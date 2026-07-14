# Cache

**Pluggable in-process cache** for gateway and bot workers — avoid re-fetching guild/channel payloads on every event.

Ships as [`@stambha/cache`](https://github.com/Mivaya/Stambha-plugins/tree/main/packages/cache) from **[Stambha-plugins](https://github.com/Mivaya/Stambha-plugins)** (independent semver).

Current line: **1.0.0**. No required peer on `@stambha/core` (works alongside the native stack).

Redis-backed drivers are planned later; today the memory implementation covers monolith and single-process workers.

## When to use it

| Use cache when… | Prefer something else when… |
|-----------------|-----------------------------|
| Hot guild/member lookups in a worker | You need shared state across many hosts (wait for Redis driver / external store) |
| Short TTL for Discord entities | Durable settings — use [Vault](/features/vault) |
| Tests with deterministic maps | Cross-process rate limits — see gates / future cooldown drivers |

## Install

```bash
pnpm add @stambha/cache
```

Requires **Node.js 20+**.

## Quick start

```ts
import { createMemoryCache } from "@stambha/cache";

const cache = createMemoryCache({ defaultTtlMs: 60_000 });

await cache.set("guild:g1", { name: "My Server" });
const guild = await cache.get<{ name: string }>("guild:g1");
await cache.has("guild:g1"); // true until expired
await cache.delete("guild:g1");
await cache.clear();
```

Wire the same instance into shard / bot setup as your process needs — see [Gateway](/deployment/gateway) for worker-oriented patterns.

## `Cache` interface

All implementations are async:

| Method | Returns | Notes |
|--------|---------|--------|
| `get(key)` | `Promise<V \| undefined>` | Expired entries are deleted and return `undefined` |
| `set(key, value, ttlMs?)` | `Promise<void>` | Optional per-call TTL overrides the default |
| `delete(key)` | `Promise<boolean>` | `true` if the key existed |
| `has(key)` | `Promise<boolean>` | Uses `get` (respects expiry) |
| `clear()` | `Promise<void>` | Drops all keys |

## Memory cache

```ts
import { MemoryCache, createMemoryCache } from "@stambha/cache";

const cache = createMemoryCache<MyType>({ defaultTtlMs: 60_000 });
// equivalent: new MemoryCache({ defaultTtlMs: 60_000 })
```

| Option | Default | Notes |
|--------|---------|--------|
| `defaultTtlMs` | unset | Applied when `set` omits `ttlMs`; omit for no expiry |

| Member | Notes |
|--------|--------|
| `size` | Current map size (may include expired entries not yet read) |

Per-key TTL:

```ts
await cache.set("hot", value, 5_000); // 5s only for this key
await cache.set("sticky", value); // uses defaultTtlMs, or never expires if unset
```

There is no LRU eviction yet — unbounded growth is your responsibility in long-lived workers.

## Exports

| Export | Purpose |
|--------|---------|
| `Cache` | Interface: `get` / `set` / `delete` / `has` / `clear` |
| `MemoryCache` | In-process TTL map class |
| `createMemoryCache` | Factory for `MemoryCache` |
| `MemoryCacheOptions` | `{ defaultTtlMs?: number }` |
| `CacheSetOptions` | `{ ttlMs?: number }` (typing helper for drivers) |

## Related

- [Gateway](/deployment/gateway) — sharding and worker layout
- [Extensions](/extensions/) — other official add-ons
- [Vault](/features/vault) — durable typed settings (not a cache)
