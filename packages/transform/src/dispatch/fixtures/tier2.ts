/** Minimal Discord API v10 payloads for Tier 2 golden tests (snake_case wire shape). */
export const TIER2_FIXTURES = {
  CHANNEL_CREATE: {
    id: "c1",
    type: 0,
    guild_id: "g1",
    name: "general",
    parent_id: null,
    permission_overwrites: [],
  },
  THREAD_CREATE: {
    id: "t1",
    type: 11,
    guild_id: "g1",
    name: "thread",
    parent_id: "c1",
    owner_id: "u1",
    thread_metadata: { archived: false, auto_archive_duration: 60 },
  },
  GUILD_ROLE_CREATE: {
    guild_id: "g1",
    role: { id: "r1", name: "mods", permissions: "0", position: 1 },
  },
  GUILD_BAN_ADD: {
    guild_id: "g1",
    user: { id: "u2", username: "banned" },
  },
  GUILD_MEMBERS_CHUNK: {
    guild_id: "g1",
    members: [{ user: { id: "u1", username: "alice" }, roles: ["r1"] }],
    chunk_index: 0,
    chunk_count: 1,
    not_found: [],
  },
  GUILD_AUDIT_LOG_ENTRY_CREATE: {
    id: "a1",
    guild_id: "g1",
    action_type: 1,
    user_id: "u1",
    target_id: "u2",
    changes: [{ key: "nick", old_value: "a", new_value: "b" }],
  },
} as const;
