import { defineGate, type GateLike } from "@stambha/core";
import {
  getPermissionLevelsConfig,
  type LevelsConfig,
  resolvePermissionLevel,
} from "./resolve.js";

export interface PermissionLevelGateOptions {
  /** Deny reason shown via `attachGateDeniedReply` / epilogues. */
  message?: string;
  /** Per-gate config override (else process-wide {@link configurePermissionLevels}). */
  config?: LevelsConfig;
}

/**
 * Require the invoker’s resolved permission level to be `>= minLevel`.
 *
 * @example
 * ```ts
 * import { PermissionLevel, permissionLevelGate } from "@stambha/levels";
 *
 * gates: [permissionLevelGate(PermissionLevel.Moderator)]
 * ```
 */
export function permissionLevelGate(
  minLevel: number,
  options: PermissionLevelGateOptions = {},
): GateLike {
  return defineGate("permissionLevel", async (ctx) => {
    const config = options.config ?? getPermissionLevelsConfig();
    const level = await resolvePermissionLevel(ctx, config);
    if (level >= minLevel) return { allow: true };
    return {
      allow: false,
      reason:
        options.message ??
        `You need permission level ${minLevel} or higher (you have ${level}).`,
    };
  });
}
