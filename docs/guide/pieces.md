# Pieces & pipeline

Stambha organizes bot logic into **pieces** — classes registered in registries and executed through a shared pipeline.

## Execution order

```text
Gateway event
  → Scout (message watchers, optional)
  → InboundRouter (prefix / slash / autocomplete)
      → Conduits → Barriers → Gates → Command → Epilogues
Signals (buttons / selects / modals) route in parallel via SignalRouter on interactionCreate
```

| Piece | Folder | Purpose |
|-------|--------|---------|
| **Scout** | `src/scouts/` | Passive message watchers (before routing) |
| **Command** | `src/commands/` | Slash, prefix, context menu |
| **Hook** | `src/listeners/` | React to any gateway event |
| **Barrier** | `src/barriers/` | Global command blockers |
| **Gate** | `src/gates/` | Per-command checks |
| **Conduit** | `src/conduits/` | Non-blocking middleware before gates |
| **Epilogue** | `src/epilogues/` | Post-command hooks |
| **Signal** | `src/signals/` | Buttons, selects, modals |
| **Chron** | `src/tasks/` | Scheduled cron jobs |

Scouts and signals are **not** inside the conduit→epilogue chain — scouts run on messages before the router; signals run on component interactions via `attachStambhaClient`.

## Auto-loading

```ts
import { loadPieces } from "@stambha/loader";

await loadPieces(client, { context: { client, vault } });
```

Defaults match `PiecePaths` in `@stambha/core` (`src/commands`, `src/listeners`, etc.). Gates load **before** commands so `gateNames` resolve at validation time. Each piece’s `onLoad()` is awaited as it is registered (see [lifecycle](#lifecycle-onload--onunload--oncommanderror)).

## Lifecycle (`onLoad` / `onUnload` / `onCommandError`)

Every piece (`Unit`) can override:

| Hook | When |
|------|------|
| `onLoad()` | After `Registry.load` / `@stambha/loader` registers the piece |
| `onUnload()` | Before `Registry.unload` removes it |
| `Command.onCommandError(error, ctx)` | When the command handler returns `err()` or throws — **default logs** via `client.container.logger` |

Optional kind hooks on `Command`: `slash` / `prefix` / `menu` (context menu). With `subcommandMethods: true`, leaf `slashPath.subcommand` maps to a same-named method. See [Getting started](/guide/getting-started#kind-hooks-optional) and [Command tree](/features/command-tree#subcommand-methods).

```ts
export class CacheCommand extends Command {
  async onLoad() {
    await this.client.binder.resolve(CACHE).warmup();
  }

  async onUnload() {
    /* close handles */
  }

  async onCommandError(error: unknown, ctx: CommandContext) {
    await ctx.replyEphemeral("Something went wrong.");
    await super.onCommandError(error, ctx); // keep default log, or omit to silence
  }

  async execute(ctx: CommandContext) {
    return ok(undefined);
  }
}
```

- Sync `registry.register()` / `client.register()` still work and **do not** call `onLoad` (tests and one-off wiring).
- Prefer `await client.loadCommand(cmd)` or `await registry.load(unit)` when you need lifecycle.
- Epilogues remain the right place for cross-cutting success/denied/blocked audits; `onCommandError` is per-command.

## Manual registration

```ts
client.register(new PingCommand(client.registries.commands));
client.registries.hooks.register(new ReadyListener(client.registries.hooks));
```

## Related guides

Pipeline pieces (command path, in order):

- [Scouts](/features/scouts) — pre-router message watchers
- [Conduits](/features/conduits)
- [Barriers](/features/barriers)
- [Gates](/features/gates)
- [Epilogues](/features/epilogues)

Interaction pieces:

- [Signals](/features/signals) — component handlers
- [Sequences](/features/sequences) — multi-step flows

Other pieces:

- [Hooks (listeners)](/features/hooks)
- [Arguments](/features/args)
- [Command tree](/features/command-tree)
- [Plugins](/features/plugins)
- [Chron](/features/chron)
