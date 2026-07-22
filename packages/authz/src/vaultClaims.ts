import type { CommandContext } from "@stambha/core";
import { field, type FieldSchema, type Vault, type VaultRecord } from "@stambha/vault";
import { configureAuthz } from "./resolve.js";
import type { AuthzConfig, CapabilityClaim, CapabilityId } from "./types.js";

/** Default guild blueprint field name for per-member capability claims. */
export const CAPABILITY_CLAIMS_FIELD = "capabilityClaims";

export interface CapabilityClaimEntry {
  userId: string;
  /** Capability ids explicitly granted. */
  grants: string[];
  /** Capability ids explicitly denied (wins over grants and roles). */
  denies: string[];
}

/**
 * Blueprint field: array of `{ userId, grants, denies }`.
 *
 * ```ts
 * capabilityClaims: capabilityClaimsField(),
 * ```
 */
export function capabilityClaimsField(): FieldSchema {
  return field
    .array(
      field
        .object({
          userId: field.string().build(),
          grants: field.array(field.string().build()).default([]).build(),
          denies: field.array(field.string().build()).default([]).build(),
        })
        .build(),
    )
    .default([])
    .build();
}

export interface VaultClaimOptions {
  ledger?: string;
  field?: string;
}

function readEntries(record: VaultRecord, fieldName: string): CapabilityClaimEntry[] {
  const raw = record.get(fieldName as never);
  if (!Array.isArray(raw)) return [];
  const out: CapabilityClaimEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.userId !== "string") continue;
    const grants = Array.isArray(row.grants)
      ? row.grants.filter((g): g is string => typeof g === "string")
      : [];
    const denies = Array.isArray(row.denies)
      ? row.denies.filter((d): d is string => typeof d === "string")
      : [];
    out.push({ userId: row.userId, grants, denies });
  }
  return out;
}

async function loadEntries(
  vault: Vault,
  guildId: string,
  options: VaultClaimOptions,
): Promise<{ record: VaultRecord; fieldName: string; entries: CapabilityClaimEntry[] }> {
  const ledgerName = options.ledger ?? "guild";
  const fieldName = options.field ?? CAPABILITY_CLAIMS_FIELD;
  const record = vault.ledger(ledgerName).acquire(guildId);
  await record.sync();
  return { record, fieldName, entries: readEntries(record, fieldName) };
}

async function saveEntries(
  record: VaultRecord,
  fieldName: string,
  entries: CapabilityClaimEntry[],
): Promise<void> {
  entries.sort((a, b) => a.userId.localeCompare(b.userId));
  record.set(fieldName as never, entries as never);
  await record.save();
}

function normalizeEntry(entry: CapabilityClaimEntry | undefined, userId: string): CapabilityClaimEntry {
  return entry ?? { userId, grants: [], denies: [] };
}

/** Read a member’s Vault claims, or `null` if unset. */
export async function getMemberCapabilityClaims(
  vault: Vault,
  guildId: string,
  userId: string,
  options: VaultClaimOptions = {},
): Promise<CapabilityClaimEntry | null> {
  const { entries } = await loadEntries(vault, guildId, options);
  return entries.find((e) => e.userId === userId) ?? null;
}

/** Grant a capability to a member (removes matching deny). */
export async function grantMemberCapability(
  vault: Vault,
  guildId: string,
  userId: string,
  capabilityId: CapabilityId,
  options: VaultClaimOptions = {},
): Promise<void> {
  const { record, fieldName, entries } = await loadEntries(vault, guildId, options);
  const next = entries.filter((e) => e.userId !== userId);
  const entry = normalizeEntry(
    entries.find((e) => e.userId === userId),
    userId,
  );
  entry.denies = entry.denies.filter((id) => id !== capabilityId);
  if (!entry.grants.includes(capabilityId)) entry.grants.push(capabilityId);
  entry.grants.sort();
  next.push(entry);
  await saveEntries(record, fieldName, next);
}

/** Deny a capability for a member (removes matching grant). */
export async function denyMemberCapability(
  vault: Vault,
  guildId: string,
  userId: string,
  capabilityId: CapabilityId,
  options: VaultClaimOptions = {},
): Promise<void> {
  const { record, fieldName, entries } = await loadEntries(vault, guildId, options);
  const next = entries.filter((e) => e.userId !== userId);
  const entry = normalizeEntry(
    entries.find((e) => e.userId === userId),
    userId,
  );
  entry.grants = entry.grants.filter((id) => id !== capabilityId);
  if (!entry.denies.includes(capabilityId)) entry.denies.push(capabilityId);
  entry.denies.sort();
  next.push(entry);
  await saveEntries(record, fieldName, next);
}

/** Clear grant and deny for one capability; drop empty rows. */
export async function clearMemberCapability(
  vault: Vault,
  guildId: string,
  userId: string,
  capabilityId: CapabilityId,
  options: VaultClaimOptions = {},
): Promise<boolean> {
  const { record, fieldName, entries } = await loadEntries(vault, guildId, options);
  const existing = entries.find((e) => e.userId === userId);
  if (!existing) return false;
  const had =
    existing.grants.includes(capabilityId) || existing.denies.includes(capabilityId);
  if (!had) return false;

  const next = entries.filter((e) => e.userId !== userId);
  const entry: CapabilityClaimEntry = {
    userId,
    grants: existing.grants.filter((id) => id !== capabilityId),
    denies: existing.denies.filter((id) => id !== capabilityId),
  };
  if (entry.grants.length > 0 || entry.denies.length > 0) next.push(entry);
  await saveEntries(record, fieldName, next);
  return true;
}

/** Remove all Vault claims for a member. */
export async function clearMemberCapabilityClaims(
  vault: Vault,
  guildId: string,
  userId: string,
  options: VaultClaimOptions = {},
): Promise<boolean> {
  const { record, fieldName, entries } = await loadEntries(vault, guildId, options);
  const next = entries.filter((e) => e.userId !== userId);
  if (next.length === entries.length) return false;
  await saveEntries(record, fieldName, next);
  return true;
}

/** Build a {@link AuthzConfig.resolveClaim} that reads Vault guild records. */
export function createVaultCapabilityClaimResolver(
  vault: Vault,
  options: VaultClaimOptions = {},
): NonNullable<AuthzConfig["resolveClaim"]> {
  return async (ctx: CommandContext, capabilityId: CapabilityId) => {
    if (!ctx.guildId) return null;
    const entry = await getMemberCapabilityClaims(vault, ctx.guildId, ctx.userId, options);
    if (!entry) return null;
    if (entry.denies.includes(capabilityId)) return "deny" satisfies CapabilityClaim;
    if (entry.grants.includes(capabilityId)) return "grant" satisfies CapabilityClaim;
    return null;
  };
}

export interface AttachVaultCapabilityClaimsOptions extends VaultClaimOptions {
  /** Extra {@link configureAuthz} settings (botOwners, capabilities, …). */
  authz?: Omit<AuthzConfig, "resolveClaim">;
}

/**
 * Wire Vault per-member claims into {@link configureAuthz} / `capabilityGate`.
 * Call after `vault.init()` and before handling commands.
 */
export function attachVaultCapabilityClaims(
  vault: Vault,
  options: AttachVaultCapabilityClaimsOptions = {},
): void {
  const { authz, ...vaultOpts } = options;
  configureAuthz({
    ...authz,
    resolveClaim: createVaultCapabilityClaimResolver(vault, vaultOpts),
  });
}
