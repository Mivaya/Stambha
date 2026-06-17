# Public docs audit — 1.0.0 release gate

Checklist of **public documentation** work required before declaring **1.0.0**. Code may ship earlier; **1.0.0 is not only semver** — it includes an honest, navigable docs site.

**Last updated:** 2026-06-16 (post **0.3.5**)

---

## Release policy

| Version | Docs expectation |
|---------|------------------|
| **0.3.x** | Ship features with minimal pages; internal docs track gaps |
| **1.0.0** | All **Tier 1** pages complete; **Tier 2** either done or listed on [Known gaps](/guide/known-gaps) |
| **1.x** | Close Tier 2; ecosystem backlog from [ecosystem-survey.md](./ecosystem-survey.md) |

---

## Tier 1 — must ship for 1.0.0

These pages exist but are **thin, stale, or missing native-0.3.5 paths**. Expand before 1.0.0.

| Page / area | Current state | 1.0.0 requirement |
|-------------|---------------|-------------------|
| **[Known gaps](/guide/known-gaps)** | **Missing** | New public page: supported native path vs 1.x/2.0/plugins backlog (link ecosystem items by ID) |
| **[Getting started](/guide/getting-started)** | Partial | End-to-end native bot: slash **with options**, one **Signal**, one **gate using meta**, deploy |
| **[Pieces & pipeline](/guide/pieces.md)** | Good overview | Add **Scout** position (before router); full diagram matching [why-stambha](/guide/why-stambha) |
| **[Scouts](/features/scouts.md)** | Basic | `attachStambhaClient({ scouts })`, loader path, vs Hook distinction, example in `examples/bot` |
| **[Conduits](/features/conduits.md)** | Basic | Priority order, interaction with epilogues, metrics conduit example |
| **[Barriers](/features/barriers.md)** | Basic | `skipOnHelp`, maintenance mode, reshard barrier placeholder (honest “1.x”) |
| **[Signals](/features/signals.md)** | Updated 0.3.5 | Full native attach flow; `stambha:` custom id spec; deferReply on SignalContext |
| **[Sequences](/features/sequences.md)** | Honest partial | Clear “manual wire today / runSequence 2.0”; step-by-step with Signals |
| **[Args](/features/args.md)** | Good | Prefix mention/snowflake + slash `SlashArgs.fromContext` on **native** attach |
| **[Gates](/features/gates.md)** | Good | Native `ctx.meta` fields table; which gates need meta |
| **[Command tree](/features/command-tree.md)** | Good | Native `slashPath` / subcommands routing |
| **[Epilogues](/features/epilogues.md)** | Good | Link phases to `attachCommandLifecycleEpilogues`; denied vs blocked |
| **[Desired properties](/features/desired-properties.md)** | Good | Gateway trim + `gatesDesiredProperties` recipe |
| **[Deployment / Gateway](/deployment/gateway.md)** | Partial | `attachStambhaClient` options table (`signals`, `autocomplete`, `applicationId`) |
| **[Migration / Sapphire](/migration/from-sapphire.md)** | Good | Remove any stale bridge wording; point to native 0.3.5 attach |
| **[Migration / Discordeno](/migration/from-discordeno.md)** | Good | desiredProperties + native attach parity |
| **`examples/bot`** | Partial | Demonstrate: slash options, Signal button, PermissionGate on meta, scout optional |

---

## Tier 2 — expand or defer with known-gaps entry

| Page / area | Gap | 1.0.0 action |
|-------------|-----|--------------|
| **[Chron](/features/chron.md)** | No tier-split example | Add single-process example; defer distributed → known gaps |
| **[Vault](/features/vault.md)** | Dashboard CRUD not documented | Cross-link plugins `@stambha/dashboard` as planned |
| **[Plugins](/features/plugins.md)** | Loader DI advanced patterns | `Hook.create`, plugin unload, container binder |
| **[Hooks](/features/hooks.md)** | vs Scouts overlap | Decision tree: Hook vs Scout vs Signal |
| **[Tier split](/deployment/tier-split.md)** | Interaction events across workers | Document which interactions must hit bot worker |
| **[Resharding](/deployment/resharding.md)** | vs Discordeno auto-reshard | Honest manual/API story; link **G1** backlog |
| **[Metrics](/deployment/metrics.md)** | Plugins repo | Install from Stambha-plugins, version pin |
| **[Reference / Transport](/reference/transport.md)** | Thin | Package map + “when to use which” |
| **Migration from Klasa** | **Missing** | Optional page: gates, levels, hot reload → Stambha equivalents |
| **Versioned snapshots** | 0.2.x only archived | Run `pnpm docs:archive 0.3.5` before 1.0.0 tag |

---

## Tier 3 — internal-only (do not block 1.0.0)

Stay in `docs/internal/`:

- [ecosystem-survey.md](./ecosystem-survey.md)
- [release-plan.md](./release-plan.md), [future-v2.md](./future-v2.md)
- ADRs

---

## Underdocumented **concepts** (content to add across pages)

| Concept | Where to document | Notes |
|---------|-------------------|-------|
| **Pipeline order** | `guide/pieces`, `guide/why-stambha` | Scout → (router) → Conduit → Barrier → Gate → Command → Epilogue; Signals parallel |
| **`attachStambhaClient` contract** | `deployment/gateway`, getting started | Normalized hub events; toggles |
| **Outcome model** | New snippet in getting started or gates | `ok()` / `err()` vs throw |
| **PiecePaths / loader order** | `guide/project-structure` | gates before commands |
| **REST vs domain data** | `features/vault`, migration | ADR 004 summary |
| **Plugins vs core** | `features/plugins`, publishing | Stambha-plugins independent semver |
| **CJS bots** | getting started callout | Pin `@stambha/*@0.2.1+` for `require()` |

---

## Suggested work order

```text
1. Add guide/known-gaps.md (public) — single honest backlog page
2. Expand deployment/gateway + getting-started for 0.3.5 attach
3. Flesh scouts, conduits, barriers, sequences (Tier 1)
4. examples/bot: SetupCommand-style signal + slash options demo
5. docs:archive 0.3.5 (and 1.0.0 at release)
6. Tier 2 pages or known-gaps deferrals
```

---

## 1.0.0 sign-off checklist

- [ ] All **Tier 1** rows marked done in this file
- [ ] [roadmap.md](./roadmap.md) criterion #5 (known gaps public) satisfied
- [ ] [release-plan.md](./release-plan.md) 1.0.0 section criteria met
- [ ] `pnpm build` + `pnpm test` on `examples/bot` with documented flows
- [ ] CHANGELOG 1.0.0 section + semver policy in README

---

## Related

- [roadmap.md](./roadmap.md) — 1.0.0 success criteria
- [ecosystem-survey.md](./ecosystem-survey.md) — feature adoption backlog (B4–B6, P1, G1)
- [future-v2.md](./future-v2.md) — 1.x / 2.0 pillars
