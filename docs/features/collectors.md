# Collectors

**One-shot waits** on gateway hub events — await a user’s reply, a reaction, or a button click without registering a long-lived [Signal](/features/signals).

Ships in [`@stambha/gateway`](https://github.com/Mivaya/Stambha/tree/main/packages/gateway). Collectors subscribe to [`GatewayEventHub`](/deployment/gateway) (or any `{ on, off }` double).

For **persistent** UI (menus that survive restarts), prefer [Signals](/features/signals) + [Components & embeds](/features/components). For multi-step button→modal flows, prefer [Sequences](/features/sequences). Automatic `runSequence` orchestration remains **2.0 D1**.

## When to use

| Use a collector when… | Prefer something else when… |
|-----------------------|-----------------------------|
| Waiting for the next message / reaction / interaction in a command | Long-lived buttons after the command returns — [Signals](/features/signals) |
| One-shot confirmations with a timeout | Shared rate limits — [Gates](/features/gates) cooldowns |
| Tests with a fake hub | Full interactive wizards — Sequences / future D1 |

## Install

Part of `@stambha/gateway` (already required for native bots).

```bash
pnpm add @stambha/gateway
```

## Quick start — await a reply

```ts
import { createMessageCollector } from "@stambha/gateway";

// inside a prefix/slash command run(), with access to the hub:
const collector = createMessageCollector(hub, {
  time: 30_000,
  max: 1,
  filter: (m) => m.channelId === ctx.channelId && m.author.id === ctx.userId,
});

const { collected, reason } = await collector.wait();
if (reason === "time" || collected.length === 0) {
  await ctx.reply("Timed out — no reply.");
  return;
}
await ctx.reply(`You said: ${collected[0]!.content}`);
```

Promise sugar:

```ts
import { awaitMessages } from "@stambha/gateway";

const { collected, reason } = await awaitMessages(hub, {
  time: 15_000,
  max: 1,
  filter: (m) => m.author.id === ctx.userId,
});
```

## Factories

| Factory | Hub event | Payload |
|---------|-----------|---------|
| `createMessageCollector` / `awaitMessages` | `messageCreate` | `StambhaMessage` |
| `createReactionCollector` / `awaitReactions` | `messageReactionAdd` | `GatewayMessageReactionAdd` |
| `createInteractionCollector` / `awaitInteractions` | `interactionCreate` | `StambhaInteraction` |

## Options

| Option | Default | Notes |
|--------|---------|--------|
| `filter` | accept all | Sync or async; non-matches ignored |
| `max` | unlimited | Ends with reason `limit` when reached |
| `time` | none | Ends with reason `time` after ms |

## Collector API

| Member | Notes |
|--------|--------|
| `collected` | Accepted items so far |
| `on("collect", fn)` / `on("end", fn)` | Listeners (not Node `EventEmitter`) |
| `stop(reason?)` | End early (`user` by default); unsubscribes from the hub |
| `wait()` | Promise of `{ collected, reason }` |

End reasons: `time` | `limit` | `user`.

## Reactions / interactions

```ts
const { collected } = await createReactionCollector(hub, {
  time: 60_000,
  max: 1,
  filter: (r) => r.messageId === promptMessageId && r.emoji.name === "✅",
}).wait();

const { collected: clicks } = await createInteractionCollector(hub, {
  time: 30_000,
  max: 1,
  filter: (i) =>
    i.kind === "component" && i.customId === "confirm" && i.user.id === ctx.userId,
}).wait();
```

## Related

- [Gateway](/deployment/gateway) — hub + `attachStambhaClient`
- [Signals](/features/signals) — persistent component handlers
- [Sequences](/features/sequences) — multi-step UI
- [Known gaps](/guide/known-gaps) — D1 `runSequence` (2.0)
