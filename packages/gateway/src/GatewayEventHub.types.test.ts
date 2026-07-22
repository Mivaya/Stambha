import { describe, expect, expectTypeOf, it } from "vitest";
import { createGatewayEventHub, type GatewayEventMap } from "./GatewayEventHub.js";

describe("GatewayEventHub typed listeners", () => {
  it("narrows known hub listener payloads", () => {
    const hub = createGatewayEventHub();

    hub.on("messageReactionAdd", (payload) => {
      expectTypeOf(payload).toEqualTypeOf<GatewayEventMap["messageReactionAdd"]>();
      expectTypeOf(payload.guildId).toEqualTypeOf<string | undefined>();
      expectTypeOf(payload.emoji.name).toBeString();
    });

    hub.on("messageCreate", (payload) => {
      expectTypeOf(payload).toEqualTypeOf<GatewayEventMap["messageCreate"]>();
      expectTypeOf(payload.content).toBeString();
    });

    hub.on("inviteCreate", (payload) => {
      expectTypeOf(payload.channelId).toBeString();
    });

    hub.on("entitlementCreate", (payload) => {
      expectTypeOf(payload.skuId).toBeString();
    });

    hub.on("guildAvailable", (payload) => {
      expectTypeOf(payload.id).toBeString();
    });

    hub.on("error", (payload) => {
      expectTypeOf(payload.type).toEqualTypeOf<"fatal_close">();
    });

    // Runtime smoke: typed registration still delivers payloads.
    let seen: string | undefined;
    hub.on("typingStart", (payload) => {
      seen = payload.userId;
    });
    hub.emit("typingStart", { channelId: "c1", userId: "u1", timestamp: 1 });
    expect(seen).toBe("u1");
  });

  it("keeps unknown event names as unknown payloads", () => {
    const hub = createGatewayEventHub();
    hub.on("customWorkerEvent", (payload) => {
      expectTypeOf(payload).toBeUnknown();
    });
  });
});
