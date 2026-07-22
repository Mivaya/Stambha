import { describe, expect, it } from "vitest";
import { camelizeDispatch } from "./camelize.js";
import {
  buildDispatchCatalog,
  dispatchNormalizationTier,
  GATEWAY_DISPATCH_EVENTS,
  gatewayEventToHubName,
  isStructuralDispatch,
  isTier1Dispatch,
  isTier2Dispatch,
  isTier3Dispatch,
  isTier4Dispatch,
} from "./catalog.js";
import { TIER1_FIXTURES } from "./fixtures/tier1.js";
import { TIER2_FIXTURES } from "./fixtures/tier2.js";
import { TIER3_FIXTURES } from "./fixtures/tier3.js";
import { TIER4_FIXTURES } from "./fixtures/tier4.js";
import { messageFromDispatch, readyFromDispatch } from "./messages.js";
import { normalizeDispatch } from "./normalize.js";

const TIER1_DISPATCH_NAMES = GATEWAY_DISPATCH_EVENTS.filter(
  (name) => dispatchNormalizationTier(name) === "tier1",
);

const TIER2_DISPATCH_NAMES = GATEWAY_DISPATCH_EVENTS.filter(
  (name) => dispatchNormalizationTier(name) === "tier2",
);

const TIER3_DISPATCH_NAMES = GATEWAY_DISPATCH_EVENTS.filter(
  (name) => dispatchNormalizationTier(name) === "tier3",
);

const TIER4_DISPATCH_NAMES = GATEWAY_DISPATCH_EVENTS.filter(
  (name) => dispatchNormalizationTier(name) === "tier4",
);

describe("dispatch/catalog", () => {
  it("maps every gateway dispatch name to a hub name", () => {
    const catalog = buildDispatchCatalog();
    expect(catalog).toHaveLength(GATEWAY_DISPATCH_EVENTS.length);
    for (const entry of catalog) {
      expect(entry.hubName).toBe(gatewayEventToHubName(entry.dispatchName));
      expect(entry.hubName.length).toBeGreaterThan(0);
      expect(["routing", "tier1", "tier2", "tier3", "tier4", "passthrough"]).toContain(entry.tier);
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

  it("classifies Tier 2 channel/thread/role/ban/chunk/audit events", () => {
    expect(isTier2Dispatch("CHANNEL_CREATE")).toBe(true);
    expect(isTier2Dispatch("THREAD_LIST_SYNC")).toBe(true);
    expect(isTier2Dispatch("GUILD_ROLE_UPDATE")).toBe(true);
    expect(isTier2Dispatch("GUILD_BAN_REMOVE")).toBe(true);
    expect(isTier2Dispatch("GUILD_MEMBERS_CHUNK")).toBe(true);
    expect(isTier2Dispatch("GUILD_AUDIT_LOG_ENTRY_CREATE")).toBe(true);
    expect(isTier2Dispatch("INVITE_CREATE")).toBe(false);
    expect(isStructuralDispatch("CHANNEL_CREATE")).toBe(true);
    expect(isStructuralDispatch("MESSAGE_REACTION_ADD")).toBe(true);
    expect(TIER2_DISPATCH_NAMES).toContain("CHANNEL_PINS_UPDATE");
    expect(TIER2_DISPATCH_NAMES).toContain("THREAD_MEMBERS_UPDATE");
  });

  it("classifies Tier 3 invite/integration/stage/event/typing/webhook/emoji events", () => {
    expect(isTier3Dispatch("INVITE_CREATE")).toBe(true);
    expect(isTier3Dispatch("INTEGRATION_UPDATE")).toBe(true);
    expect(isTier3Dispatch("STAGE_INSTANCE_CREATE")).toBe(true);
    expect(isTier3Dispatch("GUILD_SCHEDULED_EVENT_USER_ADD")).toBe(true);
    expect(isTier3Dispatch("TYPING_START")).toBe(true);
    expect(isTier3Dispatch("WEBHOOKS_UPDATE")).toBe(true);
    expect(isTier3Dispatch("GUILD_EMOJIS_UPDATE")).toBe(true);
    expect(isTier3Dispatch("GUILD_STICKERS_UPDATE")).toBe(true);
    expect(isTier3Dispatch("ENTITLEMENT_CREATE")).toBe(false);
    expect(isStructuralDispatch("INVITE_CREATE")).toBe(true);
    expect(TIER3_DISPATCH_NAMES).toContain("GUILD_INTEGRATIONS_UPDATE");
    expect(TIER3_DISPATCH_NAMES).toContain("GUILD_SCHEDULED_EVENT_DELETE");
  });

  it("classifies Tier 4 automod/soundboard/entitlement/permissions events", () => {
    expect(isTier4Dispatch("AUTO_MODERATION_RULE_CREATE")).toBe(true);
    expect(isTier4Dispatch("AUTO_MODERATION_ACTION_EXECUTION")).toBe(true);
    expect(isTier4Dispatch("GUILD_SOUNDBOARD_SOUND_CREATE")).toBe(true);
    expect(isTier4Dispatch("SOUNDBOARD_SOUNDS")).toBe(true);
    expect(isTier4Dispatch("ENTITLEMENT_CREATE")).toBe(true);
    expect(isTier4Dispatch("SUBSCRIPTION_UPDATE")).toBe(true);
    expect(isTier4Dispatch("APPLICATION_COMMAND_PERMISSIONS_UPDATE")).toBe(true);
    expect(isTier4Dispatch("USER_UPDATE")).toBe(true);
    expect(isTier4Dispatch("VOICE_CHANNEL_EFFECT_SEND")).toBe(true);
    expect(isTier4Dispatch("RATE_LIMITED")).toBe(true);
    expect(isTier4Dispatch("RESUMED")).toBe(true);
    expect(isTier4Dispatch("INVITE_CREATE")).toBe(false);
    expect(isStructuralDispatch("ENTITLEMENT_CREATE")).toBe(true);
    expect(TIER4_DISPATCH_NAMES).toContain("GUILD_SOUNDBOARD_SOUNDS_UPDATE");
    expect(TIER4_DISPATCH_NAMES).toContain("SUBSCRIPTION_DELETE");
  });

  it("has no remaining passthrough catalog events after Tier 4", () => {
    const passthrough = buildDispatchCatalog().filter((e) => e.tier === "passthrough");
    expect(passthrough).toEqual([]);
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

  it("normalizes MESSAGE_UPDATE without author for edit-tracking", () => {
    const msg = messageFromDispatch({
      id: "1",
      content: "!ping",
      channel_id: "c1",
    });
    expect(msg).toEqual({
      id: "1",
      content: "!ping",
      channelId: "c1",
      guildId: null,
      author: { id: "" },
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

  it("camelizes Tier 2 fixture payloads per event group", () => {
    for (const [dispatchName, raw] of Object.entries(TIER2_FIXTURES)) {
      expect(normalizeDispatch(dispatchName, raw)).toEqual(camelizeDispatch(raw));
    }
  });

  it("camelizes every catalog Tier 2 dispatch name", () => {
    const raw = { guild_id: "g1", channel_id: "c1", parent_id: null };
    for (const name of TIER2_DISPATCH_NAMES) {
      expect(normalizeDispatch(name, raw)).toEqual(camelizeDispatch(raw));
    }
  });

  it("camelizes Tier 3 fixture payloads per event group", () => {
    for (const [dispatchName, raw] of Object.entries(TIER3_FIXTURES)) {
      expect(normalizeDispatch(dispatchName, raw)).toEqual(camelizeDispatch(raw));
    }
  });

  it("camelizes every catalog Tier 3 dispatch name", () => {
    const raw = { guild_id: "g1", channel_id: "c1", user_id: "u1" };
    for (const name of TIER3_DISPATCH_NAMES) {
      expect(normalizeDispatch(name, raw)).toEqual(camelizeDispatch(raw));
    }
  });

  it("camelizes Tier 4 fixture payloads per event group", () => {
    for (const [dispatchName, raw] of Object.entries(TIER4_FIXTURES)) {
      expect(normalizeDispatch(dispatchName, raw)).toEqual(camelizeDispatch(raw));
    }
  });

  it("camelizes every catalog Tier 4 dispatch name", () => {
    const raw = { guild_id: "g1", sku_id: "sku1", user_id: "u1" };
    for (const name of TIER4_DISPATCH_NAMES) {
      expect(normalizeDispatch(name, raw)).toEqual(camelizeDispatch(raw));
    }
  });

  it("supports raw mode escape hatch for Tier 1–4", () => {
    const tier1 = TIER1_FIXTURES.GUILD_CREATE;
    expect(normalizeDispatch("GUILD_CREATE", tier1, { mode: "raw" })).toBe(tier1);
    const tier2 = TIER2_FIXTURES.CHANNEL_CREATE;
    expect(normalizeDispatch("CHANNEL_CREATE", tier2, { mode: "raw" })).toBe(tier2);
    const tier3 = TIER3_FIXTURES.INVITE_CREATE;
    expect(normalizeDispatch("INVITE_CREATE", tier3, { mode: "raw" })).toBe(tier3);
    const tier4 = TIER4_FIXTURES.ENTITLEMENT_CREATE;
    expect(normalizeDispatch("ENTITLEMENT_CREATE", tier4, { mode: "raw" })).toBe(tier4);
  });
});
