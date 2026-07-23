# Bigbot (enterprise scale)

**Self-contained** large-bot example: full piece tree, tier-split workers, desired properties, and a scale checklist.

Use this when you care about rate-limit isolation, many guilds, or multi-process ops. Learning the framework? Start with `[../basic](../basic)`. Feature demos without scale knobs? `[../bot](../bot)`.

## Scale checklist


| Concern                   | Stambha tool                       | Docs                                                            |
| ------------------------- | ---------------------------------- | --------------------------------------------------------------- |
| REST rate limits isolated | Tier-split REST worker             | [Tier split](../../docs/deployment/tier-split.md)               |
| Gateway vs bot process    | Relay + bot worker                 | [Tier split](../../docs/deployment/tier-split.md)               |
| RAM on huge guilds        | `desiredProperties`                | [Desired properties](../../docs/features/desired-properties.md) |
| Shard capacity            | `ReshardController` / auto monitor | [Resharding](../../docs/deployment/resharding.md)               |
| Observability             | Prometheus REST/gateway metrics    | [Metrics](../../docs/extensions/metrics.md)                     |
| Serverless slash          | HTTP interactions                  | [`../http-interactions`](../http-interactions) · [docs](../../docs/deployment/http-interactions.md) |
| Shared cache / SQL vault  | Stambha-plugins                    | [Extensions](../../docs/extensions/)                            |
| Staff authz               | `@stambha/authz`                   | [Capabilities](../../docs/features/capabilities.md)             |




## Monolith

```bash
cp .env.example .env
pnpm install
pnpm demo                     # no token
pnpm start                    # with token
```



### Desired properties

```bash
DESIRED=gates pnpm start     # keep gate meta, drop raw
DESIRED=minimal pnpm start   # drop most meta + raw
```



## Tier-split (three processes)

```bash
# terminal 1
pnpm split:rest

# terminal 2 — set REST_WORKER_URL=http://127.0.0.1:4000
pnpm split:bot

# terminal 3 — set BOT_WORKER_URL=http://127.0.0.1:5000
pnpm split:gateway
```

Optional: `DESIRED=gates` (or `minimal`) on `split:bot` / `start`.

Single-process smoke of the worker wiring:

```bash
pnpm split:demo
```



## Layout

Same conventional folders as the advanced bot (`commands/`, `workers/`, vault, authz, …), plus scale entrypoints in `main.ts` and `workers/bot.ts`.

## Related scale path

```text
basic → bot (advanced) → bigbot (this) → plugins (cache-redis, metrics, vault-sql)
```

See [Examples by scale](../../docs/guide/examples.md).