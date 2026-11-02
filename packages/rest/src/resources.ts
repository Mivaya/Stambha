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

export interface ChannelMessageAttachment {
  id: string | number;
  filename?: string;
  title?: string;
  description?: string;
  content_type?: string;
  duration_secs?: number;
  waveform?: string;
  flags?: number;
}

export interface ChannelMessageBody {
  content?: string;
  embeds?: unknown[];
  /** Action rows / Components V2 layout. */
  components?: unknown[];
  /** Discord message flags (e.g. IS_COMPONENTS_V2). */
  flags?: number;
  /** Attachment descriptors (pair with multipart `files` on the REST request). */
  attachments?: ChannelMessageAttachment[];
  /** Discord poll create request (snake_case). Prefer `createPoll()` from `./polls.js`. */
  poll?: unknown;
  message_reference?: { message_id: string; channel_id?: string };
}

/** Partial user on application owner / team member payloads. */
export interface ApplicationOwner {
  id: string;
  username?: string;
  global_name?: string | null;
  avatar?: string | null;
  discriminator?: string;
  bot?: boolean;
}

export interface ApplicationTeamMember {
  membership_state: number;
  team_id: string;
  user: ApplicationOwner;
  role?: string;
}

export interface ApplicationTeam {
  id: string;
  name: string;
  icon: string | null;
  owner_user_id: string;
  members?: ApplicationTeamMember[];
}

/** Bot application from `GET /oauth2/applications/@me`. */
export interface ApiApplication {
  id: string;
  name: string;
  icon: string | null;
  description: string;
  bot_public: boolean;
  bot_require_code_grant: boolean;
  verify_key: string;
  owner?: ApplicationOwner;
  team: ApplicationTeam | null;
  flags?: number;
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

/** Partial guild from `GET /users/@me/guilds`. */
export interface CurrentUserGuild {
  id: string;
  name: string;
  icon?: string | null;
  owner?: boolean;
  permissions?: string;
  features?: string[];
}

export interface FetchCurrentUserGuildsQuery {
  /** Before guild id (pagination). */
  before?: string;
  /** After guild id (pagination). */
  after?: string;
  /** Max results (1–200). */
  limit?: number;
  /**
   * Required for **large bot sharding**: guilds stored on that shard index
   * (`0` … `max_concurrency - 1` from Get Gateway Bot). Omitting it returns 400
   * for large-sharded apps.
   */
  shard?: number;
  /** With user OAuth, include approximate member/presence counts when true. */
  withCounts?: boolean;
}

/**
 * `GET /users/@me/guilds` — bot token or OAuth user bearer via the REST port.
 * Pass {@link FetchCurrentUserGuildsQuery.shard} when using large bot sharding.
 */
export async function fetchCurrentUserGuilds(
  rest: RestPort,
  query: FetchCurrentUserGuildsQuery = {},
): Promise<CurrentUserGuild[]> {
  const params = new URLSearchParams();
  if (query.before !== undefined) params.set("before", query.before);
  if (query.after !== undefined) params.set("after", query.after);
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.shard !== undefined) params.set("shard", String(query.shard));
  if (query.withCounts !== undefined) params.set("with_counts", String(query.withCounts));
  const qs = params.toString();
  const route = qs ? `/users/@me/guilds?${qs}` : "/users/@me/guilds";
  return (await tryRequest<CurrentUserGuild[]>(rest, { method: "GET", route })) ?? [];
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
  body: ChannelMessageBody,
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

/** Show the bot typing indicator in a channel (`POST /channels/{id}/typing`). */
export async function triggerTyping(rest: RestPort, channelId: string): Promise<void> {
  await rest.request({
    method: "POST",
    route: `/channels/${channelId}/typing`,
  });
}

/** Current bot application, including owner and team when present. */
export async function fetchApplication(rest: RestPort): Promise<ApiApplication | null> {
  return tryRequest<ApiApplication>(rest, {
    method: "GET",
    route: "/oauth2/applications/@me",
  });
}

/** Discord permissions response (`{ permissions: string }`). */
export interface PermissionsResponse {
  permissions: string;
}

export interface ChannelPermissionsQuery {
  /**
   * When true (Discord default), apply implicit masking for missing `VIEW_CHANNEL`
   * or voice/stage `CONNECT`. Pass `false` to skip masking.
   */
  implicit?: boolean;
}

/** `GET /guilds/{guild.id}/members/{user.id}/permissions` */
export async function fetchGuildMemberPermissions(
  rest: RestPort,
  guildId: string,
  userId: string,
): Promise<PermissionsResponse | null> {
  return tryRequest<PermissionsResponse>(rest, {
    method: "GET",
    route: `/guilds/${guildId}/members/${userId}/permissions`,
  });
}

/** `GET /guilds/{guild.id}/roles/{role.id}/permissions` */
export async function fetchGuildRolePermissions(
  rest: RestPort,
  guildId: string,
  roleId: string,
): Promise<PermissionsResponse | null> {
  return tryRequest<PermissionsResponse>(rest, {
    method: "GET",
    route: `/guilds/${guildId}/roles/${roleId}/permissions`,
  });
}

/** `GET /channels/{channel.id}/members/{user.id}/permissions` */
export async function fetchChannelMemberPermissions(
  rest: RestPort,
  channelId: string,
  userId: string,
  query: ChannelPermissionsQuery = {},
): Promise<PermissionsResponse | null> {
  const params = new URLSearchParams();
  if (query.implicit !== undefined) params.set("implicit", String(query.implicit));
  const qs = params.toString();
  const route = qs
    ? `/channels/${channelId}/members/${userId}/permissions?${qs}`
    : `/channels/${channelId}/members/${userId}/permissions`;
  return tryRequest<PermissionsResponse>(rest, { method: "GET", route });
}

/** `GET /channels/{channel.id}/roles/{role.id}/permissions` */
export async function fetchChannelRolePermissions(
  rest: RestPort,
  channelId: string,
  roleId: string,
  query: ChannelPermissionsQuery = {},
): Promise<PermissionsResponse | null> {
  const params = new URLSearchParams();
  if (query.implicit !== undefined) params.set("implicit", String(query.implicit));
  const qs = params.toString();
  const route = qs
    ? `/channels/${channelId}/roles/${roleId}/permissions?${qs}`
    : `/channels/${channelId}/roles/${roleId}/permissions`;
  return tryRequest<PermissionsResponse>(rest, { method: "GET", route });
}

/**
 * Interaction `app_permissions` is the bot's permissions in the interaction channel
 * (string bitfield). Prefer Discord's computed permission endpoints when you need
 * guild/channel member or role permissions outside an interaction.
 */
export function parseAppPermissions(appPermissions: string | null | undefined): bigint {
  if (!appPermissions) return 0n;
  try {
    return BigInt(appPermissions);
  } catch {
    return 0n;
  }
}

/** Role id → member count (`GET /guilds/{guild.id}/roles/member-counts`). Excludes `@everyone`. */
export type GuildRoleMemberCounts = Record<string, number>;

export async function fetchGuildRoleMemberCounts(
  rest: RestPort,
  guildId: string,
): Promise<GuildRoleMemberCounts> {
  return (
    (await tryRequest<GuildRoleMemberCounts>(rest, {
      method: "GET",
      route: `/guilds/${guildId}/roles/member-counts`,
    })) ?? {}
  );
}

export interface ActivityLocation {
  id: string;
  kind: "gc" | "pc" | string;
  channel_id: string;
  guild_id?: string | null;
}

export interface ActivityInstance {
  application_id: string;
  instance_id: string;
  launch_id: string;
  location: ActivityLocation;
  users: string[];
}

/** `GET /applications/{application.id}/activity-instances/{instance_id}` */
export async function fetchActivityInstance(
  rest: RestPort,
  applicationId: string,
  instanceId: string,
): Promise<ActivityInstance | null> {
  return tryRequest<ActivityInstance>(rest, {
    method: "GET",
    route: `/applications/${applicationId}/activity-instances/${instanceId}`,
  });
}

/** Discord attachment flag: voice message (`1 << 13`). */
export const VoiceMessageAttachmentFlag = 1 << 13;

export interface VoiceMessageFile {
  /** Ogg Opus (or Discord-accepted) audio bytes. */
  data: Uint8Array | Blob;
  filename?: string;
  contentType?: string;
  durationSecs: number;
  /** Base64 waveform samples. */
  waveform: string;
  description?: string;
}

/**
 * Send a Discord voice message (`POST /channels/{id}/messages` + multipart).
 * Builds the voice-message attachment descriptor and uploads `file` as `files[0]`.
 */
export async function sendVoiceMessage(
  rest: RestPort,
  channelId: string,
  file: VoiceMessageFile,
): Promise<{ id: string }> {
  const filename = file.filename ?? "voice-message.ogg";
  const attachment: ChannelMessageAttachment = {
    id: 0,
    filename,
    duration_secs: file.durationSecs,
    waveform: file.waveform,
    flags: VoiceMessageAttachmentFlag,
  };
  if (file.description !== undefined) attachment.description = file.description;

  return rest.request<{ id: string }>({
    method: "POST",
    route: `/channels/${channelId}/messages`,
    body: { attachments: [attachment] },
    files: [
      {
        name: "files[0]",
        filename,
        data: file.data,
        ...(file.contentType !== undefined ? { contentType: file.contentType } : {}),
      },
    ],
  });
}
