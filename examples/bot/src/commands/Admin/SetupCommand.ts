import {
  Command,
  type CommandContext,
  ok,
  type Registry,
  runSequence,
  sequence,
} from "@stambha/core";

export class SetupCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "setup",
      description: "Multi-step setup flow (runSequence)",
      kinds: ["slash", "prefix"],
      category: "Admin",
    });
  }

  async execute(ctx: CommandContext) {
    if (!ctx.channelId) {
      await ctx.reply("Setup needs a channel context.");
      return ok(undefined);
    }

    const flow = sequence()
      .timeout(60_000)
      .button("role", "Pick a role:", [
        { id: "mod", label: "Moderator" },
        { id: "member", label: "Member" },
      ])
      .select("channel", "Pick a channel type:", [
        { label: "General", value: "general" },
        { label: "Announcements", value: "announcements" },
      ])
      .build();

    const result = await runSequence(ctx, flow);
    if (result.cancelled) {
      return ok(undefined);
    }

    const channelAnswer = result.answers.channel;
    const channelLabel = Array.isArray(channelAnswer)
      ? channelAnswer.join(", ")
      : String(channelAnswer ?? "");

    const summary =
      `Setup complete for <@${ctx.userId}>:\n` +
      `- Role: \`${String(result.answers.role ?? "")}\`\n` +
      `- Channel: \`${channelLabel}\``;

    if (ctx.editReply) {
      await ctx.editReply({ content: summary, components: [] });
    } else {
      await ctx.reply(summary);
    }

    return ok(result.answers);
  }
}
