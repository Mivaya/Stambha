# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-29

**First production release of the native stack.** v1.0.0 is the milestone where a bot can run end-to-end on `@stambha/gateway`, `@stambha/rest`, and `@stambha/transform` — slash and prefix commands, signals, autocomplete, gates on native `ctx.meta`, and tier split — with public docs, and `examples/bot` demos that match what ships.

### Added

- `ReplyPayload.components` — action rows on `CommandContext.reply`, `editReply`, and channel sends (`@stambha/core`, `@stambha/transform`).
- `SignalContext.editReply` on component/modal handlers when `applicationId` is available (pairs with `deferReply`; `@stambha/core`, `@stambha/transform`, `@stambha/gateway`).
- **Public [Known gaps](https://github.com/mivaya/Stambha/blob/main/docs/guide/known-gaps.md)** — supported native path vs 1.x / 2.0 / plugins backlog.
- `examples/bot` **demos** — `SayCommand` (slash options), `ConfirmCommand` (signal button), `LockCommand` (permission gate on native `ctx.meta`).
- **[AGENT.md](https://github.com/mivaya/Stambha/blob/main/AGENT.md)** — architecture and coding-agent conventions; [CONTRIBUTING](https://github.com/mivaya/Stambha/blob/main/.github/CONTRIBUTING.md) restyled for contributors.



### Changed

- **Public docs** — expanded guides for getting started, pieces, scouts, conduits, barriers, signals, sequences, args, gates, epilogues, deployment, and migration; remaining gaps called out on the [Known gaps](https://github.com/mivaya/Stambha/blob/main/docs/guide/known-gaps.md) page.
- `@stambha/transform` — discord.js / Discordeno shape adapters **deprecated**; `discord.js` removed from devDependencies; duck-typed interfaces + one-time runtime warnings; native bots use `interactionFromDispatch` only.



### Packages in this release


| Package                      | Version |
| ---------------------------- | ------- |
| All publishable `@stambha/*` | 1.0.0   |




## [0.3.5] - 2026-06-16

Native **interaction routing** — closes the 1.0.0 blocker for production bots on `attachStambhaClient`.

### Added

- `interactionFromDispatch` — parses slash, autocomplete, component, and modal interactions with `slashOptions`, `slashPath`, and `meta`.
- `attachStambhaClient` routes autocomplete → `Command.autocomplete()`, components/modals → `SignalRouter`, with `signals` / `autocomplete` toggles.
- `deferReply` on slash `CommandContext` (interaction callback type 5).
- `autocompleteContextFromStambhaInteraction`, `signalContextFromStambhaInteraction` in `@stambha/transform`.
- `InboundRouter.processAutocomplete` + `autocompleteError` client event.



### Changed

- `commandContextFromStambhaSlashViaRest` takes a full `StambhaSlashInteraction` (includes options, path, meta).
- Public docs updated for native slash options, signals, autocomplete, and gate metadata.



### Packages in this release


| Package                | Version |
| ---------------------- | ------- |
| `@stambha/core`        | 0.3.5   |
| `@stambha/gateway`     | 0.3.5   |
| `@stambha/transform`   | 0.3.5   |
| All other `@stambha/*` | 0.3.5   |




## [0.3.4] - 2026-06-16

Minor release closing **bot authoring gaps** that previously required app-layer shims (rich replies, REST helpers, mention parsing).

### Added

- `ReplyPayload` on `CommandContext.reply` / `replyEphemeral` — content, embeds, and ephemeral flag (`@stambha/core`, `@stambha/transform`).
- Slash `editReply` for deferred interaction follow-ups (requires `application_id` on the interaction or `applicationId` on `attachStambhaClient`).
- `@stambha/rest` **resource helpers** — `fetchUser`, `fetchGuild`, `fetchGuildMember`, `fetchChannel`, channel message CRUD, guild roles/channels, moderation helpers.
- **Mention / snowflake id resolvers** in `@stambha/args` — `snowflakeArg`, `userMentionArg`, `channelMentionArg`, `roleMentionArg`.



### Changed

- `interactionFromDispatch` includes `applicationId` for slash `editReply`.
- `@stambha/args` **README** — documents actual built-in resolvers; REST entity resolvers deferred to **1.x B2**.
- Internal roadmap / release plan — **0.3.4** vs **1.x** enhancement split documented.



### Packages in this release


| Package              | Version |
| -------------------- | ------- |
| `@stambha/core`      | 0.3.4   |
| `@stambha/gateway`   | 0.3.4   |
| `@stambha/loader`    | 0.3.4   |
| `@stambha/gates`     | 0.3.4   |
| `@stambha/args`      | 0.3.4   |
| `@stambha/plugins`   | 0.3.4   |
| `@stambha/rest`      | 0.3.4   |
| `@stambha/runtime`   | 0.3.4   |
| `@stambha/transform` | 0.3.4   |
| `@stambha/transport` | 0.3.4   |
| `@stambha/vault`     | 0.3.4   |




## [0.3.3](https://github.com/mivaya/Stambha/releases/tag/v0.3.3) - 2026-06-15

Minor release focused on **native gateway WebSocket**, loader dependency injection, epilogues, and slash command deploy helpers.

### Added

- `createNativeGatewayClient` in `@stambha/gateway` — bundled Discord gateway WebSocket client that feeds a `GatewayEventHub` (identify, resume, heartbeat, dispatch normalization).
- `fetchGatewayBot`, dispatch normalizers (`messageFromDispatch`, `interactionFromDispatch`, …).
- `examples/bot` — monolith and tier-split gateway workers use the native client when `DISCORD_TOKEN` is set.
- `LoaderContext` auto-injects `binder`, `container`, `logger`; optional `bindings` on `loadPieces`.
- **Hook** `static create(ctx)` documented — replaces app-layer hook base classes with `container` getter.
- **Epilogue phases** — `runOn: "denied" | "blocked"`; `EpilogueContext.phase`.
- `attachCommandLifecycleEpilogues` / `createCommandLoggingEpilogue` — replace bootstrap `client.on('command*')`.
- `shouldDeploySlashCommands`, `deployCommandsIfShardZero`, `formatDeployDiff`, `resolveShardIdFromEnv` (`@stambha/rest`).
- `deployCommands` — `existing` snapshot for offline `dryRun` + `diff`.
- `examples/bot` — shard-0 deploy on gateway `ready`; tier-split bot worker deploys once; `pnpm deploy:dry-run`.
- **CI** — slash deploy dry-run step on example bot.



### Changed

- Gateway deployment docs updated for native WebSocket bootstrap.
- Docs: [Epilogues](/features/epilogues), expanded [project structure](/guide/project-structure), [Slash deploy](/deployment/slash-deploy).



### Packages in this release


| Package              | Version |
| -------------------- | ------- |
| `@stambha/core`      | 0.3.3   |
| `@stambha/gateway`   | 0.3.3   |
| `@stambha/loader`    | 0.3.3   |
| `@stambha/gates`     | 0.3.3   |
| `@stambha/args`      | 0.3.3   |
| `@stambha/plugins`   | 0.3.3   |
| `@stambha/rest`      | 0.3.3   |
| `@stambha/runtime`   | 0.3.3   |
| `@stambha/transform` | 0.3.3   |
| `@stambha/transport` | 0.3.3   |
| `@stambha/vault`     | 0.3.3   |


Extensions `@stambha/cache`, `@stambha/metrics`, `@stambha/vault-sql` — see [Stambha-plugins CHANGELOG](https://github.com/Mivaya/Stambha-plugins/blob/main/CHANGELOG.md).

## [0.2.2](https://github.com/mivaya/Stambha/releases/tag/v0.2.2) - 2026-06-11

Patch release focused on **migration ergonomics** (gates, prefixes, loader order) and repo hygiene.

### Added

- `CommandOptions.gateNames` — run registry gate pieces only on commands that list them.
- `GateOptions.global` — opt-in bot-wide gates (piece-framework precondition parity).
- `resolvePrefix` on `attachStambhaClient` / gateway attach — async per-guild or dynamic prefix resolution.
- **Loader** loads `gates/` before `commands/` and validates `gateNames` after `loadPieces()`.
- **Docs:** [Why Stambha](https://mivaya.github.io/Stambha/guide/why-stambha), expanded migration guide, versioned docs snapshot (`docs/versions/0.2.2/`).
- `publishConfig.access: public` on all publishable `@stambha/*` packages.
- `scripts/bump-versions.mjs` — `pnpm version:bump <semver>` for fixed monorepo releases.



### Changed

- **Official extensions** (`@stambha/cache`, `@stambha/metrics`, `@stambha/vault-sql`) publish only from **[Stambha-plugins](https://github.com/Mivaya/Stambha-plugins)**.
- **Releases** — tag-driven GitHub Releases → `publish-npm.yml` (replaces Changesets).
- Registry iteration documented (`toArray()` / `values()` on registries).



### Removed

- `packages/cache`, `packages/metrics`, `packages/vault-sql` from the core monorepo (live in Stambha-plugins).
- **Changesets** — `.changeset/`, `release.yml`, and `@changesets/cli`.



### Breaking changes

- **Registry gates are no longer global by default.** Gate pieces run only when listed in `command.gateNames`, passed inline on the command, or marked `global: true` on the gate piece.



### Migration

```diff
 export class ModGate extends Gate {
+  options = { global: true };
 }

 export class BanCommand extends Command {
+  options = { gateNames: ["mod-only"] };
 }
```

```ts
attachStambhaClient(hub, client, {
  resolvePrefix: async ({ guildId }) => fetchGuildPrefix(guildId) ?? "!",
});
```

See the [migration guide](https://mivaya.github.io/Stambha/migration/from-sapphire) and [Gates](https://mivaya.github.io/Stambha/features/gates).

### Packages in this release


| Package              | Version |
| -------------------- | ------- |
| `@stambha/core`      | 0.2.2   |
| `@stambha/gateway`   | 0.2.2   |
| `@stambha/loader`    | 0.2.2   |
| `@stambha/gates`     | 0.2.2   |
| `@stambha/args`      | 0.2.2   |
| `@stambha/plugins`   | 0.2.2   |
| `@stambha/rest`      | 0.2.2   |
| `@stambha/runtime`   | 0.2.2   |
| `@stambha/transform` | 0.2.2   |
| `@stambha/transport` | 0.2.2   |
| `@stambha/vault`     | 0.2.2   |


Extensions `@stambha/cache`, `@stambha/metrics`, `@stambha/vault-sql` — see [Stambha-plugins CHANGELOG](https://github.com/Mivaya/Stambha-plugins/blob/main/CHANGELOG.md).

## [0.2.1](https://github.com/mivaya/Stambha/releases/tag/v0.2.1) - 2026-06-08



### Added

- **Per-package READMEs** on npm — install steps, quick starts, and export tables for all `@stambha/`* packages
- **Dual module format** — every package ships ESM (`dist/index.js`) and CommonJS (`dist/index.cjs`) so existing CJS bots can `require('@stambha/core')` without TypeScript `require`/ESM errors



### Changed

- `package.json` **exports** — `import` and `require` conditions for all publishable packages
- **Shared** `tsup.package.ts` — consistent dual-format builds across the monorepo



## [0.2.0](https://github.com/mivaya/Stambha/releases/tag/v0.2.0) - 2026-05-29

**Stambha** — framework rebrand and first `@stambha/`* npm release.

### Changed (breaking)

- **Package scope:** `@stratum/`* → `@stambha/`* (npm org `[stambha](https://www.npmjs.com/org/stambha)`)
- **Core API:** `StratumClient` → `StambhaClient`, `createStratumBot` → `createStambhaBot`, `DefaultStratumContainer` → `DefaultStambhaContainer`, `StratumContainer` → `StambhaContainer`, `attachStratumClient` → `attachStambhaClient`
- **Signal custom ids:** prefix `stratum:` → `stambha:` (including `stambha:seq:` for sequences)
- **GitHub:** repository and docs URLs point to `mivaya/Stambha`; GitHub Pages base path `/Stambha/`
- **CODEOWNERS:** `@mivaya/stambha-maintainers`



### Added

- `.github/workflows/publish-npm.yml` — publish all `packages/*` on GitHub Release (pre-release → npm `beta` tag)
- `.github/PUBLISHING.md` — npm org setup and local dry-run instructions



### Migration from 0.1.x (Stratum)

Replace imports and identifiers:

```diff
- import { StratumClient, createStratumBot } from "@stratum/core";
+ import { StambhaClient, createStambhaBot } from "@stambha/core";
```

Update `package.json` dependencies from `@stratum/*` to `@stambha/*`. Re-deploy slash commands if you embed `stambha:` / `stratum:` custom ids in persisted UI.

### Packages in this release


| Package              | Version |
| -------------------- | ------- |
| `@stambha/core`      | 0.2.0   |
| `@stambha/transport` | 0.2.0   |
| `@stambha/rest`      | 0.2.0   |
| `@stambha/gateway`   | 0.2.0   |
| `@stambha/transform` | 0.2.0   |
| `@stambha/cache`     | 0.2.0   |
| `@stambha/loader`    | 0.2.0   |
| `@stambha/gates`     | 0.2.0   |
| `@stambha/args`      | 0.2.0   |
| `@stambha/plugins`   | 0.2.0   |
| `@stambha/vault`     | 0.2.0   |
| `@stambha/vault-sql` | 0.2.0   |
| `@stambha/metrics`   | 0.2.0   |
| `@stambha/runtime`   | 0.2.0   |




## [0.1.0](https://github.com/mivaya/Stambha/releases/tag/v0.1.0) - 2026-05-29

First public release of the **native Stambha stack** — a transport-agnostic Discord bot framework with Sapphire-style ergonomics and Discordeno-inspired scale.

### Added



#### Core framework (`@stambha/core`)

- Piece-based command pipeline: Commands, Hooks, Scouts, Barriers, Conduits, Epilogues
- Typed outcome model (`ok` / `err`) through the execution pipeline
- Signal registry for buttons, selects, and modals (`stambha:` custom ids)
- Multi-step **Sequences** (`sequence()`, `runSequence`, `stambha:seq:` routing)
- **Chron** scheduled tasks with `src/tasks/` piece loading
- Tier-split hooks: `RestPort`, worker bus, gateway relay attachment points
- Global **Barrier** inhibitors and command error events



#### Native transport

- `@stambha/transport` — shared Discord wire types, rate-limit bucket model, session info
- `@stambha/rest` — centralized REST queue, rate-limit handling, `deployCommands`, `createNativeRestWorker`
- `@stambha/gateway` — shard manager, identify/resume payloads, identify budget, resharding policy, operator HTTP API, gateway↔bot worker bus, `GatewayEventHub`
- `@stambha/transform` — desired-properties trimming and optional Discord shape helpers
- `@stambha/cache` — pluggable in-memory cache (Redis driver planned for v2)



#### Developer experience

- `@stambha/loader` — auto-load pieces from disk (`commands/`, `listeners/`, `gates/`, …)
- `@stambha/gates` — cooldown, user/client permissions, NSFW, RunIn, guild/DM-only gates
- `@stambha/args` — prefix lexer and slash option parsing
- Slash **command tree** — subcommands, groups, aliases, autocomplete, deploy diff
- `@stambha/plugins` — lifecycle hooks (`preInit`, `postLoad`, …) and `StambhaContainer` DI
- `@stambha/vault` — schema-first settings with Blueprint, Ledger, and Record
- `@stambha/vault-sql` — SQLite (`node:sqlite`, Node ≥ 22.5) and PostgreSQL drivers
- `@stambha/metrics` — Prometheus counters/histograms and optional `/metrics` server
- `@stambha/runtime` — portable env, fs, path, and timer helpers (Node, Bun, Deno)



#### Examples & documentation

- `examples/bot` — full Sapphire-style bot with tier-split scripts (`pnpm split:*`)
- `examples/minimal` — MockBridge smoke example
- VitePress docs site under `docs/` with migration guides (Sapphire, Discordeno, Klasa)
- Internal roadmap, ADRs, and v2 planning (`docs/internal/`)



#### Tooling

- CI matrix: Node 20 & 22, Bun, Deno
- Biome lint, Vitest across packages
- GitHub Pages workflow for documentation



### Changed

- **Native stack is the default path** — connect via `@stambha/rest`, `@stambha/gateway`, and `@stambha/transform` instead of library bridges
- Bridge packages removed from the monorepo; `deployCommands` lives in `@stambha/rest`
- README and package metadata updated for the native-first story



### Removed

- `@stambha/bridge-discordjs` and `@stambha/bridge-discordeno` — see [ADR 002](docs/internal/adr/002-bridge-deprecation.md)
- Deprecated examples (`discord-bot`, `discordeno-bot`, `tier-split`, `split-native`) replaced by `examples/bot` and `examples/minimal`



### Known limitations (0.1.x)

- No bundled dashboard HTTP API — planned as `@stambha/dashboard` in a separate plugins monorepo
- Command **declarative options** (Sapphire-style cooldown/permission fields on `Command`) are manual via gates today; planned for v2
- `@stambha/vault-sql` **(SQLite)** requires Node **≥ 22.5**; tests skip on Node 20
- Public API may still change before **1.0.0** — pin semver ranges accordingly



### Packages in this release


| Package              | Version |
| -------------------- | ------- |
| `@stambha/core`      | 0.1.0   |
| `@stambha/transport` | 0.1.0   |
| `@stambha/rest`      | 0.1.0   |
| `@stambha/gateway`   | 0.1.0   |
| `@stambha/transform` | 0.1.0   |
| `@stambha/cache`     | 0.1.0   |
| `@stambha/loader`    | 0.1.0   |
| `@stambha/gates`     | 0.1.0   |
| `@stambha/args`      | 0.1.0   |
| `@stambha/plugins`   | 0.1.0   |
| `@stambha/vault`     | 0.1.0   |
| `@stambha/vault-sql` | 0.1.0   |
| `@stambha/metrics`   | 0.1.0   |
| `@stambha/runtime`   | 0.1.0   |


