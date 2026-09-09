# Extensions

Optional packages ship from **[Stambha-plugins](https://github.com/Mivaya/Stambha-plugins)** on their own cadence — not locked to the core monorepo version.

The plugin **host** (`definePlugin`, lifecycle, container) stays in core: [Plugins & container](/features/plugins).

Current plugins line (post–core **1.3.0** peer bump):

| Package | Version | Peer on `@stambha/core` |
|---------|---------|-------------------------|
| `@stambha/api` | **1.2.1** | `^1.3.0` |
| `@stambha/pagination` | **1.1.1** | `^1.3.0` |
| `@stambha/metrics` | **1.0.1** | `^1.3.0` |
| `@stambha/vault-sql` | **1.0.1** | `@stambha/vault@^1.3.0` |
| `@stambha/cooldown-redis` | **1.0.1** | `^1.3.0` |
| `@stambha/cache` | **1.0.0** | none |
| `@stambha/cache-redis` | **1.0.0** (source ready; npm publish = **A1**) | none |

## Guides

| You need… | Guide |
|-----------|--------|
| Paginated V2 messages (prev / next / dismiss) | [Pagination](/extensions/pagination) |
| HTTP routes / Discord OAuth admin API (`src/routes/` in 1.2.0+) | [HTTP API](/extensions/api) |
| Prometheus scrape endpoint | [Metrics](/extensions/metrics) |
| In-process or shared Redis guild/entity cache | [Cache](/extensions/cache) |
| Persist Vault to SQLite / Postgres | [Vault — SQL drivers](/features/vault#sql-drivers) |
| Shared Redis cooldown store (split tier) | [Gates — CooldownStore](/features/gates) + `@stambha/cooldown-redis` README |

Each guide is self-contained: when to use it, install, examples, options, and exports. Source and CHANGELOG live in [Stambha-plugins](https://github.com/Mivaya/Stambha-plugins).

## Related

- [Stambha-plugins](https://github.com/Mivaya/Stambha-plugins) — source, CHANGELOG, releases
- [Known gaps](/guide/known-gaps) — what is still planned vs shipped
- [Getting started](/guide/getting-started) — native bootstrap
