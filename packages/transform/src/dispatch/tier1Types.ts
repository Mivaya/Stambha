/** Minimal camelCase shapes for Tier 1 hub payloads (not full Discord API types). */

export interface GatewaySnowflakeUser {
  id: string;
  username?: string;
  bot?: boolean;
}

export interface GatewayEmoji {
  id: string | null;
  name: string;
}

export interface GatewayMessageReactionAdd {
  userId: string;
  channelId: string;
  messageId: string;
  guildId?: string;
  emoji: GatewayEmoji;
  member?: { user: GatewaySnowflakeUser };
}

export interface GatewayGuildMemberAdd {
  user: GatewaySnowflakeUser;
  guildId: string;
  roles: string[];
  joinedAt?: string;
}

export interface GatewayGuildCreate {
  id: string;
  name: string;
  ownerId?: string;
}

export interface GatewayVoiceStateUpdate {
  guildId?: string;
  channelId?: string | null;
  userId: string;
  sessionId: string;
  deaf?: boolean;
  mute?: boolean;
  selfDeaf?: boolean;
  selfMute?: boolean;
}
