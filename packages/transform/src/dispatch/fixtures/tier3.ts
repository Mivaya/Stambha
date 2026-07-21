/** Minimal Discord API v10 payloads for Tier 3 golden tests (snake_case wire shape). */
export const TIER3_FIXTURES = {
  INVITE_CREATE: {
    code: "abc123",
    guild_id: "g1",
    channel_id: "c1",
    inviter: { id: "u1", username: "alice" },
    max_age: 86400,
    max_uses: 0,
    temporary: false,
  },
  INTEGRATION_CREATE: {
    id: "i1",
    name: "Twitch",
    type: "twitch",
    guild_id: "g1",
    enabled: true,
    account: { id: "tw1", name: "streamer" },
  },
  STAGE_INSTANCE_CREATE: {
    id: "s1",
    guild_id: "g1",
    channel_id: "c1",
    topic: "AMA",
    privacy_level: 2,
  },
  GUILD_SCHEDULED_EVENT_CREATE: {
    id: "e1",
    guild_id: "g1",
    name: "Launch",
    scheduled_start_time: "2026-08-01T00:00:00.000Z",
    privacy_level: 2,
    status: 1,
    entity_type: 3,
    creator_id: "u1",
  },
  TYPING_START: {
    channel_id: "c1",
    guild_id: "g1",
    user_id: "u1",
    timestamp: 1_700_000_000,
  },
  WEBHOOKS_UPDATE: {
    guild_id: "g1",
    channel_id: "c1",
  },
  GUILD_EMOJIS_UPDATE: {
    guild_id: "g1",
    emojis: [{ id: "e1", name: "wave", animated: false }],
  },
} as const;
