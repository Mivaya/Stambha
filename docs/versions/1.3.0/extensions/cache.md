# Cache

**Pluggable cache** for gateway and bot workers — avoid re-fetching guild/channel payloads on every event.

| Package | Role |
|---------|------|
| [`@stambha/cache`](https://github.com/Mivaya/Stambha-plugins/tree/main/packages/cache) | `Cache` interface + in-process `MemoryCache` |
| [`@stambha/cache-redis`](https://github.com/Mivaya/Stambha-plugins/tree/main/packages/cache-redis) | Redis driver for shared cache across workers |

Both ship from **[Stambha-plugins](https://github.com/Mivaya/Stambha-plugins)** (independent semver). Current line: **1.0.0**. No required peer on `@stambha/core`.

Monolith bots keep **`MemoryCache`**. Use Redis only when multiple processes need the same hot keys.

## When to use it

| Use cache when… | Prefer something else when… |
|-----------------|-----------------------------|
| Hot guild/member lookups in a worker | Durable settings — use [Vault](/features/vault) |
| Short TTL for Discord entities | Cross-process **command** rate limits — see [Gates](/features/gates) / future Redis cooldown (**A2**) |
| Shared snapshots across gateway + bot workers | Single-process bot — `MemoryCache` is enough |

## Install

```bash
pnpm add @stambha/cache
# split-tier / multi-host:
pnpm add @stambha/cache-redis redis
```

Requires **Node.js 20+**.

## Quick start (memory)

```ts
import { createMemoryCache } from "@stambha/cache";

const cache = createMemoryCache({ defaultTtlMs: 60_000 });

await cache.set("guild:g1", { name: "My Server" });
const guild = await cache.get<{ name: string }>("guild:g1");
await cache.has("guild:g1"); // true until expired
await cache.delete("guild:g1");
await cache.clear();
```

Wire the same instance into shard / bot setup as your process needs — see [Gateway](/deployment/gateway).

## Redis (shared workers)

```ts
import { createClient } from "redis";
import { createRedisCache } from "@stambha/cache-redis";

const client = createClient({ url: process.env.REDIS_URL });
await client.connect();

const cache = createRedisCache({
  client,
  defaultTtlMs: 60_000,
  // keyPrefix: "stambha:cache:", // default — clear() only deletes this prefix
});

await cache.set("guild:g1", { name: "My Server" });
```

Values must be **JSON-serializable**. The app owns `client.connect()` / `client.quit()`.

| Option | Default | Notes |
|--------|---------|--------|
| `client` | (required) | Connected `redis` client |
| `keyPrefix` | `stambha:cache:` | Namespace; `clear()` never runs `FLUSHDB` |
| `defaultTtlMs` | unset | Applied when `set` omits `ttlMs` |

## `Cache` interface

All implementations are async:

| Method | Returns | Notes |
|--------|---------|--------|
| `get(key)` | `Promise<V \| undefined>` | Expired / missing → `undefined` |
| `set(key, value, ttlMs?)` | `Promise<void>` | Optional per-call TTL overrides the default |
| `delete(key)` | `Promise<boolean>` | `true` if the key existed |
| `has(key)` | `Promise<boolean>` | Uses `get` (respects expiry) |
| `clear()` | `Promise<void>` | Memory: all keys; Redis: prefix only |

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

### `@stambha/cache`

| Export | Purpose |
|--------|---------|
| `Cache` | Interface: `get` / `set` / `delete` / `has` / `clear` |
| `MemoryCache` | In-process TTL map class |
| `createMemoryCache` | Factory for `MemoryCache` |
| `MemoryCacheOptions` | `{ defaultTtlMs?: number }` |
| `CacheSetOptions` | `{ ttlMs?: number }` (typing helper for drivers) |

### `@stambha/cache-redis`

| Export | Purpose |
|--------|---------|
| `RedisCache` / `createRedisCache` | Redis `Cache` implementation |
| `RedisCacheOptions` | `client`, `keyPrefix`, `defaultTtlMs` |
| `RedisCacheClient` | Minimal client surface for tests / adapters |

## Related

- [Gateway](/deployment/gateway) — sharding and worker layout
- [Extensions](/extensions/) — other official add-ons
- [Vault](/features/vault) — durable typed settings (not a cache)
- [Stambha-plugins `@stambha/cache-redis`](https://github.com/Mivaya/Stambha-plugins/tree/main/packages/cache-redis)