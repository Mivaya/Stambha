# Project structure

Stambha bots use a **conventional piece layout** — one folder per piece type under `src/`.

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
  routes/             # HTTP API handlers (@stambha/api 1.2.0+)
    hello-world.get.ts
  main.ts
```

## Auto-load pieces

```ts
import { loadPieces } from "@stambha/loader";

await loadPieces(client, { context: { client, vault } });
```

`@stambha/loader` loads folders in dependency order — **`gates/` before `commands/`** so `gateNames` resolve when commands register. Barriers, conduits, and epilogues load before commands as well.

## Piece factories & dependency injection (0.3.x)

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

## Folder reference

| Folder | Stambha class | Guide |
|--------|---------------|-------|
| `commands/` | `Command` | [Command tree](/features/command-tree) |
| `listeners/` | `Hook` | [Hooks](/features/hooks) |
| `scouts/` | `Scout` | [Scouts](/features/scouts) |
| `conduits/` | `Conduit` | [Conduits](/features/conduits) |
| `barriers/` | `Barrier` | [Barriers](/features/barriers) |
| `gates/` | `Gate` | [Gates](/features/gates) |
| `epilogues/` | `Epilogue` | [Epilogues](/features/epilogues) |
| `signals/` | `Signal` | [Signals](/features/signals) |
| `tasks/` | `Chron` | [Chron](/features/chron) |
| `schemas/` | Vault blueprints | [Vault](/features/vault) |
| `routes/` | `@stambha/api` route files | [HTTP API](/extensions/api) — **not** loaded by `loadPieces` |

`PiecePaths` in `@stambha/core` lists default piece paths (`PiecePaths.commands === "src/commands"`, `PiecePaths.preconditions === "src/gates"`, etc.). HTTP routes use `PiecePaths.routes` (`"src/routes"`) as the conventional folder for `@stambha/api` `routesDir` / `loadRoutes` — they are **not** scanned by `@stambha/loader`.

Migrating from another stack? See [migration guides](/migration/) for piece-name mappings.

## Manual registration

```ts
client.register(new PingCommand(client.registries.commands));
client.registries.hooks.register(new ReadyListener(client.registries.hooks));
client.registries.scouts.register(new MentionScout(client.registries.scouts));
```

See [`examples/basic`](../../examples/basic) for a small live bot, [`examples/bot`](../../examples/bot) for the full piece layout, and [Examples by scale](/guide/examples) for the matrix.

## Next

- [Pieces & pipeline](/guide/pieces)
- [Getting started](/guide/getting-started)
