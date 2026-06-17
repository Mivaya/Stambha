# Migration shims — deprecated app-layer patterns

> **Policy (ADR 005):** Official Stambha migrations are **native-only** (`@stambha/rest`, `@stambha/gateway`, `@stambha/transform`). Patterns below are **historical** — so maintainers recognize them in early adopters and know what to delete.

When migrating a production bot to Stambha, adopters sometimes added `lib/stambha/` or similar. This doc maps those patterns to framework gaps and **native replacements**.

**Last updated:** 2026-06-16 (post **0.3.4** / **0.3.5**)

---

## Shim → framework mapping

| App-layer pattern | What it compensated for | Native replacement | Status |
|-------------------|-------------------------|-------------------|--------|
| **`lib/core/reply.ts`** (embeds, deferred edit) | Text-only `ctx.reply` | `ReplyPayload` + `editReply` (**0.3.4 R1–R2**) | ✅ Delete after 0.3.4 |
| **`lib/rest/api.ts`** (`fetchUser`, guild, messages) | No REST helpers | `@stambha/rest` resources (**0.3.4 R3**) | ✅ Delete after 0.3.4 |
| **Bootstrap `setup.ts`** | Orchestrates bot, loader, hub, deploy | `examples/bot` native bootstrap (**0.3.0 N2**) | ✅ Use reference |
| **Custom `attach*Client`** | Dynamic prefix; legacy run methods | `resolvePrefix` (**0.2.2 P2**); `execute(ctx)` | ✅ |
| **`wire*ToHub` / discord.js gateway** | Events → hub | `createNativeGatewayClient` (**0.3.0 N1**) | ✅ Cancelled hybrid |
| **Service locator `container`** | Sapphire `container` | `client.container.binder` + plugins (**0.3.3 N3**) | ✅ |
| **Manual interaction routing** | Signals/autocomplete not on attach | **0.3.5 I3–I4** | ✅ Delete after 0.3.5 |
| **Manual `meta` / permission fetch** | Gates need `ctx.meta` on native | **0.3.5 I2** | ✅ Delete after 0.3.5 |
| **`LegacyArgs`** | Sapphire `Args.pick` for `messageRun` | `Args.fromContext` + **1.x B2** | Migrate to `execute(ctx)` |
| **`LegacySlashRegistry`** | `SlashCommandBuilder` + custom deploy | `deployCommands` + Stambha `Command` metadata | **1.x B1** optional |
| **`fetchGuildPrefix` helper** | Per-guild prefix from DB | `resolvePrefix`; **1.x C2** Vault prefix | ✅ resolver |
| **Gate `appliesTo(command)` filter** | Global gates on every command | `gateNames` on `Command` (**0.2.2 P1**) | ✅ |
| **Hook base with `container` getter** | Hooks only receive `registry` | `Hook.create(ctx)` (**0.3.3 N3**) | ✅ |
| **`RouteStub` + unwired `routes/`** | `@sapphire/plugin-api` | **Plugins E** — `@stambha/dashboard` | Planned |
| **Prisma for all data, no Vault** | Guild config in SQL | **1.x C2** Vault for settings ([ADR 004](./adr/004-vault-scope-orm-coexistence.md)) | Keep Prisma for domain |
| **`messageRun` / `chatInputRun` bases** | Legacy run methods | `execute(ctx)` | No `preserveRaw` |
| **Weak `HotLoader`** | Sapphire store reload | **Plugins** `@stambha/dev-reload` | Planned |

---

## Historical hybrid bootstrap (do not use)

**Not supported** per ADR 005:

```text
1. createStambhaBot({ restPort, prefix })
2. loadPieces(client, { context: { prisma, … } })
3. createGatewayEventHub()
4. attach*Client(hub, client, { preserveRaw: true })   // cancelled
5. wire discord.js Client → hub
6. discord.login()
```

**Native flow:** `createStambhaBot` → `loadPieces` → `GatewayEventHub` + native WS (or tier split) → `attachStambhaClient` → gateway `connect` / `client.start()` → `deployCommands`. See [from-sapphire.md](../migration/from-sapphire.md).

---

## Checklist for deleting app shims

### After 0.2.2 ✅

- [x] Remove gate `appliesTo` filter; use `gateNames`
- [x] Replace custom prefix logic with `resolvePrefix`
- [x] Loader loads gates before commands

### After 0.3.x ✅

- [x] Remove discord.js gateway wiring
- [x] Align bootstrap with `examples/bot`
- [x] Move `client.on('command*')` to epilogues

### After 0.3.4 ✅

- [ ] Remove `lib/core/reply.ts` — use `ctx.reply({ embeds })` and `ctx.editReply`
- [ ] Remove `lib/rest/api.ts` — use `@stambha/rest` resource helpers

### After 0.3.5 ✅

- [ ] Remove manual `interactionCreate` handlers for signals/autocomplete
- [ ] Remove manual permission/meta fetching before gates (use `ctx.meta`)
- [ ] Remove manual slash option parsing from `ctx.raw`

### After 1.x (B1, B2, C1)

- [ ] Remove `LegacyArgs`; migrate to `execute(ctx)` + B2 resolvers if needed
- [ ] Remove `LegacySlashRegistry` if still present
- [ ] Replace custom permission level gate with `@stambha/levels`

### After `@stambha/dashboard`

- [ ] Delete `RouteStub`; wire routes through dashboard plugin

---

## Related

- [release-plan.md](./release-plan.md) — 0.3.5 ticket IDs
- [ecosystem-survey.md](./ecosystem-survey.md) — 1.x feature ideas from other frameworks
- [future-v2.md](./future-v2.md) — 1.x / 2.0 pipeline
- [../migration/from-sapphire.md](../migration/from-sapphire.md) — public native migration guide
