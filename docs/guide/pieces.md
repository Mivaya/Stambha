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

Defaults match `PiecePaths` in `@stambha/core` (`src/commands`, `src/listeners`, etc.). Gates load **before** commands so `gateNames` resolve at validation time.

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
