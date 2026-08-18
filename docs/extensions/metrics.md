# Metrics (Prometheus)

`@stambha/metrics` exposes Stambha runtime stats for Prometheus scraping — command counters, latency histograms, piece errors, bot readiness, and optional native REST telemetry.

Ships from **[Stambha-plugins](https://github.com/Mivaya/Stambha-plugins)** — independent semver from core.

Current line: **`@stambha/metrics@1.0.1`** · peer `@stambha/core@^1.3.0`. Also install `prom-client` (peer).

## When to use it

| Use metrics when… | Prefer something else when… |
|-------------------|-----------------------------|
| You scrape Prometheus / Grafana | You only need ad-hoc logs |
| You want command success/error rates | Full APM / distributed tracing (bring your own) |
| REST worker needs rate-limit telemetry | Admin JSON API — that is [HTTP API](/extensions/api) |

## Install

```bash
pnpm add @stambha/metrics @stambha/core prom-client
```

Requires **Node.js 20+**.

## Quick start

### Attach to the bot client

```ts
import { createStambhaBot } from "@stambha/core";
import {
  attachClientMetrics,
  createPrometheusMetrics,
  createMetricsServer,
} from "@stambha/metrics";

const client = createStambhaBot({ /* … */ });

const { register, collector } = createPrometheusMetrics({ prefix: "stambha_" });
const detach = attachClientMetrics(client, collector);

const metrics = await createMetricsServer({ port: 9090, register });
console.log(`Metrics at ${metrics.url}/metrics`);

await client.start();

// later: detach(); await metrics.close();
```

Scrape `GET /metrics` (default path). `GET /health` returns `{ ok: true }`. Other paths return 404.

### Options

**`createPrometheusMetrics(options?)`**

| Option | Default | Notes |
|--------|---------|--------|
| `register` | new `Registry()` | Shared `prom-client` registry |
| `prefix` | `"stambha_"` | Metric name prefix |

Returns `{ register, collector }` where `collector` implements `MetricsCollector`.

**`createMetricsServer(options)`**

| Option | Default | Notes |
|--------|---------|--------|
| `port` | required | Listen port |
| `host` | `"127.0.0.1"` | Bind address |
| `register` | required | Prometheus registry to scrape |
| `path` | `"/metrics"` | Scrape path |

Returns `{ url, close() }`.

**`attachClientMetrics(client, collector)`** — hooks pipeline events; returns a detach function.

## Bot metrics

| Name | Type | Labels | Source |
|------|------|--------|--------|
| `stambha_commands_total` | Counter | `command`, `kind`, `outcome` | `commandSuccess`, `commandError`, `commandBlocked`, `commandDenied` |
| `stambha_command_duration_seconds` | Histogram | `command`, `kind` | Successful commands only (`durationMs`) |
| `stambha_piece_errors_total` | Counter | `piece`, `name` | Scout / hook / signal / chron / epilogue errors |
| `stambha_bot_ready` | Gauge | — | Client `ready` (`1` / `0`) |

Outcomes: `success`, `error`, `blocked`, `denied`.  
Histogram buckets (seconds): `0.01`, `0.05`, `0.1`, `0.25`, `0.5`, `1`, `2.5`, `5`, `10`.

### `MetricsCollector` interface

Implement this to plug a non-Prometheus sink:

```ts
interface MetricsCollector {
  setReady(ready: boolean): void;
  recordCommand(event: {
    command: string;
    kind: CommandKind;
    outcome: CommandOutcome;
    durationMs?: number;
  }): void;
  recordPieceError(piece: PieceKind, name: string): void;
}
```

`PieceKind`: `"scout" | "hook" | "signal" | "chron" | "epilogue"`.

## Testing without Prometheus

```ts
import { InMemoryMetrics, attachClientMetrics } from "@stambha/metrics";

const metrics = new InMemoryMetrics();
attachClientMetrics(client, metrics);

// metrics.ready — boolean
// metrics.commands — CommandRecord[]
// metrics.errors — { piece, name }[]
```

## Native REST worker (tier split)

When running `createNativeRestWorker`, pass a REST telemetry adapter:

```ts
import { createNativeRestWorker } from "@stambha/rest";
import {
  createPrometheusRestMetrics,
  createMetricsServer,
  restMetricsToTelemetry,
} from "@stambha/metrics";

const { register, collector } = createPrometheusRestMetrics({ prefix: "stambha_" });
const worker = await createNativeRestWorker({
  token: process.env.DISCORD_TOKEN!,
  port: 4000,
  telemetry: restMetricsToTelemetry(collector),
});
await createMetricsServer({ port: 9091, register });
```

| Name | Type | Labels |
|------|------|--------|
| `stambha_rest_requests_total` | Counter | `method`, `route`, `status` |
| `stambha_rest_request_duration_seconds` | Histogram | `method`, `route` |
| `stambha_rest_rate_limits_total` | Counter | `bucket` |
| `stambha_rest_wait_duration_seconds` | Histogram | `bucket` |

`restMetricsToTelemetry(collector)` maps to `@stambha/rest` `RestTelemetry` (`recordRequest` / `recordRateLimit` / `recordWait`).

See [Native REST](/deployment/native-rest).

## Environment

```bash
METRICS_PORT=9090 pnpm start
```

Read the port in your entrypoint and pass it to `createMetricsServer` — the package does not auto-bind env vars.

## Exports

| Export | Purpose |
|--------|---------|
| `attachClientMetrics` | Hook client pipeline events → collector |
| `createPrometheusMetrics` | Bot counters / histograms / gauge |
| `createMetricsServer` | HTTP scrape + `/health` |
| `createPrometheusRestMetrics` | REST queue stats |
| `restMetricsToTelemetry` | Adapter for `@stambha/rest` |
| `InMemoryMetrics` | Dev / test collector (`commands`, `errors`, `ready`) |
| Types | `MetricsCollector`, `MetricsServerOptions`, `PrometheusMetricsOptions`, `RestMetricsCollector`, `CommandOutcome`, `PieceKind`, … |

## Related

- [Extensions](/extensions/) — other Stambha-plugins packages
- [HTTP API](/extensions/api) — separate admin HTTP host (not the metrics scrape port)
- [Tier split](/deployment/tier-split) — worker layout
