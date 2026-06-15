import type { StambhaMessage, StambhaSlashInteraction } from "@stambha/transform";

/** `MESSAGE_CREATE` → `messageCreate` (discord.js-style hub event names). */
export function gatewayEventToHubName(dispatchName: string): string {
  return dispatchName.toLowerCase().replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

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

interface DiscordInteractionPayload {
  id?: string;
  token?: string;
  type?: number;
  data?: { name?: string };
  user?: DiscordUserPayload;
  member?: { user?: DiscordUserPayload };
  guild_id?: string;
  channel_id?: string;
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

export function interactionFromDispatch(
  data: unknown,
): (StambhaSlashInteraction & { commandName?: string }) | null {
  const i = data as DiscordInteractionPayload;
  if (i.type !== 2) return null;
  const user = userFromDiscord(i.member?.user ?? i.user);
  if (!user) return null;
  const commandName = i.data?.name;
  return {
    id: i.id ?? null,
    token: i.token ?? null,
    user,
    guildId: i.guild_id ?? null,
    channelId: i.channel_id ?? null,
    ...(commandName !== undefined ? { commandName } : {}),
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

/**
 * Normalize a gateway DISPATCH payload for {@link GatewayEventHub.emit}.
 * Routing-critical events use Stambha shapes; others pass through raw `d`.
 */
export function normalizeDispatch(dispatchName: string, data: unknown): unknown {
  switch (dispatchName) {
    case "MESSAGE_CREATE":
    case "MESSAGE_UPDATE":
      return messageFromDispatch(data) ?? data;
    case "INTERACTION_CREATE":
      return interactionFromDispatch(data) ?? data;
    case "READY":
      return readyFromDispatch(data);
    default:
      return data;
  }
}
