import type {
  GatewayGuildCreate,
  GatewayGuildMemberAdd,
  GatewayMessageReactionAdd,
  GatewayVoiceStateUpdate,
} from "./tier1Types.js";

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
