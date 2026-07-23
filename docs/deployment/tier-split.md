# Tier split (REST / gateway / bot workers)

Stambha can run **gateway**, **REST**, and **bot logic** in separate processes. The gateway receives Discord events; outbound API calls go through a dedicated REST worker with isolated rate limits; command routing runs in a bot worker.

## Roles

| Role | Process | Responsibility |
|------|---------|----------------|
| `monolith` | One | Gateway + REST (default) |
| `gateway` | Gateway relay | WebSocket shards → normalized events → worker bus |
| `bot` | Bot worker | StambhaClient, commands, replies via `RestPort` |
| `rest` | REST worker | Discord REST API only |

Set `tier: "split"` and `workerRole: "gateway"` on the Stambha client when the bot process handles routing, plus a `restPort` pointing at the REST worker.

## REST worker

```ts
import { createNativeRestWorker } from "@stambha/rest";

const server = await createNativeRestWorker({
  token: process.env.DISCORD_TOKEN!,
  port: 4000,
  secret: process.env.REST_WORKER_SECRET, // optional
});

console.log(`REST worker at ${server.url}`);
```

Endpoints:

- `GET /health` — liveness
- `POST /v1/rest` — execute a {@link RestRequest} (requires bearer token when `secret` is set)

## Bot worker

```ts
import { createStambhaBot, HttpRestPort } from "@stambha/core";
import { attachStambhaClient, createGatewayEventHub } from "@stambha/gateway";

const client = createStambhaBot({
  tier: "split",
  workerRole: "gateway",
  restPort: new HttpRestPort({
    baseUrl: "http://127.0.0.1:4000",
    secret: process.env.REST_WORKER_SECRET,
  }),
});

const hub = createGatewayEventHub();
attachStambhaClient(hub, client);
client.setBridge(hub);
await client.start();
```

Slash and prefix replies are sent through the REST worker instead of an in-process REST client.

## Gateway relay

Your WebSocket shard code normalizes Discord payloads and feeds the hub:

```ts
import { attachGatewayRelay, createGatewayEventHub, createHttpWorkerClient } from "@stambha/gateway";

const hub = createGatewayEventHub();
attachGatewayRelay(hub, {
  bus: createHttpWorkerClient({ baseUrl: process.env.BOT_WORKER_URL! }),
});

// hub.emit("messageCreate", { id, content, channelId, guildId, author: { id, bot } });
```

## Interaction routing (tier split)

The **bot worker** must receive normalized `interactionCreate` events for anything Stambha routes:

| Event | Bot worker required? | Notes |
|-------|----------------------|-------|
| `messageCreate` (prefix) | **Yes** | Parsed by `attachStambhaClient` |
| Slash `interactionCreate` | **Yes** | Options, meta, `deferReply` |
| Autocomplete | **Yes** | `Command.autocomplete()` |
| Buttons / selects / modals (`stambha:`) | **Yes** | `SignalRouter` |
| Raw gateway events for hooks only | Optional | Can stay on gateway if you forward selectively |

Gateway workers should relay **all** `interactionCreate` dispatches to the bot process — not only slash commands. Component interactions do not go through the REST worker; they still need the bot worker for routing and replies (via `HttpRestPort`).

```text
Discord → gateway worker → worker bus → bot worker (attachStambhaClient)
                                              ↓
                                        REST worker (replies only)
```

See [Known gaps](/guide/known-gaps) for distributed Chron (**2.0**) — scheduled tasks today assume a single bot process.

## Example: `examples/bigbot` / `examples/bot`

Prefer **bigbot** when tier-split is the goal (scale checklist + `DESIRED=`). It is **self-contained** — copy only `examples/bigbot` if you want; it does not import sibling examples.

Three processes:

```bash
cd examples/bigbot && pnpm split:rest    # terminal 1
cd examples/bigbot && pnpm split:bot     # terminal 2 — REST_WORKER_URL=http://127.0.0.1:4000
cd examples/bigbot && pnpm split:gateway # terminal 3 — BOT_WORKER_URL=http://127.0.0.1:5000
```

Feature demos without enterprise knobs also live under `examples/bot`:

```bash
cd examples/bot && pnpm demo    # no token — simulates commands
cd examples/bot && pnpm start   # with DISCORD_TOKEN
```

Copy `.env.example` → `.env` before running with a real token. See [Examples by scale](/guide/examples) and [Deployment overview](/deployment/overview).

## Core APIs

| Export | Package | Purpose |
|--------|---------|---------|
| `RestPort`, `RestRequest` | `@stambha/core` | Transport-agnostic REST |
| `HttpRestPort` | `@stambha/core` | Bot → REST worker client |
| `createRestWorkerServer` | `@stambha/core` | Generic HTTP REST worker |
| `InMemoryTierBus` | `@stambha/core` | In-process event bus (tests / demo) |
| `createNativeRestWorker` | `@stambha/rest` | Stambha-native REST worker |
| `createGatewayEventHub`, `attachStambhaClient` | `@stambha/gateway` | Native event routing |
| `attachGatewayRelay` | `@stambha/gateway` | Gateway relay → bot worker bus |

`distributed` tier (multiple gateway shards) uses `@stambha/gateway` resharding — see [Resharding](/deployment/resharding).

## See also

- [Gateway](/deployment/gateway) — shard manager, worker messages, cache
- [Native REST](/deployment/native-rest) — metrics and worker options
- [Examples on GitHub](https://github.com/mivaya/Stambha/tree/main/examples) — runnable samples
