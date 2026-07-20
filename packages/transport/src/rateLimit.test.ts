import { describe, expect, it, vi } from "vitest";
import {
  GlobalRateLimit,
  isGlobalRateLimit,
  parseRateLimitHeaders,
  RateLimitStore,
  retryAfterMs,
} from "./rateLimit.js";
import { parseRouteKey } from "./routeKey.js";

describe("rateLimit", () => {
  it("parses Discord rate-limit headers", () => {
    const key = parseRouteKey("/channels/1/messages", "GET");
    const snapshot = parseRateLimitHeaders(
      { bucket: "abc", limit: "5", remaining: "3", resetAfter: "1.5" },
      key,
      1_000,
    );
    expect(snapshot).toEqual({
      bucketId: "abc",
      limit: 5,
      remaining: 3,
      resetAt: 2_500,
    });
  });

  it("blocks and waits on bucket exhaustion", () => {
    vi.useFakeTimers();
    const store = new RateLimitStore();
    const bucket = store.block("abc", 500, 1_000);
    expect(bucket.waitMs(1_000)).toBe(500);
    vi.advanceTimersByTime(500);
    expect(bucket.waitMs(1_500)).toBe(0);
    vi.useRealTimers();
  });

  it("parses retry-after seconds", () => {
    expect(retryAfterMs({ retryAfter: "2.5" })).toBe(2500);
  });
});

describe("GlobalRateLimit", () => {
  it("detects global and user scope 429s", () => {
    expect(isGlobalRateLimit({ global: "true" }, 429)).toBe(true);
    expect(isGlobalRateLimit({ scope: "global" }, 429)).toBe(true);
    expect(isGlobalRateLimit({ scope: "user" }, 429)).toBe(true);
    expect(isGlobalRateLimit({ scope: "shared" }, 429)).toBe(false);
    expect(isGlobalRateLimit({ global: "true" }, 403)).toBe(false);
  });

  it("enforces a sliding-window request budget", () => {
    let now = 0;
    const global = new GlobalRateLimit({ limit: 3, intervalMs: 1_000, now: () => now });

    global.noteRequest(0);
    global.noteRequest(10);
    global.noteRequest(20);
    expect(global.waitMs(20)).toBe(980); // until 0+1000

    now = 1_000;
    expect(global.waitMs(now)).toBe(0);
  });

  it("pauses after blockFor until the cooldown elapses", () => {
    let now = 0;
    const global = new GlobalRateLimit({ limit: 50, intervalMs: 1_000, now: () => now });
    global.blockFor(2_000, 0);
    expect(global.waitMs(0)).toBe(2_000);
    now = 2_000;
    expect(global.waitMs(now)).toBe(0);
  });

  it("is exposed on RateLimitStore", () => {
    const store = new RateLimitStore({ global: { limit: 10 } });
    expect(store.global.limit).toBe(10);
  });
});
