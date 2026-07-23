import { Command, type CommandContext, ok, type Registry } from "@stambha/core";
import { entitlementGate } from "@stambha/gates";

const PREMIUM_SKU = process.env.PREMIUM_SKU_ID ?? "SKU_PREMIUM_DEMO";

/**
 * Demo: require an active entitlement for a SKU via `entitlementGate`.
 * Slash interactions populate `ctx.meta.entitlements` automatically.
 */
export class PremiumCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "premium",
      description: "Entitlement gate demo (requires PREMIUM_SKU_ID)",
      kinds: ["slash", "prefix"],
      category: "General",
      gates: [
        entitlementGate({
          skuIds: PREMIUM_SKU,
          message: `Requires entitlement for SKU \`${PREMIUM_SKU}\`.`,
        }),
      ],
    });
  }

  async execute(ctx: CommandContext) {
    const skus = (ctx.meta?.entitlements ?? []).map((e) => e.skuId).join(", ") || PREMIUM_SKU;
    await ctx.reply(`Premium check passed (SKU: ${skus}).`);
    return ok(undefined);
  }
}
