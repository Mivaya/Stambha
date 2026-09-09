# Chron (scheduled tasks)

Chron pieces are **scheduled tasks** — background jobs that run on an interval or cron expression.

## Layout

Place tasks in `src/tasks/` (see `PiecePaths.tasks`).

## Define a task

```ts
import { Chron, type ChronContext, type Registry } from "@stambha/core";

export class HeartbeatTask extends Chron {
  constructor(registry: Registry<Chron>) {
    super(registry, {
      name: "heartbeat",
      schedule: { every: 60_000 }, // ms
      runOnStart: true,
    });
  }

  async run(ctx: ChronContext): Promise<void> {
    console.info(`[${ctx.chron}] tick at ${ctx.runAt.toISOString()}`);
  }
}
```

### Cron schedule

```ts
schedule: { cron: "0 */6 * * *" } // every 6 hours (5-field cron)
```

## Lifecycle

- Tasks start when `client.start()` runs (after the gateway connects).
- Tasks stop when `client.stop()` runs.
- Overlapping runs are skipped unless `concurrent: true`.
- Errors emit `chronError` on the client.

## Loader

```ts
await loadPieces(client, { context: { client, vault } });
// loads src/tasks/*.ts into client.registries.chrons
```

Chron runs in the **bot process** where `client.start()` is called. In tier split, only the bot worker should start Chron — gateway and REST workers do not load `tasks/` by default.

Distributed Chron across multiple bot replicas is **2.0 D2** — see [Known gaps](/guide/known-gaps). For 1.0.0, use a single bot worker or accept duplicate ticks if you run multiple replicas (not recommended).

### Example

`examples/bot/src/tasks/HeartbeatTask.ts` — logs every 60 seconds in the monolith / bot worker.

## Related

- [Project structure](/guide/project-structure) — `src/tasks/`
- [Hooks](/features/hooks) — one-off gateway events vs scheduled ticks