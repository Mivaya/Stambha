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

**`@stambha/plugins` is the host** — hooks and DI only. Optional add-ons (dashboard HTTP, i18n, cron, etc.) live in a **separate monorepo**:

- Planned org/repo: **`stambhadev/plugins`**
- Package names describe **capability** (e.g. `@stambha/dashboard`), not a generic `plugin-*` prefix

| Extension | Package |
|-----------|---------|
| Dashboard / OAuth / Vault HTTP | `@stambha/dashboard` |
| Translations | `@stambha/i18n` |
| Scheduled tasks | `@stambha/cron` |

Install from npm, register with `attachPlugins()` like any local plugin.

---

## Related

- [Hooks](/features/hooks) — gateway event listeners
- [Signals](/features/signals) — component routing
- [Gates](/features/gates) — preconditions (often used inside plugins)
- [Command tree](/features/command-tree) — slash paths for autocomplete