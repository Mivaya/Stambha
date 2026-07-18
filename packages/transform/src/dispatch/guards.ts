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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/** Type guard for `messageReactionAdd` hub payloads (G3-p1 camelCase). */
export function isMessageReactionAddPayload(value: unknown): value is GatewayMessageReactionAdd {
  if (!isRecord(value)) return false;
  if (typeof value.userId !== "string") return false;
  if (typeof value.channelId !== "string") return false;
  if (typeof value.messageId !== "string") return false;
  if (!isRecord(value.emoji) || typeof value.emoji.name !== "string") return false;
  return true;
}

/** Type guard for `guildMemberAdd` hub payloads (G3-p1 camelCase). */
export function isGuildMemberAddPayload(value: unknown): value is GatewayGuildMemberAdd {
  if (!isRecord(value)) return false;
  if (typeof value.guildId !== "string") return false;
  if (!isRecord(value.user) || typeof value.user.id !== "string") return false;
  if (!isStringArray(value.roles)) return false;
  return true;
}

/** Type guard for `guildCreate` hub payloads (G3-p1 camelCase). */
export function isGuildCreatePayload(value: unknown): value is GatewayGuildCreate {
  if (!isRecord(value)) return false;
  return typeof value.id === "string" && typeof value.name === "string";
}

/** Type guard for `voiceStateUpdate` hub payloads (G3-p1 camelCase). */
export function isVoiceStateUpdatePayload(value: unknown): value is GatewayVoiceStateUpdate {
  if (!isRecord(value)) return false;
  return typeof value.userId === "string" && typeof value.sessionId === "string";
}

/** Type guard for `channelCreate` hub payloads (G3-p2 camelCase). */
export function isChannelCreatePayload(value: unknown): value is GatewayChannelCreate {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || typeof value.type !== "number") return false;
  // Reject wire snake_case (id/type alone match both shapes).
  if ("guild_id" in value || "parent_id" in value) return false;
  return true;
}

/** Type guard for `threadCreate` hub payloads (G3-p2 camelCase). */
export function isThreadCreatePayload(value: unknown): value is GatewayThreadCreate {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || typeof value.type !== "number") return false;
  if ("guild_id" in value || "parent_id" in value || "owner_id" in value) return false;
  return true;
}

/** Type guard for `guildRoleCreate` hub payloads (G3-p2 camelCase). */
export function isGuildRoleCreatePayload(value: unknown): value is GatewayGuildRoleCreate {
  if (!isRecord(value)) return false;
  if (typeof value.guildId !== "string") return false;
  if (!isRecord(value.role) || typeof value.role.id !== "string") return false;
  return typeof value.role.name === "string";
}

/** Type guard for `guildBanAdd` hub payloads (G3-p2 camelCase). */
export function isGuildBanAddPayload(value: unknown): value is GatewayGuildBanAdd {
  if (!isRecord(value)) return false;
  if (typeof value.guildId !== "string") return false;
  return isRecord(value.user) && typeof value.user.id === "string";
}

/** Type guard for `guildMembersChunk` hub payloads (G3-p2 camelCase). */
export function isGuildMembersChunkPayload(value: unknown): value is GatewayGuildMembersChunk {
  if (!isRecord(value)) return false;
  if (typeof value.guildId !== "string") return false;
  return Array.isArray(value.members);
}

/** Type guard for `guildAuditLogEntryCreate` hub payloads (G3-p2 camelCase). */
export function isGuildAuditLogEntryCreatePayload(
  value: unknown,
): value is GatewayGuildAuditLogEntryCreate {
  if (!isRecord(value)) return false;
  return typeof value.id === "string" && typeof value.actionType === "number";
}
