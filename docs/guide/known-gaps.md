# Known gaps

Stambha **1.2.0** ships camelCase hub payloads for common gateway events (reactions, guild/member, voice, message delete, poll votes). This page lists what is **supported today** versus what is **planned** for 1.x, plugins, or 2.0. Maintainer IDs (B1, G3-p2, …) match the [project board](https://github.com/orgs/Mivaya/projects/2).

---

## Supported native path (1.2.0)

Use this stack for new bots:

| Layer | Package | Role |
|-------|---------|------|
| Client & pipeline | `@stambha/core` | Commands, gates, signals, vault, outcomes |
| Gateway | `@stambha/gateway` | `createNativeGatewayClient`, `attachStambhaClient` |
| REST | `@stambha/rest` | `createNativeRestPort`, slash deploy |
| Transform | `@stambha/transform` | Normalized hub events (`StambhaMessage`, `StambhaInteraction`), dispatch catalog |
| Loader | `@stambha/loader` | Auto-load pieces from `src/` folders |
| Gates | `@stambha/gates` | Cooldowns, permissions, channel checks |
| Levels | `@stambha/levels` | Numeric staff hierarchy (C1) |

**Routing (0.3.5+):** `attachStambhaClient` handles prefix commands, slash commands (with options and `ctx.meta`), autocomplete, signals (buttons/selects/modals), and scouts — when the gateway emits normalized payloads.

**Mention prefix (1.1.0):** `mentionCommands: true` on `attachStambhaClient` (or `createMentionPrefixResolver` on `client.resolvePrefix`) routes `@Bot ping` like `!ping`.

**Hub events today:** `MESSAGE_CREATE` / `MESSAGE_UPDATE`, `INTERACTION_CREATE`, and `READY` are normalized to slim **`StambhaMessage`** / **`StambhaInteraction`** shapes for routing. Tier 1–4 structural dispatches emit **camelCase** (Tier 1 in **1.2.0**, Tier 2 in **1.3.0**, Tier 3–4 with **1.4.0** / **1.5.0**). Use `isTier*Dispatch` / type guards from `@stambha/transform` for listener DX.

**Not supported:** discord.js (or any library) owning the gateway while Stambha owns commands only. Use the [native bootstrap](/guide/getting-started).

---

## Deferred to 1.x

| ID | Feature | Notes |
|----|---------|-------|
| **B1** | Declarative gates on `Command` options | Shipped (#74) — `cooldown` / `runIn` / `nsfw` / permissions; also `gates: [...]` / `gateNames` |
| **B2** | Hybrid arg mapping, flags, entity resolvers | Shipped (#83) — `HybridArgs`, prefix flags, `userArg(rest)` |
| **B3** | Help system (`@stambha/help`) | Shipped (#84) — category catalog + `detailedDescription` / `hidden` |
| **B4** | Piece lifecycle + error hooks | Shipped (#85) — `onLoad` / `onUnload` / `onCommandError` |
| **B5** | Component UI builders, persistent views | Shipped (#86) — builders + `registerPersistentSignals` |
| **B6** | Prefix edit-tracking (re-run on `messageUpdate`) | Shipped (#87) — `editTracking` on `attachStambhaClient` |
| **C1** | Numeric permission levels (`@stambha/levels`) | Shipped (#88) — ladder + `permissionLevelGate` |
| **C2** | Vault level overrides | Shipped (#89) — guild `permissionLevels` + `setlevel` |
| **A1** | Redis cache (`@stambha/cache-redis`) | **In progress** — shared `Cache` across workers |
| **A2** | Shared Redis cooldown store | Memory `CooldownStore` default; Redis driver planned |
| **G1** | Auto resharding threshold | Shipped (#82) — `ReshardController.check` / `createAutoReshardMonitor` |
| **G3** | Gateway dispatch normalization (all events) | Tier 1–4 on main → **1.4.0** / **1.5.0** (catalog complete) |
| **G3a** | Typed `GatewayEventMap` on `GatewayEventHub` | Shipped (#81) — typed `hub.on` / `once` / `off` |
| **Collectors** | Message/reaction/interaction collectors | **In progress** — `@stambha/gateway` hub collectors |

---

## Deferred to plugins ([Stambha-plugins](https://github.com/Mivaya/Stambha-plugins))

Official extensions — product guides (packages ship independently; **`@stambha/api@1.2.0`**, others typically **1.0.0**):

| Package | Guide |
|---------|--------|
| `@stambha/pagination` | [Pagination](/extensions/pagination) |
| `@stambha/api` | [HTTP API](/extensions/api) — OAuth, Vault settings, **`src/routes/`** loader (1.2.0) |
| `@stambha/metrics` | [Metrics](/extensions/metrics) |
| `@stambha/cache` | [Cache](/extensions/cache) — `MemoryCache` |
| `@stambha/cache-redis` | [Cache](/extensions/cache#redis-shared-workers) — Redis driver (**A1**) |
| `@stambha/vault-sql` | [Vault — SQL drivers](/features/vault#sql-drivers) |

Hub: [Extensions](/extensions/).

Still planned in that repo (not core):

| Area | Package (planned) |
|------|-------------------|
| Admin dashboard **UI** (hosted SPA) | Separate product / `@stambha/dashboard` — OAuth + Vault settings HTTP already in [`@stambha/api`](/extensions/api) |
| Hot reload | `@stambha/dev-reload` |
| Redis cooldown drivers | **A2** |

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
| [Vault](/features/vault) dashboard CRUD | [`@stambha/api`](/extensions/api) OAuth + `/guilds/…/settings`; hosted UI still planned |
| [Tier split](/deployment/tier-split) interactions | Bot worker must receive all `interactionCreate` |
| [Resharding](/deployment/resharding) | Auto threshold plan via `controller.check` / monitor (**G1**); live reconnect still your worker loop |
| [Migration from Klasa](/migration/from-klasa) | Optional page shipped |
| Versioned doc snapshots | `1.0.0` and `1.1.0` archived; archive **1.2.0** at the next docs/archive step if missing |
| [Extensions](/extensions/) hub | Keep feature pages in sync when Stambha-plugins ships |

---

## Planned next — Discord platform DX

A1 / A2 / collectors are on `main` (release cut pending). Branch from `main` per [CONTRIBUTING](https://github.com/Mivaya/Stambha/blob/main/.github/CONTRIBUTING.md).

| ID | Feature | Notes |
|----|---------|-------|
| **USER-INSTALL** | User-installable apps + contexts | `integrationTypes` / `contexts` on Command + runtime fields |
| **COMP-V2** | Components V2 builders + Signals | Discord layout components |
| **HTTP-INTERACTIONS** | Interaction endpoint (no gateway) | Serverless / HTTP-only bots |
| **AUTHZ-CAP** | Capability / policy authorization | Replaces unreleased numeric levels before release |
| **MONETIZE-1** / **TYPING** / **REST-app** / … | Follow-ons | See project board |

## Shipped after 1.3.0 train (on main; release cut pending)

| ID | Feature | Notes |
|----|---------|-------|
| **B1** | Declarative gates | `cooldown` / `runIn` / `nsfw` / permissions on `Command` (#74) |
| **B2** | Hybrid args, flags, entity resolvers | `HybridArgs`, prefix `--flags`, `userArg(rest)` (#83) |
| **B3** | Help system | `@stambha/help` + `hidden` / `detailedDescription` (#84) |
| **B4** | Piece lifecycle + error hooks | `onLoad` / `onUnload` / `Command.onCommandError` (#85) |
| **B5** | Components + persistent signals | Builders + `registerPersistentSignals` (#86) |
| **B6** | Prefix edit-tracking | `editTracking` on `attachStambhaClient` (#87) |
| **C1** | Permission levels | `@stambha/levels` + `permissionLevelGate` (#88) |
| **C2** | Vault level overrides | Guild `permissionLevels` + `setlevel` (#89) |
| **G3-p3** | Tier 3 camelCase | Invites, integrations, stage, scheduled events, typing, webhooks, emoji/sticker → **1.4.0** (#78) |
| **G3-p4** | Tier 4 camelCase | Automod, soundboard, entitlements, subscriptions, … → **1.5.0** (#79) |
| **ADAPTERS-1.5** | Remove legacy adapters | discord.js / Discordeno shape converters removed (#80) |
| **G3a** | Typed `GatewayEventMap` | Typed `hub.on` / `once` / `off` (#81) |
| **G1** | Auto reshard threshold | `controller.check` / `createAutoReshardMonitor` (#82) |

## Shipped in 1.3.0 train (on main; release cut pending)

| ID | Feature | Notes |
|----|---------|-------|
| **H6–H7** | REST invalid-request + global RL + major params | — |
| **H1 / H2 / H4** | Resume/close, identify concurrency, guild backfill | — |
| **G3-p2** | Tier 2 camelCase | Channels, threads, roles, bans, chunks, audit log |

Use `dispatchNormalize: 'raw'` for one cycle while migrating Tier 2–4 handlers.

---

## Shipped in 1.2.0 (reference)

| ID | Feature | Notes |
|----|---------|-------|
| **G3-p1** | Common hub events camelCase | Reactions, voice, presence, guild/member, message delete/bulk, poll votes; `dispatchNormalize: 'raw'` escape hatch |

---

## CommonJS bots

Stambha ships dual ESM + CJS (`@stambha/*@0.2.1+`). Pin **`0.2.1` or newer** if your bot uses `require()`. ESM bots can use `import` with current versions.

---

## Related

- [Getting started](/guide/getting-started) — end-to-end native bot
- [Gateway deployment](/deployment/gateway) — `attachStambhaClient` options
- [Examples bot](https://github.com/Mivaya/Stambha/tree/main/examples/bot) — slash options, signals, permission gates
