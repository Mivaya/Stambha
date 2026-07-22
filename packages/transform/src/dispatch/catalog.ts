/** Discord gateway DISPATCH event names (API v10). */
export const GATEWAY_DISPATCH_EVENTS = [
  "READY",
  "RESUMED",
  "RATE_LIMITED",
  "APPLICATION_COMMAND_PERMISSIONS_UPDATE",
  "AUTO_MODERATION_RULE_CREATE",
  "AUTO_MODERATION_RULE_UPDATE",
  "AUTO_MODERATION_RULE_DELETE",
  "AUTO_MODERATION_ACTION_EXECUTION",
  "CHANNEL_CREATE",
  "CHANNEL_UPDATE",
  "CHANNEL_DELETE",
  "CHANNEL_PINS_UPDATE",
  "THREAD_CREATE",
  "THREAD_UPDATE",
  "THREAD_DELETE",
  "THREAD_LIST_SYNC",
  "THREAD_MEMBER_UPDATE",
  "THREAD_MEMBERS_UPDATE",
  "GUILD_AUDIT_LOG_ENTRY_CREATE",
  "GUILD_CREATE",
  "GUILD_UPDATE",
  "GUILD_DELETE",
  "GUILD_BAN_ADD",
  "GUILD_BAN_REMOVE",
  "GUILD_EMOJIS_UPDATE",
  "GUILD_STICKERS_UPDATE",
  "GUILD_INTEGRATIONS_UPDATE",
  "GUILD_MEMBER_ADD",
  "GUILD_MEMBER_REMOVE",
  "GUILD_MEMBER_UPDATE",
  "GUILD_MEMBERS_CHUNK",
  "GUILD_ROLE_CREATE",
  "GUILD_ROLE_UPDATE",
  "GUILD_ROLE_DELETE",
  "GUILD_SCHEDULED_EVENT_CREATE",
  "GUILD_SCHEDULED_EVENT_UPDATE",
  "GUILD_SCHEDULED_EVENT_DELETE",
  "GUILD_SCHEDULED_EVENT_USER_ADD",
  "GUILD_SCHEDULED_EVENT_USER_REMOVE",
  "GUILD_SOUNDBOARD_SOUND_CREATE",
  "GUILD_SOUNDBOARD_SOUND_UPDATE",
  "GUILD_SOUNDBOARD_SOUND_DELETE",
  "GUILD_SOUNDBOARD_SOUNDS_UPDATE",
  "SOUNDBOARD_SOUNDS",
  "INTEGRATION_CREATE",
  "INTEGRATION_UPDATE",
  "INTEGRATION_DELETE",
  "INTERACTION_CREATE",
  "INVITE_CREATE",
  "INVITE_DELETE",
  "MESSAGE_CREATE",
  "MESSAGE_UPDATE",
  "MESSAGE_DELETE",
  "MESSAGE_DELETE_BULK",
  "MESSAGE_REACTION_ADD",
  "MESSAGE_REACTION_REMOVE",
  "MESSAGE_REACTION_REMOVE_ALL",
  "MESSAGE_REACTION_REMOVE_EMOJI",
  "PRESENCE_UPDATE",
  "STAGE_INSTANCE_CREATE",
  "STAGE_INSTANCE_UPDATE",
  "STAGE_INSTANCE_DELETE",
  "TYPING_START",
  "USER_UPDATE",
  "VOICE_CHANNEL_EFFECT_SEND",
  "VOICE_STATE_UPDATE",
  "VOICE_SERVER_UPDATE",
  "WEBHOOKS_UPDATE",
  "ENTITLEMENT_CREATE",
  "ENTITLEMENT_UPDATE",
  "ENTITLEMENT_DELETE",
  "SUBSCRIPTION_CREATE",
  "SUBSCRIPTION_UPDATE",
  "SUBSCRIPTION_DELETE",
  "MESSAGE_POLL_VOTE_ADD",
  "MESSAGE_POLL_VOTE_REMOVE",
] as const;

export type GatewayDispatchEventName = (typeof GATEWAY_DISPATCH_EVENTS)[number];

export type DispatchNormalizationTier =
  | "routing"
  | "tier1"
  | "tier2"
  | "tier3"
  | "tier4"
  | "passthrough";

export interface DispatchCatalogEntry {
  dispatchName: GatewayDispatchEventName;
  hubName: string;
  tier: DispatchNormalizationTier;
}

/** `MESSAGE_CREATE` → `messageCreate` (discord.js-style hub event names). */
export function gatewayEventToHubName(dispatchName: string): string {
  return dispatchName.toLowerCase().replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

const ROUTING_EVENTS = new Set<string>([
  "MESSAGE_CREATE",
  "MESSAGE_UPDATE",
  "INTERACTION_CREATE",
  "READY",
]);

/** Tier 1 structural normalization — camelCase at hub boundary. */
const TIER1_EVENTS = new Set<string>([
  "MESSAGE_DELETE",
  "MESSAGE_DELETE_BULK",
  "MESSAGE_REACTION_ADD",
  "MESSAGE_REACTION_REMOVE",
  "MESSAGE_REACTION_REMOVE_ALL",
  "MESSAGE_REACTION_REMOVE_EMOJI",
  "MESSAGE_POLL_VOTE_ADD",
  "MESSAGE_POLL_VOTE_REMOVE",
  "PRESENCE_UPDATE",
  "VOICE_STATE_UPDATE",
  "VOICE_SERVER_UPDATE",
  "GUILD_CREATE",
  "GUILD_UPDATE",
  "GUILD_DELETE",
  "GUILD_MEMBER_ADD",
  "GUILD_MEMBER_REMOVE",
  "GUILD_MEMBER_UPDATE",
]);

/** Tier 2 structural normalization — camelCase at hub boundary. */
const TIER2_EVENTS = new Set<string>([
  "CHANNEL_CREATE",
  "CHANNEL_UPDATE",
  "CHANNEL_DELETE",
  "CHANNEL_PINS_UPDATE",
  "THREAD_CREATE",
  "THREAD_UPDATE",
  "THREAD_DELETE",
  "THREAD_LIST_SYNC",
  "THREAD_MEMBER_UPDATE",
  "THREAD_MEMBERS_UPDATE",
  "GUILD_ROLE_CREATE",
  "GUILD_ROLE_UPDATE",
  "GUILD_ROLE_DELETE",
  "GUILD_BAN_ADD",
  "GUILD_BAN_REMOVE",
  "GUILD_MEMBERS_CHUNK",
  "GUILD_AUDIT_LOG_ENTRY_CREATE",
]);

/** Tier 3 structural normalization — camelCase at hub boundary. */
const TIER3_EVENTS = new Set<string>([
  "INVITE_CREATE",
  "INVITE_DELETE",
  "INTEGRATION_CREATE",
  "INTEGRATION_UPDATE",
  "INTEGRATION_DELETE",
  "GUILD_INTEGRATIONS_UPDATE",
  "STAGE_INSTANCE_CREATE",
  "STAGE_INSTANCE_UPDATE",
  "STAGE_INSTANCE_DELETE",
  "GUILD_SCHEDULED_EVENT_CREATE",
  "GUILD_SCHEDULED_EVENT_UPDATE",
  "GUILD_SCHEDULED_EVENT_DELETE",
  "GUILD_SCHEDULED_EVENT_USER_ADD",
  "GUILD_SCHEDULED_EVENT_USER_REMOVE",
  "TYPING_START",
  "WEBHOOKS_UPDATE",
  "GUILD_EMOJIS_UPDATE",
  "GUILD_STICKERS_UPDATE",
]);

/** Tier 4 structural normalization — camelCase at hub boundary. */
const TIER4_EVENTS = new Set<string>([
  "APPLICATION_COMMAND_PERMISSIONS_UPDATE",
  "AUTO_MODERATION_RULE_CREATE",
  "AUTO_MODERATION_RULE_UPDATE",
  "AUTO_MODERATION_RULE_DELETE",
  "AUTO_MODERATION_ACTION_EXECUTION",
  "GUILD_SOUNDBOARD_SOUND_CREATE",
  "GUILD_SOUNDBOARD_SOUND_UPDATE",
  "GUILD_SOUNDBOARD_SOUND_DELETE",
  "GUILD_SOUNDBOARD_SOUNDS_UPDATE",
  "SOUNDBOARD_SOUNDS",
  "ENTITLEMENT_CREATE",
  "ENTITLEMENT_UPDATE",
  "ENTITLEMENT_DELETE",
  "SUBSCRIPTION_CREATE",
  "SUBSCRIPTION_UPDATE",
  "SUBSCRIPTION_DELETE",
  "USER_UPDATE",
  "VOICE_CHANNEL_EFFECT_SEND",
  "RESUMED",
  "RATE_LIMITED",
]);

function tierFor(dispatchName: string): DispatchNormalizationTier {
  if (ROUTING_EVENTS.has(dispatchName)) return "routing";
  if (TIER1_EVENTS.has(dispatchName)) return "tier1";
  if (TIER2_EVENTS.has(dispatchName)) return "tier2";
  if (TIER3_EVENTS.has(dispatchName)) return "tier3";
  if (TIER4_EVENTS.has(dispatchName)) return "tier4";
  return "passthrough";
}

/** Normalization tier for a gateway dispatch name. */
export function dispatchNormalizationTier(dispatchName: string): DispatchNormalizationTier {
  return tierFor(dispatchName);
}

/** True when Tier 1 applies structural camelCase at the hub boundary. */
export function isTier1Dispatch(dispatchName: string): boolean {
  return tierFor(dispatchName) === "tier1";
}

/** True when Tier 2 applies structural camelCase at the hub boundary. */
export function isTier2Dispatch(dispatchName: string): boolean {
  return tierFor(dispatchName) === "tier2";
}

/** True when Tier 3 applies structural camelCase at the hub boundary. */
export function isTier3Dispatch(dispatchName: string): boolean {
  return tierFor(dispatchName) === "tier3";
}

/** True when Tier 4 applies structural camelCase at the hub boundary. */
export function isTier4Dispatch(dispatchName: string): boolean {
  return tierFor(dispatchName) === "tier4";
}

/** True when Tier 1–4 structural camelCase applies. */
export function isStructuralDispatch(dispatchName: string): boolean {
  const tier = tierFor(dispatchName);
  return tier === "tier1" || tier === "tier2" || tier === "tier3" || tier === "tier4";
}

/** Lookup catalog metadata for a gateway dispatch name. */
export function dispatchCatalogEntry(dispatchName: GatewayDispatchEventName): DispatchCatalogEntry {
  return {
    dispatchName,
    hubName: gatewayEventToHubName(dispatchName),
    tier: tierFor(dispatchName),
  };
}

/** Full dispatch catalog for tests and migration planning. */
export function buildDispatchCatalog(): DispatchCatalogEntry[] {
  return GATEWAY_DISPATCH_EVENTS.map((name) => dispatchCatalogEntry(name));
}
