import { describe, expect, it, vi } from "vitest";
import { createGatewayEventHub } from "../GatewayEventHub.js";
import {
  awaitMessages,
  createInteractionCollector,
  createMessageCollector,
  createReactionCollector,
} from "./index.js";

function msg(overrides: { content?: string; channelId?: string; userId?: string } = {}) {
  return {
    id: "m1",
    content: overrides.content ?? "hello",
    channelId: overrides.channelId ?? "ch1",
    guildId: "g1",
    author: { id: overrides.userId ?? "u1" },
  };
}

describe("collectors", () => {
  it("collects messages until max", async () => {
    const hub = createGatewayEventHub();
    const collected: string[] = [];
    const collector = createMessageCollector(hub, { max: 2 });
    collector.on("collect", (m) => collected.push(m.content));

    const ended = collector.wait();
    hub.emit("messageCreate", msg({ content: "a" }));
    hub.emit("messageCreate", msg({ content: "b" }));
    hub.emit("messageCreate", msg({ content: "c" }));

    const result = await ended;
    expect(collected).toEqual(["a", "b"]);
    expect(result.reason).toBe("limit");
    expect(result.collected.map((m) => m.content)).toEqual(["a", "b"]);
  });

  it("applies sync and async filters", async () => {
    const hub = createGatewayEventHub();
    const collector = createMessageCollector(hub, {
      max: 1,
      filter: async (m) => {
        await Promise.resolve();
        return m.content === "keep";
      },
    });

    const ended = collector.wait();
    hub.emit("messageCreate", msg({ content: "skip" }));
    hub.emit("messageCreate", msg({ content: "keep" }));

    const result = await ended;
    expect(result.collected).toHaveLength(1);
    expect(result.collected[0]!.content).toBe("keep");
  });

  it("stops on time", async () => {
    vi.useFakeTimers();
    const hub = createGatewayEventHub();
    const collector = createMessageCollector(hub, { time: 1000 });
    const ended = collector.wait();

    hub.emit("messageCreate", msg({ content: "x" }));
    vi.advanceTimersByTime(1000);

    const result = await ended;
    expect(result.reason).toBe("time");
    expect(result.collected).toHaveLength(1);
    vi.useRealTimers();
  });

  it("stop(user) ends early and unsubscribes", async () => {
    const hub = createGatewayEventHub();
    const collector = createMessageCollector(hub, { max: 10 });
    const ended = collector.wait();

    hub.emit("messageCreate", msg({ content: "1" }));
    collector.stop("user");
    hub.emit("messageCreate", msg({ content: "2" }));

    const result = await ended;
    expect(result.reason).toBe("user");
    expect(result.collected.map((m) => m.content)).toEqual(["1"]);
  });

  it("awaitMessages resolves like wait()", async () => {
    const hub = createGatewayEventHub();
    const pending = awaitMessages(hub, {
      max: 1,
      filter: (m) => m.channelId === "ch1",
    });
    hub.emit("messageCreate", msg({ channelId: "other", content: "no" }));
    hub.emit("messageCreate", msg({ channelId: "ch1", content: "yes" }));
    const { collected, reason } = await pending;
    expect(reason).toBe("limit");
    expect(collected[0]!.content).toBe("yes");
  });

  it("collects reactions", async () => {
    const hub = createGatewayEventHub();
    const collector = createReactionCollector(hub, {
      max: 1,
      filter: (r) => r.messageId === "mid" && r.emoji.name === "👍",
    });
    const ended = collector.wait();
    hub.emit("messageReactionAdd", {
      userId: "u1",
      channelId: "c1",
      messageId: "mid",
      emoji: { name: "👍" },
    });
    const result = await ended;
    expect(result.reason).toBe("limit");
    expect(result.collected[0]!.userId).toBe("u1");
  });

  it("collects component interactions", async () => {
    const hub = createGatewayEventHub();
    const collector = createInteractionCollector(hub, {
      max: 1,
      filter: (i) => i.kind === "component" && i.customId === "confirm",
    });
    const ended = collector.wait();
    hub.emit("interactionCreate", {
      kind: "component",
      customId: "confirm",
      componentType: "button",
      values: [],
      id: "i1",
      token: "t",
      user: { id: "u1" },
      guildId: "g1",
      channelId: "c1",
      raw: {},
    });
    const result = await ended;
    expect(result.collected[0]!.kind).toBe("component");
  });
});
