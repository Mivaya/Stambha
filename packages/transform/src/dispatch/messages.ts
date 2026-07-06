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
  const author = userFromDiscord(m.author);
  if (!author || typeof m.content !== "string") return null;
  return {
    id: m.id ?? null,
    content: m.content,
    channelId: m.channel_id ?? null,
    guildId: m.guild_id ?? null,
    author,
  };
}

export function readyFromDispatch(data: unknown): {
  user?: { id: string; username?: string };
  sessionId?: string;
  shard?: [number, number];
} {
  const r = data as DiscordReadyPayload;
  const user = userFromDiscord(r.user);
  return {
    ...(user ? { user } : {}),
    ...(r.session_id !== undefined ? { sessionId: r.session_id } : {}),
    ...(r.shard !== undefined ? { shard: r.shard } : {}),
  };
}
