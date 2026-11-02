# @stambha/gateway

**Native gateway layer** — shard manager, identify/resume payloads, resharding, worker bus, and `GatewayEventHub` for routing Discord events into Stambha.

Part of the [**@stambha**](https://www.npmjs.com/org/stambha) monorepo · [GitHub](https://github.com/mivaya/Stambha) · [Gateway deployment](https://github.com/mivaya/Stambha/tree/main/docs/deployment/gateway.md)

---

## Install

```bash
npm install @stambha/gateway @stambha/core @stambha/rest @stambha/transform @stambha/transport
```

Requires **Node.js 20+**.

---

## Quick start

Monolith happy path — `bootstrapNativeBot` wires REST, hub attach, and the gateway client:

```ts
import { loadPieces } from "@stambha/loader";
import {
  bootstrapNativeBot,
  combineIntents,
  GatewayIntent,
} from "@stambha/gateway";

const token = process.env.DISCORD_TOKEN!;
const { client, gateway } = await bootstrapNativeBot({
  token,
  applicationId: process.env.DISCORD_APPLICATION_ID,
  intents: combineIntents(
    GatewayIntent.Guilds,
    GatewayIntent.GuildMessages,
    GatewayIntent.MessageContent,
  ),
});

await loadPieces(client);
await gateway.connect();
```

### Advanced — raw wiring

```ts
import { createStambhaBot } from "@stambha/core";
import {
  attachStambhaClient,
  combineIntents,
  createGatewayEventHub,
  createNativeGatewayClient,
  GatewayIntent,
} from "@stambha/gateway";
import { createNativeRestPort } from "@stambha/rest";

const token = process.env.DISCORD_TOKEN!;
const client = createStambhaBot({ restPort: createNativeRestPort(token) });

const hub = createGatewayEventHub();
attachStambhaClient(hub, client, {
  // resolvePrefix: async ({ guildId }) => fetchPrefix(guildId) ?? "!",
  // editTracking: true, // PATCH bot reply when user edits !command
});
client.setBridge(hub);

await client.start();

const gateway = await createNativeGatewayClient({
  token,
  hub,
  intents: combineIntents(
    GatewayIntent.Guilds,
    GatewayIntent.GuildMessages,
    GatewayIntent.MessageContent,
  ),
});
await gateway.connect();
```

For tests or custom workers, you can still call `hub.emit("messageCreate", …)` with `@stambha/transform` shapes.

---

## Sharding & resharding

```ts
import {
  createShardManager,
  recommendedShardCount,
  createReshardController,
  GatewayIntent,
  combineIntents,
} from "@stambha/gateway";

const intents = combineIntents(GatewayIntent.Guilds, GatewayIntent.GuildMessages);
const shards = recommendedShardCount(guildCount);
const manager = createShardManager({ token, intents, shards });
```

See `examples/bot` (`pnpm split:gateway`) for a full tier-split relay.

---

## Key exports

| Export | Purpose |
|--------|---------|
| `bootstrapNativeBot` | Monolith happy-path: REST + attach + gateway client |
| `createGatewayEventHub`, `GatewayEventHub` | Event bus → Stambha client |
| `createMessageCollector`, `awaitMessages`, … | One-shot hub collectors (messages / reactions / interactions) |
| `createNativeGatewayClient` | Bundled WebSocket shard client (0.3.0) |
| `attachStambhaClient` | Wire hub to `InboundRouter` |
| `createHttpInteractionHandler` | Discord Interactions Endpoint (no WebSocket) |
| `verifyDiscordInteractionRequest` | Ed25519 signature check |
| `ShardManager`, `createShardManager` | Shard lifecycle |
| `buildIdentifyPayload`, `buildResumePayload` | Gateway session payloads |
| `GatewayIntent`, `combineIntents` | Intent bitfields |
| `WorkerBus`, `HttpWorkerClient` | Gateway ↔ bot IPC |
| `ReshardController`, `evaluateReshard` | Resharding policy |

---

## Related packages

| Package | Role |
|---------|------|
| [`@stambha/core`](../core) | Client, pipeline, `Bridge` |
| [`@stambha/transform`](../transform) | Slim event shapes |
| [`@stambha/rest`](../rest) | Outbound replies |

---

## Development

```bash
pnpm --filter @stambha/gateway build
pnpm --filter @stambha/gateway test
```
