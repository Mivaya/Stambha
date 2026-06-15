import { DISCORD_API_VERSION } from "@stambha/transport";

/** Default Discord gateway WebSocket base (no query string). */
export const DISCORD_GATEWAY_BASE = "wss://gateway.discord.gg";

export const GATEWAY_ENCODING = "json" as const;

export function buildGatewayUrl(
  baseUrl = DISCORD_GATEWAY_BASE,
  version: string = DISCORD_API_VERSION,
): string {
  return `${baseUrl}/?v=${version}&encoding=${GATEWAY_ENCODING}`;
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

export interface GatewayPayload {
  readonly op: number;
  readonly d?: unknown;
  readonly s?: number | null;
  readonly t?: string | null;
}
