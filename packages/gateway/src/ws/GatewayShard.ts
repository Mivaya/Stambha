import type { NormalizeDispatchMode } from "@stambha/transform";
import { guildIdsFromReady } from "@stambha/transform";
import type { SessionInfo } from "@stambha/transport";
import type { GatewayEventHub } from "../GatewayEventHub.js";
import type { IdentifyBudget } from "../reshard/IdentifyBudget.js";
import {
  type BuildIdentifyOptions,
  buildIdentifyPayload,
  buildResumePayload,
} from "../shard/identify.js";
import type { ShardManager } from "../shard/ShardManager.js";
import { GatewayOpcode, type GatewayPayload } from "./constants.js";
import { gatewayEventToHubName, normalizeDispatch } from "./dispatch.js";
import type { CreateGatewayWebSocket, GatewayWebSocket } from "./socket.js";
import { WS_OPEN } from "./socket.js";

export interface GatewayShardOptions {
  session: SessionInfo;
  shardId: number;
  totalShards: number;
  intents: bigint | number;
  hub: GatewayEventHub;
  manager: ShardManager;
  gatewayUrl: string;
  identifyBudget?: IdentifyBudget;
  createWebSocket: CreateGatewayWebSocket;
  properties?: BuildIdentifyOptions["properties"];
  /** Delay before reconnect after Discord opcode 7. */
  reconnectDelayMs?: number;
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

function payloadGuildId(data: unknown): string | null {
  if (data && typeof data === "object" && "id" in data) {
    const id = (data as { id: unknown }).id;
    return typeof id === "string" && id.length > 0 ? id : null;
  }
  return null;
}

function isUnavailableGuildDelete(data: unknown): boolean {
  return Boolean(
    data && typeof data === "object" && (data as { unavailable?: unknown }).unavailable === true,
  );
}

export class GatewayShard {
  private readonly options: GatewayShardOptions;
  private socket: GatewayWebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private lastSequence: number | null = null;
  private sessionId: string | null = null;
  private heartbeatAck = true;
  private closed = false;
  private connectPromise: Promise<void> | null = null;
  /** Guild ids from the last READY (startup backfill set). */
  private startupGuildIds = new Set<string>();
  /** READY guilds still waiting for their initial GUILD_CREATE. */
  private pendingGuildIds = new Set<string>();
  private readyEmitted = false;
  private pendingReadyPayload: unknown = null;

  constructor(options: GatewayShardOptions) {
    this.options = options;
    const existing = options.manager.get(options.shardId);
    if (existing?.sessionId) {
      this.sessionId = existing.sessionId;
      this.lastSequence = existing.sequence;
    }
  }

  get id(): number {
    return this.options.shardId;
  }

  async connect(): Promise<void> {
    if (this.connectPromise) return this.connectPromise;
    this.closed = false;
    this.connectPromise = this.openSocket();
    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  async disconnect(): Promise<void> {
    this.closed = true;
    this.clearHeartbeat();
    this.socket?.close(1000, "shutdown");
    this.socket = null;
    this.options.manager.markDisconnected(this.options.shardId);
  }

  private async openSocket(): Promise<void> {
    const { createWebSocket, gatewayUrl } = this.options;
    const socket = createWebSocket(gatewayUrl);

    await new Promise<void>((resolve, reject) => {
      const onOpen = () => {
        cleanup();
        resolve();
      };
      const onError = (event: unknown) => {
        cleanup();
        reject(event instanceof Error ? event : new Error("WebSocket connection failed"));
      };
      const cleanup = () => {
        socket.removeEventListener("open", onOpen);
        socket.removeEventListener("error", onError);
      };
      socket.addEventListener("open", onOpen);
      socket.addEventListener("error", onError);
    });

    this.socket = socket;
    socket.addEventListener("message", (event) => this.onMessage(event));
    socket.addEventListener("close", () => this.onClose());
  }

  private onMessage(event: unknown): void {
    const raw = (event as { data?: string })?.data;
    if (typeof raw !== "string") return;

    let payload: GatewayPayload;
    try {
      payload = JSON.parse(raw) as GatewayPayload;
    } catch {
      return;
    }

    if (payload.s != null) {
      this.lastSequence = payload.s;
    }

    switch (payload.op) {
      case GatewayOpcode.Hello:
        this.onHello(payload.d as { heartbeat_interval: number });
        break;
      case GatewayOpcode.HeartbeatAck:
        this.heartbeatAck = true;
        break;
      case GatewayOpcode.Heartbeat:
        this.sendHeartbeat();
        break;
      case GatewayOpcode.Reconnect:
        this.reconnect();
        break;
      case GatewayOpcode.InvalidSession:
        this.onInvalidSession(Boolean(payload.d));
        break;
      case GatewayOpcode.Dispatch:
        this.onDispatch(payload.t ?? "", payload.d, payload.s ?? null);
        break;
    }
  }

  private async onHello(data: { heartbeat_interval: number }): Promise<void> {
    this.clearHeartbeat();
    const interval = data.heartbeat_interval;
    this.heartbeatTimer = setInterval(() => {
      if (!this.heartbeatAck) {
        this.reconnect();
        return;
      }
      this.heartbeatAck = false;
      this.sendHeartbeat();
    }, interval);

    if (
      this.sessionId &&
      this.lastSequence !== null &&
      this.options.manager.canResume(this.options.shardId)
    ) {
      this.options.manager.markResuming(this.options.shardId);
      this.send(buildResumePayload(this.options.session, this.sessionId, this.lastSequence));
      return;
    }

    await this.identify();
  }

  private async identify(): Promise<void> {
    const budget = this.options.identifyBudget;
    if (budget) await budget.acquire();
    try {
      this.options.manager.markIdentifying(this.options.shardId);
      const identifyOptions: BuildIdentifyOptions = {
        session: this.options.session,
        shardId: this.options.shardId,
        totalShards: this.options.totalShards,
        intents: this.options.intents,
      };
      if (this.options.properties !== undefined) {
        identifyOptions.properties = this.options.properties;
      }
      const identify = buildIdentifyPayload(identifyOptions);
      this.send(identify);
    } finally {
      budget?.release();
    }
  }

  private onInvalidSession(resumable: boolean): void {
    this.sessionId = null;
    this.lastSequence = null;
    this.options.manager.markDisconnected(this.options.shardId);
    if (resumable) {
      void this.identify();
    } else {
      void this.reconnect();
    }
  }

  private onDispatch(eventName: string, data: unknown, sequence: number | null): void {
    const { hub, manager, shardId } = this.options;
    const normalizeOptions =
      this.options.dispatchNormalize === "raw" ? { mode: "raw" as const } : undefined;

    if (eventName === "READY") {
      const ready = data as { session_id?: string };
      if (ready.session_id) {
        this.sessionId = ready.session_id;
      }
      if (sequence !== null) {
        this.lastSequence = sequence;
      }

      const guildIds = guildIdsFromReady(data);
      this.startupGuildIds = new Set(guildIds);
      this.pendingGuildIds = new Set(guildIds);
      this.readyEmitted = false;

      manager.markReady(shardId, {
        sessionId: this.sessionId ?? "",
        sequence: this.lastSequence ?? 0,
      });

      const normalized = normalizeDispatch(eventName, data, normalizeOptions);
      if (shardId === 0) {
        this.pendingReadyPayload = normalized;
        if (!this.options.waitForGuilds || this.pendingGuildIds.size === 0) {
          this.emitReady();
        }
      }
      return;
    }

    if (eventName === "GUILD_CREATE") {
      const normalized = normalizeDispatch(eventName, data, normalizeOptions);
      const guildId = payloadGuildId(data);
      if (guildId && this.startupGuildIds.has(guildId)) {
        this.pendingGuildIds.delete(guildId);
        hub.emit("guildAvailable", normalized);
        if (shardId === 0 && this.options.waitForGuilds) {
          this.emitReady();
        }
        return;
      }
      hub.emit("guildCreate", normalized);
      return;
    }

    if (eventName === "GUILD_DELETE") {
      const normalized = normalizeDispatch(eventName, data, normalizeOptions);
      const guildId = payloadGuildId(data);
      if (isUnavailableGuildDelete(data)) {
        hub.emit("guildUnavailable", normalized);
        return;
      }
      if (guildId) {
        this.startupGuildIds.delete(guildId);
        this.pendingGuildIds.delete(guildId);
      }
      hub.emit("guildDelete", normalized);
      return;
    }

    const hubEvent = gatewayEventToHubName(eventName);
    hub.emit(hubEvent, normalizeDispatch(eventName, data, normalizeOptions));
  }

  private emitReady(): void {
    if (this.readyEmitted || this.options.shardId !== 0) return;
    if (this.options.waitForGuilds && this.pendingGuildIds.size > 0) return;
    const payload = this.pendingReadyPayload;
    if (payload === null) return;
    this.readyEmitted = true;
    this.pendingReadyPayload = null;
    const { hub } = this.options;
    hub.markReady(payload as { user?: { id: string; username?: string } });
    hub.emit("ready", payload);
  }

  private sendHeartbeat(): void {
    this.send({ op: GatewayOpcode.Heartbeat, d: this.lastSequence });
  }

  private send(payload: unknown): void {
    if (!this.socket || this.socket.readyState !== WS_OPEN) return;
    this.socket.send(JSON.stringify(payload));
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private async reconnect(): Promise<void> {
    if (this.closed) return;
    this.clearHeartbeat();
    this.socket?.close();
    this.socket = null;
    const delay = this.options.reconnectDelayMs ?? 5000;
    await new Promise((r) => setTimeout(r, delay));
    if (!this.closed) {
      await this.openSocket();
    }
  }

  private onClose(): void {
    if (!this.closed) {
      void this.reconnect();
    }
  }
}
