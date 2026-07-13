# Plugins & container

**`@stambha/plugins`** provides lifecycle hooks plus a shared **container** (logger, config, DI).

Core stays transport-free: `@stambha/core` exposes `PluginLifecycle`, `DefaultStambhaContainer`, and `ConsoleLogger`. The plugins package wires hooks and optional interaction helpers.

---

## Quick start

```ts
import { createStambhaBot } from "@stambha/core";
import { loadPieces } from "@stambha/loader";
import { attachPlugins, definePlugin, StambhaContainer } from "@stambha/plugins";

const container = new StambhaContainer({ config: { env: "dev" } });
const client = createStambhaBot({ container });

await attachPlugins(client, {
  plugins: [
    definePlugin("metrics", {
      postLoad: ({ client, container }) => {
        container.logger.info(`Commands: ${client.registries.commands.size}`);
      },
      postStart: ({ container }) => container.logger.info("Online"),
    }),
  ],
});

await loadPieces(client, { context: { client, vault } });
// postLoad runs automatically after loadPieces

client.setBridge(bridge);
await client.start(); // preStart → connect → postStart
```

---

## Lifecycle hooks

| Hook | When |
|------|------|
| `preInit` | First hook in `attachPlugins`, before services register |
| `postInit` | After container/logger are on `client.binder` |
| `postLoad` | After `loadPieces()` finishes (command index rebuilt) |
| `preStart` | Before `bridge.connect()` in `client.start()` |
| `postStart` | After `ready` is emitted |

Hook order for a typical bot:

```text
attachPlugins → preInit → postInit
loadPieces    → postLoad
client.start  → preStart → connect → postStart
```

---

## StambhaContainer

```ts
const container = new StambhaContainer({
  logger: myLogger, // optional; defaults to ConsoleLogger
  config: { apiUrl: process.env.API_URL },
});
```

- **`container.binder`** — same instance as `client.binder`
- **`container.logger`** — `debug`, `info`, `warn`, `error`
- **`container.config`** — frozen key/value map

### DI tokens

```ts
import { ContainerToken, LoggerToken } from "@stambha/plugins";

const logger = client.binder.resolve(LoggerToken);
const container = client.binder.resolve(ContainerToken);
```

Register your own services with `client.binder.registerSingleton(MyToken, instance)`.

### Piece factories (`Hook.create`)

For pieces that need logger, Vault, or Prisma, use `static create(ctx: LoaderContext)` instead of a bare constructor:

```ts
import { Hook, type Registry } from "@stambha/core";
import type { LoaderContext } from "@stambha/loader";

export class ReadyListener extends Hook {
  static create(ctx: LoaderContext) {
    const logger = ctx.logger ?? ctx.client.container.logger;
    return new ReadyListener(ctx.client.registries.hooks, logger);
  }
  // ...
}
```

`loadPieces` calls `create` when present — see [Project structure](/guide/project-structure#piece-factories--dependency-injection-030).

### Unloading plugins

`attachPlugins` returns a detach function. Call it on shutdown to run plugin `preStop` hooks and remove listeners:

```ts
const detachPlugins = await attachPlugins(client, { plugins: [...] });
// on SIGINT:
detachPlugins();
await client.stop();
```

There is no hot-reload of piece folders in core — use [`@stambha/dev-reload`](https://github.com/Mivaya/Stambha-plugins) (plugins repo) when available.

---

## definePlugin vs class plugins

Use `definePlugin` for small hooks:

```ts
definePlugin("audit", {
  preStart: async ({ client }) => {
    client.on("commandError", ({ command, error }) => {
      // ...
    });
  },
});
```

For larger plugins, export a `StambhaPlugin` object with the same shape.

---

## Interaction routing

Use `resolveInteractionTarget` when wiring component or autocomplete handlers yourself:

```ts
import { resolveInteractionTarget } from "@stambha/plugins";

const target = resolveInteractionTarget(client, {
  kind: "autocomplete",
  path: { root: "search", subcommand: "query" },
});

// or
resolveInteractionTarget(client, { kind: "signal", customId: "stambha:confirm:abc" });
```

- Autocomplete → `CommandIndex.resolveSlash`
- Signals → `Signal.parseCustomId` + signal registry

On the **native** path, `attachStambhaClient` auto-routes slash, autocomplete, and component interactions (0.3.5+). See [Signals](/features/signals).

---

## Official extensions (separate repo)

**`@stambha/plugins` is the host** — hooks and DI only. Optional add-ons live in **[Stambha-plugins](https://github.com/Mivaya/Stambha-plugins)** with independent semver (current line **1.0.0**, peers on core `^1.2.0` where applicable).

| Extension | Guide |
|-----------|--------|
| Pagination | [Pagination](/extensions/pagination) |
| HTTP API | [HTTP API](/extensions/api) — router, Discord OAuth, Vault settings |
| Cache | [Cache](/extensions/cache) |
| Metrics | [Metrics](/extensions/metrics) |
| Vault SQL | [Vault — SQL drivers](/features/vault#sql-drivers) |

Start at the [Extensions](/extensions/) hub. Package names describe **capability** (not a `plugin-*` prefix).

Install from npm and wire with `attachPlugins()` / helpers as shown in each guide.

---

## Related

- [Hooks](/features/hooks) — gateway event listeners
- [Signals](/features/signals) — component routing
- [Gates](/features/gates) — preconditions (often used inside plugins)
- [Command tree](/features/command-tree) — slash paths for autocomplete
