import type { ChannelType, CommandContextMeta, SlashOption } from "@stambha/core";
import type { StambhaMessage, StambhaSlashInteraction, StambhaUser } from "./shapes.js";
import { warnLegacyLibraryAdapter } from "./deprecation.js";

/** @deprecated Removed in v1.5.0 — use {@link StambhaUser} and native gateway dispatch. */
export interface DiscordJsUserLike {
  id: string;
  bot?: boolean;
  username?: string;
}

/** @deprecated Removed in v1.5.0 */
export interface DiscordJsChannelLike {
  type?: number;
  nsfw?: boolean;
  isDMBased?: () => boolean;
  isTextBased?: () => boolean;
}

/** @deprecated Removed in v1.5.0 */
export interface DiscordJsMemberLike {
  permissions?: { bitfield: bigint };
  permissionsIn?: (channelId: string) => { bitfield: bigint };
}

/** @deprecated Removed in v1.5.0 — use {@link StambhaMessage}. */
export interface DiscordJsMessageLike {
  id: string;
  content: string;
  channelId: string;
  guildId: string | null;
  author: DiscordJsUserLike;
  channel: DiscordJsChannelLike;
  member?: DiscordJsMemberLike | null;
  guild?: { members: { me: DiscordJsMemberLike | null } } | null;
}

/** @deprecated Removed in v1.5.0 — use {@link StambhaSlashInteraction}. */
export interface DiscordJsSlashInteractionLike {
  id: string;
  token: string;
  applicationId: string;
  user: DiscordJsUserLike;
  guildId: string | null;
  channelId: string;
  commandName: string;
  options: {
    data: readonly { name: string; type: number; value?: unknown }[];
    getSubcommandGroup: (required?: boolean) => string | null;
    getSubcommand: (required?: boolean) => string | null;
  };
  channel: DiscordJsChannelLike;
  inGuild: () => boolean;
  memberPermissions?: { bitfield: bigint };
  appPermissions?: { bitfield: bigint };
}

const DjsChannelType = {
  GuildText: 0,
  DM: 1,
  GuildVoice: 2,
  GroupDM: 3,
  GuildAnnouncement: 5,
  AnnouncementThread: 10,
  PublicThread: 11,
  PrivateThread: 12,
  GuildStageVoice: 13,
  GuildForum: 15,
} as const;

function mapChannelType(type: number): ChannelType {
  switch (type) {
    case DjsChannelType.DM:
      return "dm";
    case DjsChannelType.GroupDM:
      return "group_dm";
    case DjsChannelType.GuildText:
      return "guild_text";
    case DjsChannelType.GuildVoice:
      return "guild_voice";
    case DjsChannelType.GuildAnnouncement:
      return "guild_news";
    case DjsChannelType.AnnouncementThread:
      return "guild_news_thread";
    case DjsChannelType.PublicThread:
      return "guild_public_thread";
    case DjsChannelType.PrivateThread:
      return "guild_private_thread";
    case DjsChannelType.GuildStageVoice:
      return "guild_stage";
    case DjsChannelType.GuildForum:
      return "guild_forum";
    default:
      return "unknown";
  }
}

/**
 * @deprecated Removed in v1.5.0. Use native {@link StambhaUser} from gateway dispatch.
 */
export function userFromDiscordJs(user: DiscordJsUserLike): StambhaUser {
  warnLegacyLibraryAdapter("userFromDiscordJs");
  return mapUserFromDiscordJs(user);
}

function mapUserFromDiscordJs(user: DiscordJsUserLike): StambhaUser {
  const out: StambhaUser = { id: user.id };
  if (user.bot !== undefined) (out as { bot?: boolean }).bot = user.bot;
  if (user.username !== undefined) (out as { username?: string }).username = user.username;
  return out;
}

/**
 * @deprecated Removed in v1.5.0. Use {@link StambhaMessage} from `messageFromDispatch` / `hub.emit`.
 */
export function messageFromDiscordJs(message: DiscordJsMessageLike): StambhaMessage {
  warnLegacyLibraryAdapter("messageFromDiscordJs");
  return {
    id: message.id,
    content: message.content,
    channelId: message.channelId,
    guildId: message.guildId,
    author: mapUserFromDiscordJs(message.author),
  };
}

/**
 * @deprecated Removed in v1.5.0. Use {@link interactionFromDispatch} + {@link StambhaSlashInteraction}.
 */
export function slashInteractionFromDiscordJs(
  interaction: DiscordJsSlashInteractionLike,
): StambhaSlashInteraction {
  warnLegacyLibraryAdapter("slashInteractionFromDiscordJs");
  const slashOptions: SlashOption[] = [];
  for (const opt of interaction.options.data) {
    const type = mapDjsOptionType(opt.type);
    if (!type) continue;
    slashOptions.push({ name: opt.name, type, value: opt.value as string | number | boolean });
  }

  const group = interaction.options.getSubcommandGroup(false);
  const sub = interaction.options.getSubcommand(false);

  const slashPath = {
    root: interaction.commandName,
    ...(group ? { group } : {}),
    ...(sub ? { subcommand: sub } : {}),
  };

  return {
    kind: "slash",
    id: interaction.id,
    token: interaction.token,
    applicationId: interaction.applicationId,
    user: mapUserFromDiscordJs(interaction.user),
    guildId: interaction.guildId,
    channelId: interaction.channelId,
    commandName: interaction.commandName,
    slashPath,
    slashOptions,
    raw: interaction,
  };
}

function mapDjsOptionType(type: number): import("@stambha/core").ParsedSlashOptionType | null {
  switch (type) {
    case 3:
      return "string";
    case 4:
      return "integer";
    case 5:
      return "boolean";
    case 6:
      return "user";
    case 7:
      return "channel";
    case 8:
      return "role";
    case 9:
      return "mentionable";
    case 10:
      return "number";
    case 11:
      return "attachment";
    default:
      return null;
  }
}

function metaFromGuildChannel(channel: DiscordJsChannelLike): CommandContextMeta {
  const meta: CommandContextMeta = {
    channelType: mapChannelType(channel.type ?? 0),
  };
  if (typeof channel.nsfw === "boolean") {
    meta.channelNsfw = channel.nsfw;
  }
  return meta;
}

function memberPermissions(member: DiscordJsMemberLike | null | undefined): bigint | undefined {
  return member?.permissions?.bitfield;
}

function clientPermissionsInChannel(
  member: DiscordJsMemberLike | null | undefined,
  channelId: string,
): bigint | undefined {
  if (!member?.permissionsIn) return undefined;
  return member.permissionsIn(channelId).bitfield;
}

/**
 * @deprecated Removed in v1.5.0. Use {@link metaFromDiscordInteraction} on native dispatch.
 */
export function metaFromDiscordJsMessage(
  message: DiscordJsMessageLike,
): CommandContextMeta | undefined {
  warnLegacyLibraryAdapter("metaFromDiscordJsMessage");
  const channel = message.channel;

  if (channel.isDMBased?.()) {
    return { channelType: "dm", channelNsfw: false };
  }

  if (channel.isTextBased && !channel.isTextBased()) return undefined;

  const meta = metaFromGuildChannel(channel);
  const memberPerms = memberPermissions(message.member);
  const clientPerms = message.guild
    ? clientPermissionsInChannel(message.guild.members.me, message.channelId)
    : undefined;

  if (memberPerms !== undefined) meta.memberPermissions = memberPerms;
  if (clientPerms !== undefined) meta.clientPermissions = clientPerms;
  return meta;
}

/**
 * @deprecated Removed in v1.5.0. Use {@link metaFromDiscordInteraction} on native dispatch.
 */
export function metaFromDiscordJsSlash(
  interaction: DiscordJsSlashInteractionLike,
): CommandContextMeta | undefined {
  warnLegacyLibraryAdapter("metaFromDiscordJsSlash");
  if (!interaction.inGuild()) {
    return { channelType: "dm", channelNsfw: false };
  }

  const channel = interaction.channel;
  const meta: CommandContextMeta = {};

  if (channel && channel.type !== undefined) {
    meta.channelType = mapChannelType(channel.type);
    if (typeof channel.nsfw === "boolean") {
      meta.channelNsfw = channel.nsfw;
    }
  }

  if (interaction.memberPermissions) {
    meta.memberPermissions = interaction.memberPermissions.bitfield;
  }

  if (interaction.appPermissions) {
    meta.clientPermissions = interaction.appPermissions.bitfield;
  }

  return Object.keys(meta).length > 0 ? meta : undefined;
}
