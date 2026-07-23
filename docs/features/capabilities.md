# Capabilities (`@stambha/authz`)

Named capabilities (`mod.purge`, `economy.admin`) instead of a numeric staff ladder. Each check uses a **Discord permission floor**, then role / Vault grants, and **fails closed**.

## Installation

```bash
pnpm add @stambha/authz
```

## Define policies once at bootstrap

```ts
import { configureAuthz, defineCapability } from "@stambha/authz";

defineCapability("mod.purge", {
  discordPermissions: 1n << 13n, // ManageMessages
  roleIds: ["ROLE_MOD"],
  allowGuildOwner: true,
});

defineCapability("admin.config", {
  discordPermissions: 1n << 5n, // ManageGuild
  roleIds: ["ROLE_ADMIN"],
  allowGuildOwner: true,
});

configureAuthz({
  botOwners: [process.env.BOT_OWNER_ID!],
  // Optional: role id → capability ids
  // roleCapabilities: { ROLE_ECON: ["economy.admin"] },
});
```

## Gate a command

```ts
import { Command, ok, type Registry } from "@stambha/core";
import { capabilityGate } from "@stambha/authz";

export class PurgeCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "purge",
      kinds: ["slash", "prefix"],
      gates: [capabilityGate("mod.purge")],
    });
  }

  async execute(ctx) {
    await ctx.reply("Purged (demo).");
    return ok(undefined);
  }
}
```

The gate runs in the normal pipeline (`commandGatesForRun`) — same deny path as `@stambha/gates` (`commandDenied`, `attachGateDeniedReply`).

## Evaluation order

| Step | Result |
|------|--------|
| Capability not registered | **Deny** |
| Bot owner | **Allow** (skips Discord floor) |
| Missing Discord permission bits | **Deny** |
| Vault/custom `deny` claim | **Deny** |
| Vault/custom `grant` claim | **Allow** |
| Guild owner + `allowGuildOwner` | **Allow** |
| Matching role grant | **Allow** |
| Otherwise | **Deny** |

Use `hasCapability(ctx, id)` / `resolveCapability(ctx, id)` for programmatic checks (same rules).

## Vault claims

Store per-member grants and denies on the guild blueprint:

```ts
import { defineBlueprint, field } from "@stambha/vault";
import {
  attachVaultCapabilityClaims,
  capabilityClaimsField,
} from "@stambha/authz";

export const GuildBlueprint = defineBlueprint({
  prefix: field.string().default("!").build(),
  capabilityClaims: capabilityClaimsField(),
});

attachVaultCapabilityClaims(vault, {
  authz: { botOwners: [process.env.BOT_OWNER_ID!] },
});
```

Helpers: `grantMemberCapability` / `denyMemberCapability` / `clearMemberCapability` / `getMemberCapabilityClaims`.  
Example bot: `!setcap` (requires `admin.config`).

## Meta requirements

| Field | Source |
|-------|--------|
| `meta.memberPermissions` | Slash: member permission bitfield (Discord floor) |
| `meta.memberRoleIds` | Slash: interaction `member.roles` |
| `meta.guildOwnerId` | Optional enrichment — or `guildOwners` in config |
| `botOwners` | Always from `configureAuthz` |

Prefix commands: enrich `CommandContext.meta` in your gateway worker, or rely on botOwners / Vault grants only.

## With bitfield gates

Prefer capabilities when many commands share the same staff policy. Keep `userPermissionsGate(Permission.…)` when a command needs a **one-off** Discord permission without a named capability.

| Need | Use |
|------|-----|
| Named staff action (`mod.purge`) | `capabilityGate("mod.purge")` |
| Exact Discord bit only | `userPermissionsGate(Permission.ManageChannels)` |

## See also

- [Gates](/features/gates) — bitfields, cooldown, NSFW, RunIn
- [Vault](/features/vault) — guild `capabilityClaims` + `attachVaultCapabilityClaims`
- [Known gaps](/guide/known-gaps) — authorization
