# Desired properties & transforms

**Context slimming** on `StambhaClient` and **`@stambha/transform`** provide a bidirectional layer between Discord transports and Stambha's transport-agnostic shapes.

Gateway RAM trimming (select which fields to keep on incoming payloads) pairs with Stambha's own `CommandContext` field mask.

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

## `@stambha/transform`

Transport adapters live in one package:

```ts
import {
  messageFromDiscordJs,
  metaFromDiscordJsSlash,
  buildDiscordenoDesiredProperties,
  interactionReplyBody,
} from "@stambha/transform";
```

| Export | Role |
|--------|------|
| `StambhaMessage`, `StambhaUser`, … | Slim internal DTOs |
| `metaFromDiscordJs*` / `metaFromDiscordeno*` | Gate metadata |
| `buildDiscordenoDesiredProperties` | Gateway trim from client mask |
| `interactionReplyBody`, `channelMessageBody` | Native REST payloads |

`@stambha/transform` applies slimming when building contexts. Bot authors usually set `desiredProperties` on the client.

### Gateway trim helpers

`buildDiscordenoDesiredProperties()` in `@stambha/transform` maps Stambha gate needs to gateway desired-property flags from the client mask.

---

## API helpers (core)

```ts
import { slimCommandContext, slimMeta, resolveDesiredProperties } from "@stambha/core";
```

Used by `@stambha/transform` after building a full context. Custom gateway workers should follow the same pattern.

---

## Related

- [Gates](/features/gates) — requires `meta` for permission / NSFW / RunIn checks
- [Transport](/reference/transport) — native REST (uses transform REST bodies in split tier)
