import type { CommandContext } from "@stambha/core";
import {
  Command,
  commandGatesForRun,
  ok,
  StambhaClient,
  type Registry,
} from "@stambha/core";
import { describe, expect, it, vi } from "vitest";
import { cooldownGate } from "./cooldownGate.js";
import { type CooldownStore, MemoryCooldownStore } from "./cooldownStore.js";
import { enableDeclarativeCommandGates, resolveCommandGates } from "./declarativeGates.js";
import { nsfwGate } from "./nsfwGate.js";
import { combinePermissions, hasPermissions, Permission } from "./permissions.js";
import { permissionsGate, userPermissionsGate } from "./permissionsGate.js";
import { guildOnlyGate, RunIn, runInGate } from "./runInGate.js";

function ctx(overrides: Partial<CommandContext> = {}): CommandContext {
  return {
    kind: "slash",
    commandName: "ping",
    userId: "user-1",
    guildId: "guild-1",
    channelId: "channel-1",
    raw: {},
    reply: vi.fn(),
    replyEphemeral: vi.fn(),
    ...overrides,
  };
}

describe("hasPermissions", () => {
  it("checks required bits", () => {
    const need = Permission.SendMessages | Permission.ViewChannel;
    expect(hasPermissions(Permission.SendMessages, need)).toBe(false);
    expect(hasPermissions(need, need)).toBe(true);
  });

  it("administrator bypasses checks", () => {
    expect(hasPermissions(Permission.Administrator, Permission.ManageGuild)).toBe(true);
  });
});

describe("permissionsGate", () => {
  it("denies when member lacks permissions", async () => {
    const gate = userPermissionsGate(Permission.ManageGuild);
    const result = await gate.check(ctx({ meta: { memberPermissions: Permission.SendMessages } }));
    expect(result.allow).toBe(false);
  });

  it("allows when member has permissions", async () => {
    const gate = permissionsGate({
      user: combinePermissions(Permission.SendMessages, Permission.ViewChannel),
      client: Permission.SendMessages,
    });
    const result = await gate.check(
      ctx({
        meta: {
          memberPermissions: combinePermissions(Permission.SendMessages, Permission.ViewChannel),
          clientPermissions: Permission.SendMessages,
        },
      }),
    );
    expect(result.allow).toBe(true);
  });
});

describe("cooldownGate", () => {
  it("limits invocations per window", async () => {
    const store = new MemoryCooldownStore();
    const gate = cooldownGate({ limit: 2, delay: 60_000, store, scope: "user" });

    expect((await gate.check(ctx())).allow).toBe(true);
    expect((await gate.check(ctx())).allow).toBe(true);
    const denied = await gate.check(ctx());
    expect(denied.allow).toBe(false);
    expect(denied.reason).toContain("Slow down");
  });

  it("bypasses filtered users", async () => {
    const store = new MemoryCooldownStore();
    const gate = cooldownGate({
      limit: 1,
      delay: 60_000,
      store,
      filteredUsers: ["user-1"],
    });

    expect((await gate.check(ctx())).allow).toBe(true);
    expect((await gate.check(ctx())).allow).toBe(true);
  });

  it("awaits async CooldownStore.consume", async () => {
    const store: CooldownStore = {
      async consume() {
        await Promise.resolve();
        return { allowed: false, retryAfterMs: 1500 };
      },
    };
    const gate = cooldownGate({ limit: 1, delay: 60_000, store });
    const denied = await gate.check(ctx());
    expect(denied.allow).toBe(false);
    expect(denied.reason).toContain("2 seconds");
  });
});

describe("nsfwGate", () => {
  it("denies in non-nsfw channels", async () => {
    const gate = nsfwGate();
    expect((await gate.check(ctx({ meta: { channelNsfw: false } }))).allow).toBe(false);
    expect((await gate.check(ctx({ meta: { channelNsfw: true } }))).allow).toBe(true);
  });
});

describe("runInGate", () => {
  it("allows matching channel types", async () => {
    const gate = runInGate(RunIn.GuildText);
    expect((await gate.check(ctx({ meta: { channelType: "guild_text" } }))).allow).toBe(true);
    expect((await gate.check(ctx({ meta: { channelType: "dm" } }))).allow).toBe(false);
  });

  it("guildOnlyGate rejects DMs", async () => {
    const gate = guildOnlyGate();
    expect((await gate.check(ctx({ meta: { channelType: "dm" } }))).allow).toBe(false);
    expect((await gate.check(ctx({ meta: { channelType: "guild_text" } }))).allow).toBe(true);
  });
});

class PingCommand extends Command {
  constructor(registry: Registry<Command>, options: ConstructorParameters<typeof Command>[1]) {
    super(registry, options);
  }
  async execute() {
    return ok(undefined);
  }
}

describe("declarative Command options (B1)", () => {
  it("builds cooldown/runIn/nsfw/permissions from options", () => {
    const client = new StambhaClient();
    const command = new PingCommand(client.registries.commands, {
      name: "ping",
      cooldown: 5,
      runIn: "guild",
      nsfw: true,
      userPermissions: Permission.ManageGuild,
    });
    const names = resolveCommandGates(command).map((g) => g.name);
    expect(names).toEqual([
      "cooldown(userGuild)",
      "runIn(guild_any)",
      "nsfw",
      "permissions",
    ]);
  });

  it("applies cooldown without gateNames when resolver is registered", async () => {
    enableDeclarativeCommandGates();
    const store = new MemoryCooldownStore();
    const client = new StambhaClient();
    const command = new PingCommand(client.registries.commands, {
      name: "ping",
      // Use explicit inline for store control; declarative path still verified via resolveCommandGates
      gates: [cooldownGate({ limit: 1, delay: 60_000, store })],
      cooldown: 5,
    });
    client.register(command);

    const names = commandGatesForRun(client, command).map((g) => g.name);
    expect(names[0]).toBe("cooldown(userGuild)");
    expect(names[1]).toBe("cooldown(userGuild)");

    const first = await commandGatesForRun(client, command)[0]!.check(ctx());
    expect(first.allow).toBe(true);
  });

  it("merges declarative before inline gates", () => {
    enableDeclarativeCommandGates();
    const client = new StambhaClient();
    const inline = cooldownGate({ limit: 9, delay: 1 });
    const command = new PingCommand(client.registries.commands, {
      name: "ping",
      cooldown: 3,
      runIn: "dm",
      gates: [inline],
    });
    const names = commandGatesForRun(client, command).map((g) => g.name);
    expect(names).toEqual(["cooldown(userGuild)", "runIn(dm)", "cooldown(userGuild)"]);
  });
});
