/** Minimal Discord API v10 payloads for Tier 1 golden tests (snake_case wire shape). */
export const TIER1_FIXTURES = {
  MESSAGE_REACTION_ADD: {
    user_id: "u1",
    channel_id: "c1",
    message_id: "m1",
    guild_id: "g1",
    emoji: { id: "e1", name: "wave" },
    member: { user: { id: "u1", username: "alice" } },
  },
  GUILD_CREATE: {
    id: "g1",
    name: "Test Guild",
    owner_id: "u1",
    roles: [{ id: "r1", name: "@everyone" }],
  },
  GUILD_MEMBER_ADD: {
    user: { id: "u2", username: "bob" },
    guild_id: "g1",
    roles: ["r1"],
    joined_at: "2026-01-01T00:00:00.000Z",
  },
  VOICE_STATE_UPDATE: {
    guild_id: "g1",
    channel_id: "vc1",
    user_id: "u1",
    session_id: "sess1",
    deaf: false,
    mute: false,
    self_deaf: false,
    self_mute: false,
  },
  MESSAGE_DELETE: {
    id: "m1",
    channel_id: "c1",
    guild_id: "g1",
  },
} as const;
