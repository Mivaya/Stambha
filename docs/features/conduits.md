# Conduits

**Conduits** are non-blocking middleware that runs at the **start** of the command pipeline — before barriers, gates, and `execute()`. Use them for logging, metrics tags, or mutating shared context (carefully).

Place conduit pieces under `src/conduits/`.

## Pipeline position

```text
Conduits → Barriers → Gates → Command → Epilogues
```

Conduits run on **every** command invocation (prefix and slash) after routing, before barriers. They cannot deny commands — use a [Barrier](/features/barriers) or [Gate](/features/gates) to block.

Conduits do **not** run for signal-only interactions (buttons routed via `SignalRouter`). Use a [Signal](/features/signals) or [Hook](/features/hooks) for component-side logging.

## Quick start

```ts
import { Conduit, type CommandContext, type Registry } from "@stambha/core";

export class LoggingConduit extends Conduit {
  constructor(registry: Registry<Conduit>) {
    super(registry, { name: "logging", priority: 1 });
  }

  async process(ctx: CommandContext): Promise<void> {
    console.log(`[conduit] → ${ctx.commandName} (${ctx.kind}) by ${ctx.userId}`);
  }
}
```

Load from `src/conduits/` with `@stambha/loader`.

### Metrics-style conduit

Tag commands for Prometheus or structured logs without touching command code:

```ts
export class MetricsConduit extends Conduit {
  constructor(registry: Registry<Conduit>) {
    super(registry, { name: "metrics", priority: 5 });
  }

  async process(ctx: CommandContext): Promise<void> {
    // ctx.commandName, ctx.kind, ctx.guildId — emit counter before gates run
    console.log(`[metrics] command=${ctx.commandName} kind=${ctx.kind}`);
  }
}
```

For production metrics, use [`@stambha/metrics`](https://github.com/Mivaya/Stambha-plugins) from Stambha-plugins.

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `priority` | `10` | Lower runs first |

All enabled conduits run on every command invocation (prefix and slash).

## Related

- [Barriers](/features/barriers) — blocking checks after conduits
- [Gates](/features/gates) — per-command preconditions
- [Epilogues](/features/epilogues) — post-command hooks
