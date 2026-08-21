import type { StambhaClient } from "../client/StambhaClient.js";
import type { SignalContext } from "../context/SignalContext.js";
import type { Registry } from "../pieces/Registry.js";
import { Signal } from "../registries/Signal.js";
import { parseSequenceCustomId } from "./customId.js";

export interface SeqSignalMessages {
  wrongUser?: string;
  unknown?: string;
  /** Ephemeral ack after a successful step (`false` to skip). Default: short ack. */
  ack?: string | false;
}

const DEFAULT_MESSAGES: Required<Omit<SeqSignalMessages, "ack">> & { ack: string } = {
  wrongUser: "This menu is not for you.",
  unknown: "This step is no longer active.",
  ack: "Got it.",
};

/**
 * Completes {@link SequenceStore.waitForStep} for `stambha:seq:…` custom ids.
 * Registered automatically by {@link runSequence} / {@link ensureSeqSignal}.
 */
export class SeqSignal extends Signal {
  constructor(
    registry: Registry<Signal>,
    private readonly messages: SeqSignalMessages = {},
  ) {
    super(registry, {
      name: "seq",
      types: ["button", "select", "modal"],
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

    const wrongUser = this.messages.wrongUser ?? DEFAULT_MESSAGES.wrongUser;
    const unknown = this.messages.unknown ?? DEFAULT_MESSAGES.unknown;
    const ack = this.messages.ack === undefined ? DEFAULT_MESSAGES.ack : this.messages.ack;

    if (status === "wrong_user") {
      await ctx.replyEphemeral(wrongUser);
      return;
    }
    if (status === "unknown") {
      await ctx.replyEphemeral(unknown);
      return;
    }

    if (ack !== false) {
      await ctx.replyEphemeral(ack);
    }
  }
}

/** Ensure a `seq` Signal is registered (no-op if the bot already provides one). */
export function ensureSeqSignal(client: StambhaClient, messages?: SeqSignalMessages): void {
  if (client.registries.signals.get("seq")) return;
  client.registries.signals.register(new SeqSignal(client.registries.signals, messages ?? {}));
}
