/**
 * Hub event name → payload type for typed {@link GatewayEventHub} listeners (G3a).
 *
 * Shapes are minimal camelCase DTOs (not full Discord API types). Sibling create/update/delete
 * events often share one interface. Events omitted here remain `unknown` via the hub string overload.
 */

import type { StambhaInteraction, StambhaMessage } from "../shapes.js";
import type {
  GatewayGuildCreate,
  GatewayGuildMemberAdd,
  GatewayMessageReactionAdd,
  GatewayVoiceStateUpdate,
} from "./tier1Types.js";
import type {
  GatewayChannelCreate,
  GatewayGuildAuditLogEntryCreate,
  GatewayGuildBanAdd,
  GatewayGuildMembersChunk,
  GatewayGuildRoleCreate,
  GatewayThreadCreate,
} from "./tier2Types.js";
import type {
  GatewayGuildEmojisUpdate,
  GatewayGuildScheduledEventCreate,
  GatewayIntegrationCreate,
  GatewayInviteCreate,
  GatewayStageInstanceCreate,
  GatewayTypingStart,
  GatewayWebhooksUpdate,
} from "./tier3Types.js";
import type {
  GatewayApplicationCommandPermissionsUpdate,
  GatewayAutoModerationActionExecution,
  GatewayAutoModerationRuleCreate,
  GatewayEntitlementCreate,
  GatewayGuildSoundboardSoundCreate,
  GatewaySubscriptionCreate,
  GatewayUserUpdate,
  GatewayVoiceChannelEffectSend,
} from "./tier4Types.js";

/** READY hub payload (`readyFromDispatch` / `GatewayEventHub.markReady`). */
export interface GatewayReadyPayload {
  user?: { id: string; username?: string };
  sessionId?: string;
  shard?: [number, number];
  guildIds?: string[];
}

/** MESSAGE_DELETE / bulk / poll / presence / voice server — structural camelCase, loose DTO. */
export interface GatewayMessageDelete {
  id?: string;
  channelId?: string;
  guildId?: string;
}

export interface GatewayMessageDeleteBulk {
  ids?: readonly string[];
  channelId?: string;
  guildId?: string;
}

export interface GatewayPresenceUpdate {
  user?: { id: string };
  guildId?: string;
  status?: string;
}

export interface GatewayVoiceServerUpdate {
  token?: string;
  guildId?: string;
  endpoint?: string | null;
}

export interface GatewayMessagePollVote {
  userId?: string;
  channelId?: string;
  messageId?: string;
  guildId?: string;
  answerId?: number;
}

export interface GatewayInviteDelete {
  channelId?: string;
  guildId?: string;
  code?: string;
}

export interface GatewayGuildIntegrationsUpdate {
  guildId?: string;
}

export interface GatewayGuildScheduledEventUser {
  guildScheduledEventId?: string;
  userId?: string;
  guildId?: string;
}

export interface GatewayChannelPinsUpdate {
  guildId?: string;
  channelId?: string;
  lastPinTimestamp?: string | null;
}

export interface GatewayThreadListSync {
  guildId?: string;
  channelIds?: readonly string[];
  threads?: readonly GatewayThreadCreate[];
}

export interface GatewayThreadMemberUpdate {
  id?: string;
  userId?: string;
  guildId?: string;
}

export interface GatewayGuildRoleDelete {
  guildId?: string;
  roleId?: string;
}

export interface GatewayGuildStickersUpdate {
  guildId?: string;
  stickers?: readonly unknown[];
}

export interface GatewayIntegrationDelete {
  id?: string;
  guildId?: string;
  applicationId?: string;
}

/** Typed hub events for G3a. Extra hub-only names (`guildAvailable`, `error`) live on `@stambha/gateway`. */
export interface GatewayEventMap {
  // Routing
  ready: GatewayReadyPayload;
  messageCreate: StambhaMessage;
  messageUpdate: StambhaMessage;
  interactionCreate: StambhaInteraction;

  // Tier 1
  messageDelete: GatewayMessageDelete;
  messageDeleteBulk: GatewayMessageDeleteBulk;
  messageReactionAdd: GatewayMessageReactionAdd;
  messageReactionRemove: GatewayMessageReactionAdd;
  messageReactionRemoveAll: GatewayMessageDelete;
  messageReactionRemoveEmoji: GatewayMessageReactionAdd;
  messagePollVoteAdd: GatewayMessagePollVote;
  messagePollVoteRemove: GatewayMessagePollVote;
  presenceUpdate: GatewayPresenceUpdate;
  voiceStateUpdate: GatewayVoiceStateUpdate;
  voiceServerUpdate: GatewayVoiceServerUpdate;
  guildCreate: GatewayGuildCreate;
  guildUpdate: GatewayGuildCreate;
  guildDelete: GatewayGuildCreate;
  guildMemberAdd: GatewayGuildMemberAdd;
  guildMemberRemove: GatewayGuildMemberAdd;
  guildMemberUpdate: GatewayGuildMemberAdd;

  // Tier 2
  channelCreate: GatewayChannelCreate;
  channelUpdate: GatewayChannelCreate;
  channelDelete: GatewayChannelCreate;
  channelPinsUpdate: GatewayChannelPinsUpdate;
  threadCreate: GatewayThreadCreate;
  threadUpdate: GatewayThreadCreate;
  threadDelete: GatewayThreadCreate;
  threadListSync: GatewayThreadListSync;
  threadMemberUpdate: GatewayThreadMemberUpdate;
  threadMembersUpdate: GatewayThreadMemberUpdate;
  guildRoleCreate: GatewayGuildRoleCreate;
  guildRoleUpdate: GatewayGuildRoleCreate;
  guildRoleDelete: GatewayGuildRoleDelete;
  guildBanAdd: GatewayGuildBanAdd;
  guildBanRemove: GatewayGuildBanAdd;
  guildMembersChunk: GatewayGuildMembersChunk;
  guildAuditLogEntryCreate: GatewayGuildAuditLogEntryCreate;

  // Tier 3
  inviteCreate: GatewayInviteCreate;
  inviteDelete: GatewayInviteDelete;
  integrationCreate: GatewayIntegrationCreate;
  integrationUpdate: GatewayIntegrationCreate;
  integrationDelete: GatewayIntegrationDelete;
  guildIntegrationsUpdate: GatewayGuildIntegrationsUpdate;
  stageInstanceCreate: GatewayStageInstanceCreate;
  stageInstanceUpdate: GatewayStageInstanceCreate;
  stageInstanceDelete: GatewayStageInstanceCreate;
  guildScheduledEventCreate: GatewayGuildScheduledEventCreate;
  guildScheduledEventUpdate: GatewayGuildScheduledEventCreate;
  guildScheduledEventDelete: GatewayGuildScheduledEventCreate;
  guildScheduledEventUserAdd: GatewayGuildScheduledEventUser;
  guildScheduledEventUserRemove: GatewayGuildScheduledEventUser;
  typingStart: GatewayTypingStart;
  webhooksUpdate: GatewayWebhooksUpdate;
  guildEmojisUpdate: GatewayGuildEmojisUpdate;
  guildStickersUpdate: GatewayGuildStickersUpdate;

  // Tier 4
  applicationCommandPermissionsUpdate: GatewayApplicationCommandPermissionsUpdate;
  autoModerationRuleCreate: GatewayAutoModerationRuleCreate;
  autoModerationRuleUpdate: GatewayAutoModerationRuleCreate;
  autoModerationRuleDelete: GatewayAutoModerationRuleCreate;
  autoModerationActionExecution: GatewayAutoModerationActionExecution;
  guildSoundboardSoundCreate: GatewayGuildSoundboardSoundCreate;
  guildSoundboardSoundUpdate: GatewayGuildSoundboardSoundCreate;
  guildSoundboardSoundDelete: GatewayGuildSoundboardSoundCreate;
  guildSoundboardSoundsUpdate: GatewayGuildSoundboardSoundCreate;
  soundboardSounds: GatewayGuildSoundboardSoundCreate;
  entitlementCreate: GatewayEntitlementCreate;
  entitlementUpdate: GatewayEntitlementCreate;
  entitlementDelete: GatewayEntitlementCreate;
  subscriptionCreate: GatewaySubscriptionCreate;
  subscriptionUpdate: GatewaySubscriptionCreate;
  subscriptionDelete: GatewaySubscriptionCreate;
  userUpdate: GatewayUserUpdate;
  voiceChannelEffectSend: GatewayVoiceChannelEffectSend;
}

export type GatewayEventName = keyof GatewayEventMap;
