# Transport & package map

Stambha-owned Discord transport primitives — no third-party Discord library required for the **native path**.

---

## When to use which package

| Package | Use when |
|---------|----------|
| `@stambha/core` | Always — client, pipeline, registries, `RestPort`, outcomes — [API](/api/core/) |
| `@stambha/loader` | Auto-load `src/commands`, `gates/`, etc. — [API](/api/loader/) |
| `@stambha/gateway` | WebSocket shards, `GatewayEventHub`, `attachStambhaClient`, sharding — [API](/api/gateway/) |
| `@stambha/rest` | Outbound Discord REST, rate-limit queue, slash deploy, REST worker — [API](/api/rest/) |
| `@stambha/transform` | Normalize gateway payloads → `StambhaMessage` / `StambhaInteraction`; REST reply bodies |
| `@stambha/transport` | Session info, route keys, rate-limit bucket model (used by `@stambha/rest`) |
| `@stambha/gates` | Cooldowns, permissions, channel-type checks — [API](/api/gates/) |
| `@stambha/args` | Prefix lexer + slash option accessors |
| `@stambha/vault` | Typed guild/user/member config (not domain ORM) — [API](/api/vault/) |
| `@stambha/plugins` | Plugin lifecycle + DI container |
| `@stambha/runtime` | Cross-runtime helpers (Node / Bun / Deno) |

**Extensions** ([Stambha-plugins](https://github.com/Mivaya/Stambha-plugins)): `@stambha/api` (HTTP + OAuth), `@stambha/metrics`, `@stambha/cache`, `@stambha/vault-sql`, `@stambha/pagination`.

### Stack recipes

| Bot shape | Packages |
|-----------|----------|
| **Monolith** | `core` + `gateway` + `rest` + `transform` + `loader` |
| **Tier split** | Above + `HttpRestPort` → REST worker; gateway relay → bot worker |
| **Tests / unit** | `core` + `MockBridge` or manual `hub.emit` |
| **Migrating from discord.js / Discordeno** | Native stack only — library shape adapters removed in **1.5.0**; see [migration guides](/migration/) |

New bots: [Getting started](/guide/getting-started). Not supported: discord.js owning the gateway while Stambha owns commands only.

---

## Session (`@stambha/transport`)

```ts
import { createSession, DISCORD_API_BASE } from "@stambha/transport";

const session = createSession({
  token: process.env.DISCORD_TOKEN!,
  applicationId: "123456789012345678",
});
// session.apiBaseUrl → https://discord.com/api/v10
```

---

## Rate-limit buckets

Discord groups REST routes into buckets. Stambha normalizes routes for local bucketing — **major parameters** (`guilds`, `channels`, `webhooks` ids) are kept; other snowflakes become `:id`. Once Discord sends `X-RateLimit-Bucket`, that header is authoritative:

```ts
import { parseRouteKey, RateLimitStore, parseRateLimitHeaders } from "@stambha/transport";

const key = parseRouteKey("/channels/999/messages", "POST");
// key.route === "/channels/999/messages"  (channel id kept)

const other = parseRouteKey("/guilds/1/members/2", "GET");
// other.route === "/guilds/1/members/:id"
```

`@stambha/rest` wraps this in `RateLimitQueue` — one serialized chain per bucket, automatic 429 retry, plus a global 50 req/s budget.

---

## Native REST client

```ts
import { createNativeRestPort } from "@stambha/rest";
import { createRestWorkerServer } from "@stambha/core";

const port = createNativeRestPort(process.env.DISCORD_TOKEN!);

const data = await port.request({
  method: "GET",
  route: "/users/@me",
});

// REST worker (split tier)
const server = await createRestWorkerServer({
  port: 4000,
  portImpl: port,
  secret: process.env.REST_WORKER_SECRET,
});
```

---

## Related

- [Tier split](/deployment/tier-split) — gateway / REST / bot workers
- [Gateway](/deployment/gateway) — `attachStambhaClient`, native WebSocket
- [Native REST](/deployment/native-rest) — REST worker details
- [Migration](/migration/) — Sapphire / Discordeno paths
