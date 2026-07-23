import { describe, expect, it } from "vitest";
import { camelizeDispatch } from "./camelize.js";
import { TIER1_FIXTURES } from "./fixtures/tier1.js";
import { TIER2_FIXTURES } from "./fixtures/tier2.js";
import { TIER3_FIXTURES } from "./fixtures/tier3.js";
import { TIER4_FIXTURES } from "./fixtures/tier4.js";
import {
  isApplicationCommandPermissionsUpdatePayload,
  isAutoModerationActionExecutionPayload,
  isAutoModerationRuleCreatePayload,
  isChannelCreatePayload,
  isEntitlementCreatePayload,
  isGuildAuditLogEntryCreatePayload,
  isGuildBanAddPayload,
  isGuildCreatePayload,
  isGuildEmojisUpdatePayload,
  isGuildMemberAddPayload,
  isGuildMembersChunkPayload,
  isGuildRoleCreatePayload,
  isGuildScheduledEventCreatePayload,
  isGuildSoundboardSoundCreatePayload,
  isIntegrationCreatePayload,
  isInviteCreatePayload,
  isMessagePollVotePayload,
  isMessageReactionAddPayload,
  isStageInstanceCreatePayload,
  isSubscriptionCreatePayload,
  isThreadCreatePayload,
  isTypingStartPayload,
  isUserUpdatePayload,
  isVoiceChannelEffectSendPayload,
  isVoiceStateUpdatePayload,
  isWebhooksUpdatePayload,
} from "./guards.js";

describe("dispatch/guards", () => {
  it("recognizes camelized Tier 1 reaction payloads", () => {
    const payload = camelizeDispatch(TIER1_FIXTURES.MESSAGE_REACTION_ADD);
    expect(isMessageReactionAddPayload(payload)).toBe(true);
    if (isMessageReactionAddPayload(payload)) {
      expect(payload.guildId).toBe("g1");
      expect(payload.emoji.name).toBe("wave");
    }
  });

  it("recognizes camelized poll vote payloads", () => {
    const payload = camelizeDispatch({
      user_id: "u1",
      channel_id: "c1",
      message_id: "m1",
      guild_id: "g1",
      answer_id: 2,
    });
    expect(isMessagePollVotePayload(payload)).toBe(true);
    if (isMessagePollVotePayload(payload)) {
      expect(payload.answerId).toBe(2);
      expect(payload.userId).toBe("u1");
    }
    expect(
      isMessagePollVotePayload({
        user_id: "u1",
        channel_id: "c1",
        message_id: "m1",
        answer_id: 1,
      }),
    ).toBe(false);
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

  it("recognizes camelized Tier 3 payloads per event group", () => {
    expect(isInviteCreatePayload(camelizeDispatch(TIER3_FIXTURES.INVITE_CREATE))).toBe(true);
    expect(isIntegrationCreatePayload(camelizeDispatch(TIER3_FIXTURES.INTEGRATION_CREATE))).toBe(
      true,
    );
    expect(
      isStageInstanceCreatePayload(camelizeDispatch(TIER3_FIXTURES.STAGE_INSTANCE_CREATE)),
    ).toBe(true);
    expect(
      isGuildScheduledEventCreatePayload(
        camelizeDispatch(TIER3_FIXTURES.GUILD_SCHEDULED_EVENT_CREATE),
      ),
    ).toBe(true);
    expect(isTypingStartPayload(camelizeDispatch(TIER3_FIXTURES.TYPING_START))).toBe(true);
    expect(isWebhooksUpdatePayload(camelizeDispatch(TIER3_FIXTURES.WEBHOOKS_UPDATE))).toBe(true);
    expect(isGuildEmojisUpdatePayload(camelizeDispatch(TIER3_FIXTURES.GUILD_EMOJIS_UPDATE))).toBe(
      true,
    );
  });

  it("rejects raw snake_case Tier 3 invite payloads", () => {
    expect(isInviteCreatePayload(TIER3_FIXTURES.INVITE_CREATE)).toBe(false);
  });

  it("recognizes camelized Tier 4 payloads per event group", () => {
    expect(
      isApplicationCommandPermissionsUpdatePayload(
        camelizeDispatch(TIER4_FIXTURES.APPLICATION_COMMAND_PERMISSIONS_UPDATE),
      ),
    ).toBe(true);
    expect(
      isAutoModerationRuleCreatePayload(camelizeDispatch(TIER4_FIXTURES.AUTO_MODERATION_RULE_CREATE)),
    ).toBe(true);
    expect(
      isAutoModerationActionExecutionPayload(
        camelizeDispatch(TIER4_FIXTURES.AUTO_MODERATION_ACTION_EXECUTION),
      ),
    ).toBe(true);
    expect(
      isGuildSoundboardSoundCreatePayload(
        camelizeDispatch(TIER4_FIXTURES.GUILD_SOUNDBOARD_SOUND_CREATE),
      ),
    ).toBe(true);
    expect(isEntitlementCreatePayload(camelizeDispatch(TIER4_FIXTURES.ENTITLEMENT_CREATE))).toBe(
      true,
    );
    expect(isSubscriptionCreatePayload(camelizeDispatch(TIER4_FIXTURES.SUBSCRIPTION_CREATE))).toBe(
      true,
    );
    expect(isUserUpdatePayload(camelizeDispatch(TIER4_FIXTURES.USER_UPDATE))).toBe(true);
    expect(
      isVoiceChannelEffectSendPayload(camelizeDispatch(TIER4_FIXTURES.VOICE_CHANNEL_EFFECT_SEND)),
    ).toBe(true);
  });

  it("rejects raw snake_case Tier 4 entitlement payloads", () => {
    expect(isEntitlementCreatePayload(TIER4_FIXTURES.ENTITLEMENT_CREATE)).toBe(false);
  });
});
