# Public docs audit — 1.0.0 release gate

Checklist of **public documentation** work required before declaring **1.0.0**. Code may ship earlier; **1.0.0 is not only semver** — it includes an honest, navigable docs site.

**Last updated:** 2026-06-16 · branch `release/1.0.0`

---

## Release policy

| Version | Docs expectation |
|---------|------------------|
| **0.3.x** | Ship features with minimal pages; internal docs track gaps |
| **1.0.0** | All **Tier 1** pages complete; **Tier 2** either done or listed on [Known gaps](/guide/known-gaps) |
| **1.x** | Close Tier 2; ecosystem backlog from [ecosystem-survey.md](./ecosystem-survey.md) |

---

## Tier 1 — must ship for 1.0.0

| Page / area | Status |
|-------------|--------|
| **[Known gaps](/guide/known-gaps)** | ✅ |
| **[Getting started](/guide/getting-started)** | ✅ native bot, slash options, signal, gate meta, deploy |
| **[Pieces & pipeline](/guide/pieces.md)** | ✅ Scout + router diagram |
| **[Scouts](/features/scouts.md)** | ✅ attach, loader, Hook distinction, example bot |
| **[Conduits](/features/conduits.md)** | ✅ priority, epilogues, metrics example |
| **[Barriers](/features/barriers.md)** | ✅ skipOnHelp, maintenance, resharding honest 1.x |
| **[Signals](/features/signals.md)** | ✅ native attach, custom id, deferReply, components |
| **[Sequences](/features/sequences.md)** | ✅ manual wire / runSequence 2.0 |
| **[Args](/features/args.md)** | ✅ mention/snowflake, SlashArgs native |
| **[Gates](/features/gates.md)** | ✅ ctx.meta table |
| **[Command tree](/features/command-tree.md)** | ✅ slashPath, native routing |
| **[Epilogues](/features/epilogues.md)** | ✅ denied vs blocked, lifecycle helper |
| **[Desired properties](/features/desired-properties.md)** | ✅ gatesDesiredProperties |
| **[Deployment / Gateway](/deployment/gateway.md)** | ✅ attachStambhaClient options |
| **[Migration / Sapphire](/migration/from-sapphire.md)** | ✅ native attach |
| **[Migration / Discordeno](/migration/from-discordeno.md)** | ✅ desiredProperties + attach |
| **`examples/bot`** | ✅ say, confirm, lock commands + demo events |

---

## Tier 2 — expand or defer with known-gaps entry

| Page / area | Status |
|-------------|--------|
| **[Chron](/features/chron.md)** | ✅ single-process + 2.0 defer on known-gaps |
| **[Vault](/features/vault.md)** | ✅ dashboard cross-link (plugins) |
| **[Plugins](/features/plugins.md)** | ✅ Hook.create, unload, binder |
| **[Hooks](/features/hooks.md)** | ✅ Hook vs Scout vs Signal tree |
| **[Tier split](/deployment/tier-split.md)** | ✅ interaction routing table |
| **[Resharding](/deployment/resharding.md)** | ✅ vs Discordeno + G1 |
| **[Metrics](/deployment/metrics.md)** | ✅ Stambha-plugins install |
| **[Reference / Transport](/reference/transport.md)** | ✅ package map |
| **Migration from Klasa** | ✅ [from-klasa.md](/migration/from-klasa) |
| **Versioned snapshots** | ✅ `docs/versions/0.3.5/` (archive at tag) |

---

## Tier 3 — internal-only (do not block 1.0.0)

Stay in `docs/internal/`:

- [ecosystem-survey.md](./ecosystem-survey.md)
- [release-plan.md](./release-plan.md), [future-v2.md](./future-v2.md)
- ADRs

---

## Underdocumented **concepts** (content to add across pages)

| Concept | Where | Status |
|---------|-------|--------|
| **Pipeline order** | `guide/pieces`, `guide/why-stambha` | ✅ |
| **`attachStambhaClient` contract** | `deployment/gateway`, getting started | ✅ |
| **Outcome model** | getting started | ✅ |
| **PiecePaths / loader order** | `guide/project-structure` | ✅ |
| **REST vs domain data** | `features/vault`, migration | ✅ (vault + ADR 004) |
| **Plugins vs core** | `features/plugins` | ✅ |
| **CJS bots** | getting started callout | ✅ |

---

## 1.0.0 sign-off checklist

- [x] All **Tier 1** rows complete
- [x] [roadmap.md](./roadmap.md) criterion #5 (known gaps public)
- [x] [release-plan.md](./release-plan.md) 1.0.0 section criteria (docs + examples; version tag pending)
- [x] `pnpm build` + `pnpm test`
- [x] CHANGELOG 1.0.0 section + semver policy in README
- [ ] `pnpm version:bump 1.0.0` + git tag `v1.0.0` (maintainer release step)
- [ ] `pnpm docs:archive 1.0.0` at release tag

---

## Related

- [roadmap.md](./roadmap.md) — 1.0.0 success criteria
- [ecosystem-survey.md](./ecosystem-survey.md) — feature adoption backlog (B4–B6, P1, G1)
- [future-v2.md](./future-v2.md) — 1.x / 2.0 pillars
