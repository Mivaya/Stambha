import { decisionBody, doneBody, epicBody, ticketBody } from "./templates.mjs";

/**
 * Canonical card catalog — source of truth for GitHub Project #2.
 * Keys are stable IDs; titles may be updated on the board to match `title` field.
 */
export const CARD_CATALOG = {
  "REL-0.3": {
    title: "0.2.1–0.3.5 releases",
    status: "Done",
    track: "stambha",
    type: "Task",
    pillar: "Ops",
    release: "1.0.0",
    body: doneBody({
      summary: "Shipped semver milestones from dual-module support through native interaction routing.",
      delivered: [
        "0.2.1 dual ESM+CJS",
        "0.2.2 gates, resolvePrefix, loader order",
        "0.3.0 native WebSocket gateway",
        "0.3.4 ReplyPayload, REST resources, mention args",
        "0.3.5 native interaction routing (options, meta, signals, autocomplete)",
      ],
      meta: { ID: "REL-0.3", Release: "≤0.3.5" },
      notes: ["Native stack is default transport (ADR 005)"],
    }),
  },

  "PHASES-1-23": {
    title: "Phases 1–23 (core)",
    status: "Done",
    track: "stambha",
    type: "Task",
    pillar: "Ops",
    body: doneBody({
      summary: "Core monorepo packages and infrastructure through native routing (pre-1.0.0).",
      delivered: [
        "@stambha/core, loader, vault, gates, args, transport, rest, transform, gateway",
        "Tier split, resharding APIs, migration docs, native attach routing (0.3.5)",
      ],
      meta: { ID: "PHASES-1-23" },
    }),
  },

  "PHASE-24": {
    title: "Phase 24 — 1.0.0 prep",
    status: "Done",
    track: "stambha",
    type: "Task",
    pillar: "Docs",
    release: "1.0.0",
    body: doneBody({
      summary: "Documentation, examples, and deprecation work for 1.0.0 stable API.",
      delivered: [
        "Public docs audit + known-gaps page",
        "examples/bot demos",
        "Library adapter deprecation in @stambha/transform",
        "docs/versions snapshots",
      ],
      meta: { ID: "PHASE-24", Release: "1.0.0" },
    }),
  },

  "PHASE-25": {
    title: "Phase 25 — 1.1.0 prep",
    status: "Done",
    track: "stambha",
    type: "Task",
    pillar: "Docs",
    release: "1.1.0",
    body: doneBody({
      summary: "1.1.0 minor prep — G3 dispatch foundation and mention-prefix (B7) docs/examples.",
      delivered: [
        "G3-spike: dispatch module in @stambha/transform (camelizeDispatch, event catalog)",
        "B7: createMentionPrefixResolver + mentionCommands on attachStambhaClient",
        "examples/bot @Bot ping demo",
        "gateway.md + known-gaps updated for 1.1.0",
      ],
      meta: { ID: "PHASE-25", Release: "1.1.0", Epic: "EPIC-G" },
      references: ["Shipped v1.1.0", "PR #54"],
    }),
  },

  "EXT-0.2.2": {
    title: "Extensions v0.2.2+",
    status: "Done",
    track: "stambha-plugins",
    type: "Task",
    pillar: "Plugins",
    body: doneBody({
      summary: "First-wave official extensions in Stambha-plugins (ADR 003).",
      delivered: ["@stambha/cache", "@stambha/metrics", "@stambha/vault-sql published"],
      meta: { ID: "EXT-0.2.2", Track: "stambha-plugins" },
      notes: ["Independent semver per package"],
    }),
  },

  "REL-1.0.0-tag": {
    title: "1.0.0-tag",
    status: "Done",
    track: "stambha",
    type: "Task",
    pillar: "Ops",
    release: "1.0.0",
    body: doneBody({
      summary: "Git tag `v1.0.0` — first production native stack release.",
      delivered: ["Tag `v1.0.0` on GitHub", "All core packages at 1.0.0"],
      meta: { ID: "REL-1.0.0-tag", Release: "1.0.0" },
      references: ["Shipped 2026-06-29"],
    }),
  },

  "REL-1.0.0-release": {
    title: "1.0.0-github-release",
    status: "Done",
    track: "stambha",
    type: "Task",
    pillar: "Ops",
    release: "1.0.0",
    body: doneBody({
      summary: "GitHub Release v1.0.0 — npm publish + docs CI.",
      delivered: [
        "GitHub Release published",
        "@stambha/*@1.0.0 on npm",
        "Docs site updated",
      ],
      meta: { ID: "REL-1.0.0-release", Release: "1.0.0" },
      references: ["https://github.com/mivaya/Stambha/releases/tag/v1.0.0"],
    }),
  },

  "REL-1.0.0-merge": {
    title: "1.0.0-merge",
    status: "Done",
    track: "stambha",
    type: "Task",
    pillar: "Ops",
    release: "1.0.0",
    body: doneBody({
      summary: "Release branch merged to `main` after v1.0.0 publish.",
      delivered: ["main at 1.0.0+", "Release train unblocked for 1.1.x"],
      meta: { ID: "REL-1.0.0-merge", Release: "1.0.0" },
    }),
  },

  "REL-1.0.0-archive": {
    title: "1.0.0-archive",
    status: "Done",
    track: "stambha",
    type: "Task",
    pillar: "Docs",
    release: "1.0.0",
    body: doneBody({
      summary: "Public docs snapshot `docs/versions/1.0.0/`.",
      delivered: [
        "Archived snapshot under docs/versions/1.0.0",
        "Version switcher includes 1.0.0",
      ],
      meta: { ID: "REL-1.0.0-archive", Release: "1.0.0" },
    }),
  },

  "REL-1.1.0-tag": {
    title: "1.1.0-tag",
    status: "Done",
    track: "stambha",
    type: "Task",
    pillar: "Ops",
    release: "1.1.0",
    body: doneBody({
      summary: "Git tag `v1.1.0` — mention-prefix + gateway dispatch foundation.",
      delivered: ["Tag `v1.1.0` on GitHub", "All core packages at 1.1.0"],
      meta: { ID: "REL-1.1.0-tag", Release: "1.1.0" },
      references: ["Shipped 2026-07-06"],
    }),
  },

  "REL-1.1.0-release": {
    title: "1.1.0-github-release",
    status: "Done",
    track: "stambha",
    type: "Task",
    pillar: "Ops",
    release: "1.1.0",
    body: doneBody({
      summary: "GitHub Release v1.1.0 — npm publish + docs CI.",
      delivered: [
        "GitHub Release published",
        "@stambha/*@1.1.0 on npm",
        "Additive minor — no breaking hub payload changes",
      ],
      meta: { ID: "REL-1.1.0-release", Release: "1.1.0" },
      references: ["https://github.com/mivaya/Stambha/releases/tag/v1.1.0"],
    }),
  },

  "REL-1.1.0-archive": {
    title: "1.1.0-archive",
    status: "Done",
    track: "stambha",
    type: "Task",
    pillar: "Docs",
    release: "1.1.0",
    body: doneBody({
      summary: "Public docs snapshot `docs/versions/1.1.0/`.",
      delivered: [
        "Archived snapshot under docs/versions/1.1.0",
        "Version switcher includes 1.1.0",
      ],
      meta: { ID: "REL-1.1.0-archive", Release: "1.1.0" },
    }),
  },

  "REL-1.2.0-branch": {
    title: "1.2.0-release-branch",
    status: "Done",
    track: "stambha",
    type: "Task",
    pillar: "Ops",
    release: "1.2.0",
    body: doneBody({
      summary: "Release branch `feature/v1.2.0-phase1-transform` merged — G3-p1 + product docs.",
      delivered: [
        "PR #59 merged to main",
        "Tier 1 hub camelCase payloads (G3-p1)",
        "dispatchNormalize escape hatch",
        "Architecture guide + onboarding docs",
      ],
      meta: { ID: "REL-1.2.0-branch", Release: "1.2.0", Epic: "EPIC-G", Branch: "feature/v1.2.0-phase1-transform" },
      dependencies: "PHASE-25, G3-spike",
      references: ["https://github.com/mivaya/Stambha/pull/59"],
    }),
  },

  "REL-1.2.0": {
    title: "1.2.0-release",
    status: "Done",
    track: "stambha",
    type: "Release",
    pillar: "G",
    release: "1.2.0",
    body: doneBody({
      summary: "v1.2.0 — CamelCase gateway event payloads & product docs onboarding.",
      delivered: [
        "G3-p1 Tier 1 hub camelCase (reactions, guild/member, voice, message delete, poll votes)",
        "dispatchNormalize raw escape hatch",
        "Architecture guide + examples/bot ReactionListener",
        "GitHub Release v1.2.0 + npm @stambha/*@1.2.0",
      ],
      meta: { ID: "REL-1.2.0", Release: "1.2.0", Epic: "EPIC-G" },
      references: [
        "https://github.com/mivaya/Stambha/releases/tag/v1.2.0",
        "docs/guide/known-gaps.md",
      ],
    }),
  },

  "REL-1.2.0-archive": {
    title: "1.2.0-archive",
    status: "Backlog",
    track: "stambha",
    type: "Task",
    pillar: "Docs",
    release: "1.2.0",
    lane: "Tech debt",
    priority: "low",
    body: ticketBody({
      summary: "Freeze public docs snapshot under docs/versions/1.2.0.",
      acceptance: [
        "`pnpm docs:archive` run for 1.2.0",
        "Sidebar valid for archived snapshot",
        "Live docs label latest as Next when snapshot exists",
      ],
      meta: { ID: "REL-1.2.0-archive", Release: "1.2.0", Epic: "EPIC-DOCS" },
      dependencies: "REL-1.2.0",
    }),
  },

  "REL-1.3.0": {
    title: "1.3.0-release",
    status: "Done",
    track: "stambha",
    type: "Release",
    pillar: "Ops",
    release: "1.3",
    lane: "Expedite",
    priority: "blocker",
    body: doneBody({
      summary: "v1.3.0 — Command DX, Components V2, native-only gateway.",
      delivered: [
        "Command kind hooks, subcommandMethods, declarative gates, help, args, lifecycle, plugins",
        "Components V2 builders, Embed/Container views, entity selects; PanelBuilder removed",
        "G3 tiers 2–4 + GatewayEventMap + G1 reshard; adapters removed",
        "Authz capabilities, collectors, HTTP interactions, polls, REST hardening",
        "GitHub Release v1.3.0 + npm @stambha/*@1.3.0",
      ],
      meta: { ID: "REL-1.3.0", Release: "1.3.0", Branch: "chore/release-1.3.0" },
      references: [
        "https://github.com/Mivaya/Stambha/releases/tag/v1.3.0",
        "CHANGELOG.md",
        "docs/guide/whats-new-1.3.md",
      ],
    }),
  },

  "REL-1.3.0-archive": {
    title: "1.3.0-archive",
    status: "Done",
    track: "stambha",
    type: "Task",
    pillar: "Docs",
    release: "1.3.1",
    lane: "Tech debt",
    priority: "low",
    body: doneBody({
      summary: "Freeze public docs snapshot under docs/versions/1.3.0.",
      delivered: [
        "`pnpm docs:archive 1.3.0 f325f54`",
        "Sidebar docs/.vitepress/sidebars/versioned/1.3.0.json",
        "Shipped with v1.3.1",
      ],
      meta: { ID: "REL-1.3.0-archive", Release: "1.3.1", Epic: "EPIC-DOCS" },
      dependencies: "REL-1.3.0",
    }),
  },

  "REL-1.3.1": {
    title: "1.3.1-release",
    status: "Done",
    track: "stambha",
    type: "Release",
    pillar: "Ops",
    release: "1.3.1",
    lane: "Expedite",
    priority: "blocker",
    body: doneBody({
      summary: "v1.3.1 — Docs-plus patch: Guide/API, sequences, 1.3.0 archive, Dependabot.",
      delivered: [
        "Guide/API switcher + TypeDoc API reference",
        "Sequences walkthrough + examples/bot SetupCommand/SeqSignal",
        "Known-gaps tier-2 deferrals; C1 retargeted to 1.4",
        "docs:archive 1.3.0; Dependabot action/prod bumps",
        "GitHub Release v1.3.1 + npm @stambha/*@1.3.1",
      ],
      meta: { ID: "REL-1.3.1", Release: "1.3.1", Branch: "chore/release-1.3.1" },
      references: [
        "https://github.com/Mivaya/Stambha/releases/tag/v1.3.1",
        "CHANGELOG.md",
      ],
    }),
  },

  "REL-1.4.0": {
    title: "1.4.0-release",
    status: "Backlog",
    track: "stambha",
    type: "Release",
    pillar: "Ops",
    release: "1.4",
    lane: "Expedite",
    priority: "blocker",
    body: ticketBody({
      summary:
        "v1.4.0 — **adoption minor**: fluent native bootstrap, create-stambha, runSequence, vault-sql onboarding, publish cache-redis. Capability stretch (FORMAT/ATTACH/display) only if Must lands early. Staff auth = `@stambha/authz` (C1 numeric levels Won't).",
      acceptance: [
        "Must tickets Done (see 1.4 Sprint Ready lane)",
        "CHANGELOG [1.4.0] + pnpm version:bump 1.4.0",
        "docs:archive 1.3.1 <release SHA>",
        "GitHub Release v1.4.0 + npm @stambha/*@1.4.0",
        "Plugins: cache-redis published if A1 in scope",
      ],
      meta: { ID: "REL-1.4.0", Release: "1.4.0", Branch: "chore/release-1.4.0" },
      dependencies: "F3, DX-bootstrap, D1, DOCS-vault-persist, A1",
      references: ["scripts/kanban/catalog.mjs — 1.4 picks"],
    }),
  },

  F3: {
    title: "F3 — create-stambha scaffolder",
    status: "Sprint Ready",
    track: "stambha",
    type: "Feature",
    pillar: "Docs",
    release: "1.4",
    lane: "Expedite",
    priority: "blocker",
    body: ticketBody({
      userStory: "As a new developer, I want `pnpm create stambha` to scaffold a runnable bot without copying examples/",
      summary:
        "Official scaffolder CLI. Verified gap on known-gaps (post-1.3.1). Prompts: scale (monolith | split) + template (minimal | basic | bot).",
      acceptance: [
        "`pnpm create stambha@latest` (or `npm create stambha`) published",
        "Emits tsconfig, Biome/eslint as repo standard, correct `@stambha/*` set",
        "Working `pnpm dev` / `pnpm start` + optional `pnpm demo`",
        "Docs: getting-started points to create, not only copy examples",
      ],
      outOfScope: ["Full bigbot enterprise scaffold", "i18n / levels plugins"],
      meta: { ID: "F3", Pillar: "Docs", Release: "1.4", Branch: "feature/create-stambha" },
      references: ["docs/guide/known-gaps.md", "docs/guide/examples.md"],
    }),
  },

  "DX-bootstrap": {
    title: "DX-bootstrap — Fluent native stack bootstrap",
    status: "Sprint Ready",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.4",
    lane: "Expedite",
    priority: "blocker",
    body: ticketBody({
      userStory:
        "As a greenfield author, I want a short happy-path bootstrap without seven imports across four packages.",
      summary:
        "Collapse attachStambhaClient + setBridge + createNativeGatewayClient (+ loadPieces?) into one fluent/helper API. Raw wiring stays for advanced/tier-split.",
      problem:
        "Getting started (1.3.1) still requires createStambhaBot → loadPieces → hub → attach → setBridge → createNativeGatewayClient → connect. createStambhaBot only constructs StambhaClient.",
      developerSyntax:
        "```ts\nconst { client, gateway } = await bootstrapNativeBot({\n  token,\n  applicationId,\n  prefix: \"!\",\n  intents: [...],\n});\nawait loadPieces(client);\nawait gateway.connect();\n```\n(Exact API TBD — must not break existing createStambhaBot / attachStambhaClient.)",
      acceptance: [
        "Documented happy path ≤ ~10 lines for monolith ping bot",
        "Getting-started updated to prefer helper; advanced section keeps raw wiring",
        "Tier-split / bigbot still use explicit workers",
        "Unit or smoke test covering bootstrap helper",
      ],
      meta: { ID: "DX-bootstrap", Pillar: "B", Release: "1.4", Epic: "EPIC-B", Branch: "feature/native-bootstrap" },
      references: ["docs/guide/getting-started.md", "packages/core createStambhaBot"],
    }),
  },

  "DX-piece-factory": {
    title: "DX-piece-factory — Reduce Registry constructor boilerplate",
    status: "Backlog",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.4",
    lane: "Standard",
    priority: "high",
    body: ticketBody({
      userStory:
        "As a command author, I want to declare a Command without `constructor(registry) { super(registry, opts) }` every time.",
      summary:
        "Should for 1.4: options-first / defineCommand / factory that loader can instantiate — without requiring decorators (optional later).",
      acceptance: [
        "At least one supported pattern without Registry ctor injection",
        "loadPieces still discovers pieces",
        "Docs + examples/basic migrate one command",
        "No break of existing class-extends-Command pattern",
      ],
      outOfScope: ["Mandatory decorators", "Sapphire compatibility shims"],
      meta: { ID: "DX-piece-factory", Pillar: "B", Release: "1.4", Epic: "EPIC-B" },
      dependencies: "DX-bootstrap preferred first",
    }),
  },

  "PKG-testing": {
    title: "PKG-testing — @stambha/testing helpers",
    status: "Icebox",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "2.0",
    lane: "Standard",
    priority: "low",
    body: ticketBody({
      summary:
        "Deferred — no `@stambha/testing` package for 1.4. Sapphire/discord.js ecosystems rely on library mocks + user test setup; Stambha already ships MockBridge, demo REST, and examples/minimal patterns instead.",
      acceptance: [
        "Revisit only if repeated adoption feedback asks for a dedicated test kit",
        "Until then: document patterns in examples + optional DOCS-testing-lite",
      ],
      meta: { ID: "PKG-testing", Pillar: "B", Release: "2.0" },
      references: ["examples/minimal", "packages/core MockBridge"],
    }),
  },

  "DOCS-testing": {
    title: "DOCS-testing — Command testing guide",
    status: "Icebox",
    track: "stambha",
    type: "Task",
    pillar: "Docs",
    release: "2.0",
    lane: "Standard",
    priority: "low",
    body: ticketBody({
      summary:
        "Deferred with PKG-testing — known-gaps deferral from 1.3.1 stays; point authors at MockBridge + examples/minimal until a dedicated guide is justified.",
      acceptance: [
        "Optional short section in getting-started or examples.md (no full guide required for 1.4)",
      ],
      meta: { ID: "DOCS-testing", Pillar: "Docs", Epic: "EPIC-DOCS", Release: "2.0" },
      references: ["docs/guide/known-gaps.md — Not in 1.3.1"],
    }),
  },

  "DOCS-mental-model": {
    title: "DOCS-mental-model — First-hour pipeline concept map",
    status: "Backlog",
    track: "stambha",
    type: "Task",
    pillar: "Docs",
    release: "1.4",
    lane: "Standard",
    priority: "medium",
    body: ticketBody({
      summary:
        "Single greenfield page: Scout → … → Epilogue + Signals/Sequences/Vault/Chron one-liners. Architecture exists for stack; this is vocabulary for newcomers (not only Sapphire migrants).",
      acceptance: [
        "New guide page or expanded why-stambha / pieces with one diagram of all piece types",
        "Linked from getting-started",
        "Does not rename public APIs",
      ],
      meta: { ID: "DOCS-mental-model", Pillar: "Docs", Epic: "EPIC-DOCS", Release: "1.4" },
      references: ["docs/guide/architecture.md", "docs/guide/pieces.md"],
    }),
  },

  "DOCS-vault-persist": {
    title: "DOCS-vault-persist — Vault SQL on getting-started",
    status: "Sprint Ready",
    track: "stambha",
    type: "Task",
    pillar: "Docs",
    release: "1.4",
    lane: "Expedite",
    priority: "high",
    body: ticketBody({
      summary:
        "Getting started mentions `@stambha/vault` but not `@stambha/vault-sql`. MemoryDriver loses settings on restart — promote SQLite/Postgres as default next step (package stays in plugins per ADR 003).",
      acceptance: [
        "getting-started: install + one SQLite snippet after Vault intro",
        "Link to vault-and-orm + extensions/vault-sql",
        "Do not move vault-sql into core monorepo",
      ],
      meta: { ID: "DOCS-vault-persist", Pillar: "Docs", Epic: "EPIC-DOCS", Release: "1.4" },
      references: [
        "docs/guide/getting-started.md",
        "npm @stambha/vault-sql@1.0.1 peer @stambha/vault@^1.3.0",
      ],
    }),
  },

  "DOCS-gaps-hygiene": {
    title: "DOCS-gaps-hygiene — Fix stale known-gaps Redis rows",
    status: "Sprint Ready",
    track: "stambha",
    type: "Task",
    pillar: "Docs",
    release: "1.4",
    lane: "Expedite",
    priority: "medium",
    body: ticketBody({
      summary:
        "known-gaps still lists Redis cache driver + Redis cooldown as open. cooldown-redis is on npm; cache-redis is in-repo but unpublished (A1). Correct the table after A1 ships or mark cache-redis “publish pending”.",
      acceptance: [
        "Cooldown Redis row → shipped (link extensions)",
        "Cache Redis row → accurate (published or “awaiting A1 publish”)",
        "runSequence row moves when D1 ships",
      ],
      meta: { ID: "DOCS-gaps-hygiene", Pillar: "Docs", Epic: "EPIC-DOCS", Release: "1.4" },
      dependencies: "A1 for cache-redis “shipped” wording",
    }),
  },

  "SIGNAL-match": {
    title: "SIGNAL-match — Pattern / match() Signal routing",
    status: "Backlog",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.5",
    lane: "Standard",
    priority: "medium",
    body: ticketBody({
      userStory:
        "As a UI author, I want Signals for `stambha:delete:user:*` vs `stambha:delete:guild:*` without one mega-handler.",
      summary:
        "Optional `match(customId): boolean` (or glob) alongside exact name routing. Exact name remains default.",
      acceptance: [
        "SignalRouter tries exact name then matchers",
        "Document priority / first-match rules",
        "Example signal using match",
      ],
      meta: { ID: "SIGNAL-match", Pillar: "B", Release: "1.5", Epic: "EPIC-B" },
    }),
  },

  "CHRON-redis": {
    title: "CHRON-redis — Redis Chron lock for tier-split",
    status: "Backlog",
    track: "stambha",
    type: "Feature",
    pillar: "D",
    release: "1.5",
    lane: "Standard",
    priority: "medium",
    body: ticketBody({
      summary:
        "Lite alternative to full 2.0 D2: ChronBus / distributed lock so only one worker runs a cron tick. Core interface + Redis driver in plugins. Keep D2 Icebox for richer leader election.",
      acceptance: [
        "Chron API unchanged for monolith (memory/no-op lock)",
        "Redis lock driver in Stambha-plugins",
        "Tier-split doc note",
      ],
      meta: { ID: "CHRON-redis", Pillar: "D", Release: "1.5", Epic: "EPIC-D" },
      dependencies: "D2 remains Icebox 2.0 for fuller design",
    }),
  },

  "DX-1": {
    title: "DX-1 — Kind hooks: slash / prefix / menu",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.3",
    lane: "Expedite",
    priority: "blocker",
    body: doneBody({
      summary: "Optional slash/prefix/menu hooks; pipeline dispatch; isSlash/isPrefix/isMenu.",
      delivered: ["dispatchCommand", "docs getting-started + pieces", "PR #123"],
      meta: { ID: "DX-1", Pillar: "B", Release: "1.3", Epic: "EPIC-B" },
    }),
  },

  "DX-2": {
    title: "DX-2 — Subcommand method dispatch",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.3",
    lane: "Expedite",
    priority: "high",
    body: doneBody({
      summary: "subcommandMethods + leaf method / Autocomplete convention.",
      delivered: ["dispatchCommand resolveSubcommandHandler", "command-tree.md", "PR #123"],
      meta: { ID: "DX-2", Pillar: "B", Release: "1.3", Epic: "EPIC-B" },
    }),
  },

  "DX-3": {
    title: "DX-3 — Merge/publish EmbedBuilder + Components V2 bump",
    status: "Done",
    track: "stambha",
    type: "Task",
    pillar: "B",
    release: "1.3",
    lane: "Expedite",
    priority: "high",
    body: doneBody({
      summary:
        "EmbedBuilder / Components V2 builders / Views merged on main (#122); close after v1.3.0 npm publish.",
      delivered: [
        "B10 / B10a / B10b on main",
        "CHANGELOG 1.3.0 covers EmbedBuilder + ContainerBuilder + Views",
        "Remaining: publish GitHub Release + npm for @stambha/*@1.3.0",
      ],
      meta: { ID: "DX-3", Pillar: "B", Release: "1.3", Epic: "EPIC-B" },
      notes: ["Mark Done after npm latest = 1.3.0"],
    }),
  },

  "DX-4": {
    title: "DX-4 — Capability ⊕ permission composition docs",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "Docs",
    release: "1.3",
    lane: "Standard",
    priority: "high",
    body: doneBody({
      summary: "Document gateAnd/gateOr with capabilityGate + userPermissionsGate.",
      delivered: [
        "docs/features/capabilities.md composition section",
        "gateAnd / gateOr + Permission bitfield examples",
      ],
      meta: { ID: "DX-4", Pillar: "Docs", Release: "1.3", Epic: "EPIC-DOCS" },
    }),
  },

  F1: {
    title: "F1 — REST & Gateway correctness documentation",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "Docs",
    release: "1.3",
    lane: "Standard",
    priority: "medium",
    body: doneBody({
      summary: "Operator-facing map of rate limits, resume, identify, dispatch correctness claims → code/tests.",
      delivered: [
        "docs/deployment/correctness.md",
        "Sidebar under Deployment",
        "Cross-links from known-gaps / CHANGELOG",
      ],
      meta: { ID: "F1", Pillar: "Docs", Release: "1.3", Epic: "EPIC-DOCS" },
    }),
  },

  "PLUGINS-1.0.0": {
    title: "plugins-1.0.0",
    status: "Done",
    track: "stambha-plugins",
    type: "Task",
    pillar: "Plugins",
    release: "1.0.0",
    body: doneBody({
      summary: "Stambha-plugins 1.0.0 line — peers @stambha/core@^1.2.0.",
      delivered: [
        "@stambha/api, @stambha/pagination @1.0.0",
        "@stambha/cache, @stambha/metrics, @stambha/vault-sql @1.0.0",
        "GitHub Release v1.0.0 + npm publish",
      ],
      meta: { ID: "PLUGINS-1.0.0", Track: "stambha-plugins", Release: "1.0.0" },
      references: ["https://github.com/Mivaya/Stambha-plugins/releases/tag/v1.0.0"],
    }),
  },

  "PLUGINS-README": {
    title: "plugins-readme",
    status: "Done",
    track: "stambha-plugins",
    type: "Task",
    pillar: "Plugins",
    release: "1.0.0",
    body: doneBody({
      summary: "Stambha-plugins README package matrix + core cross-links.",
      delivered: [
        "Package table in Stambha-plugins README",
        "Core README / CONTRIBUTING link to extensions",
      ],
      meta: { ID: "PLUGINS-README", Track: "stambha-plugins" },
    }),
  },

  "PLUGINS-API-1.1.0": {
    title: "api-1.1.0-release",
    status: "Done",
    track: "stambha-plugins",
    type: "Release",
    pillar: "E",
    release: "1.1.0",
    body: doneBody({
      summary: "@stambha/api 1.1.0 — Discord OAuth, sessions, Vault guild settings.",
      delivered: [
        "OAuth PKCE + state, server-side sessions, CSRF, auth rate limit",
        "GET /guilds, channels/roles helpers",
        "Vault guild settings + schema routes",
        "listenWhen / STAMBHA_API_LISTEN deploy controls",
        "GitHub Release vapi-1.1.0 + npm @stambha/api@1.1.0",
      ],
      meta: { ID: "PLUGINS-API-1.1.0", Track: "stambha-plugins", Release: "1.1.0", Epic: "EPIC-E" },
      references: ["https://github.com/Mivaya/Stambha-plugins/releases/tag/vapi-1.1.0"],
    }),
  },

  "PLUGINS-API-1.2.0": {
    title: "api-1.2.0-release",
    status: "Done",
    track: "stambha-plugins",
    type: "Release",
    pillar: "E",
    release: "1.2",
    body: doneBody({
      summary: "@stambha/api 1.2.0 — file-based routes (`src/routes/`, loadRoutes, routesDir).",
      delivered: [
        "loadRoutes + Route class + name.method.ts convention",
        "createApiServerAsync / routesDir on createApiPlugin",
        "GitHub Release vapi-1.2.0 + npm @stambha/api@1.2.0",
        "Core docs updated (extensions/api, project-structure, Sapphire migration)",
      ],
      meta: { ID: "PLUGINS-API-1.2.0", Track: "stambha-plugins", Release: "1.2", Epic: "EPIC-E" },
      references: ["https://github.com/Mivaya/Stambha-plugins/releases/tag/vapi-1.2.0"],
    }),
  },

  "PLUGINS-CORE-1.3": {
    title: "plugins-core-1.3-peers",
    status: "Done",
    track: "stambha-plugins",
    type: "Release",
    pillar: "Plugins",
    release: "1.3",
    body: doneBody({
      summary: "Stambha-plugins peer bump for core v1.3.0 (patch releases).",
      delivered: [
        "@stambha/api@1.2.1, pagination@1.1.1, metrics@1.0.1, vault-sql@1.0.1, cooldown-redis@1.0.1",
        "Peers → ^1.3.0 on core / vault / gates / plugins",
        "GitHub Releases published (vapi-1.2.1, vpagination-1.1.1, …)",
      ],
      meta: { ID: "PLUGINS-CORE-1.3", Track: "stambha-plugins", Release: "1.3" },
      references: [
        "https://github.com/Mivaya/Stambha-plugins/pull/36",
        "https://github.com/Mivaya/Stambha-plugins/blob/main/CHANGELOG.md#core-130-peers---2026-08-04",
      ],
    }),
  },

  "DOCS-EXTENSIONS": {
    title: "Extensions docs hub",
    status: "Done",
    track: "stambha",
    type: "Task",
    pillar: "Docs",
    release: "1.2.0",
    body: doneBody({
      summary: "Product docs for Stambha-plugins under /extensions/*.",
      delivered: [
        "Extensions sidebar (pagination, HTTP API, cache, metrics)",
        "Self-contained guides with full API surface",
        "Cross-links from README, Vault, known-gaps, migration",
      ],
      meta: { ID: "DOCS-EXTENSIONS", Pillar: "Docs", Release: "1.2.0", Epic: "EPIC-DOCS" },
      references: ["docs/extensions/", "PR #61"],
    }),
  },

  B1: {
    title: "B1 — Declarative gates",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.3",
    lane: "Standard",
    priority: "high",
    body: ticketBody({
      userStory: "As a bot author, I want command options to auto-wire gates so I don't repeat `gateNames` on every command.",
      summary: "Declarative gates on `Command` options — merge with explicit `gates[]` via `resolveCommandGates(command)`. Target **1.3.0**.",
      problem: "Today every command manually lists gates; Sapphire maps options → preconditions automatically.",
      developerSyntax: `\`\`\`ts
export class PingCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "ping",
      kinds: ["slash", "prefix"],
      cooldown: 5,
      runIn: "guild",
      // gates applied automatically — no gateNames array
    });
  }
}
\`\`\``,
      inScope: ["resolveCommandGates(command)", "Cooldown, permissions, nsfw, runIn from CommandOptions", "Alias `preconditions` → gates"],
      outOfScope: ["Numeric permission levels (C1)", "Auto-gates for Signals"],
      acceptance: [
        "Command with `cooldown: 5` applies cooldown gate without gateNames",
        "Explicit gates[] still merge deterministically (order documented)",
        "Unit tests for merge order",
        "Public docs + CHANGELOG",
      ],
      meta: { ID: "B1", Pillar: "B", Release: "1.3", Epic: "EPIC-B", Branch: "feature/declarative-gates" },
      references: ["docs/guide/known-gaps.md — B1"],
    }),
  },

  B2: {
    title: "B2 — Bridge args, flags, entity resolvers",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.x",
    body: ticketBody({
      userStory: "As a bot author, I want one command function for slash + prefix with shared args (Pycord/Poise parity).",
      summary: "Hybrid arg mapping, prefix flags (`--foo=bar`), REST entity resolvers beyond mention ids.",
      inScope: ["Bridge command DX", "Prefix FlagConverter-style flags", "fetchUser-backed entity resolvers"],
      outOfScope: ["Argument prompting (Won't)"],
      acceptance: [
        "kinds: ['slash','prefix'] shares arg parsing where possible",
        "At least one REST entity resolver (e.g. User) in @stambha/args",
        "Prefix flag lexer documented with examples",
      ],
      meta: { ID: "B2", Pillar: "B", Epic: "EPIC-B", Branch: "feature/rest-arg-resolvers" },
      dependencies: "B1 optional",
      references: ["docs/guide/known-gaps.md — B2"],
    }),
  },

  B3: {
    title: "B3 — Help system",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.x",
    body: ticketBody({
      userStory: "As a bot user, I want a built-in help command listing commands by category.",
      summary: "`@stambha/help` using categories, description, detailedDescription.",
      acceptance: [
        "Help command lists registered commands by category",
        "Respects hidden/disabled commands",
        "Works for prefix and slash where configured",
      ],
      meta: { ID: "B3", Pillar: "B", Epic: "EPIC-B", Branch: "feature/help-system" },
      dependencies: "B1 recommended",
    }),
  },

  B4: {
    title: "B4 — Piece lifecycle + error hooks",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.x",
    body: ticketBody({
      userStory: "As a bot author, I want per-piece onLoad/onUnload/onCommandError like discord.py cogs.",
      summary: "Piece lifecycle hooks and centralized command error handling beyond epilogues.",
      acceptance: [
        "Piece base supports onLoad / onUnload",
        "onCommandError hook with default logging",
        "Loader invokes lifecycle in correct order",
      ],
      meta: { ID: "B4", Pillar: "B", Epic: "EPIC-B", Branch: "feature/piece-lifecycle" },
    }),
  },

  B5: {
    title: "B5 — Component builder + persistent signals",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.x",
    body: ticketBody({
      userStory: "As a bot author, I want ergonomic menu/modal layouts and signals that survive restart.",
      summary: "Component UI builders + registerPersistentSignals() for stambha: ids.",
      acceptance: [
        "Row/menu builder API for common layouts",
        "registerPersistentSignals() documented",
        "Example in examples/bot",
      ],
      meta: { ID: "B5", Pillar: "B", Epic: "EPIC-B", Branch: "feature/component-builder" },
    }),
  },

  B6: {
    title: "B6 — Prefix edit-tracking",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.x",
    body: ticketBody({
      userStory: "As a bot user, I want editing my prefix command message to update the bot reply (Poise/Akairo parity).",
      summary: "Re-run or update bot reply on messageUpdate for prefix commands.",
      acceptance: [
        "attachStambhaClient option for edit-tracking",
        "Edited command re-invokes or updates prior reply",
        "Tests for messageUpdate path",
      ],
      meta: { ID: "B6", Pillar: "B", Epic: "EPIC-B", Branch: "feature/edit-tracking" },
      dependencies: "Richer StambhaMessageUpdate (G3-p1 helps)",
    }),
  },

  B7: {
    title: "B7 — Mention-as-prefix",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.1",
    body: ticketBody({
      userStory: "As a bot user, I want `@MyBot ping` to work like `!ping` without custom app code.",
      summary: "Bot mention as prefix command trigger alongside text prefix (resolvePrefix).",
      problem: "Today only string prefix via resolvePrefix; mention parsing is app-owned.",
      inScope: ["createMentionPrefixResolver(botUserId, textPrefix?)", "Optional mentionCommands on attachStambhaClient", "Parse <@id> and <@!id>"],
      outOfScope: ["Nickname display parsing edge cases beyond Discord mention format"],
      acceptance: [
        "Mention + command name routes through InboundRouter",
        "examples/bot demo or test",
        "docs/deployment/gateway.md updated",
        "docs/guide/known-gaps.md B7 marked shipped",
      ],
      meta: { ID: "B7", Pillar: "B", Release: "1.1", Epic: "EPIC-B", Branch: "feature/mention-prefix" },
      references: ["Shipped v1.1.0"],
    }),
  },

  B8: {
    title: "B8 — Native registerPlugin & onShutdown",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.3",
    lane: "Standard",
    priority: "high",
    body: ticketBody({
      userStory: "As a bot author, I want to register plugins natively in the client constructor or options, and have them clean up via onShutdown.",
      summary: "Add native `registerPlugin` & `plugins` option to StambhaClient; add `onShutdown` lifecycle hook.",
      acceptance: [
        "StambhaClient constructor accepts options.plugins",
        "registerPlugin(plugin) dynamically registers plugins",
        "onShutdown hook executed in client.stop()",
        "Vitest unit tests cover all hooks including onShutdown",
      ],
      meta: { ID: "B8", Pillar: "B", Release: "1.3", Epic: "EPIC-B", Branch: "feature/native-plugins" },
    }),
  },

  B9: {
    title: "B9 — TypeScript interface augmentation",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.3",
    lane: "Standard",
    priority: "high",
    body: doneBody({
      summary:
        "Document + test declaration merging for StambhaClientOptions and StambhaContainerLike.",
      delivered: [
        "docs/features/typescript-augmentation.md",
        "packages/core/src/client/augmentation.test.ts",
        "Sidebar Features entry",
      ],
      meta: { ID: "B9", Pillar: "B", Release: "1.3", Epic: "EPIC-B" },
    }),
  },

  B10: {
    title: "B10 — Native EmbedBuilder (classic) + Components V2 builder layer",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.3",
    lane: "Standard",
    priority: "high",
    body: doneBody({
      summary: "Shipped EmbedBuilder for classic embed JSON payloads, and initial panel() / PanelBuilder for Components V2 containers. Superseded by B10a which uses official Discord API naming and full builder classes.",
      delivered: [
        "EmbedBuilder — fluent builder for DiscordEmbedJSON",
        "panel() / PanelBuilder — embed-compat Components V2 container helper (removed in B10a)",
        "Component type constants, MessageFlags, SeparatorSpacing in @stambha/core",
      ],
      meta: { ID: "B10", Pillar: "B", Release: "1.3", Epic: "EPIC-B", Branch: "feature/native-embed-panel-builders" },
    }),
  },

  B10a: {
    title: "B10a — Components V2: official naming + full builder classes",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.3",
    lane: "Standard",
    priority: "high",
    parent: "B10",
    body: ticketBody({
      userStory: "As a bot developer, I want fluent builder classes for every Components V2 component using official Discord API names so I can construct rich messages the same way discord.js ContainerBuilder works.",
      summary: "Rework the Components V2 builder layer to use official Discord API names (ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SectionBuilder, MediaGalleryBuilder, FileBuilder, ThumbnailBuilder). Add premiumButton() for ButtonStyle.Premium (type 6). Remove PanelBuilder/panel() (to be replanned as a plugin). Rename fileComponent()→file().",
      acceptance: [
        "ContainerBuilder fluent class (1:1 Discord API, matches discord.js ContainerBuilder pattern)",
        "TextDisplayBuilder, ThumbnailBuilder, SeparatorBuilder, SectionBuilder, MediaGalleryBuilder, FileBuilder fluent classes",
        "premiumButton({ skuId }) builder + ButtonStyle.Premium = 6",
        "file() function (renamed from fileComponent(), deprecated alias kept)",
        "PanelBuilder and panel() removed from @stambha/core",
        "All builders exported from @stambha/core",
        "Unit tests for all new builder classes",
      ],
      meta: { ID: "B10a", Pillar: "B", Release: "1.3", Epic: "EPIC-B", Branch: "feature/components-v2-builders" },
    }),
  },

  B10b: {
    title: "B10b — EmbedView + ContainerView (Stambha display primitives)",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.3",
    lane: "Expedite",
    priority: "high",
    parent: "B10a",
    body: doneBody({
      summary:
        "Readonly EmbedView/ContainerView plus Stambha-native builder ergonomics (from, length, equals, resolveColor, toReply).",
      delivered: [
        "EmbedBuilder + EmbedView + embed()",
        "ContainerBuilder + ContainerView",
        "resolveColor / hexColor",
        "components.md updated; Managers deferred to EPIC-DISPLAY",
      ],
      meta: { ID: "B10b", Pillar: "B", Release: "1.3", Epic: "EPIC-B", Branch: "feature/native-embed-panel-builders" },
    }),
  },

  "EPIC-DISPLAY": {
    title: "EPIC-DISPLAY — @stambha/display (plugins)",
    status: "Backlog",
    track: "stambha-plugins",
    type: "Epic",
    pillar: "Plugins",
    release: "1.4",
    lane: "Standard",
    priority: "high",
    body: epicBody({
      objective:
        "Opinionated display DX on top of core builders — Managers, embed→container migration, templates — without bloating @stambha/core.",
      architecture: [
        "Peers on @stambha/core EmbedBuilder/ContainerBuilder + Views",
        "Stambha-plugins package @stambha/display",
      ],
      outcomes: [
        "EmbedManager + ContainerManager",
        "Classic embed options → Components V2 container (ex-panel)",
        "Optional templates / reply helpers",
      ],
      childTickets: [
        { id: "DISPLAY-managers", title: "EmbedManager + ContainerManager", shipped: false },
        { id: "DISPLAY-migrate", title: "embed → container migration helper", shipped: false },
      ],
      successCriteria: [
        "Core stays Discord-API-shaped builders + Views only",
        "Plugin documented on extensions hub",
      ],
      meta: { ID: "EPIC-DISPLAY", Track: "stambha-plugins", Release: "1.4" },
    }),
  },

  "DISPLAY-managers": {
    title: "DISPLAY-managers — EmbedManager + ContainerManager",
    status: "Backlog",
    track: "stambha-plugins",
    type: "Feature",
    pillar: "Plugins",
    release: "1.4",
    lane: "Standard",
    priority: "high",
    body: ticketBody({
      summary:
        "Orchestration layer: validate, template, toReply, length budgets, accent presets. Built on core EmbedView/ContainerView.",
      acceptance: [
        "Package scaffold in Stambha-plugins",
        "EmbedManager / ContainerManager public API + docs",
        "Does not re-export Panel*",
      ],
      meta: { ID: "DISPLAY-managers", Track: "stambha-plugins", Epic: "EPIC-DISPLAY" },
      dependencies: "B10b",
    }),
  },

  "DISPLAY-migrate": {
    title: "DISPLAY-migrate — Classic embed → Container (ex-panel)",
    status: "Backlog",
    track: "stambha-plugins",
    type: "Feature",
    pillar: "Plugins",
    release: "1.4",
    lane: "Standard",
    priority: "medium",
    body: ticketBody({
      summary:
        "Reintroduce former panel() behavior as ContainerManager.fromEmbed / fromClassicOptions — title/fields/footer → TextDisplay + Section + Container.",
      acceptance: [
        "Parity with removed PanelOptions fields",
        "Returns componentsV2 reply payload",
        "Migration note from PanelBuilder",
      ],
      meta: { ID: "DISPLAY-migrate", Track: "stambha-plugins", Epic: "EPIC-DISPLAY" },
      dependencies: "DISPLAY-managers",
    }),
  },

  ATTACH: {
    title: "ATTACH — AttachmentBuilder (files + spoilers)",
    status: "Backlog",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.4",
    lane: "Standard",
    priority: "medium",
    body: ticketBody({
      summary:
        "Fluent attachment helper for REST message payloads (name, description, spoiler, voice waveform/duration).",
      acceptance: ["AttachmentBuilder in core or rest", "Works with multipart upload path", "Docs"],
      meta: { ID: "ATTACH", Pillar: "B", Release: "1.4" },
    }),
  },

  FORMAT: {
    title: "FORMAT — @stambha/format (mentions, time, code)",
    status: "Backlog",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.4",
    lane: "Standard",
    priority: "medium",
    body: ticketBody({
      summary:
        "Small formatter utilities (user/channel/role mentions, timestamps, code blocks) — Stambha-owned, not a discord.js formatters fork.",
      acceptance: ["Package or core module", "Unit tests", "Docs link from getting-started"],
      meta: { ID: "FORMAT", Pillar: "B", Release: "1.4" },
    }),
  },

  "MODAL-V2": {
    title: "MODAL-V2 — Label, File Upload, Radio/Checkbox groups",
    status: "Icebox",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.5",
    lane: "Standard",
    priority: "low",
    body: ticketBody({
      summary:
        "Newer Discord modal layout components (Label type 18, File Upload, Radio/Checkbox groups) once bots need them.",
      acceptance: ["Builders + types", "Signal routing if needed", "Docs"],
      meta: { ID: "MODAL-V2", Pillar: "B", Release: "1.5" },
    }),
  },

  SELECTS: {
    title: "SELECTS — Typed entity select builders",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.3",
    lane: "Standard",
    priority: "high",
    body: doneBody({
      summary:
        "userSelect / roleSelect / channelSelect / mentionableSelect + ChannelSelectChannelType; selectRow/actionRow enforce alone-in-row.",
      delivered: [
        "Builders + types exported from @stambha/core",
        "components.test.ts coverage",
        "docs/features/components.md entity select section",
      ],
      meta: { ID: "SELECTS", Pillar: "B", Release: "1.3", Epic: "EPIC-B" },
    }),
  },

  C1: {
    title: "C1 — Permission levels",
    status: "Won't",
    track: "stambha",
    type: "Feature",
    pillar: "C",
    release: "—",
    lane: "Standard",
    priority: "low",
    body: ticketBody({
      summary:
        "**Won't** — numeric `@stambha/levels` / `permissionLevelGate` ladder. Staff authorization is **`@stambha/authz`** (named capabilities + Discord floor + Vault claims). Sapphire migrants use capabilities, not Everyone→Mod→Admin numbers.",
      acceptance: [
        "No `@stambha/levels` package planned",
        "Docs steer to [Capabilities](docs/features/capabilities.md) / `@stambha/authz`",
        "Revisit only if strong demand for Sapphire-parity levels as an optional plugin",
      ],
      meta: { ID: "C1", Pillar: "C", Epic: "EPIC-C", Decision: "Won't — use authz" },
      references: [
        "docs/features/capabilities.md",
        "docs/guide/getting-started.md — Staff hierarchy → capabilityGate",
        "WONT-levels",
      ],
    }),
  },

  C2: {
    title: "C2 — Vault level overrides",
    status: "Won't",
    track: "stambha",
    type: "Feature",
    pillar: "C",
    release: "—",
    body: ticketBody({
      summary:
        "**Won't** as numeric level overrides. Equivalent need is covered by **Vault capability claims** via `attachVaultCapabilityClaims` in `@stambha/authz` (role / member grants on guild blueprints).",
      acceptance: [
        "Operators use Vault + authz claims, not a level ledger",
        "No C1 dependency — ticket closed with C1",
      ],
      meta: { ID: "C2", Pillar: "C", Epic: "EPIC-C", Decision: "Won't — use authz Vault claims" },
      dependencies: "Superseded by @stambha/authz",
      references: ["docs/features/capabilities.md", "packages/authz"],
    }),
  },

  P1: {
    title: "P1 — Pagination plugin",
    status: "Done",
    track: "stambha-plugins",
    type: "Feature",
    pillar: "Plugins",
    release: "1.0.0",
    body: doneBody({
      summary: "`@stambha/pagination` — embed pagination via Signals.",
      delivered: [
        "createPaginator + PaginationSignal (stambha:pagination:…)",
        "Published @stambha/pagination@1.0.0",
        "Product guide at docs/extensions/pagination",
      ],
      meta: { ID: "P1", Pillar: "Plugins", Epic: "EPIC-B", Track: "stambha-plugins", Release: "1.0.0" },
      references: ["https://github.com/Mivaya/Stambha-plugins/releases/tag/v1.0.0"],
    }),
  },

  E1: {
    title: "E1 — Dashboard HTTP router",
    status: "Done",
    track: "stambha-plugins",
    type: "Feature",
    pillar: "E",
    release: "1.0.0",
    body: doneBody({
      summary: "`@stambha/api` HTTP router — mountable admin API host.",
      delivered: [
        "createApiServer / createApiPlugin",
        "GET /health + GET /version",
        "CORS, body limit, request-id middleware",
        "Tier-split deployment doc",
      ],
      meta: { ID: "E1", Pillar: "E", Epic: "EPIC-E", Track: "stambha-plugins", Release: "1.0.0" },
      references: ["docs/extensions/api"],
    }),
  },

  "E2-E4": {
    title: "E2–E4 — Dashboard OAuth, Vault routes, tier mount",
    status: "Done",
    track: "stambha-plugins",
    type: "Feature",
    pillar: "E",
    release: "1.1.0",
    body: doneBody({
      summary: "OAuth, Vault CRUD routes, tier-split listen controls — shipped in @stambha/api 1.1.0.",
      delivered: [
        "E2: Discord OAuth (PKCE), sessions, CSRF",
        "E3: Vault guild settings + schema routes",
        "E4: listenWhen / STAMBHA_API_LISTEN / bot-worker mount pattern",
      ],
      meta: { ID: "E2-E4", Pillar: "E", Epic: "EPIC-E", Release: "1.1.0" },
      references: ["https://github.com/Mivaya/Stambha-plugins/releases/tag/vapi-1.1.0", "docs/extensions/api"],
    }),
  },

  E5: {
    title: "E5 — File-based API routes (src/routes loader)",
    status: "Done",
    track: "stambha-plugins",
    type: "Feature",
    pillar: "E",
    release: "1.2",
    body: doneBody({
      summary:
        "`@stambha/api` 1.2.0 — `loadRoutes`, `Route` class, `routesDir` / `createApiServerAsync` for Sapphire-style `src/routes/` files.",
      delivered: [
        "loadRoutes + parseRouteFilename (`name.method.ts`)",
        "Route base class with optional static create(ctx)",
        "routesDir on createApiPlugin / createApiServerAsync",
        "GitHub Release vapi-1.2.0 + npm @stambha/api@1.2.0",
        "Core docs: PiecePaths.routes, project-structure, Sapphire migration",
      ],
      meta: { ID: "E5", Pillar: "E", Epic: "EPIC-E", Track: "stambha-plugins", Release: "1.2" },
      references: [
        "https://github.com/Mivaya/Stambha-plugins/releases/tag/vapi-1.2.0",
        "docs/extensions/api",
      ],
    }),
  },

  A1: {
    title: "A1 — Redis cache driver",
    status: "Sprint Ready",
    track: "stambha-plugins",
    type: "Feature",
    pillar: "A",
    release: "1.4",
    lane: "Expedite",
    priority: "high",
    body: ticketBody({
      userStory: "As a split-tier bot operator, I want shared cache across gateway/bot workers via npm.",
      summary:
        "`@stambha/cache-redis` exists in Stambha-plugins (v1.0.0 in-repo) but is **not on npm** (404 verified 2026-08-21). Docs already advertise it. Finish publish + peer matrix.",
      problem:
        "Core docs and extensions hub list `@stambha/cache-redis@1.0.0`, but `npm view @stambha/cache-redis` returns 404. `@stambha/cache@1.0.0` and `@stambha/cooldown-redis@1.0.1` are published.",
      acceptance: [
        "GitHub Release + npm publish `@stambha/cache-redis@1.0.0` (or next patch)",
        "`npm view @stambha/cache-redis version` succeeds",
        "Core docs peer/version matrix matches published package",
        "Monolith keeps `@stambha/cache` memory default",
      ],
      meta: { ID: "A1", Pillar: "A", Epic: "EPIC-A", Track: "stambha-plugins", Release: "1.4" },
      references: [
        "packages/cache-redis in Stambha-plugins",
        "docs/extensions/cache.md",
      ],
    }),
  },

  "A1-core": {
    title: "A1-core — Redis cache coordination",
    status: "Done",
    track: "stambha",
    type: "Task",
    pillar: "A",
    release: "1.3.0",
    body: doneBody({
      summary: "Core-side hooks/docs for plugging Redis cache driver into gateway and workers.",
      delivered: [
        "Cache injection documented on extensions/cache + deployment/tier-split",
        "No mandatory Redis for monolith",
      ],
      meta: { ID: "A1-core", Pillar: "A", Epic: "EPIC-A", Release: "1.3.0" },
    }),
  },

  A2: {
    title: "A2 — Redis cooldown store (core)",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "A",
    release: "1.3.0",
    body: doneBody({
      summary: "Shared CooldownStore interface in gates; memory default; Redis driver in plugins.",
      delivered: [
        "CooldownStore + MemoryCooldownStore in `@stambha/gates` (1.3.0)",
        "cooldownGate accepts injected async store",
      ],
      meta: { ID: "A2", Pillar: "A", Epic: "EPIC-A", Release: "1.3.0" },
      references: ["packages/gates", "docs/features/gates"],
    }),
  },

  "A2-plugins": {
    title: "A2-plugins — Redis cooldown extension",
    status: "Done",
    track: "stambha-plugins",
    type: "Feature",
    pillar: "A",
    release: "1.0.1",
    body: doneBody({
      summary: "Redis-backed cooldown store for `@stambha/gates` in Stambha-plugins.",
      delivered: [
        "Published `@stambha/cooldown-redis@1.0.1`",
        "Implements CooldownStore from core/gates",
      ],
      meta: {
        ID: "A2-plugins",
        Pillar: "A",
        Epic: "EPIC-A",
        Track: "stambha-plugins",
        Release: "1.0.1",
      },
      references: ["https://github.com/Mivaya/Stambha-plugins/releases/tag/vcooldown-redis-1.0.1"],
    }),
  },

  A3: {
    title: "A3 — RabbitMQ worker bus",
    status: "Icebox",
    track: "stambha",
    type: "Feature",
    pillar: "A",
    release: "2.0",
    body: ticketBody({
      summary: "RabbitMQ message bus for gateway → bot fan-out at scale (2.0 A3).",
      acceptance: [
        "WorkerBus interface + RabbitMQ implementation",
        "Document when to adopt vs HTTP worker bus",
        "Does not break monolith HTTP bus default",
      ],
      meta: { ID: "A3", Pillar: "A", Release: "2.0", Epic: "EPIC-A" },
      dependencies: "A1, A2 Redis drivers recommended",
    }),
  },

  "A4-core": {
    title: "A4-core — Influx telemetry spec",
    status: "Backlog",
    track: "stambha",
    type: "Task",
    pillar: "A",
    release: "1.x",
    body: ticketBody({
      summary: "Define telemetry events for gateway identify, REST 429s — core tracking hooks (A4).",
      acceptance: [
        "Event schema documented",
        "Hooks in gateway/rest emit metrics-compatible events",
      ],
      meta: { ID: "A4-core", Pillar: "A", Epic: "EPIC-A" },
    }),
  },

  "A4-influx": {
    title: "A4-influx — metrics-influx plugin",
    status: "Backlog",
    track: "stambha-plugins",
    type: "Feature",
    pillar: "Plugins",
    release: "1.x",
    body: ticketBody({
      summary: "`@stambha/metrics-influx` — InfluxDB export for ops dashboards.",
      acceptance: [
        "Package in Stambha-plugins",
        "Exports gateway + REST metrics",
        "README with docker-compose example",
      ],
      meta: { ID: "A4-influx", Pillar: "Plugins", Epic: "EPIC-A", Track: "stambha-plugins" },
      dependencies: "A4-core event schema",
    }),
  },

  G1: {
    title: "G1 — Auto resharding threshold",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "G",
    release: "1.x",
    body: ticketBody({
      userStory: "As a large bot operator, I want automatic resharding when guild count nears capacity (Discordeno 80% rule).",
      summary: "Automated resharding threshold on top of existing ReshardController APIs.",
      acceptance: [
        "Configurable threshold (e.g. 80% guild cap)",
        "Evaluation integrates with ReshardController",
        "docs/deployment/resharding.md updated",
      ],
      meta: { ID: "G1", Pillar: "G", Epic: "EPIC-G" },
      references: ["docs/deployment/resharding.md"],
    }),
  },

  G2: {
    title: "G2 — Gateway proxy",
    status: "Icebox",
    track: "stambha",
    type: "Feature",
    pillar: "G",
    release: "2.0",
    body: ticketBody({
      summary: "Gateway proxy for zero-downtime code deploy — Discordeno-inspired.",
      acceptance: [
        "Design doc for proxy layer",
        "Optional core or plugin implementation",
        "Does not block 1.x releases",
      ],
      meta: { ID: "G2", Pillar: "G", Release: "2.0", Epic: "EPIC-G" },
    }),
  },

  "G3-spike": {
    title: "G3-spike — Dispatch catalog & camelize",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "G",
    release: "1.1",
    body: ticketBody({
      summary: "G3 foundation: dispatch catalog, camelizeDispatch, consolidate normalizeDispatch in @stambha/transform.",
      problem: "Non-routing hub events are raw snake_case; app bots maintain local dispatch guards.",
      acceptance: [
        "camelizeDispatch exported with tests",
        "Catalog test covers all GatewayDispatchEvents names",
        "Single dispatch module; gateway re-exports",
        "scripts/kanban + Project cards stay source of truth (no internal docs dependency)",
      ],
      meta: { ID: "G3-spike", Pillar: "G", Release: "1.1", Epic: "EPIC-G" },
      references: ["docs/guide/known-gaps.md — G3", "docs/deployment/gateway.md", "Shipped v1.1.0"],
    }),
  },

  "G3-p1": {
    title: "G3-p1 — Tier 1 gateway dispatches",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "G",
    release: "1.2",
    body: doneBody({
      summary: "1.2.0 — Tier 1 hub camelCase (G3-p1).",
      delivered: [
        "normalizeDispatch camelizes Tier 1 at hub boundary",
        "dispatchNormalize raw escape hatch",
        "Tier 1 types + guards; ReactionListener in examples/bot",
        "gateway.md migration + CHANGELOG breaking note",
        "Worker bus JSON round-trip tests",
      ],
      meta: { ID: "G3-p1", Pillar: "G", Release: "1.2.0", Epic: "EPIC-G" },
      references: ["Shipped v1.2.0"],
    }),
  },

  "G3-p2": {
    title: "G3-p2 — Tier 2 gateway dispatches",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "G",
    release: "1.3",
    lane: "Standard",
    priority: "high",
    body: ticketBody({
      summary: "Channels, threads, roles, bans, GUILD_MEMBERS_CHUNK, audit log.",
      acceptance: ["Tier 2 complete with golden fixture tests per event group"],
      meta: { ID: "G3-p2", Pillar: "G", Release: "1.3", Epic: "EPIC-G" },
      dependencies: "G3-p1",
    }),
  },

  "G3-p3": {
    title: "G3-p3 — Tier 3 gateway dispatches",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "G",
    release: "1.4",
    body: ticketBody({
      summary: "Invites, integrations, stage, scheduled events, typing, webhooks, emoji/sticker updates.",
      acceptance: ["Tier 3 complete"],
      meta: { ID: "G3-p3", Pillar: "G", Release: "1.4", Epic: "EPIC-G" },
      dependencies: "G3-p2",
    }),
  },

  "G3-p4": {
    title: "G3-p4 — Tier 4 gateway dispatches",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "G",
    release: "1.5",
    body: ticketBody({
      summary: "Automod, soundboard, entitlements/subscriptions, app-command permission updates.",
      acceptance: ["Tier 4 complete", "Enables 1.5.0-adapters release"],
      meta: { ID: "G3-p4", Pillar: "G", Release: "1.5", Epic: "EPIC-G" },
      dependencies: "G3-p3",
    }),
  },

  G3a: {
    title: "G3a — Typed GatewayEventMap",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "G",
    release: "1.x",
    body: ticketBody({
      summary: "Typed hub.on via GatewayEventMap — optional TS DX without Stambha* per event.",
      acceptance: [
        "GatewayEventHub typed overloads or generics",
        "Event → type table in public gateway docs",
      ],
      meta: { ID: "G3a", Pillar: "G", Epic: "EPIC-G" },
      dependencies: "G3-p1 minimum",
    }),
  },

  "REST-app": {
    title: "REST: fetchApplication + owner team",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "G",
    release: "1.x",
    body: ticketBody({
      summary: "Export GET /oauth2/applications/@me helpers from @stambha/rest.",
      acceptance: [
        "fetchApplication (or equivalent) in rest package",
        "Types for owner team where applicable",
        "Used by mention-prefix (B7) or docs example",
      ],
      meta: { ID: "REST-app", Pillar: "G" },
    }),
  },

  "ADAPTERS-1.5": {
    title: "1.5.0-adapters — Remove library adapters",
    status: "Done",
    track: "stambha",
    type: "Release",
    pillar: "B",
    release: "1.5",
    body: ticketBody({
      summary: "Delete discord.js / Discordeno shape adapters from @stambha/transform (deprecated in 1.0.0).",
      problem: "ADR 005 — official migrations must be fully native.",
      acceptance: [
        "messageFromDiscordJs, messageFromDiscordeno, etc. removed",
        "CHANGELOG breaking note",
        "Migration guide confirms native-only path",
      ],
      meta: { ID: "ADAPTERS-1.5", Release: "1.5" },
      dependencies: "G3-p4 optional but same release train",
      references: ["docs/guide/known-gaps.md", "docs/decisions/005-native-only-migration.md"],
    }),
  },

  TYPING: {
    title: "Typing indicator",
    status: "Done",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.x",
    body: ticketBody({
      summary: "Bot typing indicator for long-running prefix/slash commands.",
      acceptance: [
        "API to trigger typing in channel",
        "Optional Command option `typing: true` when B1 lands",
      ],
      meta: { ID: "TYPING", Pillar: "B", Epic: "EPIC-B" },
    }),
  },

  "VAULT-migrations": {
    title: "Vault blueprint migrations",
    status: "Backlog",
    track: "stambha",
    type: "Feature",
    pillar: "Vault",
    release: "1.x",
    body: ticketBody({
      summary: "Schema migration support for Vault blueprints across bot versions.",
      acceptance: ["Migration runner for blueprint version bumps", "Docs for bot operators"],
      meta: { ID: "VAULT-migrations", Pillar: "Vault", Epic: "EPIC-V" },
    }),
  },

  "VAULT-fields": {
    title: "Vault Discord field types",
    status: "Backlog",
    track: "stambha",
    type: "Feature",
    pillar: "Vault",
    release: "1.x",
    body: ticketBody({
      summary: "First-class Discord field types in Vault schema (snowflake, channel, role).",
      acceptance: ["Type validators for Discord ids", "Serialize/deserialize documented"],
      meta: { ID: "VAULT-fields", Pillar: "Vault", Epic: "EPIC-V" },
    }),
  },

  "VAULT-array": {
    title: "Vault array update ops",
    status: "Backlog",
    track: "stambha",
    type: "Feature",
    pillar: "Vault",
    release: "1.x",
    body: ticketBody({
      summary: "Array mutation operations on Vault settings arrays (push, pull, unique).",
      acceptance: ["Documented array ops API", "Tests for concurrent updates"],
      meta: { ID: "VAULT-array", Pillar: "Vault", Epic: "EPIC-V" },
    }),
  },

  "VAULT-guild-attach": {
    title: "Guild settings attach ergonomics",
    status: "Backlog",
    track: "stambha",
    type: "Feature",
    pillar: "Vault",
    release: "1.x",
    body: ticketBody({
      summary: "Easier access to guild settings on client / context (attach ergonomics).",
      acceptance: ["Ergonomic API on StambhaClient or context", "Example in examples/bot"],
      meta: { ID: "VAULT-guild-attach", Pillar: "Vault", Epic: "EPIC-V" },
    }),
  },

  "DOCS-tier2": {
    title: "Tier 2 doc expansion",
    status: "Done",
    track: "stambha",
    type: "Task",
    pillar: "Docs",
    release: "1.3.1",
    body: doneBody({
      summary: "Closed leftover guide gaps for 1.3.1 via explicit deferrals (no scaffolder/i18n invent).",
      delivered: [
        "known-gaps: Not in 1.3.1 table for testing guide, Docker/PM2 recipes, scaffolder docs, i18n",
        "Pointers to demo REST, MemoryDriver, deployment overview, examples",
      ],
      meta: { ID: "DOCS-tier2", Pillar: "Docs", Epic: "EPIC-DOCS", Release: "1.3.1" },
      references: ["docs/guide/known-gaps.md — Documentation follow-ups"],
    }),
  },

  "DOCS-sequences": {
    title: "Sequence docs/examples",
    status: "Done",
    track: "stambha",
    type: "Task",
    pillar: "Docs",
    release: "1.3.1",
    body: doneBody({
      summary: "End-to-end sequence() + Signal walkthrough and live examples/bot multi-step flow.",
      delivered: [
        "docs/features/sequences.md — waitForStep / completeStep pattern",
        "examples/bot SetupCommand + SeqSignal (stambha:seq:)",
      ],
      meta: { ID: "DOCS-sequences", Pillar: "Docs", Epic: "EPIC-DOCS", Release: "1.3.1" },
    }),
  },

  "vault-redis": {
    title: "vault-redis — Redis Vault driver",
    status: "Backlog",
    track: "stambha-plugins",
    type: "Feature",
    pillar: "Vault",
    release: "1.x",
    body: ticketBody({
      summary: "Optional Redis-backed Vault driver for shared settings across workers.",
      acceptance: ["Package in Stambha-plugins", "Implements Vault driver interface"],
      meta: { ID: "vault-redis", Pillar: "Vault", Epic: "EPIC-A", Track: "stambha-plugins" },
    }),
  },

  i18n: {
    title: "i18n — @stambha/i18n",
    status: "Backlog",
    track: "stambha-plugins",
    type: "Feature",
    pillar: "Plugins",
    release: "1.x",
    body: ticketBody({
      summary: "Locale and translation helpers for commands and help text.",
      acceptance: ["Package scaffold", "Integration pattern with @stambha/help when B3 exists"],
      meta: { ID: "i18n", Track: "stambha-plugins" },
    }),
  },

  "dev-reload": {
    title: "dev-reload — piece hot reload",
    status: "Backlog",
    track: "stambha-plugins",
    type: "Feature",
    pillar: "Plugins",
    release: "1.x",
    body: ticketBody({
      summary: "Development hot-reload for pieces — Klasa plugin-api parity.",
      acceptance: ["Dev-only package", "Document security warnings"],
      meta: { ID: "dev-reload", Track: "stambha-plugins" },
    }),
  },

  D1: {
    title: "D1 — Native runSequence",
    status: "Sprint Ready",
    track: "stambha",
    type: "Feature",
    pillar: "D",
    release: "1.4",
    lane: "Expedite",
    priority: "blocker",
    body: ticketBody({
      userStory:
        "As a bot author, I want multi-step button/select/modal flows without manual SeqSignal + waitForStep glue.",
      summary:
        "Framework-owned `runSequence` orchestration. **Pulled from 2.0 → 1.4** — Sequences are a differentiator but the 1.3.1 floor (command + SeqSignal + wrong_user handling) is too high for adoption.",
      problem:
        "Today: createSession → render step → waitForStep loop → SeqSignal.completeStep. Docs/examples/bot show the pattern; automatic routing is still listed under Deferred to 2.0 on known-gaps.",
      developerSyntax:
        "```ts\nconst result = await runSequence(ctx, sequence()\n  .button(\"role\", \"Pick:\", [{ id: \"mod\", label: \"Mod\" }])\n  .select(\"channel\", \"Channel:\", [...])\n  .build());\n```",
      acceptance: [
        "runSequence(ctx, flow) owns session, step UI, wrong-user, timeout",
        "Works for button + select at minimum; modal documented or supported",
        "examples/bot SetupCommand uses runSequence (SeqSignal optional/internal)",
        "docs/features/sequences.md + known-gaps: remove from 2.0 deferred",
        "No breaking change to SequenceStore / sequence() builder",
      ],
      meta: { ID: "D1", Pillar: "D", Release: "1.4", Epic: "EPIC-D", Branch: "feature/run-sequence" },
      dependencies: "None (G3 already shipped)",
      references: ["docs/features/sequences.md", "examples/bot SetupCommand + SeqSignal"],
    }),
  },

  D2: {
    title: "D2 — Distributed Chron",
    status: "Icebox",
    track: "stambha",
    type: "Feature",
    pillar: "D",
    release: "2.0",
    body: ticketBody({
      summary: "Single cron tick cluster-wide — 2.0 D2.",
      acceptance: ["Leader election or distributed lock design", "Chron API unchanged for monolith"],
      meta: { ID: "D2", Pillar: "D", Release: "2.0", Epic: "EPIC-D" },
      dependencies: "A2 Redis cooldown recommended",
    }),
  },

  "D3-reshard-barrier": {
    title: "Reshard-aware routing barrier",
    status: "Icebox",
    track: "stambha",
    type: "Feature",
    pillar: "G",
    release: "2.0",
    body: ticketBody({
      summary: "Barrier integration during resharding — pause or reroute commands safely.",
      acceptance: ["Barrier activates during ReshardController migration", "Documented operator playbook"],
      meta: { ID: "D3-reshard-barrier", Pillar: "G", Release: "2.0" },
      dependencies: "G1",
    }),
  },

  "D3-vault-seq": {
    title: "Vault + Sequences integration",
    status: "Icebox",
    track: "stambha",
    type: "Feature",
    pillar: "D",
    release: "2.0",
    body: ticketBody({
      summary: "Persist multi-step wizard state to Vault schemas.",
      acceptance: ["Sequence state schema pattern", "Example wizard bot"],
      meta: { ID: "D3-vault-seq", Pillar: "D", Release: "2.0", Epic: "EPIC-D" },
      dependencies: "D1",
    }),
  },

  "D3-cmd-options": {
    title: "2.0 CommandOptions review",
    status: "Icebox",
    track: "stambha",
    type: "Task",
    pillar: "B",
    release: "2.0",
    body: ticketBody({
      summary: "Breaking review of CommandOptions if B1 auto-gates merge order requires 2.0.",
      acceptance: ["RFC or ADR if breaking", "Migration path from 1.x"],
      meta: { ID: "D3-cmd-options", Release: "2.0" },
      dependencies: "B1",
    }),
  },

  "G2-plugin": {
    title: "Gateway proxy plugin",
    status: "Icebox",
    track: "stambha-plugins",
    type: "Feature",
    pillar: "G",
    release: "2.0",
    body: ticketBody({
      summary: "Optional @stambha/gateway-proxy if G2 does not land in core.",
      acceptance: ["Plugin design doc", "Depends on G2 RFC"],
      meta: { ID: "G2-plugin", Track: "stambha-plugins", Release: "2.0" },
    }),
  },

  SSO: {
    title: "Enterprise SSO for dashboard",
    status: "Icebox",
    track: "stambha-plugins",
    type: "Feature",
    pillar: "E",
    release: "2.0",
    body: ticketBody({
      summary: "SAML/OIDC enterprise SSO for @stambha/dashboard beyond Discord OAuth.",
      acceptance: ["Out of core scope", "Plugin RFC if demand"],
      meta: { ID: "SSO", Pillar: "E" },
    }),
  },

  "HOSTED-UI": {
    title: "Hosted dashboard UI",
    status: "Icebox",
    track: "stambha-plugins",
    type: "Feature",
    pillar: "E",
    body: ticketBody({
      summary: "Fully hosted dashboard frontend as separate product — out of core scope.",
      acceptance: ["Explicit product decision before implementation"],
      meta: { ID: "HOSTED-UI", Pillar: "E" },
    }),
  },

  // Epics
  "EPIC-B": {
    title: "EPIC-B — Pillar B: Command & gate DX",
    status: "Backlog",
    track: "stambha",
    type: "Epic",
    pillar: "B",
    release: "1.x",
    lane: "Standard",
    body: epicBody({
      objective:
        "Sapphire-style command ergonomics on the native stack — declarative gates, hybrid args, help, lifecycle hooks, and component UX without discord.js.",
      architecture: [
        "`@stambha/core` — Command, CommandOptions, InboundRouter",
        "`@stambha/gates` + `@stambha/args` — preconditions and parsing",
        "`@stambha/loader` — piece discovery",
      ],
      outcomes: [
        "Declarative gates (B1)",
        "Bridge/hybrid args + REST resolvers (B2)",
        "Built-in help (B3)",
        "Piece lifecycle hooks (B4)",
        "Component builders + persistent signals (B5)",
        "Prefix edit-tracking (B6)",
      ],
      childTickets: [
        { id: "B7", title: "Mention-as-prefix", shipped: true },
        { id: "B1", title: "Declarative gates", shipped: true },
        { id: "B2", title: "Bridge args, flags, entity resolvers", shipped: true },
        { id: "B3", title: "Help system", shipped: true },
        { id: "B4", title: "Piece lifecycle + error hooks", shipped: true },
        { id: "B5", title: "Component builder + persistent signals", shipped: true },
        { id: "B6", title: "Prefix edit-tracking", shipped: true },
        { id: "B8", title: "Native registerPlugin & onShutdown", shipped: true },
        { id: "B9", title: "TypeScript interface augmentation", shipped: true },
        { id: "B10", title: "EmbedBuilder + Components V2", shipped: true },
        { id: "SELECTS", title: "Typed entity select builders", shipped: true },
        { id: "DX-1", title: "Kind hooks", shipped: true },
        { id: "DX-2", title: "Subcommand method dispatch", shipped: true },
        { id: "DX-3", title: "EmbedBuilder / V2 publish bump", shipped: true },
        { id: "TYPING", title: "Typing indicator", shipped: true },
        { id: "P1", title: "Pagination plugin (@stambha/pagination)", shipped: true },
        { id: "DX-bootstrap", title: "Fluent native bootstrap", shipped: false },
        { id: "DX-piece-factory", title: "Reduce Registry ctor boilerplate", shipped: false },
        { id: "SIGNAL-match", title: "Signal match() routing", shipped: false },
        { id: "FORMAT", title: "@stambha/format", shipped: false },
        { id: "ATTACH", title: "AttachmentBuilder", shipped: false },
      ],
      successCriteria: [
        "Adoption DX (bootstrap / piece factory) ships in 1.4 or is explicitly deferred",
        "Each child has acceptance criteria in catalog + known-gaps cross-link",
        "No discord.js in core hot path",
      ],
      meta: { ID: "EPIC-B", Pillar: "B", Release: "1.4+" },
      references: ["docs/guide/known-gaps.md", "docs/decisions/003-plugins-monorepo.md"],
    }),
  },

  "EPIC-G": {
    title: "EPIC-G — Pillar G: Gateway & dispatch",
    status: "Backlog",
    track: "stambha",
    type: "Epic",
    pillar: "G",
    release: "1.x",
    lane: "Standard",
    body: epicBody({
      objective:
        "Normalize gateway dispatches to camelCase at the hub boundary and provide Discordeno-scale ops (resharding, optional proxy) on `@stambha/gateway` + `@stambha/transform`.",
      architecture: [
        "`@stambha/gateway` — WebSocket shards, `attachStambhaClient`, worker bus",
        "`@stambha/transform` — `normalizeDispatch`, payload types, guards",
        "`@stambha/rest` — outbound API + rate-limit queue telemetry",
      ],
      outcomes: [
        "G3 all tiers camelCase (p1–p4)",
        "Typed GatewayEventMap (G3a)",
        "Auto resharding threshold (G1)",
        "Gateway proxy (G2, 2.0)",
      ],
      childTickets: [
        { id: "G3-spike", title: "Dispatch catalog & camelize", shipped: true },
        { id: "G3-p1", title: "Tier 1 gateway dispatches", shipped: true },
        { id: "G3-p2", title: "Tier 2 gateway dispatches", shipped: true },
        { id: "G3-p3", title: "Tier 3 gateway dispatches", shipped: true },
        { id: "G3-p4", title: "Tier 4 gateway dispatches", shipped: true },
        { id: "G3a", title: "Typed GatewayEventMap", shipped: true },
        { id: "G1", title: "Auto resharding threshold", shipped: true },
        { id: "ADAPTERS-1.5", title: "Remove library adapters", shipped: true },
        { id: "REST-app", title: "fetchApplication + owner team", shipped: true },
        { id: "G2", title: "Gateway proxy (2.0)", shipped: false },
      ],
      successCriteria: [
        "G3-p2 ships as breaking minor 1.3.0 with migration notes",
        "`dispatchNormalize: 'raw'` escape hatch documented until tiers complete",
        "Golden fixture tests per event group",
      ],
      meta: { ID: "EPIC-G", Pillar: "G", Release: "1.x" },
      references: ["docs/deployment/gateway.md", "docs/guide/known-gaps.md — G3"],
    }),
  },

  "EPIC-A": {
    title: "EPIC-A — Pillar A: Distributed infrastructure",
    status: "Backlog",
    track: "stambha",
    type: "Epic",
    pillar: "A",
    release: "1.x",
    body: epicBody({
      vision: "Optional Redis/bus backends — monolith defaults unchanged.",
      childFeatures: ["A1", "A1-core", "A2", "A2-plugins", "A4-core", "A4-influx", "vault-redis", "A3"],
      meta: { ID: "EPIC-A", Pillar: "A" },
    }),
  },

  "EPIC-C": {
    title: "EPIC-C — Pillar C: Staff authorization (authz)",
    status: "Done",
    track: "stambha",
    type: "Epic",
    pillar: "C",
    release: "1.3.0",
    lane: "Standard",
    body: epicBody({
      objective:
        "Staff / operator authorization without a numeric permission ladder — shipped as `@stambha/authz` capabilities.",
      vision:
        "Named capabilities (`mod.purge`, …) with Discord permission floors, role grants, and Vault claims. **Not** Sapphire-style Everyone→Mod→Admin numbers.",
      architecture: [
        "`@stambha/authz` — defineCapability, capabilityGate, configureAuthz",
        "Vault claims via attachVaultCapabilityClaims",
        "Compose with `@stambha/gates` Discord permission gates when needed",
      ],
      childTickets: [
        { id: "authz-shipped", title: "@stambha/authz capabilities (1.3)", shipped: true },
        { id: "C1", title: "Numeric permission levels", shipped: false },
        { id: "C2", title: "Vault level overrides", shipped: false },
      ],
      outcomes: [
        "C1 / C2 Won't — use capabilities + Vault claims instead",
        "Getting-started steers staff hierarchy to capabilityGate",
      ],
      successCriteria: [
        "Public docs recommend authz over levels",
        "No @stambha/levels package in core roadmap",
      ],
      meta: { ID: "EPIC-C", Pillar: "C", Release: "1.3.0" },
      references: ["docs/features/capabilities.md", "WONT-levels"],
    }),
  },

  "EPIC-E": {
    title: "EPIC-E — Pillar E: Dashboard HTTP API",
    status: "Done",
    track: "stambha-plugins",
    type: "Epic",
    pillar: "E",
    release: "1.1.0",
    lane: "Standard",
    body: epicBody({
      objective:
        "`@stambha/api` — HTTP host with Discord OAuth and Vault guild settings for operator-built admin panels (no hosted UI).",
      architecture: [
        "`@stambha/api` — router, auth, sessions, Vault settings routes",
        "`@stambha/plugins` — `createApiPlugin` lifecycle on bot worker",
        "Optional `@stambha/vault` peer for `/guilds/:id/settings`",
      ],
      childTickets: [
        { id: "E1", title: "HTTP router + health/version", shipped: true },
        { id: "E2-E4", title: "OAuth, Vault routes, tier mount", shipped: true },
        { id: "E5", title: "File-based routes (src/routes loader)", shipped: true },
        { id: "HOSTED-UI", title: "Hosted dashboard UI product", shipped: false },
        { id: "SSO", title: "Enterprise SSO", shipped: false },
      ],
      successCriteria: [
        "@stambha/api@1.2.0 on npm with OAuth, settings routes, and src/routes/ loader",
        "Product guide at docs/extensions/api",
        "API runs on bot worker only — not gateway shards",
      ],
      meta: { ID: "EPIC-E", Pillar: "E", Track: "stambha-plugins", Release: "1.2" },
      references: ["docs/extensions/api", "docs/decisions/003-plugins-monorepo.md"],
    }),
  },

  "EPIC-D": {
    title: "EPIC-D — Pillar D: Sequences & scale",
    status: "Backlog",
    track: "stambha",
    type: "Epic",
    pillar: "D",
    release: "1.4",
    body: epicBody({
      vision: "Stambha originals — Sequences first (1.4), then multi-worker Chron / proxy (1.5–2.0).",
      childFeatures: ["D1", "CHRON-redis", "D2", "D3-vault-seq", "D3-reshard-barrier"],
      meta: { ID: "EPIC-D", Pillar: "D", Release: "1.4+" },
    }),
  },

  "EPIC-V": {
    title: "EPIC-V — Vault evolution",
    status: "Backlog",
    track: "stambha",
    type: "Epic",
    pillar: "Vault",
    release: "1.x",
    body: epicBody({
      vision: "Vault schema power for guild settings.",
      childFeatures: ["VAULT-migrations", "VAULT-fields", "VAULT-array", "VAULT-guild-attach"],
      meta: { ID: "EPIC-V", Pillar: "Vault" },
    }),
  },

  "EPIC-DOCS": {
    title: "EPIC-DOCS — Public documentation",
    status: "Backlog",
    track: "stambha",
    type: "Epic",
    pillar: "Docs",
    release: "1.x",
    body: epicBody({
      vision: "Public docs match 1.x capabilities.",
      childFeatures: [
        "DOCS-tier2",
        "DOCS-sequences",
        "DX-4",
        "F1",
        "F3",
        "DOCS-mental-model",
        "DOCS-vault-persist",
        "DOCS-gaps-hygiene",
        "REL-1.3.0-archive",
        "G3 migration guides",
      ],
      meta: { ID: "EPIC-DOCS", Pillar: "Docs", Release: "1.4+" },
    }),
  },

  // Won't decisions
  "WONT-bridge-transport": {
    title: "discord.js / Discordeno transport",
    status: "Won't",
    track: "stambha",
    type: "Decision",
    body: decisionBody({
      decision: "Won't support discord.js or Discordeno as official transport.",
      rationale: "ADR 005 — native stack only for official migrations.",
      meta: { ADR: "005" },
      references: [".cursor/rules/stambha.mdc", "docs/guide/known-gaps.md", "docs/decisions/005-native-only-migration.md"],
    }),
  },

  "WONT-bridge-pkgs": {
    title: "@stambha/bridge-* packages",
    status: "Won't",
    type: "Decision",
    body: decisionBody({
      decision: "Won't re-introduce bridge packages.",
      rationale: "ADR 002 — removed; use @stambha/transform native shapes.",
      meta: { ADR: "002" },
      references: ["docs/decisions/002-bridge-deprecation.md"],
    }),
  },

  "WONT-hybrid": {
    title: "Hybrid gateway",
    status: "Won't",
    type: "Decision",
    body: decisionBody({
      decision: "Won't support discord.js WebSocket + Stambha command pipeline.",
      rationale: "ADR 005",
      meta: { ADR: "005" },
    }),
  },

  "WONT-sapphire-plugins": {
    title: "Sapphire plugin compatibility in core",
    status: "Won't",
    type: "Decision",
    body: decisionBody({
      decision: "Won't load Sapphire plugins in core.",
      rationale: "Different plugin model (@stambha/plugins host).",
    }),
  },

  "WONT-vault-orm": {
    title: "Vault as full ORM",
    status: "Won't",
    type: "Decision",
    body: decisionBody({
      decision: "Won't expand Vault into full ORM.",
      rationale: "ADR 004 — use Prisma/Drizzle for domain data.",
      meta: { ADR: "004" },
      references: ["docs/decisions/004-vault-scope-orm-coexistence.md"],
    }),
  },

  "WONT-voice": {
    title: "Voice in core",
    status: "Won't",
    type: "Decision",
    body: decisionBody({
      decision: "Won't ship voice stack in core monorepo.",
      rationale: "App-specific; use raw G3 voice events if needed.",
    }),
  },

  "WONT-require-redis": {
    title: "Require Redis/RabbitMQ for monolith",
    status: "Won't",
    type: "Decision",
    body: decisionBody({
      decision: "Won't require external infra for single-process bots.",
      rationale: "Memory defaults for Cache, CooldownStore, WorkerBus.",
    }),
  },

  "WONT-functional-only": {
    title: "Functional-only pieces",
    status: "Won't",
    type: "Decision",
    body: decisionBody({
      decision: "Won't ban class-based pieces.",
      rationale: "Stambha uses class pieces + defineGate functions.",
    }),
  },

  "WONT-prompting": {
    title: "Argument prompting",
    status: "Won't",
    type: "Decision",
    body: decisionBody({
      decision: "Won't implement Klasa-style missing-arg prompts until designed.",
      rationale: "No spec; revisit as B2 sub-feature if requested.",
    }),
  },

  "WONT-plugins-host-move": {
    title: "@stambha/plugins host in plugins repo",
    status: "Won't",
    type: "Decision",
    body: decisionBody({
      decision: "Won't move @stambha/plugins host to plugins repo.",
      rationale: "ADR 003 — host stays in core; extensions in plugins repo.",
      meta: { ADR: "003" },
      references: ["docs/decisions/003-plugins-monorepo.md"],
    }),
  },

  "WONT-meta-pkg": {
    title: "Meta-package bundling all extensions",
    status: "Won't",
    type: "Decision",
    body: decisionBody({
      decision: "Won't ship one meta-package of all extensions.",
      rationale: "Independent semver per package.",
    }),
  },

  "WONT-discordjs-adapter": {
    title: "Official discord.js adapter",
    status: "Won't",
    type: "Decision",
    body: decisionBody({
      decision: "Won't ship @stambha/adapter-discordjs.",
      rationale: "ADR 005 native-only.",
      meta: { ADR: "005" },
    }),
  },

  "WONT-levels": {
    title: "Numeric permission levels (@stambha/levels)",
    status: "Won't",
    track: "stambha",
    type: "Decision",
    pillar: "C",
    body: decisionBody({
      decision:
        "Won't ship Sapphire/Klasa-style numeric permission levels (`@stambha/levels`, permissionLevelGate).",
      rationale:
        "Staff auth is `@stambha/authz` named capabilities + Discord floors + Vault claims. A second ladder duplicates policy and confuses greenfield authors. C1/C2 closed as Won't under EPIC-C.",
      meta: { ID: "WONT-levels", Pillar: "C", Epic: "EPIC-C" },
      references: [
        "docs/features/capabilities.md",
        "C1 — Permission levels",
        "C2 — Vault level overrides",
      ],
    }),
  },
};

/** Map board title (and aliases) → catalog ID */
export const TITLE_TO_ID = {
  "0.2.1–0.3.5 releases": "REL-0.3",
  "Phases 1–23 (core)": "PHASES-1-23",
  "Phase 24 — 1.0.0 prep": "PHASE-24",
  "Phase 25 — 1.1.0 prep": "PHASE-25",
  "Extensions v0.2.2+": "EXT-0.2.2",
  "1.0.0-tag": "REL-1.0.0-tag",
  "1.0.0-github-release": "REL-1.0.0-release",
  "1.0.0-merge": "REL-1.0.0-merge",
  "1.0.0-archive": "REL-1.0.0-archive",
  "1.1.0-tag": "REL-1.1.0-tag",
  "1.1.0-github-release": "REL-1.1.0-release",
  "1.1.0-archive": "REL-1.1.0-archive",
  "1.2.0-release-branch": "REL-1.2.0-branch",
  "1.2.0-release": "REL-1.2.0",
  "1.2.0-archive": "REL-1.2.0-archive",
  "1.3.0-release": "REL-1.3.0",
  "1.3.0-archive": "REL-1.3.0-archive",
  "1.3.1-release": "REL-1.3.1",
  "1.4.0-release": "REL-1.4.0",
  F3: "F3",
  "F3 — create-stambha scaffolder": "F3",
  "F3 — create-stambha CLI / project scaffolder": "F3",
  "create-stambha scaffolder": "F3",
  "DX-bootstrap": "DX-bootstrap",
  "DX-bootstrap — Fluent native stack bootstrap": "DX-bootstrap",
  "DX-piece-factory": "DX-piece-factory",
  "DX-piece-factory — Reduce Registry constructor boilerplate": "DX-piece-factory",
  "PKG-testing": "PKG-testing",
  "PKG-testing — @stambha/testing helpers": "PKG-testing",
  "DOCS-testing": "DOCS-testing",
  "DOCS-testing — Command testing guide": "DOCS-testing",
  "DOCS-mental-model": "DOCS-mental-model",
  "DOCS-mental-model — First-hour pipeline concept map": "DOCS-mental-model",
  "DOCS-vault-persist": "DOCS-vault-persist",
  "DOCS-vault-persist — Vault SQL on getting-started": "DOCS-vault-persist",
  "DOCS-gaps-hygiene": "DOCS-gaps-hygiene",
  "DOCS-gaps-hygiene — Fix stale known-gaps Redis rows": "DOCS-gaps-hygiene",
  "SIGNAL-match": "SIGNAL-match",
  "SIGNAL-match — Pattern / match() Signal routing": "SIGNAL-match",
  "CHRON-redis": "CHRON-redis",
  "CHRON-redis — Redis Chron lock for tier-split": "CHRON-redis",
  "plugins-core-1.3-peers": "PLUGINS-CORE-1.3",
  "PLUGINS-CORE-1.3": "PLUGINS-CORE-1.3",
  "DX-1": "DX-1",
  "DX-1 — Kind hooks: slash / prefix / menu": "DX-1",
  "DX-2": "DX-2",
  "DX-2 — Subcommand method dispatch": "DX-2",
  "DX-3": "DX-3",
  "DX-3 — Merge/publish EmbedBuilder + Components V2 bump": "DX-3",
  "DX-3 — Merge & publish EmbedBuilder / B10a core bump": "DX-3",
  "DX-4": "DX-4",
  "DX-4 — Capability ⊕ permission composition docs": "DX-4",
  "DX-4 — Capability ⊕ Discord permission composition docs": "DX-4",
  F1: "F1",
  "F1 — REST & Gateway correctness documentation": "F1",
  "F1 — REST / Gateway correctness documentation + tests": "F1",
  "plugins-1.0.0": "PLUGINS-1.0.0",
  "plugins-readme": "PLUGINS-README",
  "api-1.1.0-release": "PLUGINS-API-1.1.0",
  "api-1.2.0-release": "PLUGINS-API-1.2.0",
  "Extensions docs hub": "DOCS-EXTENSIONS",
  B1: "B1",
  "B1 — Declarative gates": "B1",
  B2: "B2",
  "B2 — Bridge args, flags, entity resolvers": "B2",
  B3: "B3",
  "B3 — Help system": "B3",
  B4: "B4",
  "B4 — Piece lifecycle + error hooks": "B4",
  B5: "B5",
  "B5 — Component builder + persistent signals": "B5",
  B6: "B6",
  "B6 — Prefix edit-tracking": "B6",
  "B7 — Mention-as-prefix": "B7",
  B8: "B8",
  "B8 — Native registerPlugin & onShutdown": "B8",
  B9: "B9",
  "B9 — TypeScript interface augmentation": "B9",
  B10: "B10",
  "B10 — Native EmbedBuilder (classic) + Components V2 builder layer": "B10",
  B10a: "B10a",
  "B10a — Components V2: official naming + full builder classes": "B10a",
  B10b: "B10b",
  "B10b — EmbedView + ContainerView (Stambha display primitives)": "B10b",
  "EPIC-DISPLAY": "EPIC-DISPLAY",
  "EPIC-DISPLAY — @stambha/display (plugins)": "EPIC-DISPLAY",
  "DISPLAY-managers": "DISPLAY-managers",
  "DISPLAY-managers — EmbedManager + ContainerManager": "DISPLAY-managers",
  "DISPLAY-migrate": "DISPLAY-migrate",
  "DISPLAY-migrate — Classic embed → Container (ex-panel)": "DISPLAY-migrate",
  ATTACH: "ATTACH",
  "ATTACH — AttachmentBuilder (files + spoilers)": "ATTACH",
  FORMAT: "FORMAT",
  "FORMAT — @stambha/format (mentions, time, code)": "FORMAT",
  "MODAL-V2": "MODAL-V2",
  "MODAL-V2 — Label, File Upload, Radio/Checkbox groups": "MODAL-V2",
  SELECTS: "SELECTS",
  "SELECTS — Typed entity select builders": "SELECTS",
  C1: "C1",
  "C1 — Permission levels": "C1",
  C2: "C2",
  "C2 — Vault level overrides": "C2",
  P1: "P1",
  "P1 — Pagination plugin": "P1",
  E1: "E1",
  "E1 — Dashboard HTTP router": "E1",
  "E2–E4": "E2-E4",
  "E2–E4 — Dashboard OAuth, Vault routes, tier mount": "E2-E4",
  E5: "E5",
  "E5 — File-based API routes (src/routes loader)": "E5",
  A1: "A1",
  "A1 — Redis cache driver": "A1",
  "A1-core: Redis cache driver coordination": "A1-core",
  "A1-core — Redis cache coordination": "A1-core",
  A2: "A2",
  "A2 — Redis cooldown store (core)": "A2",
  "A2: Redis cooldown extension": "A2-plugins",
  "A2-plugins — Redis cooldown extension": "A2-plugins",
  A3: "A3",
  "A3 — RabbitMQ worker bus": "A3",
  "A4-core — Influx telemetry spec": "A4-core",
  "A4-influx — metrics-influx plugin": "A4-influx",
  G1: "G1",
  "G1 — Auto resharding threshold": "G1",
  G2: "G2",
  "G2 — Gateway proxy": "G2",
  "G3-spike — Dispatch catalog & camelize": "G3-spike",
  "G3-p1 — Tier 1 gateway dispatches": "G3-p1",
  "G3-p2 — Tier 2 gateway dispatches": "G3-p2",
  "G3-p3 — Tier 3 gateway dispatches": "G3-p3",
  "G3-p4 — Tier 4 gateway dispatches": "G3-p4",
  "G3a — Typed GatewayEventMap": "G3a",
  "REST: fetchApplication + owner team": "REST-app",
  "1.5.0-adapters": "ADAPTERS-1.5",
  "1.5.0-adapters — Remove library adapters": "ADAPTERS-1.5",
  "Typing indicator": "TYPING",
  "Vault blueprint migrations": "VAULT-migrations",
  "Vault Discord field types": "VAULT-fields",
  "Vault array update ops": "VAULT-array",
  "Guild settings attach ergonomics": "VAULT-guild-attach",
  "Tier 2 doc expansion": "DOCS-tier2",
  "Sequence docs/examples": "DOCS-sequences",
  "vault-redis": "vault-redis",
  "vault-redis — Redis Vault driver": "vault-redis",
  i18n: "i18n",
  "i18n — @stambha/i18n": "i18n",
  "dev-reload": "dev-reload",
  "dev-reload — piece hot reload": "dev-reload",
  D1: "D1",
  "D1 — Native runSequence": "D1",
  D2: "D2",
  "D2 — Distributed Chron": "D2",
  "Reshard-aware routing barrier": "D3-reshard-barrier",
  "Vault + Sequences integration": "D3-vault-seq",
  "2.0 CommandOptions review": "D3-cmd-options",
  "Gateway proxy plugin": "G2-plugin",
  "Enterprise SSO for dashboard": "SSO",
  "Hosted dashboard UI": "HOSTED-UI",
  "EPIC-B — Pillar B: Command & gate DX": "EPIC-B",
  "EPIC-G — Pillar G: Gateway & dispatch": "EPIC-G",
  "EPIC-A — Pillar A: Distributed infrastructure": "EPIC-A",
  "EPIC-C — Pillar C: Permission levels": "EPIC-C",
  "EPIC-C — Pillar C: Staff authorization (authz)": "EPIC-C",
  "Numeric permission levels (@stambha/levels)": "WONT-levels",
  "WONT-levels": "WONT-levels",
  "EPIC-E — Pillar E: Dashboard HTTP API": "EPIC-E",
  "EPIC-D — Pillar D: Sequences & scale (2.0)": "EPIC-D",
  "EPIC-V — Vault evolution": "EPIC-V",
  "EPIC-DOCS — Public documentation": "EPIC-DOCS",
  "discord.js / Discordeno transport": "WONT-bridge-transport",
  "@stambha/bridge-* packages": "WONT-bridge-pkgs",
  "Hybrid gateway": "WONT-hybrid",
  "Sapphire plugin compatibility in core": "WONT-sapphire-plugins",
  "Vault as full ORM": "WONT-vault-orm",
  "Voice in core": "WONT-voice",
  "Require Redis/RabbitMQ for monolith": "WONT-require-redis",
  "Functional-only pieces": "WONT-functional-only",
  "Argument prompting": "WONT-prompting",
  "@stambha/plugins host in plugins repo": "WONT-plugins-host-move",
  "Meta-package bundling all extensions": "WONT-meta-pkg",
  "Official discord.js adapter": "WONT-discordjs-adapter",
};

/**
 * Resolve catalog ID from project item title/body (handles duplicate A4).
 */
export function resolveCardId(title, body = "") {
  const t = title.trim();
  if (TITLE_TO_ID[t]) return TITLE_TO_ID[t];
  if (t === "A4") {
    const b = body.toLowerCase();
    if (b.includes("influx") || b.includes("metrics-influx") || b.includes("plugins implementation")) {
      return "A4-influx";
    }
    return "A4-core";
  }
  if (t === "A2: Redis cooldown extension") return "A2-plugins";
  if (t.startsWith("1.5.0-adapters")) return "ADAPTERS-1.5";
  if (t.startsWith("DX-3")) return "DX-3";
  if (t.startsWith("DX-4")) return "DX-4";
  if (t.startsWith("F1")) return "F1";
  if (t.startsWith("TYPING") || t === "Typing indicator") return "TYPING";
  return null;
}

export function allCatalogCards() {
  return Object.entries(CARD_CATALOG).map(([id, card]) => ({ id, ...card }));
}
