# Barriers

**Barriers** are global command blockers — they run after [conduits](/features/conduits) and **before** gates and `execute()`. When a barrier blocks, the command never runs and epilogues receive `phase: "blocked"`.

Place barrier pieces under `src/barriers/`.

## Pipeline position

```text
Conduits → Barriers → Gates → Command → Epilogues
```

Unlike [gates](/features/gates), barriers are **not** per-command — every registered barrier is evaluated for every command (unless skipped in help mode).

## Quick start

```ts
import { Barrier, type BarrierResult, type CommandContext, type Registry } from "@stambha/core";

export class MaintenanceBarrier extends Barrier {
  constructor(registry: Registry<Barrier>) {
    super(registry, {
      name: "maintenance",
      priority: 10,
      skipOnHelp: true,
    });
  }

  async block(_ctx: CommandContext): Promise<BarrierResult> {
    if (process.env.MAINTENANCE === "1") {
      return { block: true, reason: "Bot is under maintenance. Try again later." };
    }
    return { block: false };
  }
}
```

## BarrierResult

| Field | Description |
|-------|-------------|
| `block` | `true` stops the pipeline |
| `reason` | Shown to users when not `silent` |
| `silent` | When `true`, skip auto-reply (you handle UX elsewhere) |

Blocked commands emit `commandBlocked` and run epilogues with `runOn: "blocked"`. See [Epilogues](/features/epilogues).

### Maintenance mode

Set `MAINTENANCE=1` in the environment and use a barrier that checks it (see `examples/bot/src/barriers/MaintenanceBarrier.ts`). Set `skipOnHelp: true` so help commands still work during maintenance.

### Resharding barrier (1.x)

Automatic resharding during live traffic is **not** built in for 1.0.0. Use `ReshardController` APIs manually — see [Resharding](/deployment/resharding) and [Known gaps](/guide/known-gaps).

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `priority` | `50` | Lower runs first (all barriers are checked; first block wins) |
| `skipOnHelp` | `false` | Skip when pipeline runs in help mode |

## Barriers vs gates

| | **Barrier** | **Gate** |
|---|-------------|----------|
| Scope | Global (all commands) | Per-command (`gates`, `gateNames`) |
| Typical use | Maintenance mode, global rate limits | Permissions, cooldowns, NSFW |
| Denial UX | `commandBlocked` + epilogues | `attachGateDeniedReply()` |

## Related

- [Gates](/features/gates) — per-command checks
- [Conduits](/features/conduits) — non-blocking middleware before barriers
- [Epilogues](/features/epilogues) — audit blocked commands
