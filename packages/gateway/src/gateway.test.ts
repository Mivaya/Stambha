import type { Bridge } from "@stambha/core";
import { normalizeDispatch } from "@stambha/transform";
import { createSession } from "@stambha/transport";
import { describe, expect, it, vi } from "vitest";
import { guildShardId, recommendedShardCount, shardIdsForWorker } from "./shard/calculator.js";
import {
  buildIdentifyPayload,
  buildResumePayload,
  combineIntents,
  GatewayIntent,
} from "./shard/identify.js";
import { createShardManager } from "./shard/ShardManager.js";
import { attachGatewayRelay } from "./worker/gatewayRelay.js";
import { createWorkerServer } from "./worker/HttpWorkerBus.js";
import { InMemoryWorkerBus } from "./worker/InMemoryWorkerBus.js";
import { createWorkerMessage, type WorkerMessage, WorkerMessageTypes } from "./worker/types.js";

describe("@stambha/gateway", () => {
  it("calculates shard ids", () => {
    expect(recommendedShardCount(2500)).toBe(3);
    expect(guildShardId("123456789012345678", 4)).toBeGreaterThanOrEqual(0);
    expect(shardIdsForWorker(4, 0, 2)).toEqual([0, 2]);
  });

  it("manages shard lifecycle", () => {
    const manager = createShardManager({ totalShards: 2 });
    manager.markIdentifying(0);
    manager.markReady(0, { sessionId: "abc", sequence: 1 });
    expect(manager.get(0)?.status).toBe("ready");
    expect(manager.canResume(0)).toBe(true);
    manager.markDisconnected(0);
    expect(manager.get(0)?.status).toBe("disconnected");
  });

  it("builds identify and resume payloads", () => {
    const session = createSession({ token: "t" });
    const identify = buildIdentifyPayload({
      session,
      shardId: 0,
      totalShards: 2,
      intents: combineIntents(GatewayIntent.Guilds, GatewayIntent.GuildMessages),
    });
    expect(identify.op).toBe(2);
    expect(identify.d.shard).toEqual([0, 2]);

    const resume = buildResumePayload(session, "sess", 5);
    expect(resume.op).toBe(6);
    expect(resume.d.seq).toBe(5);
  });

  it("relays bridge events over in-memory bus", async () => {
    const bus = new InMemoryWorkerBus();
    const events: string[] = [];
    bus.subscribe(WorkerMessageTypes.gatewayEvent, (m) => {
      events.push((m.payload as { event: string }).event);
    });

    const bridge: Bridge = {
      id: "mock",
      on(event, handler) {
        (this as { _h?: Record<string, unknown> })._h ??= {};
        (this as { _h: Record<string, unknown> })._h[event] = handler;
      },
      off() {},
      once(event, handler) {
        this.on(event, handler);
      },
      emit(event, payload) {
        const h = (this as { _h?: Record<string, (p: unknown) => void> })._h?.[event];
        h?.(payload);
      },
      connect: async () => {},
      disconnect: async () => {},
    };

    attachGatewayRelay(bridge, { bus, events: ["messageCreate"] });
    bridge.emit("messageCreate", { content: "!" });
    expect(events).toEqual(["messageCreate"]);
  });

  it("round-trips Tier 1 camelCase payloads over worker bus JSON", () => {
    const bus = new InMemoryWorkerBus();
    const received: unknown[] = [];

    bus.subscribe(WorkerMessageTypes.gatewayEvent, (message) => {
      const wire = JSON.parse(JSON.stringify(message)) as WorkerMessage;
      received.push((wire.payload as { payload: unknown }).payload);
    });

    const raw = {
      user: { id: "u2", username: "bob" },
      guild_id: "g1",
      roles: ["r1"],
    };
    const normalized = normalizeDispatch("GUILD_MEMBER_ADD", raw);

    void bus.publish(
      createWorkerMessage(WorkerMessageTypes.gatewayEvent, {
        event: "guildMemberAdd",
        payload: normalized,
      }),
    );

    expect(received[0]).toEqual({
      user: { id: "u2", username: "bob" },
      guildId: "g1",
      roles: ["r1"],
    });
  });

  it("relays normalized Tier 1 hub events through gateway relay", () => {
    const bus = new InMemoryWorkerBus();
    const payloads: unknown[] = [];
    bus.subscribe(WorkerMessageTypes.gatewayEvent, (m) => {
      payloads.push((m.payload as { payload: unknown }).payload);
    });

    const bridge: Bridge = {
      id: "mock",
      on(event, handler) {
        (this as { _h?: Record<string, unknown> })._h ??= {};
        (this as { _h: Record<string, unknown> })._h[event] = handler;
      },
      off() {},
      once(event, handler) {
        this.on(event, handler);
      },
      emit(event, payload) {
        const h = (this as { _h?: Record<string, (p: unknown) => void> })._h?.[event];
        h?.(payload);
      },
      connect: async () => {},
      disconnect: async () => {},
    };

    attachGatewayRelay(bridge, { bus, events: ["guildMemberAdd"] });
    bridge.emit("guildMemberAdd", { guildId: "g1", user: { id: "u1" } });
    expect(payloads[0]).toEqual({ guildId: "g1", user: { id: "u1" } });
  });

  it("serves worker HTTP ingress", async () => {
    const received: string[] = [];
    const server = await createWorkerServer({
      port: 0,
      onMessage: async (m) => {
        received.push(m.type);
      },
    });

    await fetch(`${server.url}/v1/worker`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createWorkerMessage("test", {})),
    });

    expect(received).toEqual(["test"]);
    await server.close();
  });
});
