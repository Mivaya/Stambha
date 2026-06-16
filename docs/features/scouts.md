# Scouts

**Scouts** are passive message watchers — they run on `messageCreate` / `messageUpdate` **before** command routing, without blocking the pipeline. Use them for mentions, logging, or lightweight auto-responses that are not full commands.

Place scout pieces under `src/scouts/`.

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

With the native stack, `attachStambhaClient` calls `client.router.processScout()` on `messageCreate` and `messageUpdate`.

## ScoutContext

| Field | Description |
|-------|-------------|
| `trigger` | `"message"` \| `"messageUpdate"` \| `"interaction"` |
| `userId`, `guildId`, `channelId` | Routing ids |
| `content` | Message text when available |
| `raw` | Normalized transport payload |
| `delete()` | Delete the message via REST (requires RestPort wiring in your gateway worker) |

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

## Related

- [Hooks](/features/hooks) — raw event listeners
- [Barriers](/features/barriers) — block commands globally (different path)
- [Project structure](/guide/project-structure) — `src/scouts/`
