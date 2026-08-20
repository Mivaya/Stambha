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
| Heartbeat / zombies | Heartbeat interval from HELLO; ACK tracking in shard loop | Native WS shard implementation + tests |
| Guild backfill / availability | Backfill + availability event handling | Gateway guild backfill (PR #72 lineage) |
| CamelCase dispatches | Tiers 1–4 via `normalizeDispatch`; escape hatch `dispatchNormalize: 'raw'` | `@stambha/transform` dispatch · `dispatch.test.ts` |

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

### Identify budget

Large bots must respect Discord’s identify concurrency. `IdentifyBudget` / reshard monitor cooperate so identifies are spaced (`@stambha/gateway` reshard module). Live reconnect after a reshard **plan** remains operator-owned until G2 proxy — see [Resharding](/deployment/resharding).

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
