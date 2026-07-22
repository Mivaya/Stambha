# @stambha/levels

Numeric **permission levels** (Klasa-style) for Stambha — Everyone → Moderator → Administrator → GuildOwner → BotOwner — plus `permissionLevelGate` for the command pipeline.

Part of the [**@stambha**](https://www.npmjs.com/org/stambha) monorepo · [GitHub](https://github.com/mivaya/Stambha)

---

## Install

```bash
npm install @stambha/levels @stambha/core
```

Requires **Node.js 20+**. Pair with `@stambha/gates` if you also use bitfield / NSFW / cooldown gates.

---

## Quick start

```ts
import { createStambhaBot } from "@stambha/core";
import {
  configurePermissionLevels,
  PermissionLevel,
  permissionLevelGate,
} from "@stambha/levels";

const client = createStambhaBot({ /* … */ });

configurePermissionLevels({
  botOwners: [process.env.BOT_OWNER_ID!],
  moderatorRoleIds: ["111"],
  administratorRoleIds: ["222"],
  // guildOwners: { [guildId]: ownerUserId }, // optional when meta.guildOwnerId unset
});

// On a command:
gates: [permissionLevelGate(PermissionLevel.Moderator)]
```

---

## Default ladder

| Name | Level | Typical grant |
|------|------:|---------------|
| `Everyone` | 0 | Default |
| `Moderator` | 4 | `moderatorRoleIds` or Kick/Ban/ManageMessages bits |
| `Administrator` | 6 | `administratorRoleIds` or Administrator/ManageGuild bits |
| `GuildOwner` | 9 | `meta.guildOwnerId` or `guildOwners` map |
| `BotOwner` | 10 | `botOwners` |

Resolution picks the **highest** applicable level. Optional `resolveOverride` hooks Vault/C2 later.

Slash interactions populate `meta.memberPermissions` and `meta.memberRoleIds` via `@stambha/transform`. Prefix commands need the same meta from your worker (or rely on botOwners / overrides).

---

## Migration from role-only / bitfield gates

| Before (`@stambha/gates`) | After (`@stambha/levels`) |
|---------------------------|---------------------------|
| `userPermissionsGate(Permission.KickMembers)` | `permissionLevelGate(PermissionLevel.Moderator)` + mod roles / bit fallback |
| Custom `defineGate` checking role ids | `moderatorRoleIds` / `roleLevels` in `configurePermissionLevels` |
| Hardcoded owner id checks | `botOwners: [...]` |

Keep bitfield gates when you need a **specific** Discord permission (e.g. Manage Channels). Use levels for **staff hierarchy** shared across many commands.

---

## Key exports

| Export | Purpose |
|--------|---------|
| `PermissionLevel` | Default ladder constants |
| `DEFAULT_PERMISSION_LEVEL_LADDER` | Labeled ladder for docs/UI |
| `configurePermissionLevels` | Process-wide config |
| `resolvePermissionLevel` | Resolve level for a context |
| `permissionLevelGate` | Pipeline gate (`level >= min`) |

---

## Development

```bash
pnpm --filter @stambha/levels build
pnpm --filter @stambha/levels test
```
