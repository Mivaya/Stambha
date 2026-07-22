import type { CommandContext } from "@stambha/core";
import { PermissionLevel } from "./ladder.js";

/** Discord permission bits used for level heuristics when role maps are incomplete. */
const Administrator = 1n << 3n;
const KickMembers = 1n << 1n;
const BanMembers = 1n << 2n;
const ManageGuild = 1n << 5n;
const ManageMessages = 1n << 13n;

export interface LevelsConfig {
  /** User ids that always resolve to {@link PermissionLevel.BotOwner}. */
  botOwners?: readonly string[];
  /** Role ids that grant at least {@link PermissionLevel.Moderator}. */
  moderatorRoleIds?: readonly string[];
  /** Role ids that grant at least {@link PermissionLevel.Administrator}. */
  administratorRoleIds?: readonly string[];
  /** Explicit role id → level (highest matching role wins). */
  roleLevels?: Readonly<Record<string, number>>;
  /**
   * Guild id → owner user id when `meta.guildOwnerId` is unset.
   * Interactions do not include the guild owner — populate this or enrich meta.
   */
  guildOwners?: Readonly<Record<string, string>>;
  /**
   * Optional per-member override (C2 / Vault). Return a level, or `null` to continue resolution.
   */
  resolveOverride?: (
    ctx: CommandContext,
  ) => number | null | undefined | Promise<number | null | undefined>;
  /**
   * When true (default), infer Moderator/Administrator from `meta.memberPermissions`
   * if role maps do not produce a higher level (helps slash today; prefix needs meta).
   */
  permissionBitFallback?: boolean;
}

let globalConfig: LevelsConfig = { permissionBitFallback: true };

/** Merge into the process-wide levels config used by {@link resolvePermissionLevel}. */
export function configurePermissionLevels(config: LevelsConfig): void {
  const next: LevelsConfig = { ...globalConfig, ...config };
  next.permissionBitFallback =
    config.permissionBitFallback ?? globalConfig.permissionBitFallback ?? true;
  globalConfig = next;
}

/** Replace the process-wide config (tests). */
export function resetPermissionLevels(config: LevelsConfig = {}): void {
  globalConfig = { permissionBitFallback: true, ...config };
}

export function getPermissionLevelsConfig(): LevelsConfig {
  return globalConfig;
}

function hasBit(have: bigint | undefined, need: bigint): boolean {
  if (have === undefined) return false;
  return (have & need) === need || (have & Administrator) === Administrator;
}

function levelFromRoles(roleIds: readonly string[], config: LevelsConfig): number {
  let level: number = PermissionLevel.Everyone;
  const roleLevels = config.roleLevels;
  if (roleLevels) {
    for (const id of roleIds) {
      const mapped = roleLevels[id];
      if (mapped !== undefined && mapped > level) level = mapped;
    }
  }
  if (config.administratorRoleIds?.some((id) => roleIds.includes(id))) {
    level = Math.max(level, PermissionLevel.Administrator);
  }
  if (config.moderatorRoleIds?.some((id) => roleIds.includes(id))) {
    level = Math.max(level, PermissionLevel.Moderator);
  }
  return level;
}

function levelFromPermissions(perms: bigint | undefined): number {
  if (perms === undefined) return PermissionLevel.Everyone;
  if (hasBit(perms, Administrator) || hasBit(perms, ManageGuild)) {
    return PermissionLevel.Administrator;
  }
  if (hasBit(perms, KickMembers) || hasBit(perms, BanMembers) || hasBit(perms, ManageMessages)) {
    return PermissionLevel.Moderator;
  }
  return PermissionLevel.Everyone;
}

/**
 * Resolve the numeric permission level for a command context.
 * Highest applicable level wins (BotOwner → GuildOwner → roles/override → bits → Everyone).
 */
export async function resolvePermissionLevel(
  ctx: CommandContext,
  config: LevelsConfig = globalConfig,
): Promise<number> {
  if (config.botOwners?.includes(ctx.userId)) {
    return PermissionLevel.BotOwner;
  }

  const guildOwnerId =
    ctx.meta?.guildOwnerId ?? (ctx.guildId ? config.guildOwners?.[ctx.guildId] : undefined);
  if (guildOwnerId && guildOwnerId === ctx.userId) {
    return PermissionLevel.GuildOwner;
  }

  if (config.resolveOverride) {
    const override = await config.resolveOverride(ctx);
    if (override !== null && override !== undefined) {
      return override;
    }
  }

  const roleIds = ctx.meta?.memberRoleIds ?? [];
  let level = levelFromRoles(roleIds, config);

  if (config.permissionBitFallback !== false) {
    level = Math.max(level, levelFromPermissions(ctx.meta?.memberPermissions));
  }

  return level;
}
