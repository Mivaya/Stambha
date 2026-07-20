import type { NormalizeDispatchMode } from "@stambha/transform";
import { createSession, type SessionInfo } from "@stambha/transport";
import type { GatewayEventHub } from "../GatewayEventHub.js";
import {
  createIdentifyBudget,
  type IdentifyBudget,
  type SessionStartLimit,
} from "../reshard/IdentifyBudget.js";
import type { BuildIdentifyOptions } from "../shard/identify.js";
import { createShardManager, type ShardManager } from "../shard/ShardManager.js";
import { buildGatewayUrl } from "./constants.js";
import { fetchGatewayBot, type GatewayBotResponse } from "./fetchGatewayBot.js";
import { GatewayShard, type GatewayShardOptions } from "./GatewayShard.js";
import { type CreateGatewayWebSocket, resolveWebSocketFactory } from "./socket.js";

export interface NativeGatewayClientOptions {
  /** Bot token (used for identify and optional `/gateway/bot` lookup). */
  token: string;
  /** Event hub that receives normalized gateway events. */
  hub: GatewayEventHub;
  /** Gateway intents bitmask. */
  intents: bigint | number;
  /**
   * Total shard count. When omitted, fetched from `GET /gateway/bot`.
   * Use `1` for single-shard bots without a REST round-trip.
   */
  totalShards?: number;
  /** Subset of shard ids to connect in this process (default: all `0..totalShards-1`). */
  shardIds?: number[];
  /** Override gateway WebSocket URL (default: value from `/gateway/bot` or Discord default). */
  gatewayUrl?: string;
  /** Existing shard manager (created when omitted). */
  shardManager?: ShardManager;
  /** Rate-limit identify calls across shards. */
  identifyBudget?: IdentifyBudget;
  /**
   * Override `session_start_limit.max_concurrency` when building the default budget.
   * Ignored when `identifyBudget` is provided.
   */
  maxConcurrency?: number;
  /** Inject WebSocket factory (tests). */
  createWebSocket?: CreateGatewayWebSocket;
  properties?: BuildIdentifyOptions["properties"];
  reconnectDelayMs?: number;
  /** Cap for exponential reconnect backoff (default 60_000). */
  reconnectMaxDelayMs?: number;
  /** Custom fetch for `/gateway/bot` (tests). */
  fetch?: typeof fetch;
  /**
   * Gateway dispatch payload normalization (G3-p1).
   * `default` — Tier 1 camelCase at hub; `raw` — wire snake_case escape hatch.
   */
  dispatchNormalize?: NormalizeDispatchMode;
  /**
   * When true, defer hub `ready` (shard 0) until all READY guild stubs have
   * arrived as `GUILD_CREATE` / `guildAvailable` (discord.js-style).
   */
  waitForGuilds?: boolean;
}

export interface NativeGatewayClient {
  readonly session: SessionInfo;
  readonly shardManager: ShardManager;
  readonly shards: readonly GatewayShard[];
  /** Identify budget used by shards (exposed for operators / tests). */
  readonly identifyBudget: IdentifyBudget;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

/**
 * Connect native WebSocket shard(s) to a {@link GatewayEventHub}.
 * This is the 0.3.0 bundled gateway client (release-plan N1 / future-v2 A5).
 */
export async function createNativeGatewayClient(
  options: NativeGatewayClientOptions,
): Promise<NativeGatewayClient> {
  const session = createSession({ token: options.token });
  const fetchFn = options.fetch ?? fetch;

  let gatewayBaseUrl = options.gatewayUrl;
  let totalShards = options.totalShards;
  let bot: GatewayBotResponse | undefined;

  if (totalShards === undefined || gatewayBaseUrl === undefined || !options.identifyBudget) {
    try {
      bot = await fetchGatewayBot(options.token, fetchFn);
      totalShards ??= bot.shards;
      gatewayBaseUrl ??= bot.url;
    } catch (error) {
      if (totalShards === undefined) {
        throw error;
      }
      gatewayBaseUrl ??= "wss://gateway.discord.gg";
    }
  }

  totalShards ??= 1;
  const gatewayUrl = buildGatewayUrl(gatewayBaseUrl);
  const shardManager = options.shardManager ?? createShardManager({ totalShards });

  const identifyBudget =
    options.identifyBudget ??
    createIdentifyBudget({
      maxConcurrency:
        options.maxConcurrency ?? bot?.session_start_limit?.max_concurrency ?? 1,
      ...(bot?.session_start_limit
        ? {
            sessionStartLimit: sessionStartLimitFromBot(bot.session_start_limit),
          }
        : {}),
    });

  const createWebSocket = options.createWebSocket ?? (await resolveWebSocketFactory());

  const shardIds = options.shardIds ?? Array.from({ length: totalShards }, (_, i) => i);

  const shards = shardIds.map((shardId) => {
    const shardOptions: GatewayShardOptions = {
      session,
      shardId,
      totalShards,
      intents: options.intents,
      hub: options.hub,
      manager: shardManager,
      gatewayUrl,
      identifyBudget,
      createWebSocket,
    };
    if (options.properties !== undefined) shardOptions.properties = options.properties;
    if (options.reconnectDelayMs !== undefined)
      shardOptions.reconnectDelayMs = options.reconnectDelayMs;
    if (options.reconnectMaxDelayMs !== undefined)
      shardOptions.reconnectMaxDelayMs = options.reconnectMaxDelayMs;
    if (options.dispatchNormalize !== undefined)
      shardOptions.dispatchNormalize = options.dispatchNormalize;
    if (options.waitForGuilds !== undefined) shardOptions.waitForGuilds = options.waitForGuilds;
    return new GatewayShard(shardOptions);
  });

  return {
    session,
    shardManager,
    shards,
    identifyBudget,
    async connect() {
      await options.hub.connect();
      for (const shard of shards) {
        await shard.connect();
      }
    },
    async disconnect() {
      await Promise.all(shards.map((s) => s.disconnect()));
      await options.hub.disconnect();
    },
  };
}

function sessionStartLimitFromBot(limit: NonNullable<GatewayBotResponse["session_start_limit"]>): SessionStartLimit {
  return {
    remaining: limit.remaining,
    resetAfter: limit.reset_after,
    total: limit.total,
  };
}
