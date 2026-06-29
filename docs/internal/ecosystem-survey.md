# Ecosystem survey — frameworks & libraries

Maintainer reference: what other Discord bot ecosystems offer, what Stambha already covers, and **where to adopt ideas** (by release lane). Not linked in the public sidebar.

**References today:** Sapphire, Discordeno, Klasa (historical), plus originals (Vault, Sequences, Chron, pipeline).

**Surveyed (2026-06):** Akairo, Eris, discord.py, Pycord, Hikari (+ Lightbulb, Tanjun), Serenity (+ Poise), DiscordGo.

**Last updated:** 2026-06-16 (post **0.3.5**)

---

## Stambha positioning

```text
Sapphire ergonomics  +  Discordeno scale  +  Stambha originals (Vault, Sequences, pipeline)
```

**Moat:** transport-agnostic pipeline, tier split, Vault, Outcome model — not “another discord.js framework.”

**DX gap vs Python/Rust ecosystems:** hybrid commands, collectors/pagination, persistent views, prefix edit-tracking, piece error boundaries.

---

## Availability legend

| Lane | Meaning |
|------|---------|
| **✅ Now** | Shipped in core or plugins repo |
| **0.3.5** | Shipped 0.3.5 |
| **1.0.0** | Docs / polish only — no new API required |
| **1.x** | Post-stable enhancement (see [future-v2.md](./future-v2.md)) |
| **Plugins** | [Stambha-plugins](https://github.com/Mivaya/Stambha-plugins) |
| **2.0** | Major / distributed |
| **Won't** | Conflicts with ADR 005 or product scope |

---

## Cross-ecosystem feature matrix

| Idea | Strong in | Stambha today | Owner | Notes |
|------|-----------|---------------|-------|-------|
| Piece / cog modules | Sapphire, discord.py | **✅** registries + loader | — | Cog lifecycle hooks → **1.x B4** |
| Preconditions / checks | Sapphire, discord.py, Poise | **✅** gates + `gateNames` | — | Declarative auto-gates → **1.x B1** |
| Multi-stage inhibitors | Akairo | **Partial** scouts + barriers | **1.0.0 docs** | Pipeline underdocumented publicly |
| Hybrid / bridge commands | Pycord, Poise, discord.py | **Partial** `kinds: ['slash','prefix']` | **1.x B2** | Unified arg mapping |
| Prefix flags (`--foo=bar`) | Klasa, discord.py FlagConverter | **Partial** lexer | **1.x B2** | |
| Greedy / optional / rest args | discord.py, Klasa | **Partial** | **1.x B2** | |
| Argument prompting | Klasa | **Won't** until designed | **1.x** | Ask user for missing arg |
| Type / annotation-driven args | Poise, Tanjun | **Partial** `@stambha/args` | **1.x B2** | Entity resolvers |
| Permission levels | Klasa, custom bots | **Planned** | **1.x C1** `@stambha/levels` |
| Rich + deferred slash replies | discord.js ecosystem | **✅** 0.3.4–0.3.5 | — | `ReplyPayload`, `deferReply`, `editReply` |
| REST entity helpers | App shims | **✅** 0.3.4 `@stambha/rest` | — | |
| Native interaction routing | Discordeno path | **✅** 0.3.5 | — | Options, meta, signals, autocomplete |
| Component UI builders | Lightbulb, discord.py Views | **Partial** Signals + Sequences | **1.x B5** | Menu/modal row layout |
| Collectors (message/reaction/interaction) | discord.js, Serenity, eris-collector | **Partial** Sequences | **2.0 D1** `runSequence` | |
| Persistent components (survive restart) | discord.py `add_view` | **Partial** Signals + `stambha:` ids | **1.x B5** | `registerPersistentSignals()` |
| Built-in pagination | Pycord `ext.pages` | **None** | **Plugins** `@stambha/pagination` | High value for app bots |
| Edit-tracking prefix replies | Poise, Akairo | **None** | **1.x B6** | Re-run/update on `messageUpdate` |
| Per-piece / per-cog error hooks | discord.py | **Partial** epilogues | **1.x B4** | `onCommandError` on Piece |
| desiredProperties / RAM trim | Discordeno | **✅** | — | |
| Tier split + REST queue | Discordeno | **✅** | — | |
| Resharding APIs | Discordeno | **✅** | — | Auto threshold → **1.x gateway** |
| Gateway proxy (zero-downtime deploy) | Discordeno | **None** | **2.0** or gateway plugin | |
| Dashboard HTTP + OAuth | Sapphire plugin-api | **None** | **Plugins E** `@stambha/dashboard` | |
| Hot reload all pieces | Klasa | **None** | **Plugins** `@stambha/dev-reload` | |
| Low-level transport only | Eris, DiscordGo | **✅** optional | — | `examples/bot` = opinionated path |
| Voice | Serenity, DiscordGo | **Won't** in core | — | App/plugin concern |
| ORM in framework | Atsume (Hikari) | **Won't** | — | Vault + BYO ORM ([ADR 004](./adr/004-vault-scope-orm-coexistence.md)) |

---

## Per-ecosystem notes

### Akairo (discord.js framework)

- **Inhibitors** at multiple stages — maps to Stambha **Scouts** (pre-command messages) + **Barriers** (global command block) + **Gates** (per-command). Document the mapping in 1.0.0; no new API required.
- **Commands on message edit** — adopt as **edit tracking** (**1.x B6**).
- **Regex / conditional triggers** — low priority; prefix router already handles aliases.

### Eris (lean Node library)

- **Philosophy:** minimal API surface. Stambha should keep **monolith bootstrap** in `examples/bot` as short as Eris’s CommandClient pattern.
- Collectors are community (`eris-collector`); Stambha **Signals/Sequences** are the answer.

### discord.py / Pycord (Python)

- **Cogs** lifecycle → **1.x B4** piece `onLoad` / `onUnload` / `onCommandError`.
- **Hybrid / bridge commands** → **1.x B2** (Pycord `ext.bridge` is the clearest spec).
- **FlagConverter, Greedy, Optional** → **1.x B2** prefix arg power.
- **Views + persistent views** → **1.x B5** on Signals.
- **`ext.pages` Paginator** → **`@stambha/pagination`** plugin (Tier A for app bots like Vyne).

### Hikari + Lightbulb + Tanjun (Python)

- **Microframework + optional command layer** — same shape as Stambha core vs loader.
- **Lightbulb Menu/Modal builders** — **1.x B5** ergonomic component layout.
- **Tanjun DI** — extend **LoaderContext / binder** (pattern exists via `Hook.create(ctx)`).

### Serenity + Poise (Rust)

- **Edit tracking** — distinctive; **1.x B6**.
- **One function slash + prefix** — same target as bridge commands (**1.x B2**).
- **Type-driven args** — informs **B2** REST entity resolvers.
- **Collectors** feature — converges with **2.0 runSequence**.

### DiscordGo (Go)

- **Low-level only** — validates ADR 005. No framework features to port; optional **autoshard helper** already partially covered by `fetchGatewayBot` + gateway client.

### Already primary references

| Source | Stambha absorption |
|--------|-------------------|
| **Sapphire** | Pieces, plugins, gates, command tree, migration folder layout |
| **Discordeno** | desiredProperties, gateway manager, tier split, resharding |
| **Klasa** | Permission levels → C1; settings → Vault; flags/prompting → B2 backlog |

---

## Prioritized adoption backlog

### Tier A — high impact, fits pillars (1.x / plugins)

| ID | Feature | Inspired by | Package / lane |
|----|---------|-------------|----------------|
| **B2** | Bridge command DX + prefix flags + entity args | Pycord, Poise, Klasa | `@stambha/args`, core |
| **B3** | Built-in help | Sapphire | `@stambha/help` |
| **B4** | Piece lifecycle + command error hooks | discord.py cogs | `@stambha/core`, loader |
| **B5** | Component menu builder + persistent signals | Lightbulb, discord.py | `@stambha/core` or plugin |
| **B6** | Prefix edit tracking | Poise, Akairo | `@stambha/gateway` attach |
| **P1** | Pagination plugin | Pycord pages | `@stambha/pagination` (plugins) |

### Tier B — scale & ops (1.x / 2.0)

| ID | Feature | Inspired by | Lane |
|----|---------|-------------|------|
| **G1** | Automated resharding threshold (e.g. 80% guild cap) | Discordeno | `@stambha/gateway` |
| **G2** | Gateway proxy for zero-downtime code deploy | Discordeno | 2.0 or optional gateway |
| **D1** | Native `runSequence` / collectors | discord.js, Serenity | 2.0 |

### Tier C — already on roadmap (validate only)

- **B1** declarative gates — Sapphire
- **C1** permission levels — Klasa
- **E** dashboard — Sapphire plugin-api
- **A1–A3** Redis, bus — Discordeno scale story

---

## Explicit non-adoptions

- discord.js / Discordeno **objects in `@stambha/core`**
- Framework-owned SQL ORM (use Vault + Prisma/Drizzle)
- Mandatory Redis/RabbitMQ for single-process bots
- Official hybrid discord.js gateway path ([ADR 005](./adr/005-native-only-migration.md))
- Voice stack in core monorepo

---

## Related

- [future-v2.md](./future-v2.md) — pillars B–E, dependency graph
- [release-plan.md](./release-plan.md) — semver lanes
- [roadmap.md](./roadmap.md) — feature matrix
- [docs-1.0.0.md](./docs-1.0.0.md) — public docs audit before stable release
