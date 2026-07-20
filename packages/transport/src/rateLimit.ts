import type { RouteKey } from "./routeKey.js";
import { fallbackBucketId } from "./routeKey.js";

/** Snapshot of Discord rate-limit headers on a response. */
export interface RateLimitSnapshot {
  readonly bucketId: string;
  readonly limit: number;
  readonly remaining: number;
  /** Unix ms when the bucket resets. */
  readonly resetAt: number;
}

export interface RateLimitHeaders {
  bucket?: string | null;
  limit?: string | null;
  remaining?: string | null;
  reset?: string | null;
  resetAfter?: string | null;
  retryAfter?: string | null;
  /** `X-RateLimit-Global` — `"true"` when the 429 is global. */
  global?: string | null;
  /** `X-RateLimit-Scope` — `global` | `user` | `shared`. */
  scope?: string | null;
}

/** Discord's default global limit: 50 requests per second. */
export const DEFAULT_GLOBAL_RATE_LIMIT = 50;
export const DEFAULT_GLOBAL_RATE_INTERVAL_MS = 1000;
/** Synthetic bucket id used in queue wait telemetry for global pauses. */
export const GLOBAL_BUCKET_ID = "global";

/** Parse Discord / fetch rate-limit headers into a snapshot. */
export function parseRateLimitHeaders(
  headers: RateLimitHeaders,
  routeKey: RouteKey,
  now = Date.now(),
): RateLimitSnapshot | null {
  const limit = headers.limit ? Number(headers.limit) : NaN;
  const remaining = headers.remaining ? Number(headers.remaining) : NaN;
  if (!Number.isFinite(limit) || !Number.isFinite(remaining)) return null;

  const resetAfterSec = headers.resetAfter ? Number(headers.resetAfter) : NaN;
  const resetEpochSec = headers.reset ? Number(headers.reset) : NaN;
  const resetAt = Number.isFinite(resetAfterSec)
    ? now + resetAfterSec * 1000
    : Number.isFinite(resetEpochSec)
      ? resetEpochSec * 1000
      : now;

  const bucketId = headers.bucket?.trim() || fallbackBucketId(routeKey);
  return { bucketId, limit, remaining, resetAt };
}

/**
 * True when a 429 should pause **all** requests from this client
 * (`X-RateLimit-Global: true` or scope `global` / `user`).
 */
export function isGlobalRateLimit(headers: RateLimitHeaders, status: number): boolean {
  if (status !== 429) return false;
  if (headers.global?.toLowerCase() === "true") return true;
  const scope = headers.scope?.toLowerCase();
  return scope === "global" || scope === "user";
}

export interface GlobalRateLimitOptions {
  /** Max requests per interval (default {@link DEFAULT_GLOBAL_RATE_LIMIT}). */
  limit?: number;
  /** Sliding window in ms (default {@link DEFAULT_GLOBAL_RATE_INTERVAL_MS}). */
  intervalMs?: number;
  now?: () => number;
}

/**
 * Proactive 50 req/s budget plus reactive pause on global/user 429s.
 */
export class GlobalRateLimit {
  readonly limit: number;
  readonly intervalMs: number;
  private readonly now: () => number;
  private readonly timestamps: number[] = [];
  private blockedUntil = 0;

  constructor(options: GlobalRateLimitOptions = {}) {
    this.limit = options.limit ?? DEFAULT_GLOBAL_RATE_LIMIT;
    this.intervalMs = options.intervalMs ?? DEFAULT_GLOBAL_RATE_INTERVAL_MS;
    this.now = options.now ?? Date.now;
  }

  get blockedUntilMs(): number {
    return this.blockedUntil;
  }

  /** Milliseconds to wait before the next request may proceed (0 = ready). */
  waitMs(now = this.now()): number {
    this.prune(now);
    const blockWait = this.blockedUntil > now ? this.blockedUntil - now : 0;
    if (this.timestamps.length < this.limit) return blockWait;
    const oldest = this.timestamps[0]!;
    const windowWait = oldest + this.intervalMs - now;
    return Math.max(blockWait, windowWait > 0 ? windowWait : 0);
  }

  /** Record that a request is about to be dispatched. */
  noteRequest(now = this.now()): void {
    this.prune(now);
    this.timestamps.push(now);
  }

  /** Pause all traffic after a global/user 429. */
  blockFor(ms: number, now = this.now()): void {
    this.blockedUntil = Math.max(this.blockedUntil, now + ms);
  }

  /** Test helper. */
  reset(): void {
    this.timestamps.length = 0;
    this.blockedUntil = 0;
  }

  private prune(now: number): void {
    const cutoff = now - this.intervalMs;
    while (this.timestamps.length > 0 && this.timestamps[0]! <= cutoff) {
      this.timestamps.shift();
    }
  }
}

/** Mutable bucket state tracked by {@link RateLimitStore}. */
export class RateLimitBucket {
  readonly id: string;
  limit: number;
  remaining: number;
  resetAt: number;
  /** Block all requests until this timestamp (429 / manual). */
  blockedUntil = 0;

  constructor(id: string, limit = 1, remaining = 1, resetAt = 0) {
    this.id = id;
    this.limit = limit;
    this.remaining = remaining;
    this.resetAt = resetAt;
  }

  apply(snapshot: RateLimitSnapshot): void {
    this.limit = snapshot.limit;
    this.remaining = snapshot.remaining;
    this.resetAt = snapshot.resetAt;
  }

  blockFor(ms: number, now = Date.now()): void {
    this.blockedUntil = Math.max(this.blockedUntil, now + ms);
    this.remaining = 0;
  }

  /** Milliseconds to wait before the next request may proceed (0 = ready). */
  waitMs(now = Date.now()): number {
    if (this.remaining > 0 && now >= this.blockedUntil) return 0;
    const waits = [this.blockedUntil - now, this.resetAt - now].filter((w) => w > 0);
    return waits.length > 0 ? Math.max(...waits) : 0;
  }
}

export interface RateLimitStoreOptions {
  global?: GlobalRateLimit | GlobalRateLimitOptions;
}

/** In-memory bucket registry (single REST worker / client). */
export class RateLimitStore {
  readonly global: GlobalRateLimit;
  private readonly buckets = new Map<string, RateLimitBucket>();

  constructor(options: RateLimitStoreOptions = {}) {
    this.global =
      options.global instanceof GlobalRateLimit
        ? options.global
        : new GlobalRateLimit(options.global ?? {});
  }

  getOrCreate(id: string): RateLimitBucket {
    let bucket = this.buckets.get(id);
    if (!bucket) {
      bucket = new RateLimitBucket(id);
      this.buckets.set(id, bucket);
    }
    return bucket;
  }

  update(snapshot: RateLimitSnapshot): RateLimitBucket {
    const bucket = this.getOrCreate(snapshot.bucketId);
    bucket.apply(snapshot);
    return bucket;
  }

  block(bucketId: string, retryAfterMs: number, now = Date.now()): RateLimitBucket {
    const bucket = this.getOrCreate(bucketId);
    bucket.blockFor(retryAfterMs, now);
    return bucket;
  }

  waitMs(bucketId: string, now = Date.now()): number {
    return this.getOrCreate(bucketId).waitMs(now);
  }
}

/** Read rate-limit headers from a `fetch` `Headers` object. */
export function headersFromFetch(headers: Headers): RateLimitHeaders {
  return {
    bucket: headers.get("x-ratelimit-bucket"),
    limit: headers.get("x-ratelimit-limit"),
    remaining: headers.get("x-ratelimit-remaining"),
    reset: headers.get("x-ratelimit-reset"),
    resetAfter: headers.get("x-ratelimit-reset-after"),
    retryAfter: headers.get("retry-after"),
    global: headers.get("x-ratelimit-global"),
    scope: headers.get("x-ratelimit-scope"),
  };
}

/** Parse `retry-after` header (seconds) to milliseconds. */
export function retryAfterMs(headers: RateLimitHeaders): number {
  const raw = headers.retryAfter ?? headers.resetAfter;
  if (!raw) return 1000;
  const sec = Number(raw);
  return Number.isFinite(sec) ? sec * 1000 : 1000;
}
