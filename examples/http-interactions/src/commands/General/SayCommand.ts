import { HybridArgs, replyIfArgError, unwrapArg } from "@stambha/args";
import {
  Command,
  type CommandContext,
  ok,
  type Registry,
  SlashOptionType,
} from "@stambha/core";

export class SayCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "say",
      description: "Repeat a message",
      kinds: ["slash"],
      category: "General",
      slashOptions: [
        {
          name: "text",
          description: "Message to repeat",
          type: SlashOptionType.String,
          required: true,
        },
      ],
    });
  }

  async execute(ctx: CommandContext) {
    const args = HybridArgs.fromContext(ctx);
    const required = args.requireString("text");
    if (await replyIfArgError(ctx, required)) return ok(undefined);
    await ctx.reply(unwrapArg(required));
    return ok(undefined);
  }
}
