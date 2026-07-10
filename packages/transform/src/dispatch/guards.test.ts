import { describe, expect, it } from "vitest";
import { TIER1_FIXTURES } from "./fixtures/tier1.js";
import {
  isGuildCreatePayload,
  isGuildMemberAddPayload,
  isMessageReactionAddPayload,
  isVoiceStateUpdatePayload,
} from "./guards.js";
import { camelizeDispatch } from "./camelize.js";

describe("dispatch/guards", () => {
  it("recognizes camelized Tier 1 reaction payloads", () => {
    const payload = camelizeDispatch(TIER1_FIXTURES.MESSAGE_REACTION_ADD);
    expect(isMessageReactionAddPayload(payload)).toBe(true);
    if (isMessageReactionAddPayload(payload)) {
      expect(payload.guildId).toBe("g1");
      expect(payload.emoji.name).toBe("wave");
    }
  });

  it("recognizes camelized guild member add payloads", () => {
    const payload = camelizeDispatch(TIER1_FIXTURES.GUILD_MEMBER_ADD);
    expect(isGuildMemberAddPayload(payload)).toBe(true);
  });

  it("recognizes camelized guild create payloads", () => {
    const payload = camelizeDispatch(TIER1_FIXTURES.GUILD_CREATE);
    expect(isGuildCreatePayload(payload)).toBe(true);
  });

  it("recognizes camelized voice state payloads", () => {
    const payload = camelizeDispatch(TIER1_FIXTURES.VOICE_STATE_UPDATE);
    expect(isVoiceStateUpdatePayload(payload)).toBe(true);
  });

  it("rejects raw snake_case reaction payloads", () => {
    expect(isMessageReactionAddPayload(TIER1_FIXTURES.MESSAGE_REACTION_ADD)).toBe(false);
  });
});
