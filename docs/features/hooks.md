# Hooks (listeners)

**Hooks** react to raw gateway events — `ready`, `guildCreate`, `messageCreate`, and anything else your `Bridge` emits. They run **outside** the command pipeline (unlike scouts, which are filtered watchers).

Place hook pieces under `src/listeners/` (alias: `src/events/`).

## Quick start

```ts
import { Hook, type Registry, type StambhaLogger } from "@stambha/core";
import type { LoaderContext } from "@stambha/loader";

export class ReadyListener extends Hook {
  static create(ctx: LoaderContext) {
    const logger = ctx.logger ?? ctx.client.container.logger;
    return new ReadyListener(ctx.client.registries.hooks, logger);
  }

  constructor(
    registry: Registry<Hook>,
    private readonly logger: StambhaLogger,
  ) {
    super(registry, { name: "ready-log", event: "ready", once: true });
  }

  handle(payload: unknown): void {
    const user = (payload as { user?: { username?: string; id: string } })?.user;
    this.logger.info(`Logged in as ${user?.username ?? user?.id ?? "unknown"}`);
  }
}
```

Load with `@stambha/loader` — hooks bind when you call `client.start()` (after `setBridge`).

## Options

| Option | Description |
|--------|-------------|
| `event` | Bridge event name (e.g. `"ready"`, `"messageCreate"`) |
| `once` | Unsubscribe after first invocation (default `false`) |

Native gateway events use camelCase hub names (`messageCreate`, `interactionCreate`) — see [Gateway deployment](/deployment/gateway).

## Hooks vs scouts

| | **Hook** | **Scout** |
|---|----------|-----------|
| Folder | `src/listeners/` | `src/scouts/` |
| Trigger | Any bridge event | Message / update scouts only |
| Filtering | You implement in `handle()` | Built-in (`ignoreBots`, `triggers`, …) |
| Pipeline | No | No — parallel passive path |
| Use case | Login logging, guild join setup | Mention detection, auto-moderation hints |

For message watching with shared filters, prefer [Scouts](/features/scouts).

## Dependency injection

Hooks only receive `registry` from the default constructor. Use `static create(ctx: LoaderContext)` for logger, Vault, Prisma, etc. See [Project structure](/guide/project-structure#piece-factories--dependency-injection-030).

## Related

- [Project structure](/guide/project-structure) — `src/listeners/`
- [Plugins](/features/plugins) — lifecycle hooks (`preStart`, `postLoad`) vs event hooks
- [Gateway](/deployment/gateway) — event hub wiring
