# Project structure

Stambha bots use **Sapphire-aligned folders** so teams migrating from Sapphire keep familiar paths.

## Recommended layout

```text
src/
  commands/           # slash, prefix, context menu
    General/
      PingCommand.ts
  listeners/          # Hook pieces
    ReadyListener.ts
  scouts/             # passive message watchers
  barriers/           # global command blockers
  gates/              # per-command checks
  epilogues/          # post-command hooks
  conduits/           # middleware before gates
  signals/            # buttons, modals, selects
  tasks/              # Chron scheduled jobs
  schemas/            # Vault blueprints
  main.ts
```

## Auto-load pieces

```ts
import { loadPieces } from "@stambha/loader";

await loadPieces(client, { context: { client, vault } });
```

## Piece factories & dependency injection (0.3.0)

`loadPieces` calls `static create(ctx)` when a piece class defines it. The loader builds `ctx` with:

| Field | Source |
|-------|--------|
| `client` | Stambha client |
| `binder` | `client.binder` |
| `container` | `client.container` |
| `logger` | `client.container.logger` |
| … | Your `context` option (`vault`, `prisma`, …) |

### Hook with injected logger

```ts
import { Hook, type Registry, type StambhaLogger } from "@stambha/core";
import type { LoaderContext } from "@stambha/loader";

export class ReadyListener extends Hook {
  static create(ctx: LoaderContext) {
    const logger = ctx.logger ?? ctx.client.container.logger;
    return new ReadyListener(ctx.client.registries.hooks, logger);
  }

  constructor(registry: Registry<Hook>, private readonly logger: StambhaLogger) {
    super(registry, { name: "ready-log", event: "ready", once: true });
  }

  handle(payload: unknown): void {
    this.logger.info("ready", payload);
  }
}
```

### Binder tokens before load

```ts
import { loadPieces, type LoaderBinding } from "@stambha/loader";

const PRISMA = Symbol("prisma");

await loadPieces(client, {
  bindings: [{ token: PRISMA, value: prisma }],
  context: { vault },
});
```

Pieces resolve services with `ctx.binder.resolve(PRISMA)` inside `static create`.

See [Epilogues](/features/epilogues) for post-command hooks (prefer over `client.on('command*')`).

## Sapphire mapping

| Folder | Sapphire | Stambha class |
|--------|----------|---------------|
| `commands/` | commands | `Command` |
| `listeners/` | listeners | `Hook` |
| `gates/` | preconditions | `Gate` |

`PiecePaths` in `@stambha/core` lists default paths (`PiecePaths.commands === "src/commands"`, `PiecePaths.preconditions === "src/gates"`).

## Manual registration

```ts
client.register(new PingCommand(client.registries.commands));
client.registries.hooks.register(new ReadyListener(client.registries.hooks));
```

See [`examples/bot`](../../examples/bot) for a complete native bot using auto-load.

## Next

- [Pieces & pipeline](/guide/pieces)
- [Getting started](/guide/getting-started)
