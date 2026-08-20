# Polls

First-class helpers for Discord **native polls** — create/end via REST, listen for votes on the gateway hub.

Vote events (`messagePollVoteAdd` / `messagePollVoteRemove`) have been camelCase since **1.2.0**. This page covers poll create/end helpers on `@stambha/rest`.

## Create a poll

```ts
import { createPoll } from "@stambha/rest";

await ctx.reply({
  poll: createPoll({
    question: "Ship the release?",
    answers: ["Yes", "No", { text: "Later", emoji: "⏳" }],
    durationHours: 24, // Discord default when omitted
    allowMultiselect: false,
  }),
});
```

Or send outside a command:

```ts
import { createPoll, sendPollMessage } from "@stambha/rest";

await sendPollMessage(rest, channelId, {
  content: "Team vote",
  poll: createPoll({ question: "Lunch?", answers: ["Pizza", "Sushi"] }),
});
```

`createPoll` builds the snake_case Discord create request. Pass it as `poll` on `ctx.reply` / `sendChannelMessage` / `sendPollMessage`.

| Option | Notes |
|--------|--------|
| `question` | Required text (max 300) |
| `answers` | 1–10 strings or `{ text, emoji? }` (text max 55) |
| `durationHours` | 1–768 (32 days); Discord default 24 |
| `allowMultiselect` | Default `false` |

Poll messages **cannot be edited** after creation. Apps cannot vote on polls.

## End a poll

```ts
import { endPoll } from "@stambha/rest";

const message = await endPoll(rest, channelId, messageId);
// null if missing, already closed, or not owned by the bot
```

Only the app that created the poll can expire it early (`POST /channels/{channel.id}/polls/{message.id}/expire`).

## Answer voters

```ts
import { fetchPollAnswerVoters } from "@stambha/rest";

const voters = await fetchPollAnswerVoters(rest, channelId, messageId, answerId, {
  limit: 50,
});
```

`answerId` comes from the poll object on the message (or from vote events — typically starting at `1`).

## Vote listeners

Gateway hub events (typed via `GatewayEventMap`):

| Hub event | When |
|-----------|------|
| `messagePollVoteAdd` | User selects an answer |
| `messagePollVoteRemove` | User clears a selection |

```ts
import { isMessagePollVotePayload } from "@stambha/transform";

hub.on("messagePollVoteAdd", (payload) => {
  if (!isMessagePollVotePayload(payload)) return;
  // payload.userId, channelId, messageId, answerId, guildId?
});
```

As a [Hook](/features/hooks) piece (`src/listeners/`):

```ts
import { Hook } from "@stambha/core";
import { isMessagePollVotePayload } from "@stambha/transform";

export class PollVoteListener extends Hook {
  constructor(registry) {
    super(registry, { name: "poll-vote-log", event: "messagePollVoteAdd" });
  }

  handle(payload: unknown): void {
    if (!isMessagePollVotePayload(payload)) return;
    // …
  }
}
```

Example bot: `!poll Question? | A | B`, `!endpoll <message_id>`, plus `PollVoteListener`.

## Related

- [REST surface](/features/rest-surface) — scheduled events, automod, soundboard
- [Gateway](/deployment/gateway) — typed hub events
- [Hooks](/features/hooks) — piece-based listeners
- [Discord poll resource](https://docs.discord.com/developers/resources/poll)
