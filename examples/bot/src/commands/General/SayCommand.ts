import { Args, replyIfArgError, SlashArgs, stringArg, unwrapArg } from "@stambha/args";
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
    let text: string | null;
    if (ctx.kind === "slash") {
      text = SlashArgs.fromContext(ctx).getString("text");
    } else {
      const picked = Args.fromContext(ctx).pick(stringArg);
      if (await replyIfArgError(ctx, picked)) return ok(undefined);
      text = unwrapArg(picked);
    }

    if (!text) {
      await ctx.reply(ctx.kind === "slash" ? "Please provide text." : "Usage: `!say <message>`");
      return ok(undefined);
    }

    await ctx.reply(text);
    return ok(text);
  }
}
