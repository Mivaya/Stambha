# Monetization

SKU / entitlement helpers for Discord app subscriptions and one-time purchases — REST list helpers plus `entitlementGate` for the command pipeline.

## Interaction entitlements (slash)

Discord includes the invoker’s entitlements on interaction payloads. Stambha maps them to `ctx.meta.entitlements` (camelCase):

```ts
import { Command, ok, type Registry } from "@stambha/core";
import { entitlementGate } from "@stambha/gates";

export class PremiumCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "premium",
      kinds: ["slash", "prefix"],
      gates: [entitlementGate({ skuIds: process.env.PREMIUM_SKU_ID! })],
    });
  }

  async execute(ctx) {
    await ctx.reply("Premium unlocked.");
    return ok(undefined);
  }
}
```

`hasEntitlement(ctx.meta?.entitlements, skuId)` is available for programmatic checks.

## REST lookups (prefix / background)

When `meta.entitlements` is absent, pass a `lookup` that calls Discord:

```ts
import { createEntitlementLookup, listEntitlements, listSkus } from "@stambha/rest";
import { entitlementGate } from "@stambha/gates";

const skuId = process.env.PREMIUM_SKU_ID!;
const applicationId = process.env.DISCORD_APPLICATION_ID!;

entitlementGate({
  skuIds: skuId,
  lookup: createEntitlementLookup(client.restPort!, applicationId, skuId),
});

// Or list manually:
const skus = await listSkus(client.restPort!, applicationId);
const ents = await listEntitlements(client.restPort!, applicationId, {
  userId: ctx.userId,
  skuIds: [skuId],
  excludeEnded: true,
});
```

| Helper | Package | Role |
|--------|---------|------|
| `listEntitlements` / `listSkus` | `@stambha/rest` | HTTP list |
| `fetchEntitlement` / `consumeEntitlement` | `@stambha/rest` | Get / consume |
| `hasEntitlementForSku` / `isEntitlementActive` | `@stambha/rest` | Pure checks on API shapes |
| `createEntitlementLookup` | `@stambha/rest` | Wire into `entitlementGate` |
| `entitlementGate` / `hasEntitlement` | `@stambha/gates` | Pipeline gate + meta helper |

## Gateway events

Tier 4 camelCase hub events (`entitlementCreate` / `subscriptionCreate`, …) are already typed on `GatewayEventHub`. Use them to refresh caches; treat List Entitlements + interaction entitlements as the source of truth for access checks.

## See also

- [Gates](/features/gates) — other command checks
- [Gateway](/deployment/gateway) — entitlement / subscription hub events
- [Discord monetization overview](https://docs.discord.com/developers/monetization/overview)
