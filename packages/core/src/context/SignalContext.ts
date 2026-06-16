import type { ReplyPayload } from "./reply.js";

/** Context for component interactions (buttons, selects, modals). */
export interface SignalContext {
  readonly signalName: string;
  readonly userId: string;
  readonly guildId: string | null;
  readonly channelId: string | null;
  readonly customId: string;
  readonly raw: unknown;
  reply(message: string | ReplyPayload): Promise<void>;
  replyEphemeral(message: string | ReplyPayload): Promise<void>;
  deferReply?(ephemeral?: boolean): Promise<void>;
}

export type { ReplyPayload } from "./reply.js";
