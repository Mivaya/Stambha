import { field, type FieldSchema, type Vault, type VaultRecord } from "@stambha/vault";
import type { CommandContext } from "@stambha/core";
import { PermissionLevel } from "./ladder.js";
import { configurePermissionLevels, type LevelsConfig } from "./resolve.js";

/** Default guild blueprint field name for per-member level overrides. */
export const PERMISSION_LEVELS_FIELD = "permissionLevels";

export interface PermissionLevelEntry {
  userId: string;
  level: number;
}

/**
 * Blueprint field: array of `{ userId, level }` (0–10).
 * Add to your guild blueprint:
 *
 * ```ts
 * permissionLevels: permissionLevelsField(),
 * ```
 */
export function permissionLevelsField(): FieldSchema {
  return field
    .array(
      field
        .object({
          userId: field.string().build(),
          level: field.number().min(0).max(PermissionLevel.BotOwner).build(),
        })
        .build(),
    )
    .default([])
    .build();
}

export interface VaultLevelOptions {
  /** Ledger name (default `guild`). */
  ledger?: string;
  /** Blueprint field name (default {@link PERMISSION_LEVELS_FIELD}). */
  field?: string;
}

function readEntries(record: VaultRecord, fieldName: string): PermissionLevelEntry[] {
  const raw = record.get(fieldName as never);
  if (!Array.isArray(raw)) return [];
  const out: PermissionLevelEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.userId !== "string" || typeof row.level !== "number") continue;
    out.push({ userId: row.userId, level: row.level });
  }
  return out;
}

/** Read a member’s vault override, or `null` if unset. */
export async function getMemberPermissionLevel(
  vault: Vault,
  guildId: string,
  userId: string,
  options: VaultLevelOptions = {},
): Promise<number | null> {
  const ledgerName = options.ledger ?? "guild";
  const fieldName = options.field ?? PERMISSION_LEVELS_FIELD;
  const record = vault.ledger(ledgerName).acquire(guildId);
  await record.sync();
  const entry = readEntries(record, fieldName).find((e) => e.userId === userId);
  return entry?.level ?? null;
}

/** Set or replace a member’s vault override; persists via Vault batcher. */
export async function setMemberPermissionLevel(
  vault: Vault,
  guildId: string,
  userId: string,
  level: number,
  options: VaultLevelOptions = {},
): Promise<void> {
  if (level < 0 || level > PermissionLevel.BotOwner) {
    throw new Error(`Level must be between 0 and ${PermissionLevel.BotOwner}.`);
  }
  const ledgerName = options.ledger ?? "guild";
  const fieldName = options.field ?? PERMISSION_LEVELS_FIELD;
  const record = vault.ledger(ledgerName).acquire(guildId);
  await record.sync();
  const next = readEntries(record, fieldName).filter((e) => e.userId !== userId);
  next.push({ userId, level });
  next.sort((a, b) => a.userId.localeCompare(b.userId));
  record.set(fieldName as never, next as never);
  await record.save();
}

/** Remove a member’s vault override. */
export async function clearMemberPermissionLevel(
  vault: Vault,
  guildId: string,
  userId: string,
  options: VaultLevelOptions = {},
): Promise<boolean> {
  const ledgerName = options.ledger ?? "guild";
  const fieldName = options.field ?? PERMISSION_LEVELS_FIELD;
  const record = vault.ledger(ledgerName).acquire(guildId);
  await record.sync();
  const prev = readEntries(record, fieldName);
  const next = prev.filter((e) => e.userId !== userId);
  if (next.length === prev.length) return false;
  record.set(fieldName as never, next as never);
  await record.save();
  return true;
}

/** Build a {@link LevelsConfig.resolveOverride} that reads Vault guild records. */
export function createVaultLevelOverrideResolver(
  vault: Vault,
  options: VaultLevelOptions = {},
): NonNullable<LevelsConfig["resolveOverride"]> {
  return async (ctx: CommandContext) => {
    if (!ctx.guildId) return null;
    return getMemberPermissionLevel(vault, ctx.guildId, ctx.userId, options);
  };
}

export interface AttachVaultLevelOverridesOptions extends VaultLevelOptions {
  /** Extra {@link configurePermissionLevels} settings (botOwners, roles, …). */
  levels?: Omit<LevelsConfig, "resolveOverride">;
}

/**
 * Wire Vault per-member overrides into {@link configurePermissionLevels} / `permissionLevelGate`.
 * Call after `vault.init()` and before handling commands.
 */
export function attachVaultLevelOverrides(
  vault: Vault,
  options: AttachVaultLevelOverridesOptions = {},
): void {
  const { levels, ...vaultOpts } = options;
  configurePermissionLevels({
    ...levels,
    resolveOverride: createVaultLevelOverrideResolver(vault, vaultOpts),
  });
}
