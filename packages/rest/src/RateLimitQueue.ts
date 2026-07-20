import type { HttpMethod } from "@stambha/transport";
import {
  fallbackBucketId,
  GLOBAL_BUCKET_ID,
  headersFromFetch,
  isGlobalRateLimit,
  parseRateLimitHeaders,
  RateLimitStore,
  type RouteKey,
  retryAfterMs,
} from "@stambha/transport";

import { InvalidRequestGuard, type InvalidRequestGuardOptions } from "./InvalidRequestGuard.js";
import type { RateLimitQueueListener } from "./telemetry.js";

export interface RateLimitQueueOptions {
  store?: RateLimitStore;
  /** Max automatic retries after HTTP 429. */
  maxRetries?: number;
  sleep?: (ms: number) => Promise<void>;
  listener?: RateLimitQueueListener;
  /**
   * Cloudflare invalid-request guard (401/403/429 toward 10k/10min ban).
   * Pass `false` to disable; omit for defaults; or pass options / an instance.
   */
  invalidRequestGuard?: InvalidRequestGuard | InvalidRequestGuardOptions | false;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Per-bucket request chains — serializes calls so rate limits stay centralized
 * (Discordeno `@discordeno/rest` pattern). Also enforces the global 50 req/s
 * budget and pauses all traffic on global/user 429s.
 */
export class RateLimitQueue {
  readonly store: RateLimitStore;
  readonly invalidRequestGuard: InvalidRequestGuard | null;
  private readonly maxRetries: number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly listener: RateLimitQueueListener | undefined;
  private readonly chains = new Map<string, Promise<void>>();

  constructor(options: RateLimitQueueOptions = {}) {
    this.store = options.store ?? new RateLimitStore();
    this.maxRetries = options.maxRetries ?? 3;
    this.sleep = options.sleep ?? defaultSleep;
    this.listener = options.listener;
    this.invalidRequestGuard = resolveInvalidRequestGuard(options.invalidRequestGuard, options.listener);
  }

  /** Run `fn` when the bucket for `routeKey` allows it; retries on 429. */
  async run(routeKey: RouteKey, fn: () => Promise<Response>): Promise<Response> {
    const bucketId = fallbackBucketId(routeKey);
    const previous = this.chains.get(bucketId) ?? Promise.resolve();
    const current = previous.then(() => this.executeWithLimits(routeKey, bucketId, fn));
    this.chains.set(
      bucketId,
      current.then(
        () => undefined,
        () => undefined,
      ),
    );
    return current;
  }

  private async executeWithLimits(
    routeKey: RouteKey,
    bucketId: string,
    fn: () => Promise<Response>,
  ): Promise<Response> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const invalidWait = this.invalidRequestGuard?.waitMs() ?? 0;
      if (invalidWait > 0) {
        this.listener?.onWait?.("invalid-request", invalidWait);
        await this.sleep(invalidWait);
      }

      const globalWait = this.store.global.waitMs();
      if (globalWait > 0) {
        this.listener?.onWait?.(GLOBAL_BUCKET_ID, globalWait);
        await this.sleep(globalWait);
      }

      const wait = this.store.waitMs(bucketId);
      if (wait > 0) {
        this.listener?.onWait?.(bucketId, wait);
        await this.sleep(wait);
      }

      this.store.global.noteRequest();
      const response = await fn();
      this.invalidRequestGuard?.record(response.status);

      const headers = headersFromFetch(response.headers);
      const snapshot = parseRateLimitHeaders(headers, routeKey);
      if (snapshot) this.store.update(snapshot);

      if (response.status !== 429) return response;

      const ms = retryAfterMs(headers);
      if (isGlobalRateLimit(headers, response.status)) {
        this.store.global.blockFor(ms);
        this.listener?.onRateLimited?.(GLOBAL_BUCKET_ID, ms);
      } else {
        this.store.block(snapshot?.bucketId ?? bucketId, ms);
        this.listener?.onRateLimited?.(snapshot?.bucketId ?? bucketId, ms);
      }
      if (attempt === this.maxRetries) return response;
    }

    throw new Error("RateLimitQueue: exhausted retries");
  }
}

function resolveInvalidRequestGuard(
  value: RateLimitQueueOptions["invalidRequestGuard"],
  listener: RateLimitQueueListener | undefined,
): InvalidRequestGuard | null {
  if (value === false) return null;
  if (value instanceof InvalidRequestGuard) return value;

  const userOnThreshold = value?.onThreshold;
  return new InvalidRequestGuard({
    ...(value ?? {}),
    onThreshold: (info) => {
      userOnThreshold?.(info);
      listener?.onInvalidRequestThreshold?.(info);
    },
  });
}

/** Map core {@link RestMethod} to transport {@link HttpMethod}. */
export function toHttpMethod(method: string): HttpMethod {
  return method as HttpMethod;
}
