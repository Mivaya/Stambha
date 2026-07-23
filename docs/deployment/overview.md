# Deployment overview

Choose a deployment shape by **bot size**, then deepen with the linked guides.

## Shape vs scale

| Bot size | Typical shape | Example | Guides |
|----------|---------------|---------|--------|
| Toy / CI | In-process mock | [`examples/minimal`](https://github.com/Mivaya/Stambha/tree/main/examples/minimal) | — |
| Small (few guilds) | **Monolith** — one process | [`examples/basic`](https://github.com/Mivaya/Stambha/tree/main/examples/basic) | [Getting started](/guide/getting-started) |
| Medium (features) | Monolith + full pieces | [`examples/bot`](https://github.com/Mivaya/Stambha/tree/main/examples/bot) | [Examples by scale](/guide/examples) |
| Large (rate limits) | **Tier split** — REST worker + gateway/bot | [`examples/bigbot`](https://github.com/Mivaya/Stambha/tree/main/examples/bigbot) | [Tier split](/deployment/tier-split) |
| Very large / many shards | Tier split + reshard + slim contexts | `bigbot` + `DESIRED=` | [Resharding](/deployment/resharding), [Desired properties](/features/desired-properties) |
| Serverless slash | **HTTP interactions** (no WebSocket) | [`examples/http-interactions`](https://github.com/Mivaya/Stambha/tree/main/examples/http-interactions) | [HTTP interactions](/deployment/http-interactions) |

## Monolith

One process: `createNativeRestPort(token)` + `GatewayEventHub` + WebSocket shards.

```bash
cd examples/basic && pnpm start
# or feature-complete:
cd examples/bot && pnpm start
```

## Tier split (v1)

- **REST worker** — `@stambha/rest` (`createNativeRestWorker`)
- **Gateway / bot** — `HttpRestPort` pointing at the worker

Isolates Discord REST rate limits from your event loop. See [Tier split](/deployment/tier-split) and [Native REST](/deployment/native-rest).

```bash
cd examples/bigbot
pnpm split:rest      # :4000
pnpm split:bot       # REST_WORKER_URL=http://127.0.0.1:4000
pnpm split:gateway   # BOT_WORKER_URL=http://127.0.0.1:5000
```

## Tier split (v2)

Three processes:

1. REST worker
2. Bot worker — `createWorkerServer` + StambhaClient (commands)
3. Gateway relay — WebSocket → `attachGatewayRelay` → bot worker

`examples/bot` and `examples/bigbot` both ship `pnpm split:*` for this layout.

**Important:** the bot worker must receive **all** `interactionCreate` events (slash, buttons, modals). Prefix-only relays are not enough for a full advanced bot.

## Enterprise extras

| Need | Package / API |
|------|----------------|
| Context RAM | [`desiredProperties`](/features/desired-properties) (`gates` / `minimal`) |
| Shard planning | [`ReshardController`](/deployment/resharding) / auto monitor |
| Metrics | [`@stambha/metrics`](/extensions/metrics) (plugins) |
| Shared cache | [`@stambha/cache-redis`](/extensions/cache) (plugins) |
| SQL vault | [`@stambha/vault-sql`](/features/vault#sql-drivers) (plugins) |
| Staff authz | [`@stambha/authz`](/features/capabilities) |
| Premium SKUs | [Monetization](/features/monetization) |

## Related

- [Examples by scale](/guide/examples)
- [Gateway](/deployment/gateway)
- [Slash deploy](/deployment/slash-deploy)
- [Cross-runtime](/deployment/cross-runtime)
- [Known gaps](/guide/known-gaps)
