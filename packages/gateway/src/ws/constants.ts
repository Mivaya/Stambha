import { DISCORD_API_VERSION } from "@stambha/transport";

/** Default Discord gateway WebSocket base (no query string). */
export const DISCORD_GATEWAY_BASE = "wss://gateway.discord.gg";

export const GATEWAY_ENCODING = "json" as const;

export function buildGatewayUrl(
  baseUrl = DISCORD_GATEWAY_BASE,
  version: string = DISCORD_API_VERSION,
): string {
  // Discord may return a resume URL that already includes a path/query — keep it.
  if (baseUrl.includes("?")) return baseUrl;
  const trimmed = baseUrl.replace(/\/$/, "");
  return `${trimmed}/?v=${version}&encoding=${GATEWAY_ENCODING}`;
}

/** Discord gateway opcodes (subset used by the native client). */
export const GatewayOpcode = {
  Dispatch: 0,
  Heartbeat: 1,
  Identify: 2,
  Resume: 6,
  Reconnect: 7,
  InvalidSession: 9,
  Hello: 10,
  HeartbeatAck: 11,
} as const;

/**
 * Discord gateway close codes that must not reconnect in a loop.
 * @see https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-close-event-codes
 */
export const GatewayCloseCode = {
  AuthenticationFailed: 4004,
  InvalidShard: 4010,
  ShardingRequired: 4011,
  InvalidApiVersion: 4012,
  InvalidIntents: 4013,
  DisallowedIntents: 4014,
} as const;

export type GatewayCloseAction = "resume" | "reidentify" | "fatal";

const FATAL_CLOSE_CODES = new Set<number>([
  GatewayCloseCode.AuthenticationFailed,
  GatewayCloseCode.InvalidShard,
  GatewayCloseCode.ShardingRequired,
  GatewayCloseCode.InvalidApiVersion,
  GatewayCloseCode.InvalidIntents,
  GatewayCloseCode.DisallowedIntents,
]);

/** Close codes that invalidate the session — reconnect and Identify fresh. */
const REIDENTIFY_CLOSE_CODES = new Set<number>([
  4003, // Not authenticated
  4007, // Invalid seq
]);

/**
 * Classify a WebSocket close code for reconnect policy.
 * Unknown / standard codes default to resume (keep session when possible).
 */
export function classifyCloseCode(code: number): GatewayCloseAction {
  if (FATAL_CLOSE_CODES.has(code)) return "fatal";
  if (REIDENTIFY_CLOSE_CODES.has(code)) return "reidentify";
  return "resume";
}

export interface GatewayPayload {
  readonly op: number;
  readonly d?: unknown;
  readonly s?: number | null;
  readonly t?: string | null;
}

/** Payload emitted on hub `error` when a fatal close stops the shard. */
export interface GatewayShardFatalError {
  readonly type: "fatal_close";
  readonly shardId: number;
  readonly code: number;
  readonly reason: string;
  readonly message: string;
}
