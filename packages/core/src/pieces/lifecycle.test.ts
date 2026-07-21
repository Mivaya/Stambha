import { describe, expect, it, vi } from "vitest";
import { StambhaClient } from "../client/StambhaClient.js";
import type { CommandContext } from "../context/types.js";
import { err, isOk, ok } from "../outcome/Outcome.js";
import { Command } from "../registries/Command.js";
import type { Registry } from "./Registry.js";
import { Unit } from "./Unit.js";

class LifecycleUnit extends Unit {
  onLoad = vi.fn(async () => {});
  onUnload = vi.fn(async () => {});
}

class BoomCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, { name: "boom", kinds: ["slash"] });
  }
  execute = async () => err(new Error("kaboom"));
  onCommandError = vi.fn(async () => {});
}

class ThrowCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, { name: "throw", kinds: ["slash"] });
  }
  execute = async () => {
    throw new Error("explode");
  };
}

function mockCtx(overrides: Partial<CommandContext> = {}): CommandContext {
  return {
    kind: "slash",
    commandName: "boom",
    userId: "1",
    guildId: "2",
    channelId: "3",
    raw: {},
    reply: vi.fn().mockResolvedValue(undefined),
    replyEphemeral: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("piece lifecycle", () => {
  it("load awaits onLoad; unload awaits onUnload", async () => {
    const client = new StambhaClient();
    const unit = new LifecycleUnit(client.registries.gates, { name: "life" });

    await client.registries.gates.load(unit);
    expect(unit.loaded).toBe(true);
    expect(unit.onLoad).toHaveBeenCalledOnce();

    await client.registries.gates.unload("life");
    expect(unit.onUnload).toHaveBeenCalledOnce();
    expect(client.registries.gates.has("life")).toBe(false);
    expect(unit.loaded).toBe(false);
  });

  it("register does not call onLoad", () => {
    const client = new StambhaClient();
    const unit = new LifecycleUnit(client.registries.gates, { name: "sync" });
    client.registries.gates.register(unit);
    expect(unit.onLoad).not.toHaveBeenCalled();
    expect(unit.loaded).toBe(false);
  });

  it("loadCommand / unloadCommand rebuild the index", async () => {
    const client = new StambhaClient();
    const cmd = new BoomCommand(client.registries.commands);
    const onLoad = vi.spyOn(cmd, "onLoad").mockResolvedValue(undefined);
    const onUnload = vi.spyOn(cmd, "onUnload").mockResolvedValue(undefined);

    await client.loadCommand(cmd);
    expect(client.getCommand("boom")).toBe(cmd);
    expect(onLoad).toHaveBeenCalledOnce();

    await client.unloadCommand("boom");
    expect(client.getCommand("boom")).toBeUndefined();
    expect(onUnload).toHaveBeenCalledOnce();
  });

  it("calls onCommandError when execute returns err", async () => {
    const client = new StambhaClient();
    const boom = new BoomCommand(client.registries.commands);
    client.register(boom);

    const outcome = await client.invoke("boom", mockCtx());
    expect(isOk(outcome)).toBe(false);
    expect(boom.onCommandError).toHaveBeenCalledOnce();
    expect(boom.onCommandError.mock.calls[0]![0]).toBeInstanceOf(Error);
  });

  it("default onCommandError logs via container logger", async () => {
    const errorLog = vi.fn();
    const client = new StambhaClient();
    client.container.logger.error = errorLog;

    const cmd = new ThrowCommand(client.registries.commands);
    client.register(cmd);

    await client.invoke("throw", mockCtx({ commandName: "throw" }));
    expect(errorLog).toHaveBeenCalled();
    expect(String(errorLog.mock.calls[0]![0])).toContain("throw");
  });

  it("does not call onCommandError on success", async () => {
    class OkCommand extends Command {
      constructor(registry: Registry<Command>) {
        super(registry, { name: "ok", kinds: ["slash"] });
      }
      execute = async () => ok(undefined);
      onCommandError = vi.fn(async () => {});
    }
    const client = new StambhaClient();
    const cmd = new OkCommand(client.registries.commands);
    client.register(cmd);
    await client.invoke("ok", mockCtx({ commandName: "ok" }));
    expect(cmd.onCommandError).not.toHaveBeenCalled();
  });
});
