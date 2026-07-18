import { describe, expect, it } from "vitest";
import { camelizeDispatch } from "./camelize.js";
import {
  buildDispatchCatalog,
  dispatchNormalizationTier,
  GATEWAY_DISPATCH_EVENTS,
  gatewayEventToHubName,
  isTier1Dispatch,
} from "./catalog.js";
import { TIER1_FIXTURES } from "./fixtures/tier1.js";
import { messageFromDispatch, readyFromDispatch } from "./messages.js";
import { normalizeDispatch } from "./normalize.js";

const TIER1_DISPATCH_NAMES = GATEWAY_DISPATCH_EVENTS.filter(
  (name) => dispatchNormalizationTier(name) === "tier1",
);

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

  it("classifies Tier 1 dispatches including poll votes and voice server", () => {
    expect(isTier1Dispatch("MESSAGE_REACTION_ADD")).toBe(true);
    expect(isTier1Dispatch("MESSAGE_POLL_VOTE_ADD")).toBe(true);
    expect(isTier1Dispatch("VOICE_SERVER_UPDATE")).toBe(true);
    expect(isTier1Dispatch("CHANNEL_CREATE")).toBe(false);
    expect(TIER1_DISPATCH_NAMES).toContain("VOICE_SERVER_UPDATE");
    expect(TIER1_DISPATCH_NAMES).toContain("MESSAGE_POLL_VOTE_REMOVE");
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

  it("includes guildIds from READY stubs", () => {
    expect(
      readyFromDispatch({
        session_id: "sess",
        user: { id: "bot", username: "bot" },
        guilds: [{ id: "g1", unavailable: true }, { id: "g2", unavailable: true }],
      }),
    ).toEqual({
      user: { id: "bot", username: "bot" },
      sessionId: "sess",
      guildIds: ["g1", "g2"],
    });
  });

  it("camelizes Tier 1 dispatch payloads", () => {
    for (const [dispatchName, raw] of Object.entries(TIER1_FIXTURES)) {
      expect(normalizeDispatch(dispatchName, raw)).toEqual(camelizeDispatch(raw));
    }
  });

  it("camelizes every catalog Tier 1 dispatch name", () => {
    const raw = { guild_id: "g1", channel_id: "c1" };
    for (const name of TIER1_DISPATCH_NAMES) {
      expect(normalizeDispatch(name, raw)).toEqual(camelizeDispatch(raw));
    }
  });

  it("passes through passthrough-tier payloads unchanged", () => {
    const raw = { id: "c1", name: "general" };
    expect(normalizeDispatch("CHANNEL_CREATE", raw)).toBe(raw);
  });

  it("supports raw mode escape hatch for Tier 1", () => {
    const raw = TIER1_FIXTURES.GUILD_CREATE;
    expect(normalizeDispatch("GUILD_CREATE", raw, { mode: "raw" })).toBe(raw);
  });
});
