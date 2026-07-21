import type { Bridge, BridgeEventHandler } from "@stambha/core";
import type {
  GatewayEventMap as DiscordGatewayEventMap,
  GatewayGuildCreate,
  GatewayReadyPayload,
} from "@stambha/transform";
import type { GatewayShardFatalError } from "./ws/constants.js";

/** READY / markReady payload (alias of transform {@link GatewayReadyPayload}). */
export type GatewayEventHubReadyPayload = GatewayReadyPayload;

/**
 * Hub event → payload map for typed {@link GatewayEventHub} listeners (G3a).
 * Extends Discord dispatch map with Stambha-only hub events.
 */
export type GatewayEventMap = DiscordGatewayEventMap & {
  guildAvailable: GatewayGuildCreate;
  guildUnavailable: GatewayGuildCreate;
  error: GatewayShardFatalError;
};

export type GatewayEventName = keyof GatewayEventMap;

/**
 * Native gateway event hub — implements {@link Bridge} without discord.js or Discordeno.
 * Your WebSocket shard worker calls {@link emit} with Discord payloads normalized to Stambha shapes.
 *
 * Listeners are typed via {@link GatewayEventMap} when the event name is a known key.
 */
export class GatewayEventHub implements Bridge {
  readonly id = "native";

  private readonly handlers = new Map<string, Set<BridgeEventHandler>>();
  private readyPayload: GatewayEventHubReadyPayload | null = null;

  async connect(): Promise<void> {
    if (this.readyPayload) {
      queueMicrotask(() => this.emit("ready", this.readyPayload));
    }
  }

  async disconnect(): Promise<void> {
    this.handlers.clear();
  }

  /** Call before {@link connect} when the gateway session is ready. */
  markReady(payload: GatewayEventHubReadyPayload): void {
    this.readyPayload = payload;
  }

  on<K extends keyof GatewayEventMap>(
    event: K,
    handler: (payload: GatewayEventMap[K]) => void,
  ): void;
  on(event: string, handler: BridgeEventHandler): void;
  on(event: string, handler: BridgeEventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  off<K extends keyof GatewayEventMap>(
    event: K,
    handler: (payload: GatewayEventMap[K]) => void,
  ): void;
  off(event: string, handler: BridgeEventHandler): void;
  off(event: string, handler: BridgeEventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  once<K extends keyof GatewayEventMap>(
    event: K,
    handler: (payload: GatewayEventMap[K]) => void,
  ): void;
  once(event: string, handler: BridgeEventHandler): void;
  once(event: string, handler: BridgeEventHandler): void {
    const wrapper: BridgeEventHandler = (payload) => {
      this.off(event, wrapper);
      handler(payload);
    };
    this.on(event, wrapper);
  }

  /** Emit stays loosely typed — producers pass `normalizeDispatch` (`unknown`) payloads. */
  emit(event: string, payload: unknown): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const handler of set) {
      void handler(payload);
    }
  }
}

export function createGatewayEventHub(): GatewayEventHub {
  return new GatewayEventHub();
}
