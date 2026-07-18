export interface SessionStartLimit {
  /** Identifies remaining in the current window. */
  remaining: number;
  /** Milliseconds until the window resets. */
  resetAfter: number;
  /** Total identifies allowed per window (informational). */
  total?: number;
}

export interface IdentifyBudgetOptions {
  /**
   * Discord `session_start_limit.max_concurrency` — number of parallel identify
   * buckets (`shard_id % maxConcurrency`). Default `1` (serialize all identifies).
   */
  maxConcurrency?: number;
  /** Minimum ms between identifies that share a bucket (Discord: 5s). */
  minIntervalMs?: number;
  /**
   * Optional session start limit from `GET /gateway/bot`.
   * When `remaining` is 0, acquire waits for `resetAfter` before allowing identifies.
   */
  sessionStartLimit?: SessionStartLimit;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

interface BucketState {
  lastIdentifyAt: number | null;
  inFlight: number;
  waitQueue: Array<() => void>;
}

/**
 * Rate-limits gateway identify calls using Discord's concurrency buckets
 * (`shard_id % max_concurrency`) and optional session-start-limit remaining/reset.
 */
export class IdentifyBudget {
  readonly maxConcurrency: number;
  private readonly minIntervalMs: number;
  private readonly now: () => number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly buckets: BucketState[];
  private sessionRemaining: number | null;
  private sessionResetAt: number | null;

  constructor(options?: IdentifyBudgetOptions) {
    this.maxConcurrency = Math.max(1, options?.maxConcurrency ?? 1);
    this.minIntervalMs = options?.minIntervalMs ?? 5500;
    this.now = options?.now ?? Date.now;
    this.sleep = options?.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
    this.buckets = Array.from({ length: this.maxConcurrency }, () => ({
      lastIdentifyAt: null,
      inFlight: 0,
      waitQueue: [],
    }));

    const ssl = options?.sessionStartLimit;
    if (ssl) {
      this.sessionRemaining = ssl.remaining;
      this.sessionResetAt = this.now() + Math.max(0, ssl.resetAfter);
    } else {
      this.sessionRemaining = null;
      this.sessionResetAt = null;
    }
  }

  /** Bucket key for a shard (`shard_id % max_concurrency`). */
  bucketKey(shardId: number): number {
    return ((shardId % this.maxConcurrency) + this.maxConcurrency) % this.maxConcurrency;
  }

  /**
   * Wait until an identify slot is available for `shardId`, then reserve it.
   * @param shardId Discord shard id (default `0` for single-shard / legacy callers)
   */
  async acquire(shardId = 0): Promise<void> {
    await this.waitForSessionStartLimit();

    const key = this.bucketKey(shardId);
    const bucket = this.buckets[key]!;

    while (bucket.inFlight >= 1) {
      await new Promise<void>((resolve) => bucket.waitQueue.push(resolve));
    }

    if (bucket.lastIdentifyAt !== null) {
      const elapsed = this.now() - bucket.lastIdentifyAt;
      if (elapsed < this.minIntervalMs) {
        await this.sleep(this.minIntervalMs - elapsed);
      }
    }

    await this.waitForSessionStartLimit();
    if (this.sessionRemaining !== null) {
      this.sessionRemaining = Math.max(0, this.sessionRemaining - 1);
    }

    bucket.inFlight = 1;
    bucket.lastIdentifyAt = this.now();
  }

  /** Release a slot after identify completes or fails. */
  release(shardId = 0): void {
    const key = this.bucketKey(shardId);
    const bucket = this.buckets[key]!;
    bucket.inFlight = Math.max(0, bucket.inFlight - 1);
    const next = bucket.waitQueue.shift();
    next?.();
  }

  /** Earliest timestamp (ms) the next identify for `shardId` may start without waiting. */
  nextAllowedAt(shardId = 0): number {
    const bucket = this.buckets[this.bucketKey(shardId)]!;
    const bucketReady =
      bucket.lastIdentifyAt === null ? this.now() : bucket.lastIdentifyAt + this.minIntervalMs;
    if (this.sessionRemaining === null || this.sessionRemaining > 0) {
      return bucketReady;
    }
    return Math.max(bucketReady, this.sessionResetAt ?? this.now());
  }

  inFlightCount(shardId?: number): number {
    if (shardId === undefined) {
      return this.buckets.reduce((sum, b) => sum + b.inFlight, 0);
    }
    return this.buckets[this.bucketKey(shardId)]!.inFlight;
  }

  queuedCount(shardId?: number): number {
    if (shardId === undefined) {
      return this.buckets.reduce((sum, b) => sum + b.waitQueue.length, 0);
    }
    return this.buckets[this.bucketKey(shardId)]!.waitQueue.length;
  }

  /** Remaining identifies in the session-start window (`null` if not tracking). */
  sessionRemainingCount(): number | null {
    this.refreshSessionWindow();
    return this.sessionRemaining;
  }

  private refreshSessionWindow(): void {
    if (this.sessionRemaining === null || this.sessionResetAt === null) return;
    if (this.now() >= this.sessionResetAt) {
      // Window elapsed — Discord resets the counter; without a fresh GET we
      // clear tracking so identifies are not blocked indefinitely.
      this.sessionRemaining = null;
      this.sessionResetAt = null;
    }
  }

  private async waitForSessionStartLimit(): Promise<void> {
    this.refreshSessionWindow();
    if (this.sessionRemaining === null || this.sessionRemaining > 0) return;
    if (this.sessionResetAt === null) return;
    const wait = this.sessionResetAt - this.now();
    if (wait > 0) await this.sleep(wait);
    this.refreshSessionWindow();
  }
}

export function createIdentifyBudget(options?: IdentifyBudgetOptions): IdentifyBudget {
  return new IdentifyBudget(options);
}
