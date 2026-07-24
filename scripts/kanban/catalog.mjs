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
    status: "Backlog",
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
    status: "Backlog",
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
    status: "Backlog",
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
    status: "Backlog",
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
    status: "Backlog",
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
    status: "Backlog",
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
    status: "In Progress",
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
    status: "In Progress",
    track: "stambha",
    type: "Feature",
    pillar: "B",
    release: "1.3",
    lane: "Standard",
    priority: "high",
    body: ticketBody({
      userStory: "As a plugin author, I want to extend StambhaClientOptions and global container options via TypeScript declaration merging.",
      summary: "Ensure types are exported and structured to support module augmentation for client options & container.",
      acceptance: [
        "TypeScript declarations compile correctly",
        "Example of declaration merging in tests or docs",
      ],
      meta: { ID: "B9", Pillar: "B", Release: "1.3", Epic: "EPIC-B" },
    }),
  },


  C1: {
    title: "C1 — Permission levels",
    status: "Backlog",
    track: "stambha",
    type: "Feature",
    pillar: "C",
    release: "1.3",
    body: ticketBody({
      userStory: "As a bot operator, I want numeric permission levels (Everyone → Mod → Admin) without discord.js.",
      summary: "`@stambha/levels` + permissionLevelGate — Klasa-style governance. Target **1.3.0** (out of 1.2.0; pick B1 or C1 with G3-p2).",
      acceptance: [
        "Default level ladder exported",
        "permissionLevelGate integrates with pipeline",
        "Document migration from role-only gates",
      ],
      meta: { ID: "C1", Pillar: "C", Release: "1.3", Epic: "EPIC-C", Branch: "feature/permission-levels" },
      references: ["docs/guide/known-gaps.md — C1"],
    }),
  },

  C2: {
    title: "C2 — Vault level overrides",
    status: "Backlog",
    track: "stambha",
    type: "Feature",
    pillar: "C",
    release: "1.x",
    body: ticketBody({
      summary: "Guild member level ledger in Vault + admin commands for overrides.",
      acceptance: [
        "Vault schema for per-member level overrides",
        "Admin commands or API to set levels",
        "Integrates with C1 permissionLevelGate",
      ],
      meta: { ID: "C2", Pillar: "C", Epic: "EPIC-C", Branch: "feature/levels-vault" },
      dependencies: "C1",
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
    release: "1.x",
    lane: "Standard",
    priority: "medium",
    body: ticketBody({
      userStory: "As a split-tier bot operator, I want shared cache across gateway/bot workers.",
      summary: "`@stambha/cache-redis` implementing core Cache interface.",
      acceptance: [
        "Redis driver passes Cache interface tests",
        "Document wiring in tier-split deployment",
        "Monolith bots keep memory default",
      ],
      meta: { ID: "A1", Pillar: "A", Epic: "EPIC-A", Track: "stambha-plugins" },
      dependencies: "A1-core coordination",
    }),
  },

  "A1-core": {
    title: "A1-core — Redis cache coordination",
    status: "Backlog",
    track: "stambha",
    type: "Task",
    pillar: "A",
    release: "1.x",
    body: ticketBody({
      summary: "Core-side hooks/docs for plugging Redis cache driver (A1) into gateway and workers.",
      acceptance: [
        "Cache injection points documented",
        "examples or tier-split guide updated",
        "No mandatory Redis for monolith",
      ],
      meta: { ID: "A1-core", Pillar: "A", Epic: "EPIC-A" },
      dependencies: "A1 plugin driver",
    }),
  },

  A2: {
    title: "A2 — Redis cooldown store (core)",
    status: "Backlog",
    track: "stambha",
    type: "Feature",
    pillar: "A",
    release: "1.x",
    body: ticketBody({
      summary: "Shared CooldownStore interface in core; memory default; Redis driver in plugins.",
      acceptance: [
        "CooldownStore interface exported from @stambha/gates or core",
        "gates work with injected store",
        "Split-tier doc updated",
      ],
      meta: { ID: "A2", Pillar: "A", Epic: "EPIC-A" },
      dependencies: "A2-plugins driver",
    }),
  },

  "A2-plugins": {
    title: "A2-plugins — Redis cooldown extension",
    status: "Backlog",
    track: "stambha-plugins",
    type: "Feature",
    pillar: "A",
    release: "1.x",
    body: ticketBody({
      summary: "Redis-backed cooldown store extension for @stambha/gates in Stambha-plugins.",
      acceptance: [
        "Implements CooldownStore from core",
        "Integration test or example",
        "Published to npm",
      ],
      meta: { ID: "A2-plugins", Pillar: "A", Epic: "EPIC-A", Track: "stambha-plugins" },
      dependencies: "A2 core interface",
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
    status: "Backlog",
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
    status: "Backlog",
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
    status: "Backlog",
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
    status: "Backlog",
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
    status: "Backlog",
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
    status: "Backlog",
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
    status: "Backlog",
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
    status: "Backlog",
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
    status: "Backlog",
    track: "stambha",
    type: "Task",
    pillar: "Docs",
    release: "1.x",
    body: ticketBody({
      summary: "Close Tier 2 public docs gaps listed on known-gaps page.",
      acceptance: [
        "Each Tier 2 topic has guide or explicit deferral",
        "Sidebar links valid",
      ],
      meta: { ID: "DOCS-tier2", Pillar: "Docs", Epic: "EPIC-DOCS" },
      references: ["docs/guide/known-gaps.md — Documentation gaps"],
    }),
  },

  "DOCS-sequences": {
    title: "Sequence docs/examples",
    status: "Backlog",
    track: "stambha",
    type: "Task",
    pillar: "Docs",
    release: "1.x",
    body: ticketBody({
      summary: "Better public docs and examples/bot samples for manual sequence() + Signal wiring.",
      acceptance: [
        "features/sequences.md expanded with end-to-end example",
        "examples/bot demonstrates multi-step flow",
      ],
      meta: { ID: "DOCS-sequences", Pillar: "Docs", Epic: "EPIC-DOCS" },
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
    status: "Icebox",
    track: "stambha",
    type: "Feature",
    pillar: "D",
    release: "2.0",
    body: ticketBody({
      userStory: "As a bot author, I want multi-step UI flows without manual Signal wiring (discord.js collectors parity).",
      summary: "Native runSequence orchestration — 2.0 D1.",
      acceptance: [
        "runSequence API design approved",
        "Implements message/reaction/interaction collectors on normalized G3 events",
        "Honest scope vs Sequences store",
      ],
      meta: { ID: "D1", Pillar: "D", Release: "2.0", Epic: "EPIC-D" },
      dependencies: "G3-p1+",
      references: ["docs/guide/known-gaps.md — D1"],
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
        { id: "B1", title: "Declarative gates", shipped: false },
        { id: "B2", title: "Bridge args, flags, entity resolvers", shipped: false },
        { id: "B3", title: "Help system", shipped: false },
        { id: "B4", title: "Piece lifecycle + error hooks", shipped: false },
        { id: "B5", title: "Component builder + persistent signals", shipped: false },
        { id: "B6", title: "Prefix edit-tracking", shipped: false },
        { id: "B8", title: "Native registerPlugin & onShutdown", shipped: false },
        { id: "B9", title: "TypeScript interface augmentation", shipped: false },
        { id: "TYPING", title: "Typing indicator", shipped: false },
        { id: "P1", title: "Pagination plugin (@stambha/pagination)", shipped: true },
      ],
      successCriteria: [
        "B1 or next scheduled B-pillar feature ships in a tagged core release",
        "Each child has acceptance criteria in catalog + known-gaps cross-link",
        "No discord.js in core hot path",
      ],
      meta: { ID: "EPIC-B", Pillar: "B", Release: "1.x" },
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
        { id: "G3-p2", title: "Tier 2 gateway dispatches", shipped: false },
        { id: "G3-p3", title: "Tier 3 gateway dispatches", shipped: false },
        { id: "G3-p4", title: "Tier 4 gateway dispatches", shipped: false },
        { id: "G3a", title: "Typed GatewayEventMap", shipped: false },
        { id: "G1", title: "Auto resharding threshold", shipped: false },
        { id: "G2", title: "Gateway proxy (2.0)", shipped: false },
        { id: "REST-app", title: "fetchApplication + owner team", shipped: false },
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
    title: "EPIC-C — Pillar C: Permission levels",
    status: "Backlog",
    track: "stambha",
    type: "Epic",
    pillar: "C",
    release: "1.x",
    body: epicBody({
      vision: "Numeric permission levels without discord.js.",
      childFeatures: ["C1", "C2"],
      meta: { ID: "EPIC-C", Pillar: "C" },
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
    title: "EPIC-D — Pillar D: Sequences & scale (2.0)",
    status: "Icebox",
    track: "stambha",
    type: "Epic",
    pillar: "D",
    release: "2.0",
    body: epicBody({
      vision: "Stambha originals at multi-worker scale.",
      childFeatures: ["D1", "D2", "D3-vault-seq", "D3-reshard-barrier"],
      meta: { ID: "EPIC-D", Pillar: "D", Release: "2.0" },
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
      childFeatures: ["DOCS-tier2", "DOCS-sequences", "G3 migration guides"],
      meta: { ID: "EPIC-DOCS", Pillar: "Docs" },
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
  return null;
}

export function allCatalogCards() {
  return Object.entries(CARD_CATALOG).map(([id, card]) => ({ id, ...card }));
}
