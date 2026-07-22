/** Minimal camelCase shapes for Tier 3 hub payloads (not full Discord API types). */

import type { GatewaySnowflakeUser } from "./tier1Types.js";

export interface GatewayInviteCreate {
  code: string;
  guildId?: string;
  channelId: string;
  inviter?: GatewaySnowflakeUser;
  maxAge?: number;
  maxUses?: number;
  temporary?: boolean;
}

export interface GatewayIntegrationCreate {
  id: string;
  name: string;
  type: string;
  guildId?: string;
  enabled?: boolean;
}

export interface GatewayStageInstanceCreate {
  id: string;
  guildId: string;
  channelId: string;
  topic: string;
  privacyLevel?: number;
}

export interface GatewayGuildScheduledEventCreate {
  id: string;
  guildId: string;
  name: string;
  scheduledStartTime?: string;
  privacyLevel?: number;
  status?: number;
  entityType?: number;
  creatorId?: string | null;
}

export interface GatewayTypingStart {
  channelId: string;
  guildId?: string;
  userId: string;
  timestamp: number;
}

export interface GatewayWebhooksUpdate {
  guildId: string;
  channelId: string;
}

export interface GatewayGuildEmojisUpdate {
  guildId: string;
  emojis: readonly { id?: string | null; name?: string | null; animated?: boolean }[];
}
