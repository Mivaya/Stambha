# Desired properties & transforms

**Context slimming** on `StambhaClient` and **`@stambha/transform`** provide a bidirectional layer between Discord transports and Stambha's transport-agnostic shapes.

Gateway RAM trimming pairs with Stambha's `CommandContext` field mask on the native stack.

---

## Client configuration

```ts
import { createStambhaBot, gatesDesiredProperties, minimalDesiredProperties } from "@stambha/core";

// Default: full context + meta
const full = createStambhaBot({ prefix: "!" });

// Drop raw Discord objects; keep gate metadata
const gated = createStambhaBot({ desiredProperties: gatesDesiredProperties });

// Minimal RAM — routing fields only
const slim = createStambhaBot({ desiredProperties: minimalDesiredProperties });
```

`client.desiredProperties` is a frozen mask. `@stambha/transform` applies it when building {@link CommandContext} via `slimCommandContext`.

### Presets

| Preset | `raw` | `meta` | Use case |
|--------|-------|--------|----------|
| `defaultDesiredProperties` | yes | full | Development |
| `gatesDesiredProperties` | no | full | Production with `@stambha/gates` |
| `minimalDesiredProperties` | no | none | High-scale bots, custom gates |

### Custom mask

```ts
createStambhaBot({
  desiredProperties: {
    context: { meta: true, raw: false, argsText: true, slashOptions: true, slashPath: true },
    meta: { channelType: true, memberPermissions: true, channelNsfw: false, clientPermissions: false },
  },
});
```

---

## `@stambha/transform` (native)

```ts
import {
  interactionFromDispatch,
  metaFromDiscordInteraction,
  interactionReplyBody,
  type StambhaMessage,
} from "@stambha/transform";
```

| Export | Role |
|--------|------|
| `StambhaMessage`, `StambhaInteraction`, … | Slim internal DTOs |
| `interactionFromDispatch`, `messageFromDispatch` | Raw Discord dispatch → Stambha shapes |
| `metaFromDiscordInteraction` | Gate metadata on native attach (0.3.5+) |
| `interactionReplyBody`, `channelMessageBody` | Native REST payloads |

`createNativeGatewayClient` + `attachStambhaClient` populate `ctx.meta` and slash options automatically — no third-party library adapters.

---

## API helpers (core)

```ts
import { slimCommandContext, slimMeta, resolveDesiredProperties } from "@stambha/core";
```

Used by `@stambha/transform` after building a full context.

---

## Related

- [Gates](/features/gates) — requires `meta` for permission / NSFW / RunIn checks
- [Transport](/reference/transport) — native package map
- [Gateway](/deployment/gateway) — `attachStambhaClient`
