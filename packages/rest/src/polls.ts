import type { RestPort } from "@stambha/core";
import type { ApiUser, MessageDetail } from "./resources.js";

/** Discord poll media (question / answer text + optional emoji). */
export interface PollMedia {
  text?: string;
  emoji?: { id?: string; name?: string };
}

/** Discord poll answer as returned by the API (`answer_id` present). */
export interface PollAnswer {
  answer_id?: number;
  poll_media: PollMedia;
}

/**
 * Discord poll create request (snake_case wire shape for `POST …/messages`).
 * @see https://docs.discord.com/developers/resources/poll
 */
export interface PollCreateRequest {
  question: PollMedia;
  answers: PollAnswer[];
  /** Hours the poll stays open (max 768 / 32 days). Discord default: 24. */
  duration?: number;
  allow_multiselect?: boolean;
  /** Layout type; currently only `1` (DEFAULT). */
  layout_type?: number;
}

/** CamelCase DX options for {@link createPoll}. */
export interface CreatePollOptions {
  question: string;
  /** Answer labels (1–10). Strings or `{ text, emoji? }`. */
  answers: readonly (string | { text: string; emoji?: string | { id?: string; name?: string } })[];
  /** Hours open (1–768). Discord default when omitted: 24. */
  durationHours?: number;
  allowMultiselect?: boolean;
  layoutType?: number;
}

export interface FetchPollAnswerVotersQuery {
  after?: string;
  /** 1–100; Discord default 25. */
  limit?: number;
}

function resolveEmoji(
  emoji: string | { id?: string; name?: string },
): { id?: string; name?: string } {
  if (typeof emoji === "string") return { name: emoji };
  return emoji;
}

/**
 * Build a Discord poll create payload from camelCase options.
 *
 * ```ts
 * createPoll({
 *   question: "Lunch?",
 *   answers: ["Pizza", { text: "Sushi", emoji: "🍣" }],
 *   durationHours: 24,
 * })
 * ```
 */
export function createPoll(options: CreatePollOptions): PollCreateRequest {
  if (!options.question.trim()) {
    throw new Error("createPoll: question must be non-empty");
  }
  if (options.answers.length < 1 || options.answers.length > 10) {
    throw new Error("createPoll: answers must have 1–10 entries");
  }

  const answers: PollAnswer[] = options.answers.map((entry) => {
    if (typeof entry === "string") {
      return { poll_media: { text: entry } };
    }
    const media: PollMedia = { text: entry.text };
    if (entry.emoji !== undefined) media.emoji = resolveEmoji(entry.emoji);
    return { poll_media: media };
  });

  const body: PollCreateRequest = {
    question: { text: options.question },
    answers,
  };
  if (options.durationHours !== undefined) body.duration = options.durationHours;
  if (options.allowMultiselect !== undefined) body.allow_multiselect = options.allowMultiselect;
  if (options.layoutType !== undefined) body.layout_type = options.layoutType;
  return body;
}

/** Send a channel message that includes a poll. */
export async function sendPollMessage(
  rest: RestPort,
  channelId: string,
  body: { content?: string; poll: PollCreateRequest; embeds?: unknown[] },
): Promise<{ id: string }> {
  return rest.request<{ id: string }>({
    method: "POST",
    route: `/channels/${channelId}/messages`,
    body,
  });
}

/**
 * Immediately end a poll owned by the bot
 * (`POST /channels/{channel.id}/polls/{message.id}/expire`).
 */
export async function endPoll(
  rest: RestPort,
  channelId: string,
  messageId: string,
): Promise<MessageDetail | null> {
  try {
    return await rest.request<MessageDetail>({
      method: "POST",
      route: `/channels/${channelId}/polls/${messageId}/expire`,
    });
  } catch {
    return null;
  }
}

/**
 * List users who voted for a poll answer
 * (`GET /channels/{channel.id}/polls/{message.id}/answers/{answer_id}`).
 */
export async function fetchPollAnswerVoters(
  rest: RestPort,
  channelId: string,
  messageId: string,
  answerId: number,
  query: FetchPollAnswerVotersQuery = {},
): Promise<ApiUser[]> {
  try {
    const q: Record<string, string> = {};
    if (query.after) q.after = query.after;
    if (query.limit !== undefined) q.limit = String(query.limit);
    const result = await rest.request<{ users?: ApiUser[] }>({
      method: "GET",
      route: `/channels/${channelId}/polls/${messageId}/answers/${answerId}`,
      ...(Object.keys(q).length > 0 ? { query: q } : {}),
    });
    return Array.isArray(result?.users) ? result.users : [];
  } catch {
    return [];
  }
}
