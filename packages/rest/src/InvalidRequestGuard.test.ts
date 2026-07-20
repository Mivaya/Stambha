import { describe, expect, it, vi } from "vitest";
import {
  InvalidRequestGuard,
  isInvalidRequestStatus,
} from "./InvalidRequestGuard.js";
import { RateLimitQueue } from "./RateLimitQueue.js";
import { parseRouteKey } from "@stambha/transport";

describe("InvalidRequestGuard", () => {
  it("classifies 401/403/429 as invalid", () => {
    expect(isInvalidRequestStatus(401)).toBe(true);
    expect(isInvalidRequestStatus(403)).toBe(true);
    expect(isInvalidRequestStatus(429)).toBe(true);
    expect(isInvalidRequestStatus(400)).toBe(false);
    expect(isInvalidRequestStatus(500)).toBe(false);
  });

  it("counts only invalid statuses in the rolling window", () => {
    let now = 1_000;
    const guard = new InvalidRequestGuard({
      softLimit: 3,
      hardLimit: 5,
      windowMs: 10_000,
      now: () => now,
    });

    guard.record(200, now);
    guard.record(400, now);
    expect(guard.count).toBe(0);

    guard.record(401, now);
    guard.record(403, now);
    expect(guard.count).toBe(2);
    expect(guard.waitMs(now)).toBe(0);

    guard.record(429, now);
    expect(guard.count).toBe(3);
    expect(guard.waitMs(now)).toBeGreaterThan(0);
  });

  it("fires onThreshold once at soft and once at hard", () => {
    let now = 0;
    const onThreshold = vi.fn();
    const guard = new InvalidRequestGuard({
      softLimit: 2,
      hardLimit: 3,
      windowMs: 60_000,
      now: () => now,
      onThreshold,
    });

    guard.record(401, now);
    expect(onThreshold).not.toHaveBeenCalled();

    guard.record(403, now);
    expect(onThreshold).toHaveBeenCalledTimes(1);
    expect(onThreshold.mock.calls[0]![0]).toMatchObject({ soft: true, count: 2 });

    guard.record(429, now);
    expect(onThreshold).toHaveBeenCalledTimes(2);
    expect(onThreshold.mock.calls[1]![0]).toMatchObject({ soft: false, count: 3 });
  });

  it("clears the block after the oldest invalid exits the window", () => {
    let now = 0;
    const guard = new InvalidRequestGuard({
      softLimit: 2,
      hardLimit: 10,
      windowMs: 1_000,
      now: () => now,
    });

    guard.record(401, 0);
    guard.record(403, 100);
    expect(guard.waitMs(100)).toBe(900); // until 0+1000

    now = 1_000;
    expect(guard.waitMs(now)).toBe(0);
    expect(guard.count).toBe(1); // only the 403 at 100 remains until 1100
  });
});

describe("RateLimitQueue + InvalidRequestGuard", () => {
  it("pauses the queue when the soft limit is reached", async () => {
    vi.useFakeTimers();
    const onThreshold = vi.fn();
    const sleep = vi.fn((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
    const queue = new RateLimitQueue({
      sleep,
      invalidRequestGuard: {
        softLimit: 2,
        hardLimit: 10,
        windowMs: 10_000,
        onThreshold,
      },
    });

    const key = parseRouteKey("/channels/1", "GET");
    const fetchOk = () => Promise.resolve(new Response("{}", { status: 200 }));
    const fetch403 = () => Promise.resolve(new Response("{}", { status: 403 }));

    await queue.run(key, fetch403);
    await queue.run(key, fetch403);
    expect(onThreshold).toHaveBeenCalledOnce();

    const pending = queue.run(key, fetchOk);
    await vi.advanceTimersByTimeAsync(10_000);
    const response = await pending;
    expect(response.status).toBe(200);
    expect(sleep).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("can disable the guard with false", async () => {
    const queue = new RateLimitQueue({
      invalidRequestGuard: false,
      sleep: async () => undefined,
    });
    expect(queue.invalidRequestGuard).toBeNull();

    const key = parseRouteKey("/guilds/1", "GET");
    for (let i = 0; i < 5; i++) {
      await queue.run(key, () => Promise.resolve(new Response("{}", { status: 403 })));
    }
    // Would have blocked at soft limit 2 if enabled; without guard, continues.
    const response = await queue.run(key, () => Promise.resolve(new Response("{}", { status: 200 })));
    expect(response.status).toBe(200);
  });
});
