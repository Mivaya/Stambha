# Stambha implementation phases

Historical index of framework phases. For **current gaps and release sequencing**, see [release-plan.md](./release-plan.md) and [roadmap.md](./roadmap.md).

## Completed (phases 1–22)

| Phase | Branch | Package / deliverable |
|-------|--------|------------------------|
| 1 Core | `main` / `feature/*` | `@stambha/core` |
| 2 Bridge | `feature/bridge-discordjs` | `@stambha/bridge-discordjs` *(removed — ADR 002)* |
| 3 Vault | `feature/vault` | `@stambha/vault` |
| 3b Vault SQL | `feature/vault-sql` | `@stambha/vault-sql` *(plugins repo)* |
| 4 Piece loader | `feature/piece-loader` | `@stambha/loader` |
| 5 Signals | `feature/signal-registry` | `Signal` in core |
| 6 Sequences | `feature/sequences` | `SequenceStore`, `sequence()` custom IDs |
| 7 Chron | `feature/chron` | `Chron`, `src/tasks/` |
| 8 Tier split | `feature/tier-split` | `RestPort`, split tier |
| 9 Bridge Discordeno | `feature/bridge-discordeno` | *(removed — ADR 002)* |
| 10 Metrics | `feature/metrics` | `@stambha/metrics` *(plugins repo)* |
| 11 Gates | `feature/gates` | `@stambha/gates` |
| 12 Args | `feature/args` | `@stambha/args` |
| 13 Command tree | `feature/command-tree` | Subcommands, deploy, autocomplete API |
| 14 Plugins | `feature/plugins` | `@stambha/plugins` |
| 15 Transport | `feature/transport` | `@stambha/transport`, `@stambha/rest` |
| 16 Native REST worker | `feature/native-rest` | `createNativeRestWorker` |
| 17 Desired properties | `feature/desired-properties` | `@stambha/transform`, context slimming |
| 18 Gateway & cache | `feature/gateway` | `@stambha/gateway`, `@stambha/cache` |
| 19 Sharding & resharding | `feature/resharding` | Reshard policy, identify budget |
| 20 Cross-runtime | `feature/cross-runtime` | `@stambha/runtime` |
| 21 Migration docs | `feature/migration-docs` | Public migration guides + ADRs |
| 22 Bot authoring (0.3.4) | `feature/0.3.4` | `ReplyPayload`, REST resources, mention args |

## Release milestones (semver)

| Version | Theme | Status |
|---------|-------|--------|
| **0.2.2** | Per-command gates, prefix resolver, loader order | ✅ Shipped |
| **0.3.0–0.3.3** | Native WS gateway, loader DI, epilogues, slash deploy | ✅ Shipped |
| **0.3.4** | Rich replies, REST helpers, mention/snowflake args | ✅ Shipped |
| **0.3.5** | Native interaction routing (options, meta, signals, autocomplete) | 🔲 Planned |
| **1.0.0** | Stable API + documented known gaps | 🔲 After 0.3.5 |
| **1.x** | B1/C1, Redis, help, REST entity args | 🔲 Pipeline |
| **2.0.0** | Bus, distributed chron, native `runSequence` | 🔲 Major |

## Next phase

**Phase 23 — Native interaction routing (0.3.5)** — see [release-plan.md](./release-plan.md#035-minor--native-interaction-routing).

Framework **pieces** exist for signals, autocomplete, and slash options; **`attachStambhaClient` does not wire them yet**. That gap blocks honest 1.0.0 for production bots.

## Branch rule

Always use `feature/{short-name}`.
