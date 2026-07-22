import { HybridArgs, replyIfArgError, unwrapArg } from "@stambha/args";
import {
  Command,
  type CommandContext,
  ok,
  type Registry,
  SlashOptionType,
} from "@stambha/core";
import { guildOnlyGate } from "@stambha/gates";

export class SayCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "say",
      description: "Repeat a message",
      kinds: ["slash", "prefix"],
      category: "General",
      slashOptions: [
        {
          name: "text",
          description: "Message to repeat",
          type: SlashOptionType.String,
          required: true,
        },
      ],
      gates: [guildOnlyGate()],
    });
  }

  async execute(ctx: CommandContext) {
    const args = HybridArgs.fromContext(ctx);
    const required = args.requireString("text");
    if (await replyIfArgError(ctx, required)) return ok(undefined);

    const text = unwrapArg(required);
    await ctx.reply(text);
    return ok(text);
  }
}
