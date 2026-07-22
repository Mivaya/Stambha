/** Minimal camelCase shapes for Tier 4 hub payloads (not full Discord API types). */

export interface GatewayApplicationCommandPermissionsUpdate {
  id: string;
  applicationId: string;
  guildId: string;
  permissions: readonly { id: string; type: number; permission: boolean }[];
}

export interface GatewayAutoModerationRuleCreate {
  id: string;
  guildId: string;
  name: string;
  creatorId?: string;
  eventType?: number;
  triggerType?: number;
  enabled?: boolean;
}

export interface GatewayAutoModerationActionExecution {
  guildId: string;
  action: { type: number };
  ruleId: string;
  ruleTriggerType?: number;
  userId: string;
  channelId?: string;
  messageId?: string;
}

export interface GatewayGuildSoundboardSoundCreate {
  name: string;
  soundId: string;
  volume?: number;
  emojiId?: string | null;
  emojiName?: string | null;
  guildId?: string;
  available?: boolean;
}

export interface GatewayEntitlementCreate {
  id: string;
  skuId: string;
  applicationId: string;
  userId?: string;
  guildId?: string;
  type: number;
  deleted?: boolean;
}

export interface GatewaySubscriptionCreate {
  id: string;
  userId: string;
  skuIds: readonly string[];
  entitlementIds?: readonly string[];
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  status?: number;
}

export interface GatewayUserUpdate {
  id: string;
  username: string;
  globalName?: string | null;
  avatar?: string | null;
}

export interface GatewayVoiceChannelEffectSend {
  channelId: string;
  guildId: string;
  userId: string;
  emoji?: { name?: string | null; id?: string | null };
  animationType?: number;
  animationId?: number;
}
