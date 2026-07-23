import { HybridArgs, replyIfArgError, unwrapArg } from "@stambha/args";
import {
  Command,
  type CommandContext,
  ok,
  type Registry,
  SlashOptionType,
} from "@stambha/core";
import { guildOnlyGate } from "@stambha/gates";
import { createPoll } from "@stambha/rest";

/**
 * Create a native Discord poll.
 *
 * Prefix: `!poll Question? | Yes | No | Maybe`
 * Slash: `/poll question:"…" answers:"Yes | No | Maybe" duration:24`
 */
export class PollCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "poll",
      description: "Create a Discord poll",
      kinds: ["slash", "prefix"],
      category: "General",
      slashOptions: [
        {
          name: "question",
          description: "Poll question",
          type: SlashOptionType.String,
          required: true,
        },
        {
          name: "answers",
          description: "Answers separated by | (2–10)",
          type: SlashOptionType.String,
          required: true,
        },
        {
          name: "duration",
          description: "Hours the poll stays open (default 24)",
          type: SlashOptionType.Integer,
          required: false,
        },
      ],
      gates: [guildOnlyGate()],
    });
  }

  async execute(ctx: CommandContext) {
    const args = HybridArgs.fromContext(ctx);
    let question: string;
    let answerParts: string[];
    let durationHours: number | undefined;

    if (ctx.kind === "slash") {
      const q = args.requireString("question");
      if (await replyIfArgError(ctx, q)) return ok(undefined);
      const a = args.requireString("answers");
      if (await replyIfArgError(ctx, a)) return ok(undefined);
      question = unwrapArg(q);
      answerParts = unwrapArg(a)
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      const d = args.getInteger("duration");
      if (d !== null) durationHours = d;
    } else {
      const raw = (ctx.argsText ?? "").trim();
      const parts = raw
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length < 3) {
        await ctx.reply("Usage: `!poll Question? | Answer A | Answer B` (at least two answers).");
        return ok(undefined);
      }
      question = parts[0]!;
      answerParts = parts.slice(1);
    }

    if (answerParts.length < 2 || answerParts.length > 10) {
      await ctx.reply("Provide 2–10 answers separated by `|`.");
      return ok(undefined);
    }

    try {
      const poll = createPoll({
        question,
        answers: answerParts,
        ...(durationHours !== undefined ? { durationHours } : {}),
      });
      await ctx.reply({ poll });
    } catch (err) {
      await ctx.reply(err instanceof Error ? err.message : "Failed to build poll.");
    }
    return ok(undefined);
  }
}
