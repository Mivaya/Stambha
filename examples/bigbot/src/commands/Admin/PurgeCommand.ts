import { Command, type CommandContext, ok, type Registry } from "@stambha/core";
import { capabilityGate } from "@stambha/authz";

/**
 * Demo: requires the `mod.purge` capability via `@stambha/authz`.
 * Policies are registered in `lib/setup.ts`.
 */
export class PurgeCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "purge",
      description: "Capability demo (mod.purge)",
      kinds: ["slash", "prefix"],
      category: "Admin",
      gates: [capabilityGate("mod.purge")],
    });
  }

  async execute(ctx: CommandContext) {
    await ctx.reply(
      "Capability gate passed — you have **mod.purge** (demo only; nothing was purged).",
    );
    return ok(undefined);
  }
}
