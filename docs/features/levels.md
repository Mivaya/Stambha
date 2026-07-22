# Permission levels (`@stambha/levels`)

Numeric staff hierarchy (Klasa-style) without discord.js — Everyone → Moderator → Administrator → GuildOwner → BotOwner.

## Installation

```bash
pnpm add @stambha/levels
```

## Configure once at bootstrap

```ts
import { configurePermissionLevels, PermissionLevel } from "@stambha/levels";

configurePermissionLevels({
  botOwners: [process.env.BOT_OWNER_ID!],
  moderatorRoleIds: ["ROLE_MOD"],
  administratorRoleIds: ["ROLE_ADMIN"],
});
```

## Gate a command

```ts
import { Command, ok, type Registry } from "@stambha/core";
import { PermissionLevel, permissionLevelGate } from "@stambha/levels";

export class PurgeCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "purge",
      kinds: ["slash", "prefix"],
      gates: [permissionLevelGate(PermissionLevel.Moderator)],
    });
  }

  async execute(ctx) {
    await ctx.reply("Purged (demo).");
    return ok(undefined);
  }
}
```

The gate runs in the normal pipeline (`commandGatesForRun`) — same deny path as `@stambha/gates` (`commandDenied`, `attachGateDeniedReply`).

## Default ladder

| Constant | Level |
|----------|------:|
| `PermissionLevel.Everyone` | 0 |
| `PermissionLevel.Moderator` | 4 |
| `PermissionLevel.Administrator` | 6 |
| `PermissionLevel.GuildOwner` | 9 |
| `PermissionLevel.BotOwner` | 10 |

See [package README](https://github.com/Mivaya/Stambha/tree/main/packages/levels) for role maps, bitfield fallback, and `resolveOverride` (C2 / Vault).

## Vault overrides (C2)

Store per-member levels on the guild blueprint and wire them into the gate:

```ts
import { defineBlueprint, field } from "@stambha/vault";
import {
  attachVaultLevelOverrides,
  permissionLevelsField,
} from "@stambha/levels";

export const GuildBlueprint = defineBlueprint({
  prefix: field.string().default("!").build(),
  permissionLevels: permissionLevelsField(),
});

attachVaultLevelOverrides(vault, {
  levels: { botOwners: [process.env.BOT_OWNER_ID!] },
});
```

Helpers: `setMemberPermissionLevel` / `clearMemberPermissionLevel` / `getMemberPermissionLevel`.
Example bot: `!setlevel` (Administrator+).

## Meta requirements

| Field | Source |
|-------|--------|
| `meta.memberRoleIds` | Slash: interaction `member.roles` (`@stambha/transform`) |
| `meta.memberPermissions` | Slash: member permission bitfield |
| `meta.guildOwnerId` | Optional enrichment — or `guildOwners` in config |
| `botOwners` | Always from `configurePermissionLevels` |

Prefix commands: enrich `CommandContext.meta` in your gateway worker, or use botOwners / Vault overrides only.

## Migrating from role-only gates

Prefer levels when many commands share the same staff bar. Keep `userPermissionsGate(Permission.…)` when a command needs a **specific** Discord permission (Manage Channels, etc.).

| Role-only / bits | Levels |
|------------------|--------|
| `userPermissionsGate(Permission.KickMembers)` | `permissionLevelGate(PermissionLevel.Moderator)` |
| Manual role-id `defineGate` | `moderatorRoleIds` / `roleLevels` |

## See also

- [Gates](/features/gates) — bitfields, cooldown, NSFW, RunIn
- [Vault](/features/vault) — C2 guild `permissionLevels` field + `attachVaultLevelOverrides`
- [Known gaps](/guide/known-gaps) — C1 / C2
