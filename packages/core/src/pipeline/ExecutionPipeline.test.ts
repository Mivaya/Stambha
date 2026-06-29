import { describe, expect, it, vi } from "vitest";
import { StambhaClient } from "../client/StambhaClient.js";
import type { CommandContext } from "../context/types.js";
import { attachCommandLifecycleEpilogues } from "../epilogues/commandLifecycle.js";
import { isOk, ok } from "../outcome/Outcome.js";
import { Barrier } from "../registries/Barrier.js";
import { Command } from "../registries/Command.js";
import { Epilogue } from "../registries/Epilogue.js";
import { Gate } from "../registries/Gate.js";

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

class PingCommand extends Command {
  execute = vi.fn(async (ctx: CommandContext) => {
    await ctx.reply("Pong!");
    return ok("pong");
  });
}

class BlockAllBarrier extends Barrier {
  block = vi.fn(async () => ({ block: true, reason: "Maintenance" }));
}

class DenyGate extends Gate {
  constructor(registry: Registry<Gate>) {
    super(registry, { name: "deny" });
  }

  check = vi.fn(async () => ({ allow: false as const, reason: "Nope" }));
}

class AuditEpilogue extends Epilogue {
  run = vi.fn(async () => {});
}

describe("ExecutionPipeline", () => {
  it("runs command when barriers pass", async () => {
    const client = new StambhaClient();
    const registry = client.registries.commands;
    const ping = new PingCommand(registry, { name: "ping" });
    client.register(ping);

    const outcome = await client.invoke("ping", mockCtx());
    expect(isOk(outcome)).toBe(true);
    expect(ping.execute).toHaveBeenCalledOnce();
  });

  it("blocks command when barrier returns block", async () => {
    const client = new StambhaClient();
    const barrier = new BlockAllBarrier(client.registries.barriers, { name: "maintenance" });
    client.registries.barriers.register(barrier);

    const ping = new PingCommand(client.registries.commands, { name: "ping" });
    client.register(ping);

    const outcome = await client.invoke("ping", mockCtx());
    expect(isOk(outcome)).toBe(false);
    expect(ping.execute).not.toHaveBeenCalled();
  });

  it("runs epilogue after successful command", async () => {
    const client = new StambhaClient();
    const audit = new AuditEpilogue(client.registries.epilogues, {
      name: "audit",
      runOn: "always",
    });
    client.registries.epilogues.register(audit);

    const ping = new PingCommand(client.registries.commands, { name: "ping" });
    client.register(ping);

    await client.invoke("ping", mockCtx());
    expect(audit.run).toHaveBeenCalledOnce();
    expect(audit.run.mock.calls[0]![0].phase).toBe("completed");
  });

  it("runs denied epilogues when a gate blocks", async () => {
    const client = new StambhaClient();
    const denied = new AuditEpilogue(client.registries.epilogues, {
      name: "denied-log",
      runOn: "denied",
    });
    client.registries.epilogues.register(denied);

    const gate = new DenyGate(client.registries.gates, { name: "deny" });
    client.registries.gates.register(gate);

    const ping = new PingCommand(client.registries.commands, { name: "ping", gateNames: ["deny"] });
    client.register(ping);

    await client.invoke("ping", mockCtx());
    expect(denied.run).toHaveBeenCalledOnce();
    expect(denied.run.mock.calls[0]![0].phase).toBe("denied");
  });

  it("attachCommandLifecycleEpilogues wires success handler", async () => {
    const client = new StambhaClient();
    const onSuccess = vi.fn();
    attachCommandLifecycleEpilogues(client, { onSuccess });

    const ping = new PingCommand(client.registries.commands, { name: "ping" });
    client.register(ping);

    await client.invoke("ping", mockCtx());
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});
