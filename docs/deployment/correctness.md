# REST & Gateway correctness

How Stambha behaves on Discord’s hard edges — rate limits, resumes, identify budget, and related guards — and where that lives in code and tests. For operators evaluating a native stack.

> Scope: **`@stambha/rest`**, **`@stambha/transport`**, **`@stambha/gateway`**. Behavior is covered by package Vitest suites; this page maps claims → implementation.

## Quick map

| Discord concern | Stambha behavior | Code / tests |
|-----------------|------------------|--------------|
| Per-route buckets + major params | Route keys keep guild/channel/webhook majors; bucket queue per key | `@stambha/transport` `routeKey.ts`, `rateLimit.ts` · `routeKey.test.ts` |
| Global / user 429 | Pause **all** outbound REST when `X-RateLimit-Global` or scope `global`/`user` | `isGlobalRateLimit`, `GlobalRateLimit` · `rateLimit.test.ts` |
| Proactive global budget | Default ~50 req/s client-side budget before Discord 429 | `GlobalRateLimit` |
| Cloudflare / invalid request storms | Guard paths on REST worker / client (invalid-request protection) | `@stambha/rest` (PR #67 lineage) |
| Gateway resume URL | Prefer `resume_gateway_url` from READY on reconnect | `@stambha/gateway` WS client · `ws.test.ts` |
| Close codes | Classify resume vs fresh identify | `classifyCloseCode` · `ws.test.ts` |
| Identify `max_concurrency` | Identify budget buckets | `IdentifyBudget` · reshard / gateway tests |
| Heartbeat / zombies | Reset `heartbeatAck` on every HELLO before the interval starts. A missed ACK reconnects once; the next HELLO sends a heartbeat instead of reconnecting again at `heartbeat_interval`. | `GatewayShard.onHello` · `ws.test.ts` |
| Invalid Session | Opcode 9 `d: true` sends RESUME and keeps the session id and sequence. `d: false` drops the session and identifies again. | `GatewayShard.onInvalidSession` · `ws.test.ts` |
| Guild backfill / availability | Backfill + availability event handling | Gateway guild backfill (PR #72 lineage) |
| CamelCase dispatches | Tiers 1–4 via `normalizeDispatch`; escape hatch `dispatchNormalize: 'raw'` | `@stambha/transform` dispatch · `dispatch.test.ts` |
| Request Guild Members (op 8) all-members | Discord rate-limits empty `query` + `limit: 0` to **1 request / guild / bot / 30s**; excess emits hub `rateLimited` (`RATE_LIMITED`) | `buildRequestGuildMembersPayload` · transform `GatewayRateLimited` |
| Get Current User Guilds + large bot sharding | Pass `shard` (`0`…`max_concurrency-1`) or Discord returns **400** | `fetchCurrentUserGuilds({ shard })` |
| Channel obfuscation | Channels without `VIEW_CHANNEL` may arrive obfuscated (`ChannelFlags.Obfuscated` / name `___hidden___`). Opt into early Gateway testing via Identify `capabilities` | `isChannelObfuscated` · `GatewayIdentifyCapability.PrivateChannelObfuscation` |
| Default upload size | Discord default attachment limit is **20 MiB** (raised from 10 MiB) | Docs / operators |

## REST rate limits

### Route keys

Discord rate limits are often keyed by **major parameters** (guild id, channel id, webhook id). Stambha’s transport builds route keys so two channels do not share a bucket incorrectly (`routeKey` helpers in `@stambha/transport`).

### Global pauses

On HTTP **429**:

1. Read `X-RateLimit-Global` and `X-RateLimit-Scope`.
2. If global/user scope → `GlobalRateLimit.blockFor(retryAfter)` so the queue stops issuing requests.
3. Shared-route 429s only affect that bucket.

Tests: `packages/transport/src/rateLimit.test.ts`.

### Split-tier REST worker

When using `HttpRestPort` → `createNativeRestWorker`, the **worker** owns Discord rate limits centrally. Gateway processes must not bypass the worker for the same bot token. See [Native REST](/deployment/native-rest) and [Tier split](/deployment/tier-split).

## Gateway session correctness

### Resume

After READY, the client stores `resume_gateway_url` (when present) and reconnects there with a Resume payload (`op: 6`) when the close code allows resume. Otherwise it identifies fresh.

A missed heartbeat ACK sets an internal flag and reconnects. The next HELLO clears that flag **before** the heartbeat timer starts, so the first tick sends opcode 1 instead of reconnecting again every `heartbeat_interval`.

Invalid Session (`op: 9`) with `d: true` sends RESUME on the open socket. `d: false` means Discord rejected the session: the shard clears it and identifies again. Do not RESUME when Discord says the session is not resumable.

### Identify budget

Large bots must respect Discord’s identify concurrency. `IdentifyBudget` / reshard monitor cooperate so identifies are spaced (`@stambha/gateway` reshard module). Live reconnect after a reshard **plan** remains operator-owned until G2 proxy — see [Resharding](/deployment/resharding).

### Request Guild Members

`buildRequestGuildMembersPayload` builds opcode **8**. Requesting **all** members (`query: ""`, `limit: 0`) is limited to **one request per guild per bot every 30 seconds**. Over-limit requests receive a `RATE_LIMITED` dispatch (hub: `rateLimited`) with `retryAfter` and `meta.guildId` / `meta.nonce` — they do **not** throw on the WebSocket. Prefer user-id queries or smaller limits when you do not need a full member dump.

### Get Current User Guilds (`shard`)

Apps using **large bot sharding** must pass `shard` on `GET /users/@me/guilds`. Use `fetchCurrentUserGuilds(rest, { shard })` with a value from `0` through `max_concurrency - 1` (from Get Gateway Bot). Non-large-sharded apps can omit it.

### Channel obfuscation

When a bot lacks `VIEW_CHANNEL`, Discord may still send the channel over the Gateway with sensitive fields stripped (`ChannelFlags.Obfuscated`, name `"___hidden___"`). HTTP `GET /guilds/{id}/channels` will **omit** those channels (enforced 2026-11-16). Detect Gateway payloads with `isChannelObfuscated`. To test early, set Identify capabilities:

```ts
createNativeGatewayClient({
  capabilities: GatewayIdentifyCapability.PrivateChannelObfuscation,
  // …
});
```

### Dispatch normalization

Routing events (`messageCreate`, `interactionCreate`, `ready`) stay stable. Additional events are camelCased by tier (1.2+ / 1.3). Use:

```ts
createNativeGatewayClient({
  dispatchNormalize: "raw", // temporary while migrating listeners
  // …
});
```

Details: [Gateway](/deployment/gateway).

## What this page is not

- A guarantee of Discord ToS compliance for every bot scale.
- Coverage of every REST endpoint edge case — expand tests when fixing bugs; link them here.
- Voice / DAVE — out of core ([Known gaps](/guide/known-gaps)).

## See also

- [Gateway](/deployment/gateway)
- [Native REST](/deployment/native-rest)
- [HTTP interactions](/deployment/http-interactions) — signature verify without gateway
- [Changelog 1.3.0](https://github.com/Mivaya/Stambha/blob/main/CHANGELOG.md#130---2026-08-04)
