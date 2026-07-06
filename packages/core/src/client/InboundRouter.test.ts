import { describe, expect, it } from "vitest";
import { Command, createMentionPrefixResolver, ok } from "../index.js";
import { StambhaClient } from "./StambhaClient.js";

class PingCommand extends Command {
  async execute() {
    return ok(undefined);
  }
}

describe("InboundRouter.parsePrefixCommand", () => {
  it("uses static prefix by default", async () => {
    const client = new StambhaClient({ prefix: "!" });
    client.register(new PingCommand(client.registries.commands, { name: "ping" }));

    const parsed = await client.router.parsePrefixCommand("!ping", { userId: "1" });
    expect(parsed).toEqual({ name: "ping", args: "" });
  });

  it("uses resolvePrefix when set", async () => {
    const client = new StambhaClient({
      prefix: "!",
      resolvePrefix: ({ guildId }) => (guildId === "guild-a" ? "?" : "!"),
    });
    client.register(new PingCommand(client.registries.commands, { name: "ping" }));

    expect(
      await client.router.parsePrefixCommand("?ping", { userId: "1", guildId: "guild-a" }),
    ).toEqual({
      name: "ping",
      args: "",
    });
    expect(
      await client.router.parsePrefixCommand("?ping", { userId: "1", guildId: "guild-b" }),
    ).toBeNull();
  });

  it("parses mention prefix commands", async () => {
    const botId = "999888777666555444";
    const client = new StambhaClient({
      prefix: "!",
      resolvePrefix: createMentionPrefixResolver(botId, "!"),
    });
    client.register(new PingCommand(client.registries.commands, { name: "ping" }));

    expect(
      await client.router.parsePrefixCommand(`<@${botId}> ping`, { userId: "1" }),
    ).toEqual({ name: "ping", args: "" });
    expect(
      await client.router.parsePrefixCommand(`<@!${botId}> ping args`, { userId: "1" }),
    ).toEqual({ name: "ping", args: "args" });
    expect(await client.router.parsePrefixCommand("!ping", { userId: "1" })).toEqual({
      name: "ping",
      args: "",
    });
  });
});
