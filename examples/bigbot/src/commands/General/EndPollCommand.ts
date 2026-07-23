import { HybridArgs, replyIfArgError, unwrapArg } from "@stambha/args";
import {
  Command,
  type CommandContext,
  ok,
  type Registry,
  SlashOptionType,
} from "@stambha/core";
import { guildOnlyGate } from "@stambha/gates";
import { endPoll } from "@stambha/rest";

/** End a poll the bot owns early (`POST …/polls/{message.id}/expire`). */
export class EndPollCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "endpoll",
      description: "End a bot-owned poll early",
      kinds: ["slash", "prefix"],
      category: "General",
      slashOptions: [
        {
          name: "message_id",
          description: "Message id of the poll",
          type: SlashOptionType.String,
          required: true,
        },
      ],
      gates: [guildOnlyGate()],
    });
  }

  async execute(ctx: CommandContext) {
    const rest = this.client.restPort;
    if (!ctx.channelId || !rest) {
      await ctx.reply("Need a channel and REST port to end a poll.");
      return ok(undefined);
    }

    const args = HybridArgs.fromContext(ctx);
    let messageId: string;
    if (ctx.kind === "slash") {
      const required = args.requireString("message_id");
      if (await replyIfArgError(ctx, required)) return ok(undefined);
      messageId = unwrapArg(required);
    } else {
      messageId = (ctx.argsText ?? "").trim().split(/\s+/)[0] ?? "";
      if (!messageId) {
        await ctx.reply("Usage: `!endpoll <message_id>`");
        return ok(undefined);
      }
    }

    const ended = await endPoll(rest, ctx.channelId, messageId);
    if (!ended) {
      await ctx.reply("Could not end that poll (missing, not yours, or already closed).");
      return ok(undefined);
    }
    await ctx.reply(`Ended poll on message \`${messageId}\`.`);
    return ok(undefined);
  }
}
