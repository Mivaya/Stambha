import {
  parseSequenceCustomId,
  type Registry,
  Signal,
  type SignalContext,
} from "@stambha/core";

/**
 * Completes {@link SequenceStore.waitForStep} waits for `stambha:seq:…` custom ids.
 * Loaded from `src/signals/` — name must be `seq` so `Signal.parseCustomId` routes here.
 */
export class SeqSignal extends Signal {
  constructor(registry: Registry<Signal>) {
    super(registry, {
      name: "seq",
      types: ["button", "select"],
    });
  }

  async run(ctx: SignalContext): Promise<void> {
    const parsed = parseSequenceCustomId(ctx.customId);
    if (!parsed) return;

    const value =
      parsed.part !== undefined
        ? parsed.part
        : ctx.values.length === 1
          ? ctx.values[0]
          : [...ctx.values];

    const status = this.client.sequences.completeStep(
      parsed.sessionId,
      parsed.stepId,
      ctx.userId,
      value,
    );

    if (status === "wrong_user") {
      await ctx.replyEphemeral("This setup menu is not for you.");
      return;
    }
    if (status === "unknown") {
      await ctx.replyEphemeral("This setup step is no longer active.");
      return;
    }

    await ctx.replyEphemeral("Got it — continuing setup…");
  }
}
