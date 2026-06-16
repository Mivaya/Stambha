# Pieces & pipeline

Stambha organizes bot logic into **pieces** — classes registered in registries and executed through a shared pipeline.

## Execution order

```text
Gateway event → InboundRouter → Conduits → Barriers → Gates → Command → Epilogues
```

| Piece | Folder | Purpose |
|-------|--------|---------|
| **Command** | `src/commands/` | Slash, prefix, context menu |
| **Hook** | `src/listeners/` | React to gateway events |
| **Scout** | `src/scouts/` | Passive message watchers |
| **Barrier** | `src/barriers/` | Global command blockers |
| **Gate** | `src/gates/` | Per-command checks |
| **Conduit** | `src/conduits/` | Middleware before gates |
| **Epilogue** | `src/epilogues/` | Post-command hooks |
| **Signal** | `src/signals/` | Buttons, selects, modals |
| **Chron** | `src/tasks/` | Scheduled cron jobs |

## Auto-loading

```ts
import { loadPieces } from "@stambha/loader";

await loadPieces(client, { context: { client, vault } });
```

Defaults match `PiecePaths` in `@stambha/core` (`src/commands`, `src/listeners`, etc.).

## Manual registration

```ts
client.register(new PingCommand(client.registries.commands));
client.registries.hooks.register(new ReadyListener(client.registries.hooks));
```

## Related guides

Pipeline pieces (in execution order):

- [Conduits](/features/conduits)
- [Barriers](/features/barriers)
- [Gates](/features/gates)
- [Epilogues](/features/epilogues)

Other pieces:

- [Hooks (listeners)](/features/hooks)
- [Scouts](/features/scouts)
- [Signals](/features/signals)
- [Arguments](/features/args)
- [Command tree](/features/command-tree)
- [Plugins](/features/plugins)
- [Sequences](/features/sequences)
- [Chron](/features/chron)
