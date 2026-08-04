import { describe, expect, it, vi } from "vitest";
import { StambhaClient } from "../client/StambhaClient.js";
import type { AutocompleteContext } from "../context/autocomplete.js";
import type { CommandContext } from "../context/types.js";
import { isOk, ok } from "../outcome/Outcome.js";
import { Command } from "../registries/Command.js";
import {
  dispatchAutocomplete,
  dispatchCommand,
  isMenu,
  isPrefix,
  isSlash,
} from "./dispatchCommand.js";

function mockCtx(overrides: Partial<CommandContext> = {}): CommandContext {
  return {
    kind: "slash",
    commandName: "ping",
    userId: "1",
    guildId: "2",
    channelId: "3",
    raw: {},
    reply: vi.fn().mockResolvedValue(undefined),
    replyEphemeral: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("kind helpers", () => {
  it("detects slash / prefix / menu", () => {
    expect(isSlash(mockCtx({ kind: "slash" }))).toBe(true);
    expect(isPrefix(mockCtx({ kind: "prefix" }))).toBe(true);
    expect(isMenu(mockCtx({ kind: "contextMenu" }))).toBe(true);
    expect(isMenu(mockCtx({ kind: "slash" }))).toBe(false);
  });
});

describe("dispatchCommand kind hooks", () => {
  it("uses execute when no kind hooks are defined", async () => {
    const client = new StambhaClient();
    class Hybrid extends Command {
      execute = vi.fn(async () => ok("hybrid"));
    }
    const cmd = new Hybrid(client.registries.commands, { name: "ping", kinds: ["slash", "prefix"] });
    const outcome = await dispatchCommand(cmd, mockCtx({ kind: "prefix" }));
    expect(isOk(outcome)).toBe(true);
    expect(cmd.execute).toHaveBeenCalledOnce();
  });

  it("prefers slash hook over execute for slash invocations", async () => {
    const client = new StambhaClient();
    class Split extends Command {
      slash = vi.fn(async () => ok("slash"));
      prefix = vi.fn(async () => ok("prefix"));
      execute = vi.fn(async () => ok("execute"));
    }
    const cmd = new Split(client.registries.commands, { name: "ping", kinds: ["slash", "prefix"] });

    await dispatchCommand(cmd, mockCtx({ kind: "slash" }));
    expect(cmd.slash).toHaveBeenCalledOnce();
    expect(cmd.execute).not.toHaveBeenCalled();

    await dispatchCommand(cmd, mockCtx({ kind: "prefix" }));
    expect(cmd.prefix).toHaveBeenCalledOnce();
    expect(cmd.execute).not.toHaveBeenCalled();
  });

  it("maps contextMenu to menu hook", async () => {
    const client = new StambhaClient();
    class MenuCmd extends Command {
      menu = vi.fn(async () => ok("menu"));
      execute = vi.fn(async () => ok("execute"));
    }
    const cmd = new MenuCmd(client.registries.commands, {
      name: "user-info",
      kinds: ["contextMenu"],
    });
    await dispatchCommand(cmd, mockCtx({ kind: "contextMenu", commandName: "user-info" }));
    expect(cmd.menu).toHaveBeenCalledOnce();
    expect(cmd.execute).not.toHaveBeenCalled();
  });

  it("allows slash-only commands without overriding execute", async () => {
    const client = new StambhaClient();
    class SlashOnly extends Command {
      async slash() {
        return ok("ok");
      }
    }
    const cmd = new SlashOnly(client.registries.commands, { name: "ping" });
    const outcome = await dispatchCommand(cmd, mockCtx());
    expect(isOk(outcome)).toBe(true);
  });

  it("default execute returns err when no hooks match", async () => {
    const client = new StambhaClient();
    class Empty extends Command {}
    const cmd = new Empty(client.registries.commands, { name: "empty" });
    const outcome = await dispatchCommand(cmd, mockCtx({ kind: "prefix" }));
    expect(isOk(outcome)).toBe(false);
  });
});

describe("subcommandMethods", () => {
  it("dispatches to leaf method when enabled", async () => {
    const client = new StambhaClient();
    class Mod extends Command {
      ban = vi.fn(async () => ok("banned"));
      kick = vi.fn(async () => ok("kicked"));
      execute = vi.fn(async () => ok("execute"));
    }
    const cmd = new Mod(client.registries.commands, {
      name: "mod",
      subcommandMethods: true,
      subcommands: [
        { name: "ban", description: "Ban" },
        { name: "kick", description: "Kick" },
      ],
    });

    await dispatchCommand(
      cmd,
      mockCtx({ slashPath: { root: "mod", subcommand: "ban" } }),
    );
    expect(cmd.ban).toHaveBeenCalledOnce();
    expect(cmd.kick).not.toHaveBeenCalled();
    expect(cmd.execute).not.toHaveBeenCalled();
  });

  it("falls back to slash hook then execute when method missing", async () => {
    const client = new StambhaClient();
    class Mod extends Command {
      slash = vi.fn(async () => ok("slash"));
      execute = vi.fn(async () => ok("execute"));
    }
    const cmd = new Mod(client.registries.commands, {
      name: "mod",
      subcommandMethods: true,
      subcommands: [{ name: "warn", description: "Warn" }],
    });

    await dispatchCommand(
      cmd,
      mockCtx({ slashPath: { root: "mod", subcommand: "warn" } }),
    );
    expect(cmd.slash).toHaveBeenCalledOnce();
    expect(cmd.execute).not.toHaveBeenCalled();
  });

  it("does not treat reserved names as subcommand methods", async () => {
    const client = new StambhaClient();
    class Mod extends Command {
      execute = vi.fn(async () => ok("execute"));
    }
    const cmd = new Mod(client.registries.commands, {
      name: "mod",
      subcommandMethods: true,
    });
    await dispatchCommand(
      cmd,
      mockCtx({ slashPath: { root: "mod", subcommand: "execute" } }),
    );
    expect(cmd.execute).toHaveBeenCalledOnce();
  });

  it("dispatches `${subcommand}Autocomplete` when enabled", async () => {
    const client = new StambhaClient();
    class Mod extends Command {
      banAutocomplete = vi.fn(async (_ctx: AutocompleteContext) => {});
      autocomplete = vi.fn(async () => {});
    }
    const cmd = new Mod(client.registries.commands, {
      name: "mod",
      subcommandMethods: true,
    });
    const actx: AutocompleteContext = {
      commandName: "mod",
      slashPath: { root: "mod", subcommand: "ban" },
      focusedOption: "user",
      userInput: "a",
      userId: "1",
      guildId: "2",
      channelId: "3",
      raw: {},
      respond: vi.fn().mockResolvedValue(undefined),
    };
    await dispatchAutocomplete(cmd, actx);
    expect(cmd.banAutocomplete).toHaveBeenCalledOnce();
    expect(cmd.autocomplete).not.toHaveBeenCalled();
  });
});

describe("ExecutionPipeline integration", () => {
  it("invokes kind hooks through client.invoke", async () => {
    const client = new StambhaClient();
    class Split extends Command {
      slash = vi.fn(async () => ok("slash"));
    }
    const cmd = new Split(client.registries.commands, { name: "ping" });
    client.register(cmd);

    const outcome = await client.invoke("ping", mockCtx());
    expect(isOk(outcome)).toBe(true);
    expect(cmd.slash).toHaveBeenCalledOnce();
  });
});
