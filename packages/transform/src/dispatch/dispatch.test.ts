import { describe, expect, it } from "vitest";
import { camelizeDispatch } from "./camelize.js";
import {
  buildDispatchCatalog,
  GATEWAY_DISPATCH_EVENTS,
  gatewayEventToHubName,
} from "./catalog.js";
import { messageFromDispatch } from "./messages.js";
import { normalizeDispatch } from "./normalize.js";

describe("dispatch/catalog", () => {
  it("maps every gateway dispatch name to a hub name", () => {
    const catalog = buildDispatchCatalog();
    expect(catalog).toHaveLength(GATEWAY_DISPATCH_EVENTS.length);
    for (const entry of catalog) {
      expect(entry.hubName).toBe(gatewayEventToHubName(entry.dispatchName));
      expect(entry.hubName.length).toBeGreaterThan(0);
      expect(["routing", "tier1", "passthrough"]).toContain(entry.tier);
    }
  });

  it("maps gateway event names to hub camelCase", () => {
    expect(gatewayEventToHubName("MESSAGE_CREATE")).toBe("messageCreate");
    expect(gatewayEventToHubName("GUILD_MEMBER_ADD")).toBe("guildMemberAdd");
  });
});

describe("dispatch/camelize", () => {
  it("deep-camelizes snake_case keys", () => {
    expect(
      camelizeDispatch({
        channel_id: "c1",
        guild_id: "g1",
        author: { user_id: "u1", is_bot: false },
        items: [{ message_id: "m1" }],
      }),
    ).toEqual({
      channelId: "c1",
      guildId: "g1",
      author: { userId: "u1", isBot: false },
      items: [{ messageId: "m1" }],
    });
  });

  it("preserves primitives and null", () => {
    expect(camelizeDispatch(null)).toBeNull();
    expect(camelizeDispatch("hello")).toBe("hello");
    expect(camelizeDispatch(42)).toBe(42);
  });
});

describe("dispatch/normalize", () => {
  it("normalizes MESSAGE_CREATE to StambhaMessage", () => {
    const msg = messageFromDispatch({
      id: "1",
      content: "hi",
      channel_id: "c1",
      guild_id: "g1",
      author: { id: "u1", bot: false, username: "alice" },
    });
    expect(msg).toEqual({
      id: "1",
      content: "hi",
      channelId: "c1",
      guildId: "g1",
      author: { id: "u1", bot: false, username: "alice" },
    });
  });

  it("passes through unknown dispatch payloads unchanged", () => {
    const raw = { id: "g1", name: "Guild" };
    expect(normalizeDispatch("GUILD_CREATE", raw)).toBe(raw);
  });
});
