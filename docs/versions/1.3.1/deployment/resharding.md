# Sharding & resharding

`@stambha/gateway` includes capacity planning, identify rate limiting, automatic threshold checks, and operator APIs for production sharding.

## Capacity planning

Stambha evaluates shard capacity (default **80%** of guilds-per-shard) and offers a deliberate migration loop (`ReshardController.nextIdentify`, `IdentifyBudget`) so you control when shards re-identify.

| Concern | Stambha API |
|---|---|
| Threshold detection | `evaluateReshard()` / `controller.check()` |
| Auto plan on threshold | `controller.check()` / `createAutoReshardMonitor` |
| Identify pacing | `IdentifyBudget` + `ReshardController.nextIdentify()` |
| Live shard reconnect | Your WebSocket worker + `createNativeGatewayClient` |
| Zero-downtime proxy | Planned — see [Known gaps](/guide/known-gaps) |

Live WebSocket re-identify after an auto plan is still **your worker loop** — automatic checks plan (and optionally `start`) from capacity thresholds; zero-downtime reconnect remains a separate concern.

## Shard calculator

```ts
import {
  recommendedShardCount,
  guildShardId,
  shardCapacityRatio,
  guildsAffectedByReshard,
} from "@stambha/gateway";

recommendedShardCount(2500); // 3
shardCapacityRatio(2500, 2); // ~1.25 (over 1000 guilds/shard cap)

guildsAffectedByReshard(2, 4, ["100000000000000001"]);
```

## Threshold policy

Default: scale up at **80%** of `guildsPerShard` (1000), scale down below **30%**:

```ts
import { evaluateReshard } from "@stambha/gateway";

const evaluation = evaluateReshard(2500, 2, {
  guildsPerShard: 1000,
  scaleUpThreshold: 0.8,
  scaleDownThreshold: 0.3,
});

if (evaluation.needed && evaluation.reason === "scale_up") {
  console.log(`Reshard to ${evaluation.recommendedShards} shards`);
}
```

## Automatic threshold check

`ReshardController.check` evaluates capacity and, when needed, builds a plan (optionally starts identify). Skips while a migration is in flight or within the cooldown after a prior auto plan:

```ts
import { createShardManager, createReshardController } from "@stambha/gateway";

const manager = createShardManager({ totalShards: 2 });
const controller = createReshardController({
  manager,
  policy: { scaleUpThreshold: 0.8 },
  getGuildIds: () => myGuildIdList,
});

const result = controller.check(guildCount, {
  autoStart: false, // plan only (default) — set true to enter identifying
  cooldownMs: 300_000,
  onPlan: (plan, evaluation) => {
    console.log(`Auto plan ${plan.fromTotal} → ${plan.toTotal} (${evaluation.reason})`);
  },
});

if (result.planned) {
  controller.start(); // if you did not pass autoStart: true
  let shardId: number | null;
  while ((shardId = await controller.nextIdentify()) !== null) {
    // identify shardId with new total from controller.plan!.toTotal
    controller.markIdentifyComplete(shardId, { sessionId: "...", sequence: 0 });
  }
  controller.complete();
}
```

Poll on an interval (e.g. after READY guild backfill or periodic inventory):

```ts
import { createAutoReshardMonitor } from "@stambha/gateway";

const monitor = createAutoReshardMonitor({
  controller,
  getGuildCount: () => myGuildIdList.length,
  intervalMs: 60_000,
  autoStart: false,
  onResult: (result) => {
    if (result.planned) {
      // kick your identify / reconnect loop
    }
  },
});
monitor.start();
```

## Identify budget

Discord limits identify frequency using **concurrency buckets** (`shard_id % max_concurrency` from `GET /gateway/bot`). Each bucket allows one identify every ~5 seconds; different buckets may identify in parallel:

```ts
import { createIdentifyBudget } from "@stambha/gateway";

const budget = createIdentifyBudget({
  maxConcurrency: 16, // from session_start_limit.max_concurrency
  minIntervalMs: 5500,
});

await budget.acquire(shardId);
try {
  // send gateway identify (opcode 2)
} finally {
  budget.release(shardId);
}
```

`createNativeGatewayClient` builds this budget automatically from `/gateway/bot` (override with `identifyBudget` or `maxConcurrency`).

## Reshard controller (manual)

Plan migration, stagger identifies, then resize the shard manager without using `check`:

```ts
import { createShardManager, createReshardController } from "@stambha/gateway";

const manager = createShardManager({ totalShards: 2 });
const controller = createReshardController({
  manager,
  getGuildIds: () => myGuildIdList,
});

const auto = controller.evaluate(2500);
if (auto.needed) {
  controller.planManual(auto.recommendedShards);
  controller.start();

  let shardId: number | null;
  while ((shardId = await controller.nextIdentify()) !== null) {
    // identify shardId with new total from controller.plan!.toTotal
    controller.markIdentifyComplete(shardId, { sessionId: "...", sequence: 0 });
  }

  controller.complete(); // manager.totalShards updated
}
```

## Manual resharding HTTP API

```ts
import { createReshardServer, createReshardController, createShardManager } from "@stambha/gateway";

const server = await createReshardServer({
  port: 5100,
  secret: process.env.RESHARD_SECRET,
  controller: createReshardController({ manager: createShardManager({ totalShards: 2 }) }),
});
```

| Method | Path | Body | Purpose |
|--------|------|------|---------|
| GET | `/health` | — | Liveness |
| GET | `/v1/reshard/status` | — | Current phase + plan |
| POST | `/v1/reshard/evaluate` | `{ guildCount }` | Threshold check |
| POST | `/v1/reshard/plan` | `{ targetShards }` | Build plan |
| POST | `/v1/reshard/start` | `{ targetShards? }` | Begin identify phase |
| POST | `/v1/reshard/complete` | — | Apply new shard count |

Bearer auth when `secret` is set (same pattern as REST/worker servers).

## Zero-downtime notes

The APIs below provide **planning and pacing** primitives. A full zero-downtime migration also requires:

1. Re-identify every shard with the new `[shardId, newTotal]` pair
2. Drain guilds that changed shard assignment (see `guildsToMigrate` on `ReshardPlan`)
3. Respect `IdentifyBudget` across all gateway workers sharing one bot token

A bundled native WebSocket gateway client integrates identify pacing; a zero-downtime gateway proxy remains planned — see [Known gaps](/guide/known-gaps).

## Related

- [Gateway](/deployment/gateway) — shard manager, worker bus
- [Tier split](/deployment/tier-split) — multi-process layout