import { Command, ok, StambhaClient, type Registry } from "@stambha/core";
import { describe, expect, it, vi } from "vitest";
import { formatCommandHelp, formatHelpCatalog } from "./format.js";
import { HelpCommand } from "./HelpCommand.js";

class PingCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "ping",
      description: "Latency check",
      kinds: ["prefix", "slash"],
      category: "General",
    });
  }
  execute = async () => ok(undefined);
}

class SecretCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "secret",
      description: "Hidden",
      kinds: ["prefix"],
      category: "Admin",
      hidden: true,
    });
  }
  execute = async () => ok(undefined);
}

class OffCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "off",
      description: "Disabled",
      kinds: ["prefix"],
      enabled: false,
    });
  }
  execute = async () => ok(undefined);
}

class AdminLockCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "lock",
      description: "Lock the channel",
      detailedDescription: "Prevents members from sending messages in this channel.",
      kinds: ["prefix", "slash"],
      category: "Admin",
      aliases: ["l"],
    });
  }
  execute = async () => ok(undefined);
}

describe("@stambha/help", () => {
  it("lists commands by category and skips hidden/disabled", () => {
    const client = new StambhaClient({ prefix: "!" });
    client.register(new PingCommand(client.registries.commands));
    client.register(new SecretCommand(client.registries.commands));
    client.register(new OffCommand(client.registries.commands));
    client.register(new AdminLockCommand(client.registries.commands));
    client.register(new HelpCommand(client.registries.commands));

    const byCategory = client.commandIndex.byCategory(client.registries.commands.values());
    expect([...byCategory.keys()].sort()).toEqual(["Admin", "General"]);
    expect(byCategory.get("General")?.map((c) => c.name)).toEqual(["help", "ping"]);
    expect(byCategory.get("Admin")?.map((c) => c.name)).toEqual(["lock"]);

    const catalog = formatHelpCatalog(byCategory);
    expect(catalog).toContain("**Admin**");
    expect(catalog).toContain("`lock`");
    expect(catalog).not.toContain("`secret`");
    expect(catalog).not.toContain("`off`");
  });

  it("formats detailed command help", () => {
    const client = new StambhaClient({ prefix: "!" });
    const lock = new AdminLockCommand(client.registries.commands);
    const text = formatCommandHelp(lock, "!");
    expect(text).toContain("Prevents members");
    expect(text).toContain("`l`");
    expect(text).toContain("!lock");
    expect(text).toContain("/lock");
  });

  it("replies with catalog on prefix help", async () => {
    const client = new StambhaClient({ prefix: "!" });
    client.register(new PingCommand(client.registries.commands));
    const help = new HelpCommand(client.registries.commands);
    client.register(help);

    const reply = vi.fn();
    const result = await help.execute({
      kind: "prefix",
      commandName: "help",
      userId: "1",
      guildId: null,
      channelId: "c",
      argsText: "",
      raw: {},
      reply,
      replyEphemeral: async () => {},
    });

    expect(result.ok).toBe(true);
    expect(reply).toHaveBeenCalledOnce();
    expect(String(reply.mock.calls[0]?.[0])).toContain("**General**");
  });

  it("shows details for help <command> and rejects hidden", async () => {
    const client = new StambhaClient({ prefix: "!" });
    client.register(new PingCommand(client.registries.commands));
    client.register(new SecretCommand(client.registries.commands));
    const help = new HelpCommand(client.registries.commands);
    client.register(help);

    const reply = vi.fn();
    await help.execute({
      kind: "prefix",
      commandName: "help",
      userId: "1",
      guildId: null,
      channelId: "c",
      argsText: "ping",
      raw: {},
      reply,
      replyEphemeral: async () => {},
    });
    expect(String(reply.mock.calls[0]?.[0])).toContain("Latency check");

    reply.mockClear();
    await help.execute({
      kind: "slash",
      commandName: "help",
      userId: "1",
      guildId: null,
      channelId: "c",
      slashOptions: [{ name: "command", type: "string", value: "secret" }],
      raw: {},
      reply,
      replyEphemeral: async () => {},
    });
    expect(String(reply.mock.calls[0]?.[0])).toContain("Unknown command");
  });
});
