# Conduits

**Conduits** are non-blocking middleware that runs at the **start** of the command pipeline — before barriers, gates, and `execute()`. Use them for logging, metrics tags, or mutating shared context (carefully).

Place conduit pieces under `src/conduits/`.

## Pipeline position

```text
Conduits → Barriers → Gates → Command → Epilogues
```

Conduits cannot deny commands. To block execution, use a [Barrier](/features/barriers) or [Gate](/features/gates).

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

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `priority` | `10` | Lower runs first |

All enabled conduits run on every command invocation (prefix and slash).

## Related

- [Barriers](/features/barriers) — blocking checks after conduits
- [Gates](/features/gates) — per-command preconditions
- [Epilogues](/features/epilogues) — post-command hooks