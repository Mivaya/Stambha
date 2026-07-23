# @stambha/authz

Named **capabilities** for Stambha — `mod.purge`, `economy.admin` — composed from a Discord permission floor, role grants, and optional Vault claims. Fail closed; re-checked on every invoke.

Part of the [**@stambha**](https://www.npmjs.com/org/stambha) monorepo · [GitHub](https://github.com/mivaya/Stambha)

---

## Install

```bash
npm install @stambha/authz @stambha/core
```

Optional Vault peer for per-member grants/denies: `@stambha/vault`.

Requires **Node.js 20+**.

---

## Quick start

```ts
import { capabilityGate, configureAuthz, defineCapability } from "@stambha/authz";

defineCapability("mod.purge", {
  discordPermissions: 1n << 13n, // ManageMessages
  roleIds: [process.env.MOD_ROLE_ID!],
  allowGuildOwner: true,
});

configureAuthz({
  botOwners: [process.env.BOT_OWNER_ID!],
});

// On a Command:
gates: [capabilityGate("mod.purge")]
```

### Evaluation order

1. Unknown capability → **deny**
2. Bot owner → **allow**
3. Discord permission floor → **deny** if missing
4. Vault/custom claim → **deny** / **grant** / continue
5. Guild owner (when `allowGuildOwner`) → **allow**
6. Role grants → **allow**
7. Else → **deny**

---

## Vault claims

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
  authz: {
    botOwners: [process.env.BOT_OWNER_ID!],
    capabilities: {
      "mod.purge": {
        id: "mod.purge",
        discordPermissions: 1n << 13n,
      },
    },
  },
});
```

Helpers: `grantMemberCapability` / `denyMemberCapability` / `clearMemberCapability` / `getMemberCapabilityClaims`.

---

## Key exports

| Export | Purpose |
|--------|---------|
| `defineCapability` / `configureAuthz` | Register policies |
| `capabilityGate` | Pipeline gate |
| `hasCapability` / `resolveCapability` | Programmatic checks |
| `capabilityClaimsField` | Guild blueprint field |
| `attachVaultCapabilityClaims` | Wire Vault into authz |

---

## Related

- [`@stambha/gates`](../gates) — Discord bitfield gates, cooldown, NSFW
- [Capabilities guide](https://github.com/mivaya/Stambha/blob/main/docs/features/capabilities.md)
