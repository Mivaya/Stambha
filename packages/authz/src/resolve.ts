import type { CommandContext } from "@stambha/core";
import type {
  AuthzConfig,
  CapabilityDecision,
  CapabilityId,
  CapabilityPolicy,
} from "./types.js";

const Administrator = 1n << 3n;

let globalConfig: AuthzConfig = {};

/** Merge into the process-wide authz config used by {@link hasCapability}. */
export function configureAuthz(config: AuthzConfig): void {
  globalConfig = {
    ...globalConfig,
    ...config,
    capabilities: {
      ...globalConfig.capabilities,
      ...config.capabilities,
    },
    roleCapabilities: {
      ...globalConfig.roleCapabilities,
      ...config.roleCapabilities,
    },
  };
}

/** Replace the process-wide config (tests / full reset). */
export function resetAuthz(config: AuthzConfig = {}): void {
  globalConfig = { ...config };
}

export function getAuthzConfig(): AuthzConfig {
  return globalConfig;
}

/** Register or replace a single capability policy. */
export function defineCapability(
  id: CapabilityId,
  policy: Omit<CapabilityPolicy, "id">,
): CapabilityPolicy {
  const full: CapabilityPolicy = { ...policy, id };
  configureAuthz({ capabilities: { [id]: full } });
  return full;
}

function combineNeed(
  need: bigint | readonly bigint[] | undefined,
): bigint {
  if (need === undefined) return 0n;
  if (typeof need === "bigint") return need;
  let out = 0n;
  for (const bit of need) out |= bit;
  return out;
}

function hasDiscordPermissions(have: bigint | undefined, need: bigint): boolean {
  if (need === 0n) return true;
  if (have === undefined) return false;
  if ((have & Administrator) === Administrator) return true;
  return (have & need) === need;
}

function isGuildOwner(ctx: CommandContext, config: AuthzConfig): boolean {
  const guildOwnerId =
    ctx.meta?.guildOwnerId ?? (ctx.guildId ? config.guildOwners?.[ctx.guildId] : undefined);
  return Boolean(guildOwnerId && guildOwnerId === ctx.userId);
}

function rolesGrantCapability(
  roleIds: readonly string[],
  capabilityId: CapabilityId,
  policy: CapabilityPolicy,
  config: AuthzConfig,
): boolean {
  if (policy.roleIds?.some((id) => roleIds.includes(id))) return true;
  const map = config.roleCapabilities;
  if (!map) return false;
  for (const roleId of roleIds) {
    const caps = map[roleId];
    if (caps?.includes(capabilityId)) return true;
  }
  return false;
}

/**
 * Resolve whether `ctx` may use `capabilityId`.
 *
 * Order (fail closed):
 * 1. Unknown capability → deny
 * 2. Bot owner → allow
 * 3. Discord permission floor → deny if missing
 * 4. Vault/custom claim deny → deny; grant → allow
 * 5. Guild owner (when `allowGuildOwner`) → allow
 * 6. Role grants → allow
 * 7. Else deny
 */
export async function resolveCapability(
  ctx: CommandContext,
  capabilityId: CapabilityId,
  config: AuthzConfig = globalConfig,
): Promise<CapabilityDecision> {
  const policy = config.capabilities?.[capabilityId];
  if (!policy) {
    return { allow: false, reason: "unknown_capability" };
  }

  if (config.botOwners?.includes(ctx.userId)) {
    return { allow: true, reason: "bot_owner" };
  }

  const need = combineNeed(policy.discordPermissions);
  if (!hasDiscordPermissions(ctx.meta?.memberPermissions, need)) {
    return { allow: false, reason: "missing_discord_permissions" };
  }

  if (config.resolveClaim) {
    const claim = await config.resolveClaim(ctx, capabilityId);
    if (claim === "deny") return { allow: false, reason: "vault_deny" };
    if (claim === "grant") return { allow: true, reason: "vault_grant" };
  }

  if (policy.allowGuildOwner && isGuildOwner(ctx, config)) {
    return { allow: true, reason: "guild_owner" };
  }

  const roleIds = ctx.meta?.memberRoleIds ?? [];
  if (rolesGrantCapability(roleIds, capabilityId, policy, config)) {
    return { allow: true, reason: "role" };
  }

  return { allow: false, reason: "denied" };
}

/** Convenience boolean wrapper around {@link resolveCapability}. */
export async function hasCapability(
  ctx: CommandContext,
  capabilityId: CapabilityId,
  config?: AuthzConfig,
): Promise<boolean> {
  const decision = await resolveCapability(ctx, capabilityId, config);
  return decision.allow;
}
