import type { RestPort } from "@stambha/core";

/** Discord entitlement object (snake_case API shape). */
export interface ApiEntitlement {
  id: string;
  sku_id: string;
  application_id: string;
  user_id?: string;
  guild_id?: string;
  type: number;
  deleted: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  consumed?: boolean;
}

/** Discord SKU object (snake_case API shape). */
export interface ApiSku {
  id: string;
  type: number;
  application_id: string;
  name: string;
  slug: string;
  flags: number;
}

export interface ListEntitlementsQuery {
  userId?: string;
  guildId?: string;
  /** Filter to these SKU ids. */
  skuIds?: readonly string[];
  before?: string;
  after?: string;
  limit?: number;
  /** Omit ended entitlements (Discord default: include ended). */
  excludeEnded?: boolean;
  /** Omit deleted entitlements (Discord default: true). */
  excludeDeleted?: boolean;
}

function buildQuery(query: ListEntitlementsQuery = {}): Record<string, string> | undefined {
  const out: Record<string, string> = {};
  if (query.userId) out.user_id = query.userId;
  if (query.guildId) out.guild_id = query.guildId;
  if (query.skuIds && query.skuIds.length > 0) out.sku_ids = query.skuIds.join(",");
  if (query.before) out.before = query.before;
  if (query.after) out.after = query.after;
  if (query.limit !== undefined) out.limit = String(query.limit);
  if (query.excludeEnded !== undefined) out.exclude_ended = String(query.excludeEnded);
  if (query.excludeDeleted !== undefined) out.exclude_deleted = String(query.excludeDeleted);
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * List entitlements for an application (`GET /applications/{id}/entitlements`).
 * Returns `[]` on REST failure.
 */
export async function listEntitlements(
  rest: RestPort,
  applicationId: string,
  query: ListEntitlementsQuery = {},
): Promise<ApiEntitlement[]> {
  try {
    const q = buildQuery(query);
    const result = await rest.request<ApiEntitlement[]>({
      method: "GET",
      route: `/applications/${applicationId}/entitlements`,
      ...(q ? { query: q } : {}),
    });
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

/** List SKUs for an application (`GET /applications/{id}/skus`). */
export async function listSkus(rest: RestPort, applicationId: string): Promise<ApiSku[]> {
  try {
    const result = await rest.request<ApiSku[]>({
      method: "GET",
      route: `/applications/${applicationId}/skus`,
    });
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

/** Get one entitlement by id. */
export async function fetchEntitlement(
  rest: RestPort,
  applicationId: string,
  entitlementId: string,
): Promise<ApiEntitlement | null> {
  try {
    return await rest.request<ApiEntitlement>({
      method: "GET",
      route: `/applications/${applicationId}/entitlements/${entitlementId}`,
    });
  } catch {
    return null;
  }
}

/** Mark a consumable entitlement as consumed. */
export async function consumeEntitlement(
  rest: RestPort,
  applicationId: string,
  entitlementId: string,
): Promise<boolean> {
  try {
    await rest.request({
      method: "POST",
      route: `/applications/${applicationId}/entitlements/${entitlementId}/consume`,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * True when the entitlement grants access now (not deleted, not consumed,
 * and `ends_at` is unset or in the future).
 */
export function isEntitlementActive(
  entitlement: Pick<ApiEntitlement, "deleted" | "consumed" | "ends_at">,
  nowMs: number = Date.now(),
): boolean {
  if (entitlement.deleted) return false;
  if (entitlement.consumed === true) return false;
  if (entitlement.ends_at) {
    const end = Date.parse(entitlement.ends_at);
    if (!Number.isNaN(end) && end <= nowMs) return false;
  }
  return true;
}

/** True when any active entitlement matches one of `skuIds`. */
export function hasEntitlementForSku(
  entitlements: readonly ApiEntitlement[] | undefined,
  skuIds: string | readonly string[],
  nowMs: number = Date.now(),
): boolean {
  if (!entitlements || entitlements.length === 0) return false;
  const want = new Set(typeof skuIds === "string" ? [skuIds] : skuIds);
  if (want.size === 0) return false;
  return entitlements.some((e) => want.has(e.sku_id) && isEntitlementActive(e, nowMs));
}

export interface CreateEntitlementLookupOptions {
  /** Omit ended entitlements when listing (default `true`). */
  excludeEnded?: boolean;
}

/**
 * Build an async lookup for `entitlementGate` / prefix commands that lack
 * interaction entitlements. Uses `listEntitlements` filtered by user (and guild when set).
 */
export function createEntitlementLookup(
  rest: RestPort,
  applicationId: string,
  skuIds: string | readonly string[],
  options: CreateEntitlementLookupOptions = {},
): (ctx: { userId: string; guildId: string | null }) => Promise<boolean> {
  const skus = typeof skuIds === "string" ? [skuIds] : [...skuIds];
  const excludeEnded = options.excludeEnded ?? true;
  return async (ctx) => {
    const ents = await listEntitlements(rest, applicationId, {
      userId: ctx.userId,
      ...(ctx.guildId ? { guildId: ctx.guildId } : {}),
      skuIds: skus,
      excludeEnded,
    });
    return hasEntitlementForSku(ents, skus);
  };
}
