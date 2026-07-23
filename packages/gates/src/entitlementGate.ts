import { defineGate, type CommandContext, type EntitlementSummary, type GateLike } from "@stambha/core";

export interface EntitlementGateOptions {
  /** One or more SKU ids that grant access (any match). */
  skuIds: string | readonly string[];
  /** Deny reason shown via `attachGateDeniedReply` / epilogues. */
  message?: string;
  /**
   * When `ctx.meta.entitlements` is missing (e.g. prefix), call this to resolve.
   * Typically wraps `listEntitlements` from `@stambha/rest`.
   */
  lookup?: (ctx: CommandContext) => boolean | Promise<boolean>;
}

function normalizeSkuIds(skuIds: string | readonly string[]): string[] {
  return typeof skuIds === "string" ? [skuIds] : [...skuIds];
}

/**
 * True when any entitlement is active and matches one of `skuIds`.
 * Active = not deleted, not consumed, and `endsAt` unset or in the future.
 */
export function hasEntitlement(
  entitlements: readonly EntitlementSummary[] | undefined,
  skuIds: string | readonly string[],
  nowMs: number = Date.now(),
): boolean {
  if (!entitlements || entitlements.length === 0) return false;
  const want = new Set(normalizeSkuIds(skuIds));
  if (want.size === 0) return false;
  return entitlements.some((e) => {
    if (!want.has(e.skuId)) return false;
    if (e.deleted) return false;
    if (e.consumed === true) return false;
    if (e.endsAt) {
      const end = Date.parse(e.endsAt);
      if (!Number.isNaN(end) && end <= nowMs) return false;
    }
    return true;
  });
}

/**
 * Require an active entitlement for one of the given SKU ids.
 *
 * Prefer interaction `meta.entitlements` (slash). For prefix / background checks,
 * pass {@link EntitlementGateOptions.lookup} that calls REST `listEntitlements`.
 *
 * @example
 * ```ts
 * gates: [entitlementGate({ skuIds: process.env.PREMIUM_SKU_ID! })]
 * ```
 */
export function entitlementGate(options: EntitlementGateOptions): GateLike {
  const skuIds = normalizeSkuIds(options.skuIds);
  const label = skuIds.join(", ");

  return defineGate("entitlement", async (ctx) => {
    if (skuIds.length === 0) {
      return { allow: false, reason: options.message ?? "No SKU configured for this command." };
    }

    if (hasEntitlement(ctx.meta?.entitlements, skuIds)) {
      return { allow: true };
    }

    if (options.lookup) {
      if (await options.lookup(ctx)) return { allow: true };
    }

    return {
      allow: false,
      reason: options.message ?? `This command requires a purchase (SKU: ${label}).`,
    };
  });
}
