/** Transport-agnostic Discord channel types for gate checks. */
export type ChannelType =
  | "dm"
  | "group_dm"
  | "guild_text"
  | "guild_voice"
  | "guild_news"
  | "guild_stage"
  | "guild_forum"
  | "guild_news_thread"
  | "guild_public_thread"
  | "guild_private_thread"
  | "unknown";

/**
 * Optional metadata bridges attach for built-in gates (`@stambha/gates`, `@stambha/authz`).
 * When absent, gates that need metadata typically allow or degrade gracefully per gate docs.
 */
export interface CommandContextMeta {
  channelType?: ChannelType;
  channelNsfw?: boolean;
  /** Member permissions in the current channel (guild commands). */
  memberPermissions?: bigint;
  /** Bot permissions in the current channel. */
  clientPermissions?: bigint;
  /** Guild member role ids (for `@stambha/authz` role → capability mapping). */
  memberRoleIds?: readonly string[];
  /**
   * Guild owner user id when known (gateway/REST enrichment).
   * Interactions do not include this — set via worker or leave unset and use `guildOwners` in authz config.
   */
  guildOwnerId?: string;
  /**
   * Entitlements from the interaction payload (slash / components).
   * Used by monetization gates (`entitlementGate`) via SKU ids.
   */
  entitlements?: readonly EntitlementSummary[];
}

/** Slim entitlement slice for command gates (camelCase). */
export interface EntitlementSummary {
  id: string;
  skuId: string;
  applicationId?: string;
  userId?: string;
  guildId?: string;
  type?: number;
  deleted?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  consumed?: boolean;
}

/** Returns true when the channel type is any guild channel (not DM / group DM). */
export function isGuildChannelType(type: ChannelType): boolean {
  return type !== "dm" && type !== "group_dm" && type !== "unknown";
}
