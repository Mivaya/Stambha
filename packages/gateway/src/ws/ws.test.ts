import { createSession } from "@stambha/transport";
import { describe, expect, it } from "vitest";
import { createGatewayEventHub } from "../GatewayEventHub.js";
import { createShardManager } from "../shard/ShardManager.js";
import { GatewayOpcode } from "./constants.js";
import {
  gatewayEventToHubName,
  interactionFromDispatch,
  messageFromDispatch,
  normalizeDispatch,
} from "./dispatch.js";
import { GatewayShard } from "./GatewayShard.js";
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
    expect(interaction?.kind).toBe("slash");
    if (interaction?.kind === "slash") {
      expect(interaction.commandName).toBe("ping");
      expect(interaction.user.id).toBe("u1");
    }
  });

  it("camelizes Tier 1 dispatch payloads", () => {
    const raw = { id: "g1", name: "Guild", owner_id: "u1" };
    expect(normalizeDispatch("GUILD_CREATE", raw)).toEqual({
      id: "g1",
      name: "Guild",
      ownerId: "u1",
    });
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

  it("emits camelCase Tier 1 payloads from gateway dispatch", async () => {
    const hub = createGatewayEventHub();
    const events: unknown[] = [];
    hub.on("guildMemberAdd", (payload) => events.push(payload));

    const scripted: GatewayPayload[] = [
      { op: GatewayOpcode.Hello, d: { heartbeat_interval: 60_000 } },
      {
        op: GatewayOpcode.Dispatch,
        t: "GUILD_MEMBER_ADD",
        s: 2,
        d: {
          user: { id: "u2", username: "bob" },
          guild_id: "g1",
          roles: ["r1"],
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

    sockets[0]?.push(scripted[0]!);
    await new Promise((resolve) => setImmediate(resolve));

    sockets[0]?.push(scripted[1]!);
    expect(events[0]).toMatchObject({
      guildId: "g1",
      user: { id: "u2", username: "bob" },
    });

    await shard.disconnect();
  });

  it("preserves raw snake_case when dispatchNormalize is raw", async () => {
    const hub = createGatewayEventHub();
    const events: unknown[] = [];
    hub.on("guildCreate", (payload) => events.push(payload));

    const rawGuild = { id: "g1", name: "Guild", owner_id: "u1" };
    const scripted: GatewayPayload[] = [
      { op: GatewayOpcode.Hello, d: { heartbeat_interval: 60_000 } },
      { op: GatewayOpcode.Dispatch, t: "GUILD_CREATE", s: 2, d: rawGuild },
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
      dispatchNormalize: "raw",
    });

    const connectPromise = shard.connect();
    await sockets[0]?.open();
    await connectPromise;

    sockets[0]?.push(scripted[0]!);
    await new Promise((resolve) => setImmediate(resolve));
    sockets[0]?.push(scripted[1]!);

    expect(events[0]).toEqual(rawGuild);
    expect((events[0] as typeof rawGuild).owner_id).toBe("u1");
    await shard.disconnect();
  });

  it("emits guildAvailable for READY backfill GUILD_CREATE", async () => {
    const hub = createGatewayEventHub();
    const available: unknown[] = [];
    const created: unknown[] = [];
    hub.on("guildAvailable", (payload) => available.push(payload));
    hub.on("guildCreate", (payload) => created.push(payload));

    const scripted: GatewayPayload[] = [
      { op: GatewayOpcode.Hello, d: { heartbeat_interval: 60_000 } },
      {
        op: GatewayOpcode.Dispatch,
        t: "READY",
        s: 1,
        d: {
          session_id: "sess",
          user: { id: "bot", username: "bot" },
          guilds: [{ id: "g1", unavailable: true }],
        },
      },
      {
        op: GatewayOpcode.Dispatch,
        t: "GUILD_CREATE",
        s: 2,
        d: { id: "g1", name: "Guild", owner_id: "u1" },
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

    sockets[0]?.push(scripted[0]!);
    await new Promise((resolve) => setImmediate(resolve));
    sockets[0]?.push(scripted[1]!);
    sockets[0]?.push(scripted[2]!);

    expect(available).toHaveLength(1);
    expect(available[0]).toMatchObject({ id: "g1", name: "Guild", ownerId: "u1" });
    expect(created).toHaveLength(0);
    await shard.disconnect();
  });

  it("emits guildCreate for joins after ready", async () => {
    const hub = createGatewayEventHub();
    const available: unknown[] = [];
    const created: unknown[] = [];
    hub.on("guildAvailable", (payload) => available.push(payload));
    hub.on("guildCreate", (payload) => created.push(payload));

    const scripted: GatewayPayload[] = [
      { op: GatewayOpcode.Hello, d: { heartbeat_interval: 60_000 } },
      {
        op: GatewayOpcode.Dispatch,
        t: "READY",
        s: 1,
        d: { session_id: "sess", user: { id: "bot" }, guilds: [] },
      },
      {
        op: GatewayOpcode.Dispatch,
        t: "GUILD_CREATE",
        s: 2,
        d: { id: "g-new", name: "Joined", owner_id: "u1" },
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

    sockets[0]?.push(scripted[0]!);
    await new Promise((resolve) => setImmediate(resolve));
    sockets[0]?.push(scripted[1]!);
    sockets[0]?.push(scripted[2]!);

    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({ id: "g-new", name: "Joined" });
    expect(available).toHaveLength(0);
    await shard.disconnect();
  });

  it("emits guildUnavailable vs guildDelete on GUILD_DELETE", async () => {
    const hub = createGatewayEventHub();
    const unavailable: unknown[] = [];
    const deleted: unknown[] = [];
    hub.on("guildUnavailable", (payload) => unavailable.push(payload));
    hub.on("guildDelete", (payload) => deleted.push(payload));

    const scripted: GatewayPayload[] = [
      { op: GatewayOpcode.Hello, d: { heartbeat_interval: 60_000 } },
      {
        op: GatewayOpcode.Dispatch,
        t: "GUILD_DELETE",
        s: 1,
        d: { id: "g1", unavailable: true },
      },
      {
        op: GatewayOpcode.Dispatch,
        t: "GUILD_DELETE",
        s: 2,
        d: { id: "g2" },
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

    sockets[0]?.push(scripted[0]!);
    await new Promise((resolve) => setImmediate(resolve));
    sockets[0]?.push(scripted[1]!);
    sockets[0]?.push(scripted[2]!);

    expect(unavailable).toEqual([{ id: "g1", unavailable: true }]);
    expect(deleted).toEqual([{ id: "g2" }]);
    await shard.disconnect();
  });

  it("defers ready until pending guilds arrive when waitForGuilds is true", async () => {
    const hub = createGatewayEventHub();
    const readyEvents: unknown[] = [];
    hub.on("ready", (payload) => readyEvents.push(payload));

    const scripted: GatewayPayload[] = [
      { op: GatewayOpcode.Hello, d: { heartbeat_interval: 60_000 } },
      {
        op: GatewayOpcode.Dispatch,
        t: "READY",
        s: 1,
        d: {
          session_id: "sess",
          user: { id: "bot", username: "bot" },
          guilds: [{ id: "g1", unavailable: true }],
        },
      },
      {
        op: GatewayOpcode.Dispatch,
        t: "GUILD_CREATE",
        s: 2,
        d: { id: "g1", name: "Guild", owner_id: "u1" },
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
      waitForGuilds: true,
    });

    const connectPromise = shard.connect();
    await sockets[0]?.open();
    await connectPromise;

    sockets[0]?.push(scripted[0]!);
    await new Promise((resolve) => setImmediate(resolve));
    sockets[0]?.push(scripted[1]!);
    expect(readyEvents).toHaveLength(0);

    sockets[0]?.push(scripted[2]!);
    expect(readyEvents).toHaveLength(1);
    expect(readyEvents[0]).toMatchObject({
      user: { id: "bot", username: "bot" },
      sessionId: "sess",
      guildIds: ["g1"],
    });
    await shard.disconnect();
  });
});
