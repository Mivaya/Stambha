import type { RestPort } from "@stambha/core";

export interface ApiUser {
  id: string;
  username?: string;
  global_name?: string | null;
  avatar?: string | null;
  bot?: boolean;
}

export interface GuildSummary {
  id: string;
  name: string;
  owner_id: string;
  member_count?: number;
  icon?: string | null;
}

export interface GuildMember {
  user?: ApiUser;
  permissions?: string;
  roles?: string[];
}

export interface ChannelSummary {
  id: string;
  type: number;
  name?: string;
  guild_id?: string;
}

export interface MessageDetail {
  id: string;
  content: string;
  channel_id: string;
  guild_id?: string;
  author: ApiUser;
  message_reference?: { message_id: string; channel_id?: string };
  mentions?: { id: string; bot?: boolean }[];
  embeds?: unknown[];
}

export interface ChannelMessageBody {
  content?: string;
  embeds?: unknown[];
  message_reference?: { message_id: string; channel_id?: string };
}

async function tryRequest<T>(
  rest: RestPort,
  req: Parameters<RestPort["request"]>[0],
): Promise<T | null> {
  try {
    return await rest.request<T>(req);
  } catch {
    return null;
  }
}

export async function fetchUser(rest: RestPort, userId: string): Promise<ApiUser | null> {
  return tryRequest<ApiUser>(rest, { method: "GET", route: `/users/${userId}` });
}

export async function fetchGuild(rest: RestPort, guildId: string): Promise<GuildSummary | null> {
  return tryRequest<GuildSummary>(rest, { method: "GET", route: `/guilds/${guildId}` });
}

export async function fetchGuildMember(
  rest: RestPort,
  guildId: string,
  userId: string,
): Promise<GuildMember | null> {
  return tryRequest<GuildMember>(rest, {
    method: "GET",
    route: `/guilds/${guildId}/members/${userId}`,
  });
}

export async function fetchChannel(
  rest: RestPort,
  channelId: string,
): Promise<ChannelSummary | null> {
  return tryRequest<ChannelSummary>(rest, { method: "GET", route: `/channels/${channelId}` });
}

export async function fetchChannelMessage(
  rest: RestPort,
  channelId: string,
  messageId: string,
): Promise<MessageDetail | null> {
  return tryRequest<MessageDetail>(rest, {
    method: "GET",
    route: `/channels/${channelId}/messages/${messageId}`,
  });
}

export async function sendChannelMessage(
  rest: RestPort,
  channelId: string,
  body: ChannelMessageBody,
): Promise<{ id: string }> {
  return rest.request<{ id: string }>({
    method: "POST",
    route: `/channels/${channelId}/messages`,
    body,
  });
}

export async function editChannelMessage(
  rest: RestPort,
  channelId: string,
  messageId: string,
  body: { content?: string; embeds?: unknown[] },
): Promise<void> {
  await rest.request({
    method: "PATCH",
    route: `/channels/${channelId}/messages/${messageId}`,
    body,
  });
}

export async function deleteChannelMessage(
  rest: RestPort,
  channelId: string,
  messageId: string,
): Promise<void> {
  await rest.request({
    method: "DELETE",
    route: `/channels/${channelId}/messages/${messageId}`,
  });
}

export function userDisplayName(user: ApiUser): string {
  return user.global_name ?? user.username ?? user.id;
}

export function userAvatarUrl(user: { id: string; avatar?: string | null }, size = 128): string {
  if (user.avatar) {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=${size}`;
  }
  const index = Number((BigInt(user.id) >> 22n) % 6n);
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

export function memberHasPermission(member: GuildMember, bit: bigint): boolean {
  if (!member.permissions) return false;
  const have = BigInt(member.permissions);
  if ((have & 0x8n) !== 0n) return true;
  return (have & bit) === bit;
}

export const PermissionBits = {
  Administrator: 0x8n,
  ManageGuild: 0x20n,
  ManageMessages: 0x2000n,
  BanMembers: 0x4n,
  ModerateMembers: 0x100000000000n,
  SendMessages: 0x800n,
  EmbedLinks: 0x4000n,
} as const;

export const ChannelType = {
  GuildText: 0,
  GuildAnnouncement: 5,
} as const;

export interface GuildRole {
  id: string;
  name: string;
  color: number;
  position: number;
  permissions: string;
}

export async function fetchGuildRoles(rest: RestPort, guildId: string): Promise<GuildRole[]> {
  return (
    (await tryRequest<GuildRole[]>(rest, { method: "GET", route: `/guilds/${guildId}/roles` })) ??
    []
  );
}

export async function fetchGuildChannels(
  rest: RestPort,
  guildId: string,
): Promise<ChannelSummary[]> {
  return (
    (await tryRequest<ChannelSummary[]>(rest, {
      method: "GET",
      route: `/guilds/${guildId}/channels`,
    })) ?? []
  );
}

export async function addGuildMemberRole(
  rest: RestPort,
  guildId: string,
  userId: string,
  roleId: string,
): Promise<void> {
  await rest.request({
    method: "PUT",
    route: `/guilds/${guildId}/members/${userId}/roles/${roleId}`,
  });
}

export async function timeoutGuildMember(
  rest: RestPort,
  guildId: string,
  userId: string,
  durationMs: number,
  reason?: string,
): Promise<void> {
  const until = new Date(Date.now() + durationMs).toISOString();
  await rest.request({
    method: "PATCH",
    route: `/guilds/${guildId}/members/${userId}`,
    body: {
      communication_disabled_until: until,
      ...(reason ? { reason } : {}),
    },
  });
}
