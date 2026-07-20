import { describe, expect, it } from "vitest";
import { TIER1_FIXTURES } from "./fixtures/tier1.js";
import { TIER2_FIXTURES } from "./fixtures/tier2.js";
import {
  isChannelCreatePayload,
  isGuildAuditLogEntryCreatePayload,
  isGuildBanAddPayload,
  isGuildCreatePayload,
  isGuildMemberAddPayload,
  isGuildMembersChunkPayload,
  isGuildRoleCreatePayload,
  isMessageReactionAddPayload,
  isThreadCreatePayload,
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

  it("recognizes camelized Tier 2 payloads per event group", () => {
    expect(isChannelCreatePayload(camelizeDispatch(TIER2_FIXTURES.CHANNEL_CREATE))).toBe(true);
    expect(isThreadCreatePayload(camelizeDispatch(TIER2_FIXTURES.THREAD_CREATE))).toBe(true);
    expect(isGuildRoleCreatePayload(camelizeDispatch(TIER2_FIXTURES.GUILD_ROLE_CREATE))).toBe(true);
    expect(isGuildBanAddPayload(camelizeDispatch(TIER2_FIXTURES.GUILD_BAN_ADD))).toBe(true);
    expect(isGuildMembersChunkPayload(camelizeDispatch(TIER2_FIXTURES.GUILD_MEMBERS_CHUNK))).toBe(
      true,
    );
    expect(
      isGuildAuditLogEntryCreatePayload(camelizeDispatch(TIER2_FIXTURES.GUILD_AUDIT_LOG_ENTRY_CREATE)),
    ).toBe(true);
  });

  it("rejects raw snake_case Tier 2 channel payloads", () => {
    expect(isChannelCreatePayload(TIER2_FIXTURES.CHANNEL_CREATE)).toBe(false);
  });
});
