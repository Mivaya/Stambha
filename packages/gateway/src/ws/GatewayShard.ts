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

    if (eventName === "READY") {
      const ready = data as { session_id?: string };
      if (ready.session_id) {
        this.sessionId = ready.session_id;
      }
      if (sequence !== null) {
        this.lastSequence = sequence;
      }
      manager.markReady(shardId, {
        sessionId: this.sessionId ?? "",
        sequence: this.lastSequence ?? 0,
      });
      if (shardId === 0) {
        const normalized = normalizeDispatch(eventName, data);
        hub.markReady(normalized as { user?: { id: string; username?: string } });
        hub.emit("ready", normalized);
      }
      return;
    }

    const hubEvent = gatewayEventToHubName(eventName);
    hub.emit(hubEvent, normalizeDispatch(eventName, data));
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
