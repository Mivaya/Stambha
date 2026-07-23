import type { RestPort } from "@stambha/core";
import { describe, expect, it, vi } from "vitest";
import {
  hasEntitlementForSku,
  isEntitlementActive,
  listEntitlements,
  listSkus,
} from "./monetization.js";

describe("monetization helpers", () => {
  it("listEntitlements forwards query params", async () => {
    const request = vi.fn().mockResolvedValue([
      {
        id: "e1",
        sku_id: "sku1",
        application_id: "app",
        type: 1,
        deleted: false,
      },
    ]);
    const rest: RestPort = { request };
    const ents = await listEntitlements(rest, "app", {
      userId: "u1",
      skuIds: ["sku1", "sku2"],
      excludeEnded: true,
    });
    expect(ents).toHaveLength(1);
    expect(request).toHaveBeenCalledWith({
      method: "GET",
      route: "/applications/app/entitlements",
      query: {
        user_id: "u1",
        sku_ids: "sku1,sku2",
        exclude_ended: "true",
      },
    });
  });

  it("listSkus returns [] on failure", async () => {
    const rest: RestPort = { request: vi.fn().mockRejectedValue(new Error("401")) };
    await expect(listSkus(rest, "app")).resolves.toEqual([]);
  });

  it("isEntitlementActive respects ends_at and consumed", () => {
    expect(isEntitlementActive({ deleted: false, ends_at: null })).toBe(true);
    expect(isEntitlementActive({ deleted: true })).toBe(false);
    expect(isEntitlementActive({ deleted: false, consumed: true })).toBe(false);
    expect(
      isEntitlementActive(
        { deleted: false, ends_at: "2020-01-01T00:00:00.000Z" },
        Date.parse("2021-01-01T00:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("hasEntitlementForSku matches active sku", () => {
    const ents = [
      {
        id: "e1",
        sku_id: "premium",
        application_id: "app",
        type: 1,
        deleted: false,
      },
    ];
    expect(hasEntitlementForSku(ents, "premium")).toBe(true);
    expect(hasEntitlementForSku(ents, "other")).toBe(false);
    expect(hasEntitlementForSku(undefined, "premium")).toBe(false);
  });
});
