# Extensions

Optional packages ship from **[Stambha-plugins](https://github.com/Mivaya/Stambha-plugins)** on their own cadence — not locked to the core monorepo version.

The plugin **host** (`definePlugin`, lifecycle, container) stays in core: [Plugins & container](/features/plugins).

Current plugins line: packages ship independently. **`@stambha/api` is at 1.2.0** (file-based `src/routes/`); other packages remain on **1.0.0** unless noted. Peers on Stambha core **^1.2.0** where applicable.

## Guides

| You need… | Guide |
|-----------|--------|
| Paginated embeds (prev / next / dismiss) | [Pagination](/extensions/pagination) |
| HTTP routes / Discord OAuth admin API (`src/routes/` in 1.2.0+) | [HTTP API](/extensions/api) |
| Prometheus scrape endpoint | [Metrics](/extensions/metrics) |
| In-process guild/entity cache | [Cache](/extensions/cache) |
| Persist Vault to SQLite / Postgres | [Vault — SQL drivers](/features/vault#sql-drivers) |

Each guide is self-contained: when to use it, install, examples, options, and exports. Source and CHANGELOG live in [Stambha-plugins](https://github.com/Mivaya/Stambha-plugins).

## Related

- [Stambha-plugins](https://github.com/Mivaya/Stambha-plugins) — source, CHANGELOG, releases
- [Known gaps](/guide/known-gaps) — what is still planned vs shipped
- [Getting started](/guide/getting-started) — native bootstrap
