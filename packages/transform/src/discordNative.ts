import type {
  ChannelType,
  CommandContextMeta,
  CommandSlashPath,
  ParsedSlashOptionType,
  SlashOption,
} from "@stambha/core";
import { SlashOptionType } from "@stambha/core";
import type {
  StambhaAutocompleteInteraction,
  StambhaComponentInteraction,
  StambhaInteraction,
  StambhaModalInteraction,
  StambhaSlashInteraction,
  StambhaUser,
} from "./shapes.js";

interface DiscordUserPayload {
  id?: string;
  bot?: boolean;
  username?: string;
}

interface DiscordChannelPayload {
  id?: string;
  type?: number;
  nsfw?: boolean;
}

interface DiscordMemberPayload {
  user?: DiscordUserPayload;
  permissions?: string;
}

interface DiscordOptionPayload {
  name: string;
  type: number;
  value?: string | number | boolean;
  focused?: boolean;
  options?: DiscordOptionPayload[];
}

interface DiscordInteractionPayload {
  id?: string;
  token?: string;
  type?: number;
  application_id?: string;
  data?: {
    id?: string;
    name?: string;
    type?: number;
    custom_id?: string;
    component_type?: number;
    values?: string[];
    options?: DiscordOptionPayload[];
    components?: { components?: { custom_id?: string }[] }[];
  };
  user?: DiscordUserPayload;
  member?: DiscordMemberPayload;
  guild_id?: string;
  channel_id?: string;
  channel?: DiscordChannelPayload;
  app_permissions?: string;
}

function userFromDiscord(user: DiscordUserPayload | undefined): StambhaUser | null {
  if (!user?.id) return null;
  return {
    id: user.id,
    ...(user.bot !== undefined ? { bot: user.bot } : {}),
    ...(user.username !== undefined ? { username: user.username } : {}),
  };
}

function mapChannelType(type: number): ChannelType {
  switch (type) {
    case 0:
      return "guild_text";
    case 1:
      return "dm";
    case 2:
      return "guild_voice";
    case 3:
      return "group_dm";
    case 4:
      return "guild_voice";
    case 5:
      return "guild_news";
    case 10:
      return "guild_news_thread";
    case 11:
      return "guild_public_thread";
    case 12:
      return "guild_private_thread";
    case 13:
      return "guild_stage";
    case 15:
      return "guild_forum";
    default:
      return "unknown";
  }
}

function mapOptionType(type: number): ParsedSlashOptionType | null {
  switch (type) {
    case SlashOptionType.String:
      return "string";
    case SlashOptionType.Integer:
      return "integer";
    case SlashOptionType.Boolean:
      return "boolean";
    case SlashOptionType.User:
      return "user";
    case SlashOptionType.Channel:
      return "channel";
    case SlashOptionType.Role:
      return "role";
    case SlashOptionType.Mentionable:
      return "mentionable";
    case SlashOptionType.Number:
      return "number";
    case SlashOptionType.Attachment:
      return "attachment";
    default:
      return null;
  }
}

function parseSlashTree(
  rootName: string,
  options: DiscordOptionPayload[] | undefined,
): { slashPath: CommandSlashPath; slashOptions: SlashOption[] } {
  const slashPath: CommandSlashPath = { root: rootName };
  let current = options ?? [];

  if (current[0]?.type === SlashOptionType.SubcommandGroup) {
    slashPath.group = current[0].name;
    current = current[0].options ?? [];
  }

  if (current[0]?.type === SlashOptionType.Subcommand) {
    slashPath.subcommand = current[0].name;
    current = current[0].options ?? [];
  }

  const slashOptions: SlashOption[] = [];
  for (const opt of current) {
    if (opt.type === SlashOptionType.SubcommandGroup || opt.type === SlashOptionType.Subcommand) {
      continue;
    }
    const mapped = mapOptionType(opt.type);
    if (!mapped || opt.value === undefined) continue;
    slashOptions.push({ name: opt.name, type: mapped, value: opt.value });
  }

  return { slashPath, slashOptions };
}

function findFocusedOption(
  options: DiscordOptionPayload[] | undefined,
): { name: string; value: string } | null {
  if (!options) return null;
  for (const opt of options) {
    if (opt.focused) {
      return { name: opt.name, value: opt.value !== undefined ? String(opt.value) : "" };
    }
    const nested = findFocusedOption(opt.options);
    if (nested) return nested;
  }
  return null;
}

export function metaFromDiscordInteraction(
  payload: DiscordInteractionPayload,
): CommandContextMeta | undefined {
  const meta: CommandContextMeta = {};

  if (!payload.guild_id) {
    meta.channelType = "dm";
    meta.channelNsfw = false;
  } else if (payload.channel?.type !== undefined) {
    meta.channelType = mapChannelType(payload.channel.type);
    if (payload.channel.nsfw !== undefined) meta.channelNsfw = payload.channel.nsfw;
  }

  if (payload.member?.permissions) {
    try {
      meta.memberPermissions = BigInt(payload.member.permissions);
    } catch {
      // ignore invalid bitfield
    }
  }

  if (payload.app_permissions) {
    try {
      meta.clientPermissions = BigInt(payload.app_permissions);
    } catch {
      // ignore
    }
  }

  return Object.keys(meta).length > 0 ? meta : undefined;
}

function baseInteraction(
  payload: DiscordInteractionPayload,
  user: StambhaUser,
): Omit<StambhaSlashInteraction, "kind" | "commandName" | "slashPath" | "slashOptions"> {
  const meta = metaFromDiscordInteraction(payload);
  return {
    id: payload.id ?? null,
    token: payload.token ?? null,
    applicationId: payload.application_id ?? null,
    user,
    guildId: payload.guild_id ?? null,
    channelId: payload.channel_id ?? null,
    ...(meta ? { meta } : {}),
    raw: payload,
  };
}

function slashFromDispatch(
  payload: DiscordInteractionPayload,
  user: StambhaUser,
): StambhaSlashInteraction | null {
  const rootName = payload.data?.name;
  if (!rootName) return null;
  const { slashPath, slashOptions } = parseSlashTree(rootName, payload.data?.options);
  return {
    kind: "slash",
    ...baseInteraction(payload, user),
    commandName: rootName,
    slashPath,
    slashOptions,
  };
}

function autocompleteFromDispatch(
  payload: DiscordInteractionPayload,
  user: StambhaUser,
): StambhaAutocompleteInteraction | null {
  const rootName = payload.data?.name;
  if (!rootName) return null;
  const { slashPath } = parseSlashTree(rootName, payload.data?.options);
  const focused = findFocusedOption(payload.data?.options);
  if (!focused) return null;
  return {
    kind: "autocomplete",
    ...baseInteraction(payload, user),
    commandName: rootName,
    slashPath,
    focusedOption: focused.name,
    userInput: focused.value,
  };
}

function componentFromDispatch(
  payload: DiscordInteractionPayload,
  user: StambhaUser,
): StambhaComponentInteraction | null {
  const customId = payload.data?.custom_id;
  if (!customId) return null;
  const componentType = payload.data?.component_type === 2 ? "button" : "select";
  return {
    kind: "component",
    ...baseInteraction(payload, user),
    customId,
    componentType,
    values: payload.data?.values ?? [],
  };
}

function modalFromDispatch(
  payload: DiscordInteractionPayload,
  user: StambhaUser,
): StambhaModalInteraction | null {
  const customId = payload.data?.custom_id;
  if (!customId) return null;
  return {
    kind: "modal",
    ...baseInteraction(payload, user),
    customId,
  };
}

/** Parse gateway `INTERACTION_CREATE` into a transport-agnostic {@link StambhaInteraction}. */
export function interactionFromDispatch(data: unknown): StambhaInteraction | null {
  const payload = data as DiscordInteractionPayload;
  const user = userFromDiscord(payload.member?.user ?? payload.user);
  if (!user) return null;

  switch (payload.type) {
    case 2:
      return slashFromDispatch(payload, user);
    case 3:
      return componentFromDispatch(payload, user);
    case 4:
      return autocompleteFromDispatch(payload, user);
    case 5:
      return modalFromDispatch(payload, user);
    default:
      return null;
  }
}

export function parseSlashTreeFromOptions(
  rootName: string,
  options: DiscordOptionPayload[] | undefined,
): { slashPath: CommandSlashPath; slashOptions: SlashOption[] } {
  return parseSlashTree(rootName, options);
}
