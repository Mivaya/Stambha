import { Command, createStambhaBot, ok, type RestPort } from "@stambha/core";
import type { StambhaMessage } from "@stambha/transform";
import { describe, expect, it, vi } from "vitest";
import { attachStambhaClient } from "./attachStambhaClient.js";
import { createGatewayEventHub } from "./GatewayEventHub.js";
import { PrefixEditTracker } from "./prefixEditTracking.js";

class EchoCommand extends Command {
  async execute(ctx: import("@stambha/core").CommandContext) {
    await ctx.reply(`echo:${ctx.argsText ?? ""}`);
    return ok(undefined);
  }
}

describe("PrefixEditTracker", () => {
  it("evicts oldest entries past maxEntries", () => {
    const tracker = new PrefixEditTracker({ maxEntries: 2 });
    tracker.remember("a", { channelId: "c", replyId: "r1", userId: "u" });
    tracker.remember("b", { channelId: "c", replyId: "r2", userId: "u" });
    tracker.remember("c", { channelId: "c", replyId: "r3", userId: "u" });
    expect(tracker.get("a")).toBeUndefined();
    expect(tracker.get("b")?.replyId).toBe("r2");
    expect(tracker.get("c")?.replyId).toBe("r3");
  });
});

describe("attachStambhaClient editTracking", () => {
  it("PATCHes the prior reply when the command message is edited", async () => {
    const requests: { method: string; route: string; body?: unknown }[] = [];
    const restPort: RestPort = {
      request: vi.fn(async (req) => {
        requests.push({ method: req.method, route: req.route, body: req.body });
        if (req.method === "POST") return { id: "bot-reply-1" };
        return {};
      }),
    };

    const client = createStambhaBot({ prefix: "!", restPort });
    client.register(
      new EchoCommand(client.registries.commands, {
        name: "echo",
        kinds: ["prefix"],
      }),
    );

    const hub = createGatewayEventHub();
    attachStambhaClient(hub, client, { editTracking: true, scouts: false });

    const created: StambhaMessage = {
      id: "user-msg-1",
      content: "!echo hi",
      channelId: "c1",
      guildId: "g1",
      author: { id: "u1", bot: false },
    };
    hub.emit("messageCreate", created);
    await vi.waitFor(() => expect(requests.some((r) => r.method === "POST")).toBe(true));

    const edited: StambhaMessage = {
      id: "user-msg-1",
      content: "!echo bye",
      channelId: "c1",
      guildId: "g1",
      author: { id: "u1", bot: false },
    };
    hub.emit("messageUpdate", edited);
    await vi.waitFor(() =>
      expect(requests.some((r) => r.method === "PATCH" && r.route.includes("bot-reply-1"))).toBe(
        true,
      ),
    );

    const patch = requests.find((r) => r.method === "PATCH");
    expect(patch?.body).toMatchObject({ content: "echo:bye" });
  });

  it("deletes the bot reply when the edit is no longer a command", async () => {
    const requests: { method: string; route: string }[] = [];
    const restPort: RestPort = {
      request: vi.fn(async (req) => {
        requests.push({ method: req.method, route: req.route });
        if (req.method === "POST") return { id: "bot-reply-2" };
        return {};
      }),
    };

    const client = createStambhaBot({ prefix: "!", restPort });
    client.register(
      new EchoCommand(client.registries.commands, {
        name: "echo",
        kinds: ["prefix"],
      }),
    );

    const hub = createGatewayEventHub();
    attachStambhaClient(hub, client, { editTracking: true, scouts: false });

    hub.emit("messageCreate", {
      id: "user-msg-2",
      content: "!echo x",
      channelId: "c1",
      guildId: "g1",
      author: { id: "u1", bot: false },
    } satisfies StambhaMessage);

    await vi.waitFor(() => expect(requests.some((r) => r.method === "POST")).toBe(true));

    hub.emit("messageUpdate", {
      id: "user-msg-2",
      content: "not a command",
      channelId: "c1",
      guildId: "g1",
      author: { id: "u1", bot: false },
    } satisfies StambhaMessage);

    await vi.waitFor(() =>
      expect(requests.some((r) => r.method === "DELETE" && r.route.includes("bot-reply-2"))).toBe(
        true,
      ),
    );
  });
});
