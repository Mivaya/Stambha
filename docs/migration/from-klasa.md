# Migrating from Klasa

[Klasa](https://klasa.js.org/) used a piece-based layout with **stores**, **permission levels**, and **flag arguments**. Stambha maps most concepts to gates, Vault, and `@stambha/args` — without a built-in hot-reload store.

## Quick mapping

| Klasa | Stambha | Notes |
|-------|---------|-------|
| `Client` | `createStambhaBot()` | Native stack — [getting started](/guide/getting-started) |
| `commands/` | `src/commands/` | `Command` pieces |
| `events/` | `src/listeners/` | `Hook` pieces |
| `preconditions/` | `src/gates/` | Inline `gates: [...]` or gate pieces + `gateNames` |
| `PermissionLevels` | `@stambha/gates` + roles | Numeric levels → **1.x C1** `@stambha/levels` |
| `Flag` / `FlagSeries` | Partial lexer | **1.x B2** — prefix flags not fully ported |
| `Settings` / JSON providers | `@stambha/vault` | Blueprint + driver |
| `Monitor` / hot reload | Not in core | **Plugins** `@stambha/dev-reload` (planned) |
| `Language` / i18n | Not in core | **Plugins** `@stambha/i18n` (planned) |

Folder alias: `PiecePaths.preconditions` → `src/gates`.

---

## Preconditions → gates

**Klasa:**

```ts
// preconditions/GuildOnly.ts
```

**Stambha:**

```ts
import { guildOnlyGate, userPermissionsGate, Permission } from "@stambha/gates";

gates: [guildOnlyGate(), userPermissionsGate(Permission.ManageGuild)],
```

Or register reusable gate pieces in `src/gates/` and reference `gateNames` on commands. See [Gates](/features/gates).

---

## Permission levels

Klasa's numeric levels (everyone → owner) are **not** bundled in 1.0.0. Options today:

1. **`userPermissionsGate(Permission.*)`** — Discord permission flags on native `ctx.meta` (0.3.5+)
2. **Role checks** — custom `defineGate` reading `ctx.meta` / your ORM
3. **1.x** — `@stambha/levels` + Vault guild overrides ([Known gaps](/guide/known-gaps) **C1**)

---

## Settings → Vault

Klasa `Settings` maps cleanly to Vault blueprints for guild/user/member config:

```ts
vault.registerLedger("guild", { blueprint: GuildBlueprint });
const record = vault.ledger("guild").acquire(guildId);
await record.sync();
const prefix = record.get("prefix");
```

Keep economy and domain tables in your ORM — see [Vault](/features/vault).

---

## Hot reload

Klasa could reload command/event stores at runtime. Stambha expects **process restart** or a dev plugin:

- Production: redeploy bot worker
- Development: **`@stambha/dev-reload`** (Stambha-plugins, planned)

---

## Native transport

Klasa bots typically ran on discord.js. Stambha's supported path is **native** (`@stambha/gateway`, `@stambha/rest`) — no hybrid discord.js gateway. See [From Sapphire](/migration/from-sapphire) for a similar bootstrap walkthrough.

---

## Related

- [From Sapphire](/migration/from-sapphire)
- [From Discordeno](/migration/from-discordeno)
- [Known gaps](/guide/known-gaps) — B2 flags, C1 levels, dev-reload
