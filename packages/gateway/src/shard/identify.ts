import type { SessionInfo } from "@stambha/transport";

/**
 * Identify `capabilities` bitfield (temporary Discord testing flags).
 * @see https://docs.discord.com/developers/change-log — Channel Obfuscation
 */
export const GatewayIdentifyCapability = {
  /** Opt into private channel obfuscation early (`1 << 15`). */
  PrivateChannelObfuscation: 1 << 15,
} as const;

/** Gateway opcode 2 — Identify */
export interface GatewayIdentifyPayload {
  readonly op: 2;
  readonly d: {
    readonly token: string;
    readonly intents: number | string;
    readonly properties: {
      readonly $os: string;
      readonly $browser: string;
      readonly $device: string;
    };
    readonly shard: [number, number];
    /** Optional Discord identify capabilities bitfield. */
    readonly capabilities?: number;
  };
}

/** Gateway opcode 6 — Resume */
export interface GatewayResumePayload {
  readonly op: 6;
  readonly d: {
    readonly token: string;
    readonly session_id: string;
    readonly seq: number;
  };
}

export interface BuildIdentifyOptions {
  session: SessionInfo;
  shardId: number;
  totalShards: number;
  intents: bigint | number;
  properties?: { os?: string; browser?: string; device?: string };
  /**
   * Discord Identify `capabilities` bitfield (e.g.
   * {@link GatewayIdentifyCapability.PrivateChannelObfuscation}).
   */
  capabilities?: number;
}

export function buildIdentifyPayload(options: BuildIdentifyOptions): GatewayIdentifyPayload {
  const intents = typeof options.intents === "bigint" ? Number(options.intents) : options.intents;
  return {
    op: 2,
    d: {
      token: options.session.token,
      intents,
      properties: {
        $os: options.properties?.os ?? "linux",
        $browser: options.properties?.browser ?? "stambha",
        $device: options.properties?.device ?? "stambha",
      },
      shard: [options.shardId, options.totalShards],
      ...(options.capabilities !== undefined ? { capabilities: options.capabilities } : {}),
    },
  };
}

/** Gateway opcode 8 — Request Guild Members */
export interface GatewayRequestGuildMembersPayload {
  readonly op: 8;
  readonly d: {
    readonly guild_id: string;
    readonly query: string;
    readonly limit: number;
    readonly presences?: boolean;
    readonly user_ids?: string | readonly string[];
    readonly nonce?: string;
  };
}

export interface BuildRequestGuildMembersOptions {
  guildId: string;
  /** Empty string + `limit: 0` requests all members (rate-limited to 1/guild/bot/30s). */
  query?: string;
  limit?: number;
  presences?: boolean;
  userIds?: string | readonly string[];
  nonce?: string;
}

/** Build a Request Guild Members (opcode 8) payload. */
export function buildRequestGuildMembersPayload(
  options: BuildRequestGuildMembersOptions,
): GatewayRequestGuildMembersPayload {
  return {
    op: 8,
    d: {
      guild_id: options.guildId,
      query: options.query ?? "",
      limit: options.limit ?? 0,
      ...(options.presences !== undefined ? { presences: options.presences } : {}),
      ...(options.userIds !== undefined ? { user_ids: options.userIds } : {}),
      ...(options.nonce !== undefined ? { nonce: options.nonce } : {}),
    },
  };
}

export function buildResumePayload(
  session: SessionInfo,
  sessionId: string,
  sequence: number,
): GatewayResumePayload {
  return {
    op: 6,
    d: {
      token: session.token,
      session_id: sessionId,
      seq: sequence,
    },
  };
}

/** Common gateway intents (subset; extend as needed). */
export const GatewayIntent = {
  Guilds: 1n << 0n,
  GuildMessages: 1n << 9n,
  MessageContent: 1n << 15n,
  DirectMessages: 1n << 12n,
} as const;

export function combineIntents(...flags: bigint[]): bigint {
  return flags.reduce((acc, f) => acc | f, 0n);
}
