/**
 * Tracks Discord "invalid requests" (401 / 403 / 429) against Cloudflare's
 * 10 000-per-10-minutes ban. Soft-caps before the hard limit and pauses the
 * REST queue so the host IP is not banned for an hour.
 *
 * @see https://discord.com/developers/docs/topics/rate-limits#invalid-request-limit-aka-cloudflare-bans
 */

/** HTTP statuses Discord counts toward the invalid-request ban. */
export const INVALID_REQUEST_STATUSES = new Set([401, 403, 429]);

export const DEFAULT_INVALID_REQUEST_HARD_LIMIT = 10_000;
/** Pause before the Cloudflare hard limit (default 95%). */
export const DEFAULT_INVALID_REQUEST_SOFT_LIMIT = 9_500;
export const DEFAULT_INVALID_REQUEST_WINDOW_MS = 10 * 60 * 1000;

export interface InvalidRequestThresholdInfo {
  count: number;
  softLimit: number;
  hardLimit: number;
  /** `true` when soft limit crossed; `false` when hard limit crossed. */
  soft: boolean;
  blockedUntil: number;
}

export interface InvalidRequestGuardOptions {
  /** Soft cap inside the window (default {@link DEFAULT_INVALID_REQUEST_SOFT_LIMIT}). */
  softLimit?: number;
  /** Discord hard limit (default {@link DEFAULT_INVALID_REQUEST_HARD_LIMIT}). */
  hardLimit?: number;
  /** Rolling window in ms (default 10 minutes). */
  windowMs?: number;
  /**
   * Extra pause after crossing soft/hard (default: time until the oldest
   * invalid request exits the window).
   */
  cooldownMs?: number;
  now?: () => number;
  onThreshold?: (info: InvalidRequestThresholdInfo) => void;
}

export function isInvalidRequestStatus(status: number): boolean {
  return INVALID_REQUEST_STATUSES.has(status);
}

/**
 * Rolling-window counter for invalid Discord REST responses.
 * Call {@link record} after each response; call {@link waitMs} before firing.
 */
export class InvalidRequestGuard {
  readonly softLimit: number;
  readonly hardLimit: number;
  readonly windowMs: number;
  private readonly cooldownMs: number | undefined;
  private readonly now: () => number;
  private readonly onThreshold: ((info: InvalidRequestThresholdInfo) => void) | undefined;
  /** Timestamps (ms) of invalid responses still inside the window. */
  private readonly timestamps: number[] = [];
  private blockedUntil = 0;
  private softWarned = false;
  private hardWarned = false;

  constructor(options: InvalidRequestGuardOptions = {}) {
    this.softLimit = options.softLimit ?? DEFAULT_INVALID_REQUEST_SOFT_LIMIT;
    this.hardLimit = options.hardLimit ?? DEFAULT_INVALID_REQUEST_HARD_LIMIT;
    this.windowMs = options.windowMs ?? DEFAULT_INVALID_REQUEST_WINDOW_MS;
    this.cooldownMs = options.cooldownMs;
    this.now = options.now ?? Date.now;
    this.onThreshold = options.onThreshold;
  }

  /** Current count of invalid responses in the rolling window. */
  get count(): number {
    this.prune(this.now());
    return this.timestamps.length;
  }

  /** Unix ms until which all REST traffic should pause (0 = not blocked). */
  get blockedUntilMs(): number {
    return this.blockedUntil;
  }

  /** Milliseconds to wait before the next request may proceed (0 = ready). */
  waitMs(now = this.now()): number {
    this.prune(now);
    if (now >= this.blockedUntil) return 0;
    return this.blockedUntil - now;
  }

  /** Record a response status; no-ops for non-invalid statuses. */
  record(status: number, now = this.now()): void {
    if (!isInvalidRequestStatus(status)) return;
    this.prune(now);
    this.timestamps.push(now);
    this.maybeBlock(now);
  }

  /** Test helper — clear counters and block state. */
  reset(): void {
    this.timestamps.length = 0;
    this.blockedUntil = 0;
    this.softWarned = false;
    this.hardWarned = false;
  }

  private prune(now: number): void {
    const cutoff = now - this.windowMs;
    while (this.timestamps.length > 0 && this.timestamps[0]! <= cutoff) {
      this.timestamps.shift();
    }
    if (this.timestamps.length < this.softLimit) this.softWarned = false;
    if (this.timestamps.length < this.hardLimit) this.hardWarned = false;
  }

  private maybeBlock(now: number): void {
    const count = this.timestamps.length;
    if (count < this.softLimit) return;

    const untilWindow = this.timestamps[0]! + this.windowMs;
    const extra = this.cooldownMs ?? 0;
    const blockedUntil = Math.max(untilWindow, now + extra);
    this.blockedUntil = Math.max(this.blockedUntil, blockedUntil);

    const hard = count >= this.hardLimit;
    if (hard && !this.hardWarned) {
      this.hardWarned = true;
      this.onThreshold?.({
        count,
        softLimit: this.softLimit,
        hardLimit: this.hardLimit,
        soft: false,
        blockedUntil: this.blockedUntil,
      });
      return;
    }
    if (!hard && !this.softWarned) {
      this.softWarned = true;
      this.onThreshold?.({
        count,
        softLimit: this.softLimit,
        hardLimit: this.hardLimit,
        soft: true,
        blockedUntil: this.blockedUntil,
      });
    }
  }
}
