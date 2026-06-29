import { createSession, type SessionInfo } from "@stambha/transport";
import type { GatewayEventHub } from "../GatewayEventHub.js";
import { createIdentifyBudget, type IdentifyBudget } from "../reshard/IdentifyBudget.js";
import type { BuildIdentifyOptions } from "../shard/identify.js";
import { createShardManager, type ShardManager } from "../shard/ShardManager.js";
import { buildGatewayUrl } from "./constants.js";
import { fetchGatewayBot } from "./fetchGatewayBot.js";
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
  /** Inject WebSocket factory (tests). */
  createWebSocket?: CreateGatewayWebSocket;
  properties?: BuildIdentifyOptions["properties"];
  reconnectDelayMs?: number;
  /** Custom fetch for `/gateway/bot` (tests). */
  fetch?: typeof fetch;
}

export interface NativeGatewayClient {
  readonly session: SessionInfo;
  readonly shardManager: ShardManager;
  readonly shards: readonly GatewayShard[];
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

  if (totalShards === undefined || gatewayBaseUrl === undefined) {
    try {
      const bot = await fetchGatewayBot(options.token, fetchFn);
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
  const identifyBudget = options.identifyBudget ?? createIdentifyBudget();
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
    return new GatewayShard(shardOptions);
  });

  return {
    session,
    shardManager,
    shards,
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
