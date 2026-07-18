import type { InvalidRequestThresholdInfo } from "./InvalidRequestGuard.js";

/** Optional hooks for REST queue telemetry (wired by `@stambha/metrics`). */
export interface RestTelemetry {
  recordRequest(event: { method: string; route: string; status: number; durationMs: number }): void;
  recordRateLimit(bucketId: string): void;
  recordWait(bucketId: string, waitMs: number): void;
  /** Fired when the invalid-request soft/hard threshold is crossed (H6). */
  recordInvalidRequestThreshold?(info: InvalidRequestThresholdInfo): void;
}

export interface RateLimitQueueListener {
  onWait?(bucketId: string, waitMs: number): void;
  onRateLimited?(bucketId: string, waitMs: number): void;
  onInvalidRequestThreshold?(info: InvalidRequestThresholdInfo): void;
}

/** Build queue listener from {@link RestTelemetry}. */
export function createRestTelemetryListener(telemetry: RestTelemetry): RateLimitQueueListener {
  return {
    onWait: (bucketId, waitMs) => telemetry.recordWait(bucketId, waitMs),
    onRateLimited: (bucketId) => telemetry.recordRateLimit(bucketId),
    onInvalidRequestThreshold: (info) => telemetry.recordInvalidRequestThreshold?.(info),
  };
}
