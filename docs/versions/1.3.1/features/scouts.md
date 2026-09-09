# Scouts

**Scouts** are passive message watchers — they run on `messageCreate` / `messageUpdate` **before** command routing, without blocking the pipeline. Use them for mentions, logging, or lightweight auto-responses that are not full commands.

Place scout pieces under `src/scouts/`.

## Scout vs Hook vs Signal

| | **Scout** | **Hook** | **Signal** |
|---|-----------|----------|------------|
| Folder | `src/scouts/` | `src/listeners/` | `src/signals/` |
| Events | Message create/update | Any bridge event | Component interactions |
| Pipeline | Pre-router; non-blocking | Outside pipeline | Parallel interaction router |
| Built-in filters | `ignoreBots`, `triggers`, … | You implement | `stambha:` custom id routing |
| Typical use | Mention log, auto-react | `ready`, `guildCreate` | Buttons, selects, modals |

## Quick start

```ts
import { Scout, type Registry, type ScoutContext } from "@stambha/core";

export class MentionScout extends Scout {
  constructor(registry: Registry<Scout>) {
    super(registry, {
      name: "mention-log",
      triggers: ["message"],
      ignoreBots: true,
      priority: 200,
    });
  }

  async run(ctx: ScoutContext): Promise<void> {
    const botId = this.client.botUserId;
    if (!botId) return;

    const content = (ctx.raw as { content?: string })?.content ?? ctx.content ?? "";
    if (!content.includes(`<@${botId}>`) && !content.includes(`<@!${botId}>`)) return;

    console.log(`[scout] ${ctx.userId} mentioned the bot in ${ctx.guildId ?? "DM"}`);
  }
}
```

## Native attach

```ts
attachStambhaClient(hub, client, { scouts: true }); // default
```

Calls `client.router.processScout()` on `messageCreate` and `messageUpdate` when payloads are normalized `StambhaMessage` shapes.

Load scouts from `src/scouts/` with `@stambha/loader` — same as other piece folders.

## ScoutContext

| Field | Description |
|-------|-------------|
| `trigger` | `"message"` \| `"messageUpdate"` \| `"interaction"` |
| `userId`, `guildId`, `channelId` | Routing ids |
| `content` | Message text when available |
| `raw` | Normalized transport payload |
| `delete()` | Delete the message via REST (requires RestPort) |

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `triggers` | `["message"]` | Which scout triggers to listen for |
| `ignoreBots` | `true` | Skip bot-authored messages |
| `ignoreSelf` | `true` | Skip the bot's own messages |
| `ignoreDMs` | `false` | Skip messages with no `guildId` |
| `priority` | `100` | Lower runs first among serial scouts |
| `concurrency` | `"parallel"` | `"serial"` runs one-after-another; default runs scouts in parallel |

## Errors

Scout failures emit `client.on("scoutError", …)` — they do not crash the gateway handler.

## Example

See `examples/bot/src/scouts/MentionScout.ts` — triggered in `pnpm demo` when a user mentions the bot.

## Related

- [Hooks](/features/hooks) — raw event listeners
- [Barriers](/features/barriers) — block commands globally (different path)
- [Pieces & pipeline](/guide/pieces) — scout position before router