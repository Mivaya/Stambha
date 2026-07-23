/**
 * Discord application installation contexts and interaction surfaces.
 * @see https://docs.discord.com/developers/interactions/application-commands
 */

/** Where the app may be installed for this command. */
export type IntegrationTypeName = "guild" | "user";

/** Discord surface where the command may be invoked. */
export type InteractionContextName = "guild" | "bot_dm" | "private_channel";

/** Discord API `integration_types` values. */
export const IntegrationType = {
  GuildInstall: 0,
  UserInstall: 1,
} as const;

/** Discord API `contexts` values. */
export const InteractionContextType = {
  Guild: 0,
  BotDm: 1,
  PrivateChannel: 2,
} as const;

export type IntegrationTypeValue = (typeof IntegrationType)[keyof typeof IntegrationType];
export type InteractionContextTypeValue =
  (typeof InteractionContextType)[keyof typeof InteractionContextType];

/** IDs that authorized the install context(s) for an interaction. */
export interface AuthorizingIntegrationOwners {
  /** Guild id when the interaction is associated with a guild install (`"0"`). */
  guildInstall?: string;
  /** User id that authorized a user install (`"1"`). */
  userInstall?: string;
}

const INTEGRATION_NAME_TO_API: Record<IntegrationTypeName, IntegrationTypeValue> = {
  guild: IntegrationType.GuildInstall,
  user: IntegrationType.UserInstall,
};

const CONTEXT_NAME_TO_API: Record<InteractionContextName, InteractionContextTypeValue> = {
  guild: InteractionContextType.Guild,
  bot_dm: InteractionContextType.BotDm,
  private_channel: InteractionContextType.PrivateChannel,
};

const INTEGRATION_API_TO_NAME: Record<number, IntegrationTypeName> = {
  [IntegrationType.GuildInstall]: "guild",
  [IntegrationType.UserInstall]: "user",
};

const CONTEXT_API_TO_NAME: Record<number, InteractionContextName> = {
  [InteractionContextType.Guild]: "guild",
  [InteractionContextType.BotDm]: "bot_dm",
  [InteractionContextType.PrivateChannel]: "private_channel",
};

/** Map friendly names → Discord `integration_types` integers. */
export function integrationTypesToApi(
  types: readonly IntegrationTypeName[],
): IntegrationTypeValue[] {
  return [...new Set(types.map((t) => INTEGRATION_NAME_TO_API[t]))];
}

/** Map friendly names → Discord `contexts` integers. */
export function interactionContextsToApi(
  contexts: readonly InteractionContextName[],
): InteractionContextTypeValue[] {
  return [...new Set(contexts.map((c) => CONTEXT_NAME_TO_API[c]))];
}

/** Parse Discord `context` field on an interaction. */
export function interactionContextFromApi(
  value: number | undefined,
): InteractionContextName | undefined {
  if (value === undefined) return undefined;
  return CONTEXT_API_TO_NAME[value];
}

/**
 * Parse Discord `authorizing_integration_owners` object.
 * Keys are stringified integration type ints (`"0"` / `"1"`).
 */
export function authorizingIntegrationOwnersFromApi(
  raw: Record<string, string> | undefined,
): AuthorizingIntegrationOwners | undefined {
  if (!raw) return undefined;
  const out: AuthorizingIntegrationOwners = {};
  const guild = raw[String(IntegrationType.GuildInstall)];
  const user = raw[String(IntegrationType.UserInstall)];
  if (typeof guild === "string") out.guildInstall = guild;
  if (typeof user === "string") out.userInstall = user;
  return out.guildInstall !== undefined || out.userInstall !== undefined ? out : undefined;
}

/** @internal Test helper — map API int back to friendly name. */
export function integrationTypeFromApi(value: number): IntegrationTypeName | undefined {
  return INTEGRATION_API_TO_NAME[value];
}
