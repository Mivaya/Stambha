import {
  ButtonStyle,
  button,
  buttonRow,
  Command,
  type CommandContext,
  ok,
  type Registry,
  type ReplyPayload,
  sequence,
  sequenceCustomId,
  type SequenceStep,
  selectRow,
  stringSelect,
} from "@stambha/core";

/** Render one sequence step as a Discord reply payload. */
function stepPayload(sessionId: string, step: SequenceStep): ReplyPayload {
  if (step.type === "button") {
    return {
      content: step.prompt,
      components: [
        buttonRow(
          ...step.buttons.map((b) =>
            button({
              customId: sequenceCustomId(sessionId, step.id, b.id),
              label: b.label,
              style: ButtonStyle.Primary,
            }),
          ),
        ),
      ],
    };
  }

  if (step.type === "select") {
    return {
      content: step.prompt,
      components: [
        selectRow(
          stringSelect({
            customId: sequenceCustomId(sessionId, step.id),
            placeholder: step.placeholder ?? "Choose…",
            options: step.options.map((o) => ({ label: o.label, value: o.value })),
            minValues: step.minValues,
            maxValues: step.maxValues,
          }),
        ),
      ],
    };
  }

  return {
    content: `${step.prompt}\n_(Modal steps need a show-modal callback — see Sequences docs.)_`,
  };
}

export class SetupCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "setup",
      description: "Multi-step setup flow (sequence + SeqSignal)",
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

    const session = this.client.sequences.createSession({
      userId: ctx.userId,
      guildId: ctx.guildId,
      channelId: ctx.channelId,
      timeoutMs: flow.defaultTimeoutMs,
    });

    const answers: Record<string, unknown> = {};
    const useEdit = Boolean(ctx.deferReply && ctx.editReply);

    try {
      if (useEdit) {
        await ctx.deferReply!();
      }

      for (const step of flow.steps) {
        const payload = stepPayload(session.id, step);
        if (useEdit) {
          await ctx.editReply!(payload);
        } else {
          await ctx.reply(payload);
        }

        const value = await this.client.sequences.waitForStep(
          session.id,
          step.id,
          step.timeoutMs ?? flow.defaultTimeoutMs,
        );
        answers[step.id] = value;
      }

      const channelAnswer = answers.channel;
      const channelLabel = Array.isArray(channelAnswer)
        ? channelAnswer.join(", ")
        : String(channelAnswer ?? "");

      const summary =
        `Setup complete for <@${ctx.userId}>:\n` +
        `- Role: \`${String(answers.role ?? "")}\`\n` +
        `- Channel: \`${channelLabel}\``;

      if (useEdit) {
        await ctx.editReply!({ content: summary, components: [] });
      } else {
        await ctx.reply(summary);
      }
    } catch {
      const msg = "Setup timed out or was cancelled. Run `/setup` (or `!setup`) again.";
      if (useEdit && ctx.editReply) {
        await ctx.editReply({ content: msg, components: [] }).catch(() => undefined);
      } else {
        await ctx.reply(msg).catch(() => undefined);
      }
    } finally {
      this.client.sequences.endSession(session.id);
    }

    return ok(answers);
  }
}
