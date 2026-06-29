# @stambha/transform

**Payload normalization** — convert gateway events into slim Stambha contexts and build REST request bodies.

Part of the [**@stambha**](https://www.npmjs.com/org/stambha) monorepo · [GitHub](https://github.com/mivaya/Stambha)

---

## Install

```bash
npm install @stambha/transform @stambha/core
```

Requires **Node.js 20+**. **No discord.js or Discordeno dependency.**

---

## Quick start (native)

```ts
import type { StambhaMessage, StambhaSlashInteraction } from "@stambha/transform";
import { interactionFromDispatch, interactionReplyBody } from "@stambha/transform";

const message: StambhaMessage = {
  id: "1",
  content: "!ping",
  channelId: "c1",
  guildId: "g1",
  author: { id: "u1", bot: false },
};

await restPort.request({
  method: "POST",
  route: `/interactions/${id}/${token}/callback`,
  body: interactionReplyBody("Hello!"),
});
```

### Split-tier context builders

```ts
import {
  scoutContextFromStambhaMessage,
  commandContextFromStambhaSlashViaRest,
} from "@stambha/transform";
```

Use with `createNativeGatewayClient` + `attachStambhaClient` — see [Gateway](../gateway).

---

## Deprecated: library shape adapters (removed v1.5.0)

Exports such as `messageFromDiscordJs`, `metaFromDiscordJsSlash`, `messageFromDiscordeno`, and `buildDiscordenoDesiredProperties` are **deprecated in 1.0.0** and scheduled for **removal in 1.5.0**.

Official migrations require a **fully native** bot (`@stambha/gateway`, `@stambha/rest`, `StambhaMessage` / `interactionFromDispatch`). Adapters emit a one-time runtime warning when called.

Replace with:

| Deprecated | Native replacement |
|------------|-------------------|
| `messageFromDiscordJs` | `messageFromDispatch` or manual `StambhaMessage` |
| `slashInteractionFromDiscordJs` | `interactionFromDispatch` |
| `metaFromDiscordJs*` / `metaFromDiscordeno*` | `metaFromDiscordInteraction` |
| `buildDiscordenoDesiredProperties` | `gatesDesiredProperties` on `createStambhaBot` |

---

## Key exports

| Export | Purpose |
|--------|---------|
| `StambhaMessage`, `StambhaInteraction`, … | Core shapes |
| `interactionFromDispatch`, `messageFromDispatch` | Native gateway parsing |
| `channelMessageBody`, `interactionReplyBody` | REST payloads |
| `commandContextFromStambhaSlashViaRest` | Command routing via `RestPort` |

---

## Related packages

| Package | Role |
|---------|------|
| [`@stambha/gateway`](../gateway) | Emits `Stambha*` events into the hub |
| [`@stambha/rest`](../rest) | Sends bodies built here |
| [`@stambha/core`](../core) | `DesiredProperties`, slim contexts |

---

## Development

```bash
pnpm --filter @stambha/transform build
pnpm --filter @stambha/transform test
```
