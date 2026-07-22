import type { StambhaMessage } from "../shapes.js";

interface DiscordUserPayload {
  id?: string;
  bot?: boolean;
  username?: string;
}

interface DiscordMessagePayload {
  id?: string;
  content?: string;
  channel_id?: string;
  guild_id?: string;
  author?: DiscordUserPayload;
}

interface DiscordReadyPayload {
  user?: DiscordUserPayload;
  session_id?: string;
  shard?: [number, number];
  /** Unavailable guild stubs present on READY. */
  guilds?: readonly { id?: string; unavailable?: boolean }[];
}

function userFromDiscord(user: DiscordUserPayload | undefined) {
  if (!user?.id) return null;
  return {
    id: user.id,
    ...(user.bot !== undefined ? { bot: user.bot } : {}),
    ...(user.username !== undefined ? { username: user.username } : {}),
  };
}

export function messageFromDispatch(data: unknown): StambhaMessage | null {
  const m = data as DiscordMessagePayload;
  if (typeof m.content !== "string") return null;
  const author = userFromDiscord(m.author);
  // MESSAGE_UPDATE may omit author; allow id+content through for edit-tracking.
  if (!author && !m.id) return null;
  return {
    id: m.id ?? null,
    content: m.content,
    channelId: m.channel_id ?? null,
    guildId: m.guild_id ?? null,
    author: author ?? { id: "" },
  };
}

/** Extract guild ids from a READY `guilds` array (unavailable stubs). */
export function guildIdsFromReady(data: unknown): string[] {
  const guilds = (data as DiscordReadyPayload)?.guilds;
  if (!Array.isArray(guilds)) return [];
  const ids: string[] = [];
  for (const g of guilds) {
    if (g && typeof g.id === "string" && g.id.length > 0) ids.push(g.id);
  }
  return ids;
}

export function readyFromDispatch(data: unknown): {
  user?: { id: string; username?: string };
  sessionId?: string;
  shard?: [number, number];
  /** Guild ids from READY unavailable stubs (startup backfill set). */
  guildIds?: string[];
} {
  const r = data as DiscordReadyPayload;
  const user = userFromDiscord(r.user);
  const guildIds = guildIdsFromReady(data);
  return {
    ...(user ? { user } : {}),
    ...(r.session_id !== undefined ? { sessionId: r.session_id } : {}),
    ...(r.shard !== undefined ? { shard: r.shard } : {}),
    ...(guildIds.length > 0 ? { guildIds } : {}),
  };
}
