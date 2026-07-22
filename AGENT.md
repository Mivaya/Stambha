# Stambha — agent & architecture guide

Canonical architecture and conventions for contributors and coding agents working in this repository.

For contribution workflow (PRs, branching, releases), see [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md).

Cursor-specific migration and release detail: [.cursor/skills/stambha/SKILL.md](.cursor/skills/stambha/SKILL.md).

If your coding agent expects a different filename, create a local symlink to this file instead of copying it:

```bash
ln -s AGENT.md CLAUDE.md
ln -s AGENT.md GEMINI.md
ln -s AGENT.md COPILOT.md
```

---

## What Stambha is

Stambha is a **native-first** Discord bot framework for Node.js 20+ and TypeScript.

- **npm scope:** `@stambha/*` (core monorepo, fixed versioning)
- **Extensions:** `@stambha/cache`, `@stambha/metrics`, `@stambha/vault-sql`, … publish from [**Stambha-plugins**](https://github.com/Mivaya/Stambha-plugins) with independent semver
- **Transport:** `@stambha/rest`, `@stambha/gateway`, `@stambha/transform` — no third-party Discord client library in core
- **Do not** use or suggest `@stambha/bridge-*` — removed (ADR 005)
- **Signal custom ids:** `stambha:` prefix (sequences: `stambha:seq:`)
- **GitHub:** `mivaya/Stambha` · **docs base:** `/Stambha/`

---

## Package layers

```text
@stambha/core          Pipeline, registries, pieces, vault, sequences — NO discord.js / Discordeno
        ↓
@stambha/transform     StambhaMessage, StambhaInteraction, CommandContext builders
        ↓
@stambha/rest          RestPort, rate limits, slash deploy, resource helpers
@stambha/gateway       Native WebSocket gateway, attachStambhaClient
@stambha/loader        Auto-load pieces from src/ folders
@stambha/gates         Built-in gate pieces (cooldown, permissions, …)
@stambha/levels        Numeric permission levels (Everyone → BotOwner ladder)
@stambha/args          Prefix + slash argument resolvers
@stambha/help          Built-in help command (category catalog)
@stambha/vault         Typed guild config blueprints
@stambha/plugins       Lifecycle hooks + container DI
```

| Layer | Responsibility |
|-------|----------------|
| `@stambha/core` | Routing, pipeline, registries, sequences, chron — **no** Discord library imports |
| `@stambha/transform` | Normalize Discord payloads ↔ Stambha contexts |
| `@stambha/rest` / `@stambha/gateway` | Native transport (gateway events, REST worker) |
| `@stambha/vault`, `@stambha/loader`, … | Optional packages integrating via `@stambha/core` types |

**Rule:** Do not import Discord library types into `@stambha/core`. If core needs a capability, add a small interface in core and implement it in transform, rest, or gateway.

**Native only:** `@stambha/transform` ships native shapes (`StambhaMessage`, `interactionFromDispatch`, `metaFromDiscordInteraction`). discord.js / Discordeno shape adapters were removed in **1.5.0** (deprecated since 1.0.0).

---

## Command pipeline

```text
Command invoked (slash / prefix / context menu)
    → Conduits (middleware)
    → Barriers (global blockers)
    → Gates (per-command checks)
    → execute(ctx)
    → Epilogues (post-run hooks)
```

**Piece types** (folder conventions in [project structure](docs/guide/project-structure.md)):

| Folder | Class |
|--------|-------|
| `commands/` | `Command` |
| `listeners/` | `Hook` |
| `scouts/` | `Scout` |
| `barriers/` | `Barrier` |
| `gates/` | `Gate` |
| `conduits/` | `Conduit` |
| `epilogues/` | `Epilogue` |
| `signals/` | `Signal` |
| `tasks/` | `Chron` |
| `schemas/` | Vault blueprints |

New piece types belong in core only when they fit this pipeline and benefit most bots.

---

## Native attach

Production bots use the native stack:

```ts
import { createNativeGatewayClient, attachStambhaClient } from "@stambha/gateway";
import { createNativeRestPort } from "@stambha/rest";
```

`attachStambhaClient` routes prefix commands, slash commands (options + `ctx.meta`), autocomplete, signals, and scouts when the gateway emits normalized payloads.

**Reference implementation:** read `examples/bot/src/lib/setup.ts` before inventing new bootstrap structure.

---

## Repo anchors

| Resource | Path |
|----------|------|
| Architecture (this file) | `AGENT.md` |
| Contributing | `.github/CONTRIBUTING.md` |
| Full example bot | `examples/bot/` |
| Minimal mock bot | `examples/minimal/` |
| Getting started | `docs/guide/getting-started.md` |
| Project structure | `docs/guide/project-structure.md` |
| Known gaps (public) | `docs/guide/known-gaps.md` |
| Migration guides | `docs/migration/` |
| Tier split | `docs/deployment/tier-split.md` |
| Publishing (maintainers) | `.github/PUBLISHING.md` |
| Cursor release skill | `.cursor/skills/release/SKILL.md` |
| Extensions repo | `.cursor/skills/stambha-plugins/SKILL.md` |

---

## Conventions for code changes

### Monorepo

- **pnpm** workspaces; internal deps as `workspace:*`
- **ESM** in source; `.js` import suffixes in TypeScript
- **Dual publish:** ESM (`import`) + CJS (`require`) from v0.2.1+ — pin `@stambha/*@0.2.1` minimum for CommonJS bots

### TypeScript

- Match existing strictness (`exactOptionalPropertyTypes`, ESM)
- Prefer explicit types on public APIs
- Avoid `any`; narrow types at transport boundaries

### Style

- [Biome](https://biomejs.dev/) — run `pnpm lint` before pushing
- Match surrounding code: minimal abstractions, no drive-by refactors
- Comments only for non-obvious behavior

### Tests

- **Vitest** in the package you change
- Core logic: test with `MockBridge` where possible
- Gateway/REST tests: small Discord payload fixtures

### Before release-related commits

```bash
pnpm build
pnpm test
```

### API names

Use **Stambha** naming (`StambhaClient`, `createStambhaBot`, `attachStambhaClient`) — not Stratum or legacy bridge names.

---

## Adding a new `@stambha/*` package

1. Create `packages/<name>/` following an existing package layout (`package.json`, `tsconfig.json`, `src/index.ts`, `README.md`, `CHANGELOG.md`)
2. Wire into root `pnpm-workspace.yaml` if needed
3. Add to root publish filter / version bump script targets
4. Export only through `@stambha/core` types where possible — no Discord library imports
5. Add Vitest tests and a short README
6. Document in `docs/` if user-facing

## Adding a new piece type

1. Propose in an issue first — must fit the execution pipeline
2. Add base class + registry in `@stambha/core`
3. Add loader path in `@stambha/loader` (`PiecePaths`)
4. Update [project structure](docs/guide/project-structure.md) and examples

---

## Semver (1.0.0+)

| Release | Policy |
|---------|--------|
| **Major** | Breaking API changes only |
| **Minor** | New features, backward compatible |
| **Patch** | Bug fixes, backward compatible |

Breaking changes require clear PR description, docs updates, and example fixes.
