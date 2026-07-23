import type { CommandContext } from "@stambha/core";

/** Capability id — prefer dotted names (`mod.purge`, `economy.admin`). */
export type CapabilityId = string;

/** Vault / custom claim: deny wins; grant allows after the Discord floor. */
export type CapabilityClaim = "grant" | "deny";

/**
 * Policy for one named capability.
 * Evaluation is fail-closed: unknown ids deny; missing grants deny.
 */
export interface CapabilityPolicy {
  id: CapabilityId;
  description?: string;
  /**
   * Discord permission bits the member must hold (Administrator satisfies any).
   * Always checked before role/Vault grants (except bot owners).
   */
  discordPermissions?: bigint | readonly bigint[];
  /** Role ids that grant this capability (after Discord floor). */
  roleIds?: readonly string[];
  /** When true, the Discord guild owner is granted this capability (after floor). */
  allowGuildOwner?: boolean;
}

export interface AuthzConfig {
  /** User ids that pass every capability check (skip Discord floor). */
  botOwners?: readonly string[];
  /**
   * Guild id → owner user id when `meta.guildOwnerId` is unset.
   * Interactions do not include the guild owner — populate this or enrich meta.
   */
  guildOwners?: Readonly<Record<string, string>>;
  /** Registered capability policies (required for `capabilityGate` / `hasCapability`). */
  capabilities?: Readonly<Record<string, CapabilityPolicy>>;
  /** Role id → capability ids granted by that role. */
  roleCapabilities?: Readonly<Record<string, readonly string[]>>;
  /**
   * Optional per-member claims (Vault). Checked after the Discord floor.
   * `deny` blocks; `grant` allows; `null` continues to role checks.
   */
  resolveClaim?: (
    ctx: CommandContext,
    capabilityId: CapabilityId,
  ) =>
    | CapabilityClaim
    | null
    | undefined
    | Promise<CapabilityClaim | null | undefined>;
}

export type CapabilityDecisionReason =
  | "unknown_capability"
  | "bot_owner"
  | "missing_discord_permissions"
  | "vault_deny"
  | "vault_grant"
  | "guild_owner"
  | "role"
  | "denied";

export interface CapabilityDecision {
  allow: boolean;
  reason: CapabilityDecisionReason;
}
