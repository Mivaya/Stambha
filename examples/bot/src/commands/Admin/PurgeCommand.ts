import { Command, type CommandContext, ok, type Registry } from "@stambha/core";
import { PermissionLevel, permissionLevelGate } from "@stambha/levels";

/**
 * Demo: requires Moderator (level 4+) via `@stambha/levels`.
 * Configure roles / botOwners in `lib/setup.ts` (`configurePermissionLevels`).
 */
export class PurgeCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "purge",
      description: "Permission-level demo (Moderator+)",
      kinds: ["slash", "prefix"],
      category: "Admin",
      gates: [permissionLevelGate(PermissionLevel.Moderator)],
    });
  }

  async execute(ctx: CommandContext) {
    await ctx.reply(
      "Permission level gate passed — you are **Moderator** or higher (demo only; nothing was purged).",
    );
    return ok(undefined);
  }
}
