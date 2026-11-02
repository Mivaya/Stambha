import { describe, expect, it } from "vitest";
import type { CommandContext } from "../context/types.js";
import { ok } from "../outcome/Outcome.js";
import type { Registry } from "../pieces/Registry.js";
import type { Command } from "../registries/Command.js";
import { defineCommand } from "./defineCommand.js";

describe("defineCommand", () => {
  it("builds a loadable Command class from options", async () => {
    const Ping = defineCommand({
      name: "ping",
      description: "Pong",
      kinds: ["slash", "prefix"],
      async execute() {
        return ok(undefined);
      },
    });

    const registry = { register: (c: Command) => c } as Registry<Command>;
    const cmd = new Ping(registry);
    expect(cmd.name).toBe("ping");
    expect(cmd.supports("slash")).toBe(true);

    const result = await cmd.execute({ kind: "slash" } as CommandContext);
    expect(result.ok).toBe(true);
  });

  it("wires kind hooks", async () => {
    const calls: string[] = [];
    const Echo = defineCommand({
      name: "echo",
      description: "Echo",
      kinds: ["slash", "prefix"],
      async slash() {
        calls.push("slash");
        return ok(undefined);
      },
      async prefix() {
        calls.push("prefix");
        return ok(undefined);
      },
    });

    const registry = { register: (c: Command) => c } as Registry<Command>;
    const cmd = new Echo(registry);
    await cmd.slash!({ kind: "slash" } as CommandContext);
    await cmd.prefix!({ kind: "prefix" } as CommandContext);
    expect(calls).toEqual(["slash", "prefix"]);
  });
});
