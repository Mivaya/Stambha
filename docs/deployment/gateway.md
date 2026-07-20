# Gateway manager & worker protocol

`@stambha/gateway` covers shard state, identify/resume payloads, **bundled native WebSocket shards**, and gateway↔bot messaging.

## Native WebSocket client (0.3.0)

Connect Discord gateway shards directly into a `GatewayEventHub` — no discord.js or manual `hub.emit` wiring:

```ts
import {
  attachStambhaClient,
  combineIntents,
  createGatewayEventHub,
  createNativeGatewayClient,
  GatewayIntent,
} from "@stambha/gateway";
import { createStambhaBot } from "@stambha/core";
import { createNativeRestPort } from "@stambha/rest";

const client = createStambhaBot({
  prefix: "!",
  restPort: createNativeRestPort(process.env.DISCORD_TOKEN!),
});

const hub = createGatewayEventHub();
attachStambhaClient(hub, client);
client.setBridge(hub);

await client.start();

const gateway = await createNativeGatewayClient({
  token: process.env.DISCORD_TOKEN!,
  hub,
  intents: combineIntents(
    GatewayIntent.Guilds,
    GatewayIntent.GuildMessages,
    GatewayIntent.MessageContent,
  ),
});

await gateway.connect();
```

### `attachStambhaClient` options

Wire hub events into `InboundRouter` and `SignalRouter`:

| Option | Default | Description |
|--------|---------|-------------|
| `prefixCommands` | `true` | Route `messageCreate` through prefix parser |
| `slashCommands` | `true` | Route slash `interactionCreate` payloads |
| `signals` | `true` | Route buttons, selects, modals with `stambha:` custom ids |
| `autocomplete` | `true` | Route autocomplete interactions to `Command.autocomplete()` |
| `scouts` | `true` | Run scouts on `messageCreate` / `messageUpdate` |
| `mentionCommands` | `false` | Route `@Bot ping` via `createMentionPrefixResolver` on `ready` |
| `resolvePrefix` | — | Per-guild prefix resolver; sets `client.resolvePrefix` for attach lifetime |
| `applicationId` | — | Discord app id for slash `editReply` when missing from interaction payloads |

```ts
import { createMentionPrefixResolver } from "@stambha/core";

attachStambhaClient(hub, client, {
  applicationId: process.env.DISCORD_APPLICATION_ID,
  mentionCommands: true, // @Bot ping — needs ready user id
  resolvePrefix: async ({ guildId }) => (guildId ? await fetchPrefix(guildId) : "!"),
  signals: true,
});
```

`mentionCommands` wires `client.resolvePrefix` on gateway `ready` using the bot user id. Pass an explicit `resolvePrefix` to override. For mention-only bots, use `createMentionPrefixResolver(botId, "")` with a prefix that does not match normal messages, or disable `prefixCommands`.

Returns a detach function. Expects normalized `StambhaMessage` / `StambhaInteraction` shapes from `interactionFromDispatch` (native gateway) or manual `hub.emit` in tests.

### Gateway dispatch normalization

**1.1.0:** `@stambha/transform` exports `camelizeDispatch`, `GATEWAY_DISPATCH_EVENTS`, and consolidated `normalizeDispatch`. Catalog + tests only — hub behavior unchanged until 1.2.0.

**1.2.0:** Common hub events emit **camelCase** payloads. Routing events (`messageCreate`, `interactionCreate`, `ready`) still use `StambhaMessage` / `StambhaInteraction` shapes.

**1.3.0:** Tier 2 hub events (channels, threads, roles, bans, member chunks, audit log) also emit **camelCase**.

| Group | Events (examples) | Hub payload |
|-------|-------------------|-------------|
| Routing | `messageCreate`, `interactionCreate`, `ready` | `StambhaMessage` / `StambhaInteraction` / ready DTO |
| Tier 1 | `messageReactionAdd`, `guildMemberAdd`, `voiceStateUpdate`, `guildCreate`, `messageDelete`, … | camelCase structural (`guildId`, `userId`, …) |
| Tier 2 | `channelCreate`, `threadCreate`, `guildRoleCreate`, `guildBanAdd`, `guildMembersChunk`, `guildAuditLogEntryCreate`, … | camelCase structural |
| Passthrough | invites, integrations, stage, … until 1.4+ | raw snake_case `d` |

#### Migration from 1.1.x / 1.2.x

```ts
// Before (1.1.x) — snake_case on common events
hub.on("messageReactionAdd", (payload) => {
  const guild = payload.guild_id;
});

// After (1.2.0+) — camelCase
import { isMessageReactionAddPayload } from "@stambha/transform";

hub.on("messageReactionAdd", (payload) => {
  if (!isMessageReactionAddPayload(payload)) return;
  const guild = payload.guildId;
});
```

```ts
// Before (1.2.x) — snake_case on Tier 2 events
hub.on("channelCreate", (payload) => {
  const guild = payload.guild_id;
});

// After (1.3.0) — camelCase
import { isChannelCreatePayload } from "@stambha/transform";

hub.on("channelCreate", (payload) => {
  if (!isChannelCreatePayload(payload)) return;
  const guild = payload.guildId;
});
```

**Escape hatch (one minor cycle):** pass `dispatchNormalize: 'raw'` to `createNativeGatewayClient` to keep wire snake_case on Tier 1/2 events while you migrate handlers.

```ts
const gateway = await createNativeGatewayClient({
  token: process.env.DISCORD_TOKEN!,
  hub,
  intents,
  dispatchNormalize: "raw", // remove after migrating hub.on handlers
});
```

`createNativeGatewayClient` options:

| Option | Default | Description |
|--------|---------|-------------|
| `dispatchNormalize` | `'default'` | `'default'` — camelCase Tier 1/2 events at hub; `'raw'` — skip structural normalize |
| `waitForGuilds` | `false` | Defer hub `ready` (shard 0) until READY guild stubs arrive as `guildAvailable` |

### Guild availability (startup backfill)

Discord sends unavailable guild stubs on `READY`, then full guild bodies as `GUILD_CREATE`. Stambha mirrors discord.js:

| Wire | Hub event | When |
|------|-----------|------|
| `READY` guild stubs | (tracked internally) | Seed startup / pending guild ids |
| `GUILD_CREATE` for a READY stub | `guildAvailable` | Startup backfill (not a join) |
| `GUILD_CREATE` for an unknown guild | `guildCreate` | Bot joined a guild after ready |
| `GUILD_DELETE` with `unavailable: true` | `guildUnavailable` | Outage / disconnect |
| `GUILD_DELETE` otherwise | `guildDelete` | Bot removed / left |

By default, hub `ready` still fires as soon as `READY` arrives (shard 0). Set `waitForGuilds: true` to wait until pending stubs are cleared:

```ts
const gateway = await createNativeGatewayClient({
  token: process.env.DISCORD_TOKEN!,
  hub,
  intents,
  waitForGuilds: true,
});
```

`readyFromDispatch` / hub ready payloads may include `guildIds` from the READY stubs. Worker relay defaults forward `guildAvailable` and `guildUnavailable` alongside `guildCreate` / `guildDelete`.

`createNativeGatewayClient`:

- Fetches `GET /gateway/bot` for recommended shard count, gateway URL, and `session_start_limit.max_concurrency` (override with `totalShards` / `gatewayUrl` / `maxConcurrency`)
- Sends identify / resume with heartbeat handling; identifies use concurrency buckets (`shard_id % max_concurrency`)
- Reconnects with exponential backoff; uses READY `resume_gateway_url` when resuming
- Stops and emits hub `error` (`fatal_close`) on fatal close codes (4004, 4010–4014) instead of looping
- Normalizes `MESSAGE_CREATE`, `INTERACTION_CREATE`, and `READY` into Stambha hub shapes
- Normalizes Tier 1 dispatches (reactions, guild/member, voice, …) to camelCase at the hub (1.2.0+)
- Normalizes Tier 2 dispatches (channels, threads, roles, bans, member chunks, audit log) to camelCase (1.3.0+)
- Emits remaining dispatches on camelCase hub names with raw snake_case `d` until further coverage in 1.4.0+

Requires Node 22+ global `WebSocket` or the bundled `ws` dependency (installed with `@stambha/gateway`).

## Shard manager

Track identify / resume state per shard before wiring a real gateway connection:

```ts
import { createShardManager, buildIdentifyPayload, combineIntents, GatewayIntent } from "@stambha/gateway";
import { createSession } from "@stambha/transport";

const manager = createShardManager({ totalShards: 2 });
manager.markIdentifying(0);

const session = createSession({ token: process.env.DISCORD_TOKEN! });
const identify = buildIdentifyPayload({
  session,
  shardId: 0,
  totalShards: 2,
  intents: combineIntents(GatewayIntent.Guilds, GatewayIntent.GuildMessages),
});

manager.markReady(0, { sessionId: "abc", sequence: 1 });
```

Shard calculator helpers (`recommendedShardCount`, `guildShardId`, `shardIdsForWorker`) and resharding (`evaluateReshard`, `ReshardController`) live in the same package — see [RESHARDING.md](./RESHARDING.md).

## Worker protocol

Gateway and bot logic can run in separate processes. Events flow over a **worker bus**:

| Transport | Gateway (publisher) | Bot (consumer) |
|-----------|---------------------|----------------|
| In-process | `InMemoryWorkerBus` | `bus.subscribe(...)` |
| HTTP | `HttpWorkerClient` | `createWorkerServer` |

Message envelope:

```ts
interface WorkerMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
  shardId?: number;
}
```

Built-in types: `gateway:ready`, `gateway:event`, `bot:ping`.

### Relay gateway events

On the gateway process, normalize Discord payloads and forward via `GatewayEventHub` + relay:

```ts
import { attachGatewayRelay, createGatewayEventHub, createHttpWorkerClient } from "@stambha/gateway";

const bus = createHttpWorkerClient({ baseUrl: "http://127.0.0.1:5000", secret: process.env.WORKER_SECRET });
const hub = createGatewayEventHub();
attachGatewayRelay(hub, { bus, shardId: 0 });

// Your WebSocket shard worker (tier split) — or use createNativeGatewayClient in-process:
// hub.emit("messageCreate", { id, content, channelId, guildId, author: { id, bot } });
await hub.connect();
```

Bot worker:

```ts
import { createWorkerServer, WorkerMessageTypes } from "@stambha/gateway";

await createWorkerServer({
  port: 5000,
  secret: process.env.WORKER_SECRET,
  onMessage: async (message) => {
    if (message.type === WorkerMessageTypes.gatewayEvent) {
      const { event, payload } = message.payload as { event: string; payload: unknown };
      // Route into StambhaClient (see examples/bot)
    }
  },
});
```

HTTP endpoints (parity with REST worker):

- `GET /health`
- `POST /v1/worker` — JSON `WorkerMessage` body

**Note:** HTTP relay carries JSON-serializable payloads. Use `@stambha/transform` to normalize library types before `hub.emit`.

## Cache

```ts
import { createMemoryCache } from "@stambha/cache";

const cache = createMemoryCache({ defaultTtlMs: 60_000 });
await cache.set("guild:123", { name: "My Guild" });
const guild = await cache.get<{ name: string }>("guild:123");
```

Redis and gateway-backed cache adapters are planned; the `Cache` interface is stable for custom backends.

## Tier split v2

| Process | Packages | Role |
|---------|----------|------|
| REST worker | `@stambha/rest` | Centralized rate limits |
| Gateway worker | `@stambha/gateway` | WebSocket shards, relay events |
| Bot worker | `@stambha/core` + `@stambha/transform` | Commands, vault, sequences |

See [Tier split](/deployment/tier-split) and `examples/bot` for the three-process layout.

## Related

- [Transport](/reference/transport) — session info and REST routes
- [Cross-runtime](/deployment/cross-runtime) — Node, Bun, Deno support
- [Resharding](/deployment/resharding) — threshold resharding, identify budget, operator API
