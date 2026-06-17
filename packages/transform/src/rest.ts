import type { ReplyPayload } from "@stambha/core";
import { normalizeReplyData } from "@stambha/core";

export interface MessageBody {
  content?: string;
  embeds?: unknown[];
  flags?: number;
}

/** Discord REST body for `POST /channels/{id}/messages`. */
export function channelMessageBody(message: string | ReplyPayload): MessageBody {
  const data = normalizeReplyData(message);
  const body: MessageBody = { ...data };
  if (typeof message === "object" && message.ephemeral) {
    body.flags = 64;
  }
  return body;
}

/** Discord interaction callback payload (type 4 = channel message). */
export function interactionReplyBody(
  message: string | ReplyPayload,
  ephemeral = false,
): { type: number; data: MessageBody } {
  const data = normalizeReplyData(message);
  const body: MessageBody = { ...data };
  const isEphemeral = ephemeral || (typeof message === "object" && message.ephemeral === true);
  if (isEphemeral) body.flags = 64;
  return { type: 4, data: body };
}

export function interactionDeferBody(ephemeral = false): {
  type: number;
  data?: { flags: number };
} {
  if (ephemeral) return { type: 5, data: { flags: 64 } };
  return { type: 5 };
}

/** Edit webhook / follow-up / channel message body. */
export function webhookMessageBody(payload: ReplyPayload): MessageBody {
  return normalizeReplyData(payload);
}

/** Autocomplete callback (type 8). */
export function autocompleteCallbackBody(choices: { name: string; value: string }[]): {
  type: number;
  data: { choices: { name: string; value: string }[] };
} {
  return { type: 8, data: { choices: choices.slice(0, 25) } };
}
