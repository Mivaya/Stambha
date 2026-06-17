import { Command, type Registry } from "@stambha/core";
import { describe, expect, it } from "vitest";
import {
  deployCommandsIfShardZero,
  formatDeployDiff,
  resolveShardIdFromEnv,
  shouldDeploySlashCommands,
} from "./deploySlash.js";

class PingCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, { name: "ping", description: "Pong", kinds: ["slash"] });
  }

  execute = async () => ({ ok: true as const, value: undefined });
}

describe("deploySlash", () => {
  it("shouldDeploySlashCommands allows single-process and shard 0 only", () => {
    expect(shouldDeploySlashCommands()).toBe(true);
    expect(shouldDeploySlashCommands({ shardId: 0 })).toBe(true);
    expect(shouldDeploySlashCommands({ shardId: 1 })).toBe(false);
    expect(shouldDeploySlashCommands({ skip: true })).toBe(false);
  });

  it("formatDeployDiff summarizes changes", () => {
    const text = formatDeployDiff({
      added: ["ping"],
      removed: ["old"],
      updated: ["help"],
    });
    expect(text).toContain("+ added");
    expect(text).toContain("- removed");
    expect(text).toContain("~ updated");
  });

  it("formatDeployDiff reports no changes", () => {
    expect(formatDeployDiff({ added: [], removed: [], updated: [] })).toBe(
      "no slash command name changes",
    );
  });

  it("deployCommandsIfShardZero skips non-zero shards", async () => {
    const registry = { register: (c: Command) => c } as Registry<Command>;
    const ping = new PingCommand(registry);

    const skipped = await deployCommandsIfShardZero({
      token: "t",
      applicationId: "app",
      commands: [ping],
      shardId: 2,
      dryRun: true,
    });
    expect(skipped).toBeNull();
  });

  it("deployCommandsIfShardZero dry-runs on shard 0", async () => {
    const registry = { register: (c: Command) => c } as Registry<Command>;
    const ping = new PingCommand(registry);

    const result = await deployCommandsIfShardZero({
      token: "t",
      applicationId: "app",
      commands: [ping],
      shardId: 0,
      dryRun: true,
      diff: true,
    });
    expect(result?.count).toBe(1);
  });

  it("resolveShardIdFromEnv reads SHARD_ID", () => {
    const prev = process.env.SHARD_ID;
    process.env.SHARD_ID = "3";
    expect(resolveShardIdFromEnv()).toBe(3);
    if (prev === undefined) delete process.env.SHARD_ID;
    else process.env.SHARD_ID = prev;
  });
});
