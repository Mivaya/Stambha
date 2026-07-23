import { defineGate, type GateLike } from "@stambha/core";
import { getAuthzConfig, resolveCapability } from "./resolve.js";
import type { AuthzConfig, CapabilityId } from "./types.js";

export interface CapabilityGateOptions {
  /** Deny reason shown via `attachGateDeniedReply` / epilogues. */
  message?: string;
  /** Per-gate config override (else process-wide {@link configureAuthz}). */
  config?: AuthzConfig;
}

/**
 * Require a named capability for the invoker.
 *
 * @example
 * ```ts
 * import { capabilityGate, defineCapability } from "@stambha/authz";
 *
 * defineCapability("mod.purge", {
 *   discordPermissions: 1n << 13n, // ManageMessages
 *   roleIds: ["ROLE_MOD"],
 * });
 *
 * gates: [capabilityGate("mod.purge")]
 * ```
 */
export function capabilityGate(
  capabilityId: CapabilityId,
  options: CapabilityGateOptions = {},
): GateLike {
  return defineGate(`capability:${capabilityId}`, async (ctx) => {
    const config = options.config ?? getAuthzConfig();
    const decision = await resolveCapability(ctx, capabilityId, config);
    if (decision.allow) return { allow: true };
    return {
      allow: false,
      reason:
        options.message ??
        (decision.reason === "unknown_capability"
          ? `Unknown capability \`${capabilityId}\`.`
          : decision.reason === "missing_discord_permissions"
            ? `Missing Discord permissions for \`${capabilityId}\`.`
            : `You need the \`${capabilityId}\` capability.`),
    };
  });
}
