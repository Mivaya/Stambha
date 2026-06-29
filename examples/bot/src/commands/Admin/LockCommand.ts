import { Command, type CommandContext, ok, type Registry } from "@stambha/core";
import { guildOnlyGate, Permission, userPermissionsGate } from "@stambha/gates";

/** Demonstrates permission gates using native `ctx.meta` from slash interactions. */
export class LockCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "lock",
      description: "Lock channel demo (requires Manage Channels)",
      kinds: ["slash"],
      category: "Admin",
      gates: [guildOnlyGate(), userPermissionsGate(Permission.ManageChannels)],
    });
  }

  async execute(ctx: CommandContext) {
    await ctx.reply(
      "Permission gate passed — you have **Manage Channels** (demo only; no channel is locked).",
    );
    return ok(undefined);
  }
}
