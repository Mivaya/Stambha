/** Minimal camelCase shapes for Tier 2 hub payloads (not full Discord API types). */

import type { GatewaySnowflakeUser } from "./tier1Types.js";

export interface GatewayChannelCreate {
  id: string;
  type: number;
  guildId?: string;
  name?: string;
  parentId?: string | null;
}

export interface GatewayThreadCreate {
  id: string;
  type: number;
  guildId?: string;
  name?: string;
  parentId?: string;
  ownerId?: string;
}

export interface GatewayGuildRoleCreate {
  guildId: string;
  role: { id: string; name: string; permissions?: string; position?: number };
}

export interface GatewayGuildBanAdd {
  guildId: string;
  user: GatewaySnowflakeUser;
}

export interface GatewayGuildMembersChunk {
  guildId: string;
  members: readonly { user: GatewaySnowflakeUser; roles?: string[] }[];
  chunkIndex?: number;
  chunkCount?: number;
}

export interface GatewayGuildAuditLogEntryCreate {
  id: string;
  guildId?: string;
  actionType: number;
  userId?: string | null;
  targetId?: string | null;
}
