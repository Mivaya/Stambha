# Stambha roadmap

Stambha’s goal is a **first-class native Discord bot framework** — Sapphire-style ergonomics (pieces, pipeline, gates, args) plus Discordeno-style scale (split tier, centralized REST, sharding) plus **originals** (Vault, Sequences, Chron, Outcome pipeline).

This document is the **feature matrix** and **phase history**. Release sequencing lives in [release-plan.md](./release-plan.md); post-1.0 pillars in [future-v2.md](./future-v2.md).

**Branch rule:** `feature/{short-name}`

**Current version:** **0.3.5** · **Next:** **1.0.0** (stable API + [public docs](./docs-1.0.0.md))

---

## Product vision

```text
┌─────────────────────────────────────────────────────────────────┐
│  Stambha = Sapphire ergonomics + Discordeno scale + originals   │
├─────────────────────────────────────────────────────────────────┤
│  @stambha/core        Framework (never imports discord.js/Deno) │
│  @stambha/transport   Rate limits, session, route keys          │
│  @stambha/rest        Native Discord REST + deploy              │
│  @stambha/gateway     WebSocket shards → GatewayEventHub        │
│  @stambha/transform   Dispatch → Stambha shapes → REST bodies   │
└─────────────────────────────────────────────────────────────────┘
```

**End state:** Authors write against Stambha APIs only. Discord connectivity is **Stambha-owned transport** ([ADR 005](./adr/005-native-only-migration.md)). Bridge packages were removed ([ADR 002](./adr/002-bridge-deprecation.md)).

---

## Native attach status (honest snapshot)

`attachStambhaClient` is the default wiring for production bots. As of **0.3.5**:

| Flow | Native attach | Notes |
|------|---------------|-------|
| Prefix commands | ✅ | `messageCreate` → router |
| Slash commands (options, subcommands) | ✅ | `slashOptions`, `slashPath` from dispatch |
| Permission / RunIn / NSFW gates | ✅ | `ctx.meta` on native path |
| Buttons / selects / modals | ✅ | `signals` toggle on attach (default on) |
| Autocomplete | ✅ | `autocomplete` toggle on attach (default on) |
| Rich replies + embeds | ✅ | `ReplyPayload` |
| Deferred slash + `editReply` | ✅ | `deferReply` + `editReply` |
| Scouts, hooks, chron, vault | ✅ | Via hub events + loader |

---

## Feature matrix

Legend: **Done** · **Partial** · **Planned** · **Won't**

### From Sapphire (authoring ergonomics)

| Feature | Stambha today | Target |
|---------|---------------|--------|
| Piece stores (commands, hooks, …) | **Done** — registries + `@stambha/loader` | Maintain |
| Preconditions / gates | **Done** — `@stambha/gates` | Native `meta` ✅ 0.3.5 |
| Barriers, epilogues, conduits | **Done** | Public docs → [docs-1.0.0](./docs-1.0.0.md) |
| Prefix `Args` + mention/snowflake ids | **Done** — `@stambha/args` (0.3.4) | B2 REST entity resolvers in 1.x |
| Slash options / `SlashArgs` | **Done** — native attach 0.3.5 | |
| Subcommands & groups (deploy + router) | **Done** | |
| Prefix aliases, categories | **Done** | Maintain |
| Autocomplete handlers | **Done** — native attach 0.3.5 | |
| Component handlers (buttons, …) | **Done** — native attach 0.3.5 | B5 menu builder → 1.x |
| Slash deploy / diff | **Done** — `@stambha/rest` | Maintain |
| Plugins + container DI | **Done** — `@stambha/plugins`, loader context | Maintain |
| Rich replies (embeds, ephemeral) | **Done** — `ReplyPayload` (0.3.4) | Maintain |
| REST entity helpers | **Done** — `@stambha/rest` resources (0.3.4) | Maintain |
| Bridge / hybrid command DX | **Planned** — 1.x B2 | Pycord, Poise |
| Piece lifecycle + error hooks | **Planned** — 1.x B4 | discord.py cogs |
| Built-in pagination | **Planned** — plugins P1 | Pycord pages |
| Declarative command options → gates | **Planned** — 1.x B1 | — |
| Permission levels | **Planned** — 1.x C1 `@stambha/levels` | — |
| Built-in help package | **Planned** — 1.x B3 | — |
| Dashboard HTTP API | **Planned** — plugins `@stambha/dashboard` | — |
| Typing indicator | **Planned** — 1.x | — |
| Depends on discord.js | **Won't** — native only | — |

### From Discordeno (scale & ops)

| Feature | Stambha today | Target |
|---------|---------------|--------|
| Split gateway / REST / bot | **Done** — tier split + workers | Maintain |
| Centralized REST rate limits | **Done** — `@stambha/rest` | Maintain |
| Native WebSocket gateway | **Done** — 0.3.0 `createNativeGatewayClient` | Maintain |
| desiredProperties / slim context | **Done** | Maintain |
| Transform layer | **Done** — `@stambha/transform` | Extend in 0.3.5 |
| Sharding + resharding APIs | **Done** — `@stambha/gateway` | Maintain |
| Custom cache | **Done** — `@stambha/cache` (plugins); Redis → 1.x A1 | — |
| Cross-runtime (Node, Bun, Deno) | **Done** — `@stambha/runtime` | Maintain |
| Gateway proxy patterns | **Planned** — optional | Discordeno-inspired; 2.0 |
| Auto resharding threshold | **Planned** — 1.x G1 | Discordeno 80% rule |
| Horizontal worker bus (RabbitMQ) | **Planned** — 2.0 A3 | — |
| Functional-only pieces | **Won't** — class pieces + `defineGate` functions | — |

### Stambha originals

| Feature | Status | Notes |
|---------|--------|-------|
| Transport-agnostic `Bridge` | **Done** | Core never imports Discord libs |
| `Outcome` pipeline | **Done** | `ok()` / `err()` |
| **Vault** | **Done** | Settings + bot-shaped data ([ADR 004](./adr/004-vault-scope-orm-coexistence.md)) |
| **Sequences** | **Partial** | Store + custom IDs; native `runSequence` → 2.0 |
| **Chron** | **Done** | In-process; distributed → 2.0 |
| **Scouts** / **Signals** | **Done** — routing ✅ 0.3.5 | Scouts/docs → [docs-1.0.0](./docs-1.0.0.md) |
| **Metrics** | **Done** — `@stambha/metrics` (plugins repo) | |
| **MockBridge** | **Done** | Tests without Discord |
| Migration guides | **Done** | `docs/migration/*` |

---

## What we are **not** building

- A fork of Sapphire or a discord.js wrapper marketed as Stambha
- Re-introducing `@stambha/bridge-*` packages
- **Vault as a full ORM** — Prisma/Drizzle for heavy domain ([ADR 004](./adr/004-vault-scope-orm-coexistence.md))
- Requiring Redis/RabbitMQ for single-process bots

---

## Vault scope (Path B)

Vault = **settings + bot-shaped data**. ORM/SQL for economy, quests, analytics.

| Vault owns | ORM / SQL owns |
|------------|----------------|
| Guild / user / member config | Multi-table transactions |
| Prefix, modules, toggles | Economy, inventories |
| Feature flags, level overrides (1.x) | Quest graphs, mod-log at scale |
| Dashboard-editable bot settings | Analytics |

Vault evolution (1.x): migrations, serializers, SQL/Redis drivers, dashboard CRUD — see [future-v2.md](./future-v2.md).

---

## Phase history (11–23)

Phases 1–10: see [phases.md](./phases.md). Summary of 11+:

| Phase | Status | Highlight |
|-------|--------|-------------|
| 11 Gates | ✅ | `@stambha/gates`; meta from bridges — native meta → 0.3.5 |
| 12 Args | ✅ | Prefix + slash API; native slash options → 0.3.5 |
| 13 Command tree | ✅ | Deploy, subcommands, autocomplete API |
| 14 Plugins | ✅ | `@stambha/plugins`, container |
| 15–16 Transport + REST | ✅ | `@stambha/transport`, `@stambha/rest`, REST worker |
| 17 Transform | ✅ | desiredProperties, slim context |
| 18 Gateway | ✅ | `@stambha/gateway`, bundled WS (0.3.0) |
| 19 Resharding | ✅ | Operator APIs |
| 20 Cross-runtime | ✅ | `@stambha/runtime` |
| 21 Migration docs | ✅ | Public guides + ADRs |
| 22 Authoring (0.3.4) | ✅ | ReplyPayload, REST resources, mention args |
| **23 Native routing (0.3.5)** | ✅ | Options, meta, signals, autocomplete, defer |
| **24 Docs & 1.0.0** | 🔲 | [docs-1.0.0.md](./docs-1.0.0.md), known-gaps page, examples |

---

## 1.0.0 success criteria

Ship **1.0.0** after **0.3.5** ✅, when all of the following are true:

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Production bot on **native transport** (no discord.js) | ✅ monolith + tier split |
| 2 | **Daily authoring** — prefix, slash with options, gates, signals, autocomplete, deploy | ✅ code (0.3.5) |
| 3 | **Ops parity** — split tier, REST queue, sharding path, desired properties | ✅ |
| 4 | **Originals** documented — Vault, Chron, Sequences (scope honest), pipeline pieces | 🔲 [docs-1.0.0](./docs-1.0.0.md) |
| 5 | **Known gaps** public page + 1.x/2.0/plugins backlog | 🔲 [ecosystem-survey](./ecosystem-survey.md) |

**0.3.5 closes the native routing blocker.** **1.0.0** is primarily **docs + semver promise**, not a feature dump.

---

## Priority order (for new contributors)

```text
Now:     1.0.0 — public docs audit + known-gaps page + examples/bot demos
Next:    1.x B1/C1, B2 bridge args, plugins pagination (P1)
Then:    1.x B4–B6 (lifecycle, components, edit tracking)
Later:   2.0 bus, distributed chron, native runSequence
```

---

## Contributing

Pick a release lane or phase, reference this doc in the issue, branch `feature/{short-name}`, follow [.github/CONTRIBUTING.md](../../.github/CONTRIBUTING.md).

Large work should split into reviewable PRs (e.g. `feature/0.3.5-slash-options` before `feature/0.3.5-signals`).
