# Release plan — migration fixes & pipeline alignment

Planning doc for maintainers. Captures **semver release lanes** and maps every known migration gap to an owner. Long-term pillars live in [future-v2.md](./future-v2.md); the feature matrix in [roadmap.md](./roadmap.md).

**Migration policy:** [ADR 005](./adr/005-native-only-migration.md) — native stack only; no official hybrid discord.js path.

**Last updated:** 2026-06-16 (post **0.3.5**)

---

## Release lanes

| Lane | Version | Scope |
|------|---------|--------|
| **Patch** | **0.2.2** | Gates, prefix resolver, loader order — ✅ shipped |
| **Minor** | **0.3.0–0.3.3** | Native WS gateway, loader/DX, epilogues, slash deploy — ✅ shipped |
| **Minor** | **0.3.4** | Rich replies, REST resource helpers, mention id args — ✅ shipped |
| **Minor** | **0.3.5** | Native interaction routing — ✅ shipped |
| **Minor** | **1.0.0** | Stable API; semver promise; [public docs audit](./docs-1.0.0.md) |
| **Minor** | **1.x** | [future-v2.md](./future-v2.md) — B1, C1, Redis, help, B2 entity args |
| **Plugins repo** | `@stambha/dashboard` etc. | Pillar E — HTTP, OAuth, dashboard routes |
| **Major** | **2.0** | Bus, distributed chron, native `runSequence`, breaking CommandOptions if needed |

### Sequencing

```text
0.2.2  ✅ Per-command gates, prefix resolver, loader order
0.3.0  ✅ Bundled gateway WS, native examples, epilogue/DI docs
0.3.3  ✅ Native gateway polish, deploy helpers, docs cleanup
0.3.4  ✅ Rich replies, REST helpers, mention/snowflake args
0.3.5  ✅ Slash options/subcommands, meta, signals, autocomplete, deferReply
1.0.0  🔲 Stable API + public docs (see docs-1.0.0.md)
1.x    🔲 B1–B6, C1, Redis, help, plugins (see ecosystem-survey.md)
2.0.0  🔲 A3 bus, distributed chron, native runSequence
```

---

## Shipped: 0.2.2 (patch)

| ID | Item | Status |
|----|------|--------|
| **P1** | Per-command gate resolution (`gateNames` on `Command`) | ✅ |
| **P2** | `resolvePrefix` on `attachStambhaClient` | ✅ |
| **P4** | Loader loads gates before commands | ✅ |
| **P5–P7** | Native bootstrap + registry + CJS docs | ✅ |

**Cancelled (ADR 005):** P3 `preserveRaw`, hybrid startup patterns.

---

## Shipped: 0.3.0–0.3.3 (minor)

| ID | Item | Status |
|----|------|--------|
| **N1** | Bundled WebSocket shard client → `GatewayEventHub` | ✅ 0.3.0 |
| **N2** | `examples/bot` native bootstrap (monolith + tier split) | ✅ 0.3.0 |
| **N3** | Hook `static create(ctx)` + loader `LoaderContext` DI | ✅ 0.3.3 |
| **N4** | Epilogue phases + `attachCommandLifecycleEpilogues` | ✅ 0.3.3 |
| **N5–N6** | Shard-0 deploy + `deployCommands` dry-run/diff | ✅ 0.3.3 |

**Cancelled (ADR 005):** M1 `attachDiscordJsGateway`, M2 `examples/hybrid-discordjs`.

---

## Shipped: 0.3.4 (minor)

| ID | Item | Package | Status |
|----|------|---------|--------|
| **R1** | `ReplyPayload` on `CommandContext.reply` / `replyEphemeral` | `@stambha/core`, `@stambha/transform` | ✅ |
| **R2** | Slash `editReply` (deferred follow-up) | `@stambha/transform`, `@stambha/gateway` | ✅ |
| **R3** | REST resource helpers (`fetchUser`, guild, messages, …) | `@stambha/rest` | ✅ |
| **R4** | Snowflake + mention id resolvers | `@stambha/args` | ✅ |

Closes app-layer shims for embed replies, `fetchUser`, and mention parsing. Does **not** close native attach routing gaps (see 0.3.5).

---

## Shipped: 0.3.5 (minor)

| ID | Item | Package | Status |
|----|------|---------|--------|
| **I1** | `slashOptions` + `slashPath` on slash `CommandContext` | `@stambha/gateway`, `@stambha/transform` | ✅ |
| **I2** | `CommandContext.meta` from gateway dispatch | `@stambha/gateway`, `@stambha/transform` | ✅ |
| **I3** | Route component interactions → `SignalRouter` | `@stambha/gateway` | ✅ |
| **I4** | Route autocomplete → `Command.autocomplete()` | `@stambha/gateway`, `@stambha/core` | ✅ |
| **I5** | `deferReply` on slash `CommandContext` | `@stambha/core`, `@stambha/transform` | ✅ |
| **I6** | `SignalContext` rich replies + meta parity | `@stambha/transform` | ✅ |

Closes native attach routing gaps. **1.0.0** is unblocked for code; [docs-1.0.0.md](./docs-1.0.0.md) tracks public documentation work.

---

## 0.3.5 (minor) — native interaction routing _(historical spec)_

<details>
<summary>Original 0.3.5 ticket spec (shipped)</summary>

| ID | Item | Package | Notes |
|----|------|---------|-------|
| **I1** | `slashOptions` + `slashPath` on slash `CommandContext` | `@stambha/gateway`, `@stambha/transform` | Parse interaction `data.options`; resolve subcommands/groups |
| **I2** | `CommandContext.meta` from gateway dispatch | `@stambha/gateway`, `@stambha/transform` | Member/client permissions, channel type, NSFW — gates work on native |
| **I3** | Route component interactions → `SignalRouter` | `@stambha/gateway` | Buttons, selects, modals (types 3, 5) |
| **I4** | Route autocomplete → `Command.autocomplete()` | `@stambha/gateway`, `@stambha/core` | Interaction type 4 |
| **I5** | `deferReply` on slash `CommandContext` | `@stambha/core`, `@stambha/transform` | Type 5 deferred callback; pairs with existing `editReply` |
| **I6** | `SignalContext` rich replies + meta parity | `@stambha/transform` | Align with `ReplyPayload` where applicable |

</details>

**Explicitly still 1.x (enhancements):** declarative gates (B1), permission levels (C1), dashboard, Redis, built-in help, typing indicator, REST-backed entity resolvers (B2), bridge commands, piece lifecycle (B4–B6), pagination plugin — see [ecosystem-survey.md](./ecosystem-survey.md).

---

## 1.0.0 — stable API

**Not a feature dump.** Ship when:

1. **0.3.5** is done (native attach covers daily command/interaction flows). ✅
2. `examples/bot` demonstrates slash options, a signal, and permission gates on native stack. 🔲
3. Public docs complete per [docs-1.0.0.md](./docs-1.0.0.md) (including **Known gaps** page). 🔲
4. CHANGELOG + semver policy: breaking changes only in major releases after 1.0.0. 🔲

Known gaps documented for 1.x/2.0/plugins (levels, declarative options, Redis, dashboard, runSequence, pagination).

---

## Full gap coverage matrix

Every gap from production Sapphire → Stambha migrations is assigned. **Nothing unowned.**

| Gap | Owner | Status |
|-----|--------|--------|
| Dashboard HTTP API (routes, OAuth, CORS) | **Plugins E** (`@stambha/dashboard`) | Planned |
| Per-command gates | **0.2.2 P1** | ✅ |
| Dynamic / per-guild prefix | **0.2.2 P2**; long-term **1.x C2** Vault | ✅ resolver |
| Native gateway WebSocket | **0.3.0 N1** | ✅ |
| Rich / embed replies | **0.3.4 R1–R2** | ✅ |
| `fetchUser` / guild REST helpers | **0.3.4 R3** | ✅ |
| Mention / snowflake id args | **0.3.4 R4** | ✅ |
| Slash options on native context | **0.3.5 I1** | ✅ |
| Gate `meta` on native context | **0.3.5 I2** | ✅ |
| Signals (buttons/selects/modals) on native attach | **0.3.5 I3** | ✅ |
| Autocomplete on native attach | **0.3.5 I4** | ✅ |
| Slash `deferReply` | **0.3.5 I5** | ✅ |
| Bridge / hybrid command DX | **1.x B2** | Planned |
| Prefix flags + greedy args | **1.x B2** | Planned |
| Piece lifecycle + command errors | **1.x B4** | Planned |
| Component menu builder + persistent signals | **1.x B5** | Planned |
| Prefix edit tracking | **1.x B6** | Planned |
| Pagination UI | **Plugins P1** | Planned |
| Automated resharding threshold | **1.x G1** | Planned |
| Declarative command options → auto-gates | **1.x B1** | Planned |
| Permission levels | **1.x C1** (`@stambha/levels`) | Planned |
| REST entity arg resolvers | **1.x B2** | Planned |
| Built-in help command | **1.x B3** | Planned |
| Typing indicator | **1.x B1** | Planned |
| Guild config in Vault (prefix, flags, levels) | **1.x C2** | Planned |
| Redis cache / shared cooldown | **1.x A1–A2** | Planned |
| Native `runSequence` orchestration | **2.0 D1** | Planned |
| Distributed Chron | **2.0 D2** | Planned |
| Container / DI (prisma, logger) | **0.3.3 N3** + **1.x** plugins | ✅ core pattern |
| Sharding / resharding | **0.3.0 N1, N5** + `@stambha/gateway` | ✅ |
| Hot load / unload / reload | **Plugins** `@stambha/dev-reload` | Planned |
| Hybrid discord.js / `preserveRaw` | **Cancelled** ADR 005 | — |
| Dual ESM/CJS | **0.2.1** | ✅ |

---

## Pipeline (1.x / 2.0 — do not fold into 0.3.5)

| Pillar | Source | Deliverables |
|--------|--------|--------------|
| **A** | Distributed infra | Redis cache/cooldown, RabbitMQ bus, Influx (**A5 → 0.3.0** ✅) |
| **B** | Sapphire + ecosystem DX | B1 declarative gates, B2 bridge args, B3 help, B4–B6 from [ecosystem-survey](./ecosystem-survey.md) |
| **C** | Permission levels | C1 `@stambha/levels`, C2 Vault overrides |
| **D** | Stambha-only | Native `runSequence`, reshard barriers, distributed chron |
| **E** | Dashboard | `@stambha/dashboard` in plugins repo (ADR 003) |

See [future-v2.md](./future-v2.md) for phases, dependency graph, and open questions.

---

## Related

- [ecosystem-survey.md](./ecosystem-survey.md) — cross-framework adoption backlog
- [docs-1.0.0.md](./docs-1.0.0.md) — public docs gate for 1.0.0
- [migration-shims.md](./migration-shims.md) — deprecated app-layer patterns
- [roadmap.md](./roadmap.md) — feature matrix and 1.0.0 criteria
- [phases.md](./phases.md) — completed phase index
- [adr/005-native-only-migration.md](./adr/005-native-only-migration.md)
- [adr/004-vault-scope-orm-coexistence.md](./adr/004-vault-scope-orm-coexistence.md)
