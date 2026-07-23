# @stambha/rest

**Native Discord REST client** — centralized rate-limit queue, split-tier REST worker, and slash command deploy. No discord.js in the REST process.

Part of the [**@stambha**](https://www.npmjs.com/org/stambha) monorepo · [GitHub](https://github.com/mivaya/Stambha) · [Tier split docs](https://github.com/mivaya/Stambha/tree/main/docs/deployment/tier-split.md)

---

## Install

```bash
npm install @stambha/rest @stambha/core @stambha/transport
```

Requires **Node.js 20+**.

---

## Quick start

### In-process REST (monolith)

```ts
import { createStambhaBot } from "@stambha/core";
import { createNativeRestPort } from "@stambha/rest";

const token = process.env.DISCORD_TOKEN!;

const client = createStambhaBot({
  restPort: createNativeRestPort(token),
});
```

Commands call `ctx.reply()` through the shared `RestPort` — rate limits are handled globally.

### Standalone REST worker (tier split)

```ts
import { createNativeRestWorker } from "@stambha/rest";

const { url, close } = await createNativeRestWorker({
  token: process.env.DISCORD_TOKEN!,
  port: 4000,
});

console.log(`REST worker listening at ${url}`);
```

Point the bot worker at it with `HttpRestPort` from `@stambha/core` (`REST_WORKER_URL` in `examples/bot`).

### Deploy slash commands

```ts
import {
  deployCommands,
  deployCommandsIfShardZero,
  formatDeployDiff,
  shouldDeploySlashCommands,
} from "@stambha/rest";

// Shard 0 only when sharded — see docs/deployment/slash-deploy.md
if (shouldDeploySlashCommands({ shardId: 0 })) {
  const result = await deployCommands({
    token: process.env.DISCORD_TOKEN!,
    applicationId: process.env.DISCORD_APPLICATION_ID!,
    commands: client.registries.commands.values(),
    diff: true,
  });
  if (result.diff) console.log(formatDeployDiff(result.diff));
}
```

**CI dry-run:** `pnpm --filter @stambha/example-bot deploy:dry-run`

### Resource helpers (0.3.4+)

Thin wrappers over `RestPort.request` for common bot operations — no discord.js required:

```ts
import {
  createEntitlementLookup,
  fetchApplication,
  fetchUser,
  fetchGuildMember,
  listEntitlements,
  listSkus,
  sendChannelMessage,
  triggerTyping,
} from "@stambha/rest";

const user = await fetchUser(client.restPort!, userId);
await sendChannelMessage(client.restPort!, channelId, {
  embeds: [{ title: "Hello" }],
});

const app = await fetchApplication(client.restPort!);
// app?.owner, app?.team — from GET /oauth2/applications/@me

await triggerTyping(client.restPort!, channelId);

const skus = await listSkus(client.restPort!, applicationId);
const ents = await listEntitlements(client.restPort!, applicationId, {
  userId,
  excludeEnded: true,
});

// Wire into entitlementGate for prefix commands:
createEntitlementLookup(client.restPort!, applicationId, "SKU_ID");
```

Commands can also set `typing: true` so the core pipeline triggers typing automatically after gates pass.

Use with `defineArgResolver` from `@stambha/args` when you need REST-backed entity parsing. See [Monetization](https://github.com/mivaya/Stambha/blob/main/docs/features/monetization.md).

### Polls

```ts
import { createPoll, endPoll, sendPollMessage } from "@stambha/rest";

const poll = createPoll({
  question: "Ship it?",
  answers: ["Yes", "No", { text: "Later", emoji: "⏳" }],
  durationHours: 24,
});

await sendPollMessage(rest, channelId, { content: "Team vote", poll });
// or via command context: await ctx.reply({ poll });

await endPoll(rest, channelId, messageId);
```

See [Polls](../../docs/features/polls.md) and [REST surface](../../docs/features/rest-surface.md) (scheduled events, automod, soundboard).

---

## Key exports

| Export | Purpose |
|--------|---------|
| `createNativeRestPort` | `RestPort` for in-process REST |
| `RestClient`, `createRestClient` | Low-level Discord API client |
| `RateLimitQueue` | Per-route bucket queue + global 50 req/s |
| `InvalidRequestGuard` | Cloudflare invalid-request soft cap (401/403/429 → 10k/10min) |
| `createNativeRestWorker` | HTTP REST worker process |
| `deployCommands` | Register application commands |
| `deployCommandsIfShardZero` | Deploy only on shard 0 |
| `shouldDeploySlashCommands` | Guard for multi-process sharding |
| `formatDeployDiff` | Log diff summary |
| `fetchUser`, `fetchGuild`, `fetchGuildMember`, … | Common REST resource helpers |
| `fetchApplication` | Current bot application (`owner` / `team`) |
| `triggerTyping` | Channel typing indicator |
| `listEntitlements`, `listSkus`, `createEntitlementLookup` | Monetization / SKU helpers |
| `createPoll`, `sendPollMessage`, `endPoll`, `fetchPollAnswerVoters` | Native Discord polls |
| `createGuildScheduledEvent`, `listGuildScheduledEvents`, … | Guild scheduled events |
| `createAutoModerationRule`, `listAutoModerationRules`, … | Auto Moderation CRUD |
| `listGuildSoundboardSounds`, `sendSoundboardSound`, … | Soundboard |
| `createRestTelemetryListener` | Hook metrics into the queue |

---

## Related packages

| Package | Role |
|---------|------|
| [`@stambha/core`](../core) | `RestPort`, `HttpRestPort`, command contexts |
| [`@stambha/transport`](../transport) | API version, session, route keys |
| [`@stambha/metrics`](../metrics) | Prometheus REST telemetry |

---

## Development

```bash
pnpm --filter @stambha/rest build
pnpm --filter @stambha/rest test
```
