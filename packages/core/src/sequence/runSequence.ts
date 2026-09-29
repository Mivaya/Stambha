import type { StambhaClient } from "../client/StambhaClient.js";
import type { ReplyPayload } from "../context/reply.js";
import type { CommandContext } from "../context/types.js";
import { renderSequenceStep } from "./renderSequenceStep.js";
import { ensureSeqSignal, type SeqSignalMessages } from "./SeqSignal.js";
import type { SequenceAnswers, SequenceResult, SequenceStep } from "./types.js";

export interface SequenceFlow {
  steps: SequenceStep[];
  defaultTimeoutMs: number;
}

export interface RunSequenceOptions {
  /**
   * Client that owns {@link StambhaClient.sequences}.
   * Prefer `ctx.client` (injected by {@link StambhaClient.invoke}); pass explicitly in tests.
   */
  client?: StambhaClient;
  /** Override step → reply payload mapping. */
  renderStep?: (sessionId: string, step: SequenceStep) => ReplyPayload;
  /** Messages for the built-in seq Signal (wrong user / unknown / ack). */
  signalMessages?: SeqSignalMessages;
  /** Timeout / cancel message when waiting fails. */
  timeoutMessage?: string;
}

function resolveClient(ctx: CommandContext, options?: RunSequenceOptions): StambhaClient {
  const client = options?.client ?? ctx.client;
  if (!client) {
    throw new Error("runSequence requires ctx.client (pipeline injects it) or options.client.");
  }
  return client;
}

/**
 * Framework-owned sequence runner: session, step UI, wait/complete, timeout cleanup.
 *
 * Requires a `seq` Signal (auto-registered via {@link ensureSeqSignal}) so component
 * interactions call {@link SequenceStore.completeStep}.
 *
 * @example
 * ```ts
 * const result = await runSequence(ctx, sequence()
 *   .button("role", "Pick:", [{ id: "mod", label: "Mod" }])
 *   .select("channel", "Channel:", [{ label: "General", value: "general" }])
 *   .build());
 * ```
 */
export async function runSequence(
  ctx: CommandContext,
  flow: SequenceFlow,
  options: RunSequenceOptions = {},
): Promise<SequenceResult> {
  const client = resolveClient(ctx, options);
  ensureSeqSignal(client, options.signalMessages);

  if (!ctx.channelId) {
    throw new Error("runSequence requires ctx.channelId.");
  }

  const session = client.sequences.createSession({
    userId: ctx.userId,
    guildId: ctx.guildId,
    channelId: ctx.channelId,
    timeoutMs: flow.defaultTimeoutMs,
  });

  const answers: SequenceAnswers = {};
  const render = options.renderStep ?? renderSequenceStep;
  const useEdit = Boolean(ctx.deferReply && ctx.editReply);
  const timeoutMessage = options.timeoutMessage ?? "Timed out or cancelled. Run the command again.";

  try {
    if (useEdit) {
      await ctx.deferReply!();
    }

    for (const step of flow.steps) {
      if (step.type === "modal") {
        throw new Error(
          `runSequence does not open modals yet (step "${step.id}"). Use button/select, or complete modal steps via a custom Signal.`,
        );
      }

      const payload = render(session.id, step);
      if (useEdit) {
        await ctx.editReply!(payload);
      } else {
        await ctx.reply(payload);
      }

      const value = await client.sequences.waitForStep(
        session.id,
        step.id,
        step.timeoutMs ?? flow.defaultTimeoutMs,
      );
      answers[step.id] = value as SequenceAnswers[string];
    }

    return { sessionId: session.id, answers, cancelled: false };
  } catch (error) {
    const msg =
      error instanceof Error && error.message.startsWith("runSequence does not open modals")
        ? error.message
        : timeoutMessage;

    if (useEdit && ctx.editReply) {
      await ctx.editReply({ content: msg, components: [] }).catch(() => undefined);
    } else {
      await ctx.reply(msg).catch(() => undefined);
    }

    if (error instanceof Error && error.message.startsWith("runSequence does not open modals")) {
      throw error;
    }

    return { sessionId: session.id, answers, cancelled: true };
  } finally {
    client.sequences.endSession(session.id);
  }
}
