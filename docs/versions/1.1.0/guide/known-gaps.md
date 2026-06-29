# Known gaps

Stambha **1.1.0** ships a stable native stack and honest documentation. This page lists what is **supported today** versus what is **planned** for 1.x, plugins, or 2.0.

---

## Supported native path (1.1.0)

Use this stack for new bots:

| Layer | Package | Role |
|-------|---------|------|
| Client & pipeline | `@stambha/core` | Commands, gates, signals, vault, outcomes |
| Gateway | `@stambha/gateway` | `createNativeGatewayClient`, `attachStambhaClient` |
| REST | `@stambha/rest` | `createNativeRestPort`, slash deploy |
| Transform | `@stambha/transform` | Normalized hub events (`StambhaMessage`, `StambhaInteraction`), dispatch catalog |
| Loader | `@stambha/loader` | Auto-load pieces from `src/` folders |
| Gates | `@stambha/gates` | Cooldowns, permissions, channel checks |

**Routing (0.3.5+):** `attachStambhaClient` handles prefix commands, slash commands (with options and `ctx.meta`), autocomplete, signals (buttons/selects/modals), and scouts — when the gateway emits normalized payloads.

**Mention prefix (1.1.0):** `mentionCommands: true` on `attachStambhaClient` (or `createMentionPrefixResolver` on `client.resolvePrefix`) routes `@Bot ping` like `!ping`.

**Hub events today:** `MESSAGE_CREATE` / `MESSAGE_UPDATE`, `INTERACTION_CREATE`, and `READY` are normalized to slim **`StambhaMessage`** / **`StambhaInteraction`** shapes for routing. All other dispatches are emitted on camelCase hub names (`messageReactionAdd`, `guildCreate`, …) with **raw snake_case** Discord `d` payloads. **`camelizeDispatch`** is exported in 1.1.0 (G3-spike) but not applied at the hub boundary until **G3-p1** in **1.2.0** — plan a migration when upgrading to 1.2.

**Not supported:** discord.js (or any library) owning the gateway while Stambha owns commands only. Use the [native bootstrap](/guide/getting-started).

### Deprecated library adapters

`@stambha/transform` still exports discord.js / Discordeno **shape converters** for transitional code, but they are **deprecated in 1.0.0** and **removed in future release**. New migrations and releases must use native shapes only (`StambhaMessage`, `interactionFromDispatch`, `attachStambhaClient`).

---

## Deferred to 1.x

| ID | Feature | Notes |
|----|---------|-------|
| **B1** | Declarative gates on `Command` options | Target **1.2.0** — today: `gates: [...]` or `gateNames` |
| **B2** | Hybrid arg mapping, flags, entity resolvers | Partial `@stambha/args` today |
| **B4** | Per-piece error hooks | Epilogues cover most cases |
| **B5** | Component UI builders, persistent views | Signals + manual `stambha:` ids today |
| **B6** | Prefix edit-tracking (re-run on `messageUpdate`) | — |
| **C1** | Numeric permission levels (`@stambha/levels`) | Target **1.2.0** — use `userPermissionsGate` + roles today |
| **A1–A2** | Redis cache / shared cooldown store | In-memory defaults for monolith |
| **G1** | Auto resharding threshold | Manual `ReshardController` APIs exist |
| **G3** | Gateway dispatch normalization (all events) | **G3-spike shipped in 1.1.0** — catalog + `camelizeDispatch`; Tier 1 hub camelCase → **1.2.0** (G3-p1) |
| **G3a** | Typed `GatewayEventMap` on `GatewayEventHub` | Late 1.x — hub `on` handlers get per-event types |

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
| Versioned doc snapshots | `1.0.0` and `1.1.0` archived; archive again at each release tag |

---

## Planned for 1.2.0

First **breaking** gateway minor for custom `hub.on` listeners on Tier 1 events:

| ID | Feature | Notes |
|----|---------|-------|
| **G3-p1** | Reactions, voice, presence, guild/member, message delete | Hub payloads camelCase; migration guide + optional `normalize: 'raw'` for one cycle |
| **B1** or **C1** | Pick one pillar per release | Do not combine G3-p1 + B1 + C1 unless team accepts large QA surface |

**G3-p1 requires G3-spike (1.1.0).** Schedule a B1 vs C1 prioritization before starting 1.2.0 work.

---

## CommonJS bots

Stambha ships dual ESM + CJS (`@stambha/*@0.2.1+`). Pin **`0.2.1` or newer** if your bot uses `require()`. ESM bots can use `import` with current versions.

---

## Related

- [Getting started](/guide/getting-started) — end-to-end native bot
- [Gateway deployment](/deployment/gateway) — `attachStambhaClient` options
- [Examples bot](https://github.com/Mivaya/Stambha/tree/main/examples/bot) — slash options, signals, permission gates
