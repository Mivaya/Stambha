# Known gaps

Stambha **1.0.0** ships a stable native stack and honest documentation. This page lists what is **supported today** versus what is **planned** for 1.x, plugins, or 2.0.

---

## Supported native path (1.0.0)

Use this stack for new bots:

| Layer | Package | Role |
|-------|---------|------|
| Client & pipeline | `@stambha/core` | Commands, gates, signals, vault, outcomes |
| Gateway | `@stambha/gateway` | `createNativeGatewayClient`, `attachStambhaClient` |
| REST | `@stambha/rest` | `createNativeRestPort`, slash deploy |
| Transform | `@stambha/transform` | Normalized hub events (`StambhaMessage`, `StambhaInteraction`) |
| Loader | `@stambha/loader` | Auto-load pieces from `src/` folders |
| Gates | `@stambha/gates` | Cooldowns, permissions, channel checks |

**Routing (0.3.5+):** `attachStambhaClient` handles prefix commands, slash commands (with options and `ctx.meta`), autocomplete, signals (buttons/selects/modals), and scouts — when the gateway emits normalized payloads.

**Not supported:** discord.js (or any library) owning the gateway while Stambha owns commands only. Use the [native bootstrap](/guide/getting-started).

### Deprecated library adapters

`@stambha/transform` still exports discord.js / Discordeno **shape converters** for transitional code, but they are **deprecated in 1.0.0** and **removed in future release**. New migrations and releases must use native shapes only (`StambhaMessage`, `interactionFromDispatch`, `attachStambhaClient`).

---

## Deferred to 1.x

| ID | Feature | Notes |
|----|---------|-------|
| **B1** | Declarative gates on `Command` options | Today: `gates: [...]` or `gateNames` |
| **B2** | Hybrid arg mapping, flags, entity resolvers | Partial `@stambha/args` today |
| **B4** | Per-piece error hooks | Epilogues cover most cases |
| **B5** | Component UI builders, persistent views | Signals + manual `stambha:` ids today |
| **B6** | Prefix edit-tracking (re-run on `messageUpdate`) | — |
| **C1** | Numeric permission levels (`@stambha/levels`) | Use `userPermissionsGate` + roles today |
| **A1–A2** | Redis cache / shared cooldown store | In-memory defaults for monolith |
| **G1** | Auto resharding threshold | Manual `ReshardController` APIs exist |

---

## Deferred to plugins ([Stambha-plugins](https://github.com/Mivaya/Stambha-plugins))

| Area | Package (planned) |
|------|-------------------|
| Pagination helpers | `@stambha/pagination` |
| Prometheus metrics | `@stambha/metrics` |
| Vault SQL drivers | `@stambha/vault-sql` |
| Admin dashboard | `@stambha/dashboard` |
| Hot reload | `@stambha/dev-reload` |

Core stays transport-agnostic; plugins ship on independent semver.

---

## Deferred to 2.0

| ID | Feature |
|----|---------|
| **D1** | Native `runSequence` (automatic multi-step routing) |
| **A3** | RabbitMQ / distributed worker bus |
| **D2** | Distributed Chron across workers |
| **G2** | Gateway proxy (zero-downtime deploy) |

Today, [Sequences](/features/sequences) are built with `sequence()` + manual Signal wiring or `SequenceStore` handlers.

---

## Documentation gaps

These topics are covered at a high level in 1.0.0; deeper guides land in 1.x:

| Topic | 1.0.0 status |
|-------|----------------|
| [Chron](/features/chron) tier-split | Single-process documented; distributed → **2.0 D2** |
| [Vault](/features/vault) dashboard CRUD | Cross-link `@stambha/dashboard` (plugins) |
| [Tier split](/deployment/tier-split) interactions | Bot worker must receive all `interactionCreate` |
| [Resharding](/deployment/resharding) | Manual operator APIs; auto threshold → **G1** |
| [Migration from Klasa](/migration/from-klasa) | Optional page shipped |
| Versioned doc snapshots | `0.3.5` archived; archive again at 1.0.0 tag |

---

## CommonJS bots

Stambha ships dual ESM + CJS (`@stambha/*@0.2.1+`). Pin **`0.2.1` or newer** if your bot uses `require()`. ESM bots can use `import` with current versions.

---

## Related

- [Getting started](/guide/getting-started) — end-to-end native bot
- [Gateway deployment](/deployment/gateway) — `attachStambhaClient` options
- [Examples bot](https://github.com/Mivaya/Stambha/tree/main/examples/bot) — slash options, signals, permission gates
