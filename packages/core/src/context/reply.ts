/** Rich reply body for {@link CommandContext.reply} (Discord REST message / interaction callback shape). */
export interface ReplyPayload {
  content?: string;
  embeds?: readonly unknown[];
  /** Action rows / Components V2 layout (Discord API shape). */
  components?: readonly unknown[];
  /**
   * Discord message flags bitfield (e.g. `MessageFlags.IsComponentsV2`).
   * Combined with {@link ephemeral} when building REST bodies.
   */
  flags?: number;
  /**
   * Native Discord poll create request (snake_case wire shape).
   * Prefer `createPoll()` from `@stambha/rest`.
   */
  poll?: unknown;
  /** Slash only — uses ephemeral flag (64) on interaction callbacks. */
  ephemeral?: boolean;
}

/** Normalize `string | ReplyPayload` into REST `data` fields. */
export function normalizeReplyData(message: string | ReplyPayload): {
  content?: string;
  embeds?: unknown[];
  components?: unknown[];
  flags?: number;
  poll?: unknown;
} {
  if (typeof message === "string") {
    return { content: message };
  }
  const data: {
    content?: string;
    embeds?: unknown[];
    components?: unknown[];
    flags?: number;
    poll?: unknown;
  } = {};
  if (message.content !== undefined) data.content = message.content;
  if (message.embeds && message.embeds.length > 0) {
    data.embeds = [...message.embeds];
  }
  if (message.components && message.components.length > 0) {
    data.components = [...message.components];
  }
  if (typeof message.flags === "number" && message.flags !== 0) {
    data.flags = message.flags;
  }
  if (message.poll !== undefined) data.poll = message.poll;
  if (
    data.content === undefined &&
    !data.embeds?.length &&
    !data.components?.length &&
    data.poll === undefined
  ) {
    data.content = " ";
  }
  return data;
}
