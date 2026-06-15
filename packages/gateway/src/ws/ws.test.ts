import { createSession } from "@stambha/transport";
import { describe, expect, it } from "vitest";
import { createGatewayEventHub } from "../GatewayEventHub.js";
import { createShardManager } from "../shard/ShardManager.js";
import { GatewayShard } from "./GatewayShard.js";
import { GatewayOpcode } from "./constants.js";
import {
  gatewayEventToHubName,
  interactionFromDispatch,
  messageFromDispatch,
  normalizeDispatch,
} from "./dispatch.js";
import type { CreateGatewayWebSocket, GatewayWebSocket } from "./socket.js";

describe("ws/dispatch", () => {
  it("maps gateway event names to hub camelCase", () => {
    expect(gatewayEventToHubName("MESSAGE_CREATE")).toBe("messageCreate");
    expect(gatewayEventToHubName("GUILD_MEMBER_ADD")).toBe("guildMemberAdd");
  });

  it("normalizes MESSAGE_CREATE to StambhaMessage", () => {
    const msg = messageFromDispatch({
      id: "1",
      content: "hi",
      channel_id: "c1",
      guild_id: "g1",
      author: { id: "u1", bot: false, username: "alice" },
    });
    expect(msg).toEqual({
      id: "1",
      content: "hi",
      channelId: "c1",
      guildId: "g1",
      author: { id: "u1", bot: false, username: "alice" },
    });
  });

  it("normalizes chat input INTERACTION_CREATE", () => {
    const interaction = interactionFromDispatch({
      id: "i1",
      token: "tok",
      type: 2,
      data: { name: "ping" },
      user: { id: "u1" },
      guild_id: "g1",
      channel_id: "c1",
    });
    expect(interaction?.commandName).toBe("ping");
    expect(interaction?.user.id).toBe("u1");
  });

  it("passes through unknown dispatch payloads", () => {
    const raw = { id: "g1", name: "Guild" };
    expect(normalizeDispatch("GUILD_CREATE", raw)).toBe(raw);
  });
});

class MockWebSocket implements GatewayWebSocket {
  readyState = 0;
  private listeners = new Map<string, Set<(event: unknown) => void>>();
  readonly sent: string[] = [];

  constructor(private readonly scripted: GatewayPayload[]) {}

  send(data: string): void {
    this.sent.push(data);
  }

  close(): void {
    this.readyState = 3;
  }

  addEventListener(
    type: "open" | "message" | "close" | "error",
    listener: (event: unknown) => void,
  ): void {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)?.add(listener);
  }

  removeEventListener(
    type: "open" | "message" | "close" | "error",
    listener: (event: unknown) => void,
  ): void {
    this.listeners.get(type)?.delete(listener);
  }

  async open(): Promise<void> {
    this.readyState = 1;
    for (const fn of this.listeners.get("open") ?? []) fn({});
  }

  push(payload: GatewayPayload): void {
    for (const fn of this.listeners.get("message") ?? []) {
      fn({ data: JSON.stringify(payload) });
    }
  }
}

interface GatewayPayload {
  op: number;
  d?: unknown;
  s?: number | null;
  t?: string | null;
}

describe("GatewayShard", () => {
  it("identifies after Hello and emits normalized messageCreate", async () => {
    const hub = createGatewayEventHub();
    const events: unknown[] = [];
    hub.on("messageCreate", (payload) => events.push(payload));

    const scripted: GatewayPayload[] = [
      { op: GatewayOpcode.Hello, d: { heartbeat_interval: 60_000 } },
      {
        op: GatewayOpcode.Dispatch,
        t: "MESSAGE_CREATE",
        s: 1,
        d: {
          id: "m1",
          content: "!ping",
          channel_id: "c1",
          guild_id: "g1",
          author: { id: "u1", bot: false },
        },
      },
    ];

    const sockets: MockWebSocket[] = [];
    const createWebSocket: CreateGatewayWebSocket = () => {
      const socket = new MockWebSocket(scripted);
      sockets.push(socket);
      return socket;
    };

    const shard = new GatewayShard({
      session: createSession({ token: "test-token" }),
      shardId: 0,
      totalShards: 1,
      intents: 1,
      hub,
      manager: createShardManager({ totalShards: 1 }),
      gatewayUrl: "wss://gateway.test/?v=10&encoding=json",
      createWebSocket,
    });

    const connectPromise = shard.connect();
    await sockets[0]?.open();
    await connectPromise;

    const hello = scripted.find((p) => p.op === GatewayOpcode.Hello);
    if (hello) sockets[0]?.push(hello);
    await new Promise((resolve) => setImmediate(resolve));

    expect(sockets[0]?.sent.some((line) => line.includes('"op":2'))).toBe(true);

    const dispatch = scripted.find((p) => p.t === "MESSAGE_CREATE");
    if (dispatch) sockets[0]?.push(dispatch);
    expect(events[0]).toMatchObject({
      content: "!ping",
      author: { id: "u1", bot: false },
    });

    await shard.disconnect();
  });
});
