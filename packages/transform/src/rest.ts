import type { ReplyPayload } from "@stambha/core";
import { normalizeReplyData } from "@stambha/core";

export interface MessageBody {
  content?: string;
  embeds?: unknown[];
  components?: unknown[];
  flags?: number;
  /** Discord poll create request (snake_case). */
  poll?: unknown;
}

const EPHEMERAL = 1 << 6;

function mergeReplyFlags(
  message: string | ReplyPayload,
  ephemeralExtra = false,
): number | undefined {
  let flags = 0;
  if (typeof message === "object") {
    if (typeof message.flags === "number") flags |= message.flags;
    if (message.ephemeral) flags |= EPHEMERAL;
  }
  if (ephemeralExtra) flags |= EPHEMERAL;
  return flags === 0 ? undefined : flags;
}

/** Discord REST body for `POST /channels/{id}/messages`. */
export function channelMessageBody(message: string | ReplyPayload): MessageBody {
  const data = normalizeReplyData(message);
  const body: MessageBody = { ...data };
  const flags = mergeReplyFlags(message);
  if (flags !== undefined) body.flags = flags;
  return body;
}

/** Discord interaction callback payload (type 4 = channel message). */
export function interactionReplyBody(
  message: string | ReplyPayload,
  ephemeral = false,
): { type: number; data: MessageBody } {
  const data = normalizeReplyData(message);
  const body: MessageBody = { ...data };
  const flags = mergeReplyFlags(message, ephemeral);
  if (flags !== undefined) body.flags = flags;
  return { type: 4, data: body };
}

export function interactionDeferBody(ephemeral = false): {
  type: number;
  data?: { flags: number };
} {
  if (ephemeral) return { type: 5, data: { flags: EPHEMERAL } };
  return { type: 5 };
}

/** Edit webhook / follow-up / channel message body. */
export function webhookMessageBody(payload: ReplyPayload): MessageBody {
  const data = normalizeReplyData(payload);
  const body: MessageBody = { ...data };
  const flags = mergeReplyFlags(payload);
  if (flags !== undefined) body.flags = flags;
  return body;
}

/** Autocomplete callback (type 8). */
export function autocompleteCallbackBody(choices: { name: string; value: string }[]): {
  type: number;
  data: { choices: { name: string; value: string }[] };
} {
  return { type: 8, data: { choices: choices.slice(0, 25) } };
}
