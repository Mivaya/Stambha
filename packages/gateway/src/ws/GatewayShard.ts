import type { NormalizeDispatchMode } from "@stambha/transform";
import type { SessionInfo } from "@stambha/transport";
import type { GatewayEventHub } from "../GatewayEventHub.js";
import type { IdentifyBudget } from "../reshard/IdentifyBudget.js";
import {
  type BuildIdentifyOptions,
  buildIdentifyPayload,
  buildResumePayload,
} from "../shard/identify.js";
import type { ShardManager } from "../shard/ShardManager.js";
import {
  buildGatewayUrl,
  classifyCloseCode,
  GatewayOpcode,
  type GatewayPayload,
  type GatewayShardFatalError,
} from "./constants.js";
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
  /**
   * Base delay (ms) for exponential reconnect backoff (default 1000).
   * Legacy fixed-delay name — still accepted as the backoff base.
   */
  reconnectDelayMs?: number;
  /** Cap for reconnect backoff (default 60_000). */
  reconnectMaxDelayMs?: number;
  /**
   * Gateway dispatch payload normalization (G3-p1).
   * `default` — Tier 1 camelCase at hub; `raw` — wire snake_case escape hatch.
   */
  dispatchNormalize?: NormalizeDispatchMode;
}

export class GatewayShard {
  private readonly options: GatewayShardOptions;
  private socket: GatewayWebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private lastSequence: number | null = null;
  private sessionId: string | null = null;
  /** From READY `resume_gateway_url` — used for resume reconnects. */
  private resumeGatewayUrl: string | null = null;
  private heartbeatAck = true;
  private closed = false;
  private connectPromise: Promise<void> | null = null;
  private reconnectAttempt = 0;
  /** Skip `onClose` while we intentionally tear down for reconnect. */
  private ignoreClose = false;
  /** URL used for the most recent socket open (tests / diagnostics). */
  private lastConnectUrl: string | null = null;

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

  /** Most recent WebSocket URL this shard connected to. */
  get connectUrl(): string | null {
    return this.lastConnectUrl;
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

  private resolveConnectUrl(): string {
    if (
      this.sessionId &&
      this.resumeGatewayUrl &&
      this.lastSequence !== null &&
      this.options.manager.canResume(this.options.shardId)
    ) {
      return buildGatewayUrl(this.resumeGatewayUrl);
    }
    return this.options.gatewayUrl;
  }

  private async openSocket(): Promise<void> {
    const { createWebSocket } = this.options;
    const url = this.resolveConnectUrl();
    this.lastConnectUrl = url;
    const socket = createWebSocket(url);

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
    socket.addEventListener("close", (event) => this.onClose(event));
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
        void this.reconnect();
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
        void this.reconnect();
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
    const shardId = this.options.shardId;
    if (budget) await budget.acquire(shardId);
    try {
      this.options.manager.markIdentifying(shardId);
      const identifyOptions: BuildIdentifyOptions = {
        session: this.options.session,
        shardId,
        totalShards: this.options.totalShards,
        intents: this.options.intents,
      };
      if (this.options.properties !== undefined) {
        identifyOptions.properties = this.options.properties;
      }
      const identify = buildIdentifyPayload(identifyOptions);
      this.send(identify);
    } finally {
      budget?.release(shardId);
    }
  }

  private onInvalidSession(resumable: boolean): void {
    this.sessionId = null;
    this.lastSequence = null;
    this.resumeGatewayUrl = null;
    this.options.manager.markDisconnected(this.options.shardId);
    if (resumable) {
      void this.identify();
    } else {
      void this.reconnect({ resetSession: true });
    }
  }

  private onDispatch(eventName: string, data: unknown, sequence: number | null): void {
    const { hub, manager, shardId } = this.options;
    const normalizeOptions =
      this.options.dispatchNormalize === "raw" ? { mode: "raw" as const } : undefined;

    if (eventName === "READY") {
      const ready = data as { session_id?: string; resume_gateway_url?: string };
      if (ready.session_id) {
        this.sessionId = ready.session_id;
      }
      if (typeof ready.resume_gateway_url === "string" && ready.resume_gateway_url.length > 0) {
        this.resumeGatewayUrl = ready.resume_gateway_url;
      }
      if (sequence !== null) {
        this.lastSequence = sequence;
      }
      this.reconnectAttempt = 0;
      manager.markReady(shardId, {
        sessionId: this.sessionId ?? "",
        sequence: this.lastSequence ?? 0,
      });
      if (shardId === 0) {
        const normalized = normalizeDispatch(eventName, data, normalizeOptions);
        hub.markReady(normalized as { user?: { id: string; username?: string } });
        hub.emit("ready", normalized);
      }
      return;
    }

    if (eventName === "RESUMED") {
      this.reconnectAttempt = 0;
    }

    const hubEvent = gatewayEventToHubName(eventName);
    hub.emit(hubEvent, normalizeDispatch(eventName, data, normalizeOptions));
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

  private nextBackoffMs(): number {
    const base = this.options.reconnectDelayMs ?? 1000;
    const max = this.options.reconnectMaxDelayMs ?? 60_000;
    const exp = Math.min(max, base * 2 ** this.reconnectAttempt);
    // Full jitter: random in [0, exp]
    return Math.floor(Math.random() * exp);
  }

  private async reconnect(options?: { resetSession?: boolean }): Promise<void> {
    if (this.closed) return;
    this.clearHeartbeat();
    this.ignoreClose = true;
    try {
      this.socket?.close();
    } finally {
      this.ignoreClose = false;
      this.socket = null;
    }

    if (options?.resetSession) {
      this.sessionId = null;
      this.lastSequence = null;
      this.resumeGatewayUrl = null;
      this.options.manager.markDisconnected(this.options.shardId);
    }

    const delay = this.nextBackoffMs();
    this.reconnectAttempt += 1;
    await new Promise((r) => setTimeout(r, delay));
    if (!this.closed) {
      await this.openSocket();
    }
  }

  private onClose(event: unknown): void {
    if (this.closed || this.ignoreClose) return;

    const code =
      typeof event === "object" && event !== null && "code" in event
        ? Number((event as { code: unknown }).code)
        : 1006;
    const reason =
      typeof event === "object" && event !== null && "reason" in event
        ? String((event as { reason: unknown }).reason ?? "")
        : "";

    const action = classifyCloseCode(Number.isFinite(code) ? code : 1006);

    if (action === "fatal") {
      this.closed = true;
      this.clearHeartbeat();
      this.socket = null;
      this.options.manager.markDisconnected(this.options.shardId);
      const error: GatewayShardFatalError = {
        type: "fatal_close",
        shardId: this.options.shardId,
        code,
        reason,
        message: `Gateway shard ${this.options.shardId} stopped: fatal close code ${code}`,
      };
      this.options.hub.emit("error", error);
      return;
    }

    if (action === "reidentify") {
      void this.reconnect({ resetSession: true });
      return;
    }

    void this.reconnect();
  }
}
