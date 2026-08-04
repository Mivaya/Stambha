import { Command, gateAnd, type CommandContext, ok, type Registry } from "@stambha/core";
import { capabilityGate } from "@stambha/authz";
import { Permission, userPermissionsGate } from "@stambha/gates";

/**
 * Demo: `mod.purge` capability **and** Manage Messages (capability ⊕ Discord bit).
 * Policies are registered in `lib/setup.ts`.
 */
export class PurgeCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "purge",
      description: "Capability ⊕ permission demo (mod.purge + Manage Messages)",
      kinds: ["slash", "prefix"],
      category: "Admin",
      gates: [
        gateAnd(capabilityGate("mod.purge"), userPermissionsGate(Permission.ManageMessages)),
      ],
    });
  }

  async execute(ctx: CommandContext) {
    await ctx.reply(
      "Gates passed — you have **mod.purge** and **Manage Messages** (demo only; nothing was purged).",
    );
    return ok(undefined);
  }
}
