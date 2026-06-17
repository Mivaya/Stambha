import type { CommandContextMeta, ResolvedDesiredProperties } from "@stambha/core";
import type { StambhaMessage, StambhaSlashInteraction, StambhaUser } from "./shapes.js";
import { warnLegacyLibraryAdapter } from "./deprecation.js";

/** @deprecated Removed in v1.5.0 — use {@link StambhaMessage}. */
export interface DiscordenoMessageLike {
  id?: bigint;
  content?: string;
  channelId?: bigint;
  guildId?: bigint;
  author?: { id?: bigint; bot?: boolean; username?: string };
}

/** @deprecated Removed in v1.5.0 — use {@link StambhaSlashInteraction}. */
export interface DiscordenoInteractionLike {
  id?: bigint;
  token?: string;
  user?: { id?: bigint; bot?: boolean };
  guildId?: bigint;
  channelId?: bigint;
  member?: { permissions?: bigint | string };
}

function idString(value: bigint | undefined | null): string | null {
  return value === undefined || value === null ? null : String(value);
}

/**
 * @deprecated Removed in v1.5.0. Use native {@link StambhaUser} from gateway dispatch.
 */
export function userFromDiscordeno(user: {
  id?: bigint;
  bot?: boolean;
  username?: string;
}): StambhaUser {
  warnLegacyLibraryAdapter("userFromDiscordeno");
  return mapUserFromDiscordeno(user);
}

function mapUserFromDiscordeno(user: {
  id?: bigint;
  bot?: boolean;
  username?: string;
}): StambhaUser {
  return { id: String(user.id!), ...(user.bot !== undefined ? { bot: user.bot } : {}) };
}

/**
 * @deprecated Removed in v1.5.0. Use {@link StambhaMessage} from `messageFromDispatch` / `hub.emit`.
 */
export function messageFromDiscordeno(message: DiscordenoMessageLike): StambhaMessage {
  warnLegacyLibraryAdapter("messageFromDiscordeno");
  return {
    id: message.id ? String(message.id) : null,
    content: message.content ?? "",
    channelId: idString(message.channelId),
    guildId: idString(message.guildId),
    author: message.author?.id ? mapUserFromDiscordeno(message.author) : { id: "0" },
  };
}

/**
 * @deprecated Removed in v1.5.0. Use {@link interactionFromDispatch}.
 */
export function slashInteractionFromDiscordeno(
  interaction: DiscordenoInteractionLike,
): StambhaSlashInteraction {
  warnLegacyLibraryAdapter("slashInteractionFromDiscordeno");
  const commandName = (interaction as { data?: { name?: string } }).data?.name ?? "unknown";
  return {
    kind: "slash",
    id: interaction.id ? String(interaction.id) : null,
    token: interaction.token ?? null,
    user: interaction.user?.id ? mapUserFromDiscordeno(interaction.user) : { id: "0" },
    guildId: idString(interaction.guildId),
    channelId: idString(interaction.channelId),
    commandName,
    slashPath: { root: commandName },
    slashOptions: [],
    raw: interaction,
  };
}

/**
 * @deprecated Removed in v1.5.0. Use {@link metaFromDiscordInteraction}.
 */
export function metaFromDiscordenoMessage(
  message: DiscordenoMessageLike,
): CommandContextMeta | undefined {
  warnLegacyLibraryAdapter("metaFromDiscordenoMessage");
  if (!message.guildId) {
    return { channelType: "dm", channelNsfw: false };
  }
  return { channelType: "guild_text" };
}

/**
 * @deprecated Removed in v1.5.0. Use {@link metaFromDiscordInteraction}.
 */
export function metaFromDiscordenoSlash(
  interaction: DiscordenoInteractionLike,
): CommandContextMeta | undefined {
  warnLegacyLibraryAdapter("metaFromDiscordenoSlash");
  if (!interaction.guildId) {
    return { channelType: "dm", channelNsfw: false };
  }

  const meta: CommandContextMeta = { channelType: "guild_text" };
  const member = interaction.member;
  if (member?.permissions !== undefined) {
    meta.memberPermissions = BigInt(String(member.permissions));
  }
  return meta;
}

/**
 * @deprecated Removed in v1.5.0. Use {@link gatesDesiredProperties} on the client.
 */
export const defaultDiscordenoDesiredProperties = {
  user: { id: true, bot: true, username: true },
  message: { id: true, content: true, channelId: true, guildId: true, author: true },
  interaction: {
    id: true,
    type: true,
    token: true,
    data: true,
    user: true,
    guildId: true,
    channelId: true,
    acknowledged: true,
  },
} as const;

/**
 * @deprecated Removed in v1.5.0. Native gateway uses {@link gatesDesiredProperties} on the client.
 */
export function buildDiscordenoDesiredProperties(
  resolved: ResolvedDesiredProperties,
): Record<string, unknown> {
  warnLegacyLibraryAdapter("buildDiscordenoDesiredProperties");
  const interaction: Record<string, boolean> = {
    ...defaultDiscordenoDesiredProperties.interaction,
  };

  if (resolved.meta.memberPermissions) {
    interaction.member = true;
  }

  return {
    user: { ...defaultDiscordenoDesiredProperties.user },
    message: { ...defaultDiscordenoDesiredProperties.message },
    interaction,
  };
}
