# Pipeline mental model

First-hour map of how a Discord event becomes a command reply (and where Signals / Sequences / Vault / Chron sit beside that path).

```text
Gateway / HTTP interaction
        │
        ▼
   Scout (optional)          ← message watchers before routing
        │
        ▼
 InboundRouter               ← prefix · slash · autocomplete · context menu
        │
        ▼
   Conduit → Barrier → Gate → Command → Epilogue
        │
        └── success / denied / blocked hooks

Signals (buttons · selects · modals)  ── parallel on interactionCreate
Sequences                             ── multi-step Signal flows (`stambha:seq:`)
Chron                                 ── scheduled jobs (not on the command path)
Vault                                 ── settings / KV used by pieces
```

| Piece | One-liner |
|-------|-----------|
| **Scout** | Watch messages before the command router |
| **Conduit** | Non-blocking middleware before gates |
| **Barrier** | Global “should this command run at all?” |
| **Gate** | Per-command checks (cooldown, permissions, …) |
| **Command** | Slash / prefix / menu handler (`execute` or kind hooks) |
| **Epilogue** | After the command finishes (audit, metrics) |
| **Signal** | Buttons, selects, modals via `stambha:` custom ids |
| **Sequence** | Chained Signal steps with session state |
| **Chron** | Cron / interval tasks |
| **Hook** | Listen to any gateway hub event |

## How to write a command

Class form (full control):

```ts
export class PingCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, { name: "ping", description: "Pong", kinds: ["slash"] });
  }
  async execute(ctx) {
    await ctx.reply("Pong!");
    return ok(undefined);
  }
}
```

Options-first factory (less boilerplate — same loader contract):

```ts
import { defineCommand, ok } from "@stambha/core";

export default defineCommand({
  name: "ping",
  description: "Pong",
  kinds: ["slash"],
  async execute(ctx) {
    await ctx.reply("Pong!");
    return ok(undefined);
  },
});
```

## Related

- [Pieces & pipeline](/guide/pieces) — folders, lifecycle, auto-load
- [Architecture](/guide/architecture) — stack diagram
- [Getting started](/guide/getting-started) — bootstrap + first command
- [Sequences](/features/sequences) · [Signals](/features/signals) · [Vault](/features/vault)
