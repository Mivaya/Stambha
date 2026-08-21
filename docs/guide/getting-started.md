# Getting started

Build a Stambha bot on the **native stack** (`@stambha/rest`, `@stambha/gateway`, `@stambha/transform`).

This page is a walkthrough. For TypeScript signatures, switch to **API** in the header — [`Command`](/api/core/classes/Command), [`createStambhaBot`](/api/core/functions/createStambhaBot), [`loadPieces`](/api/loader/functions/loadPieces).

Pick an example by size → [Examples by scale](/guide/examples).

## New project (scaffolder)

Generate a runnable bot without copying `examples/`:

```bash
pnpm create stambha@latest my-bot
cd my-bot && pnpm install && pnpm demo   # basic template — no token
```

Templates: **`basic`** (native gateway + loader, default) or **`minimal`** (MockBridge smoke). Use `pnpm create stambha my-bot --template minimal` for the smaller layout.

## Fastest path — no token

| Goal | Command |
|------|---------|
| Small Discord-shaped demo | `cd examples/basic && pnpm install && pnpm demo` |
| Serverless slash (no gateway) | `cd examples/http-interactions && pnpm install && pnpm demo` |
| Full feature demo | `cd examples/bot && pnpm install && pnpm demo` |
| Pipeline unit smoke | `cd examples/minimal && pnpm install && pnpm start` |

No Discord token required for `demo` / minimal. You’ll see prefix commands (and on `bot`, signals + mentions) against the real pipeline.

When you’re ready for a live bot, continue below — or scaffold with `pnpm create stambha@latest`.

## Prerequisites

- Node.js 20 or newer (Node 22+ recommended for bundled WebSocket in `@stambha/gateway`)
- A [Discord application](https://discord.com/developers/applications), bot token, and application ID

## Install

```bash
pnpm add @stambha/core @stambha/rest @stambha/gateway @stambha/transform @stambha/loader @stambha/gates @stambha/args
```

Common next packages:

| Package | When |
|---------|------|
| `@stambha/authz` | Staff capabilities (not numeric levels) |
| `@stambha/vault` | Typed guild config — often alongside Prisma/Drizzle ([guide](/guide/vault-and-orm)) |
| `@stambha/help` | Help catalog |
| Extensions | [Pagination](/extensions/pagination), [Metrics](/extensions/metrics), … — [Extensions hub](/extensions/) |

> **CommonJS:** Pin `@stambha/*@1.3.0` (or `^1.3.0`) for `require()`. ESM projects can use the same line.

## 1. Create a command

```ts
// src/commands/General/PingCommand.ts
import { Command, ok, type CommandContext, type Registry } from "@stambha/core";

export class PingCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "ping",
      description: "Replies with Pong!",
      kinds: ["slash", "prefix"],
    });
  }

  async execute(ctx: CommandContext) {
    await ctx.reply("Pong!");
    return ok(undefined);
  }
}
```

Return **`ok(value)`** or **`err(message)`** from `execute()` — the pipeline uses outcomes for epilogues and metrics. Uncaught throws are treated as failures.

### Kind hooks (optional)

Prefer separate handlers per invocation kind without Sapphire’s `chatInputRun` / `messageRun` names:

```ts
export class PingCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "ping",
      description: "Replies with Pong!",
      kinds: ["slash", "prefix"],
    });
  }

  async slash(ctx: CommandContext) {
    await ctx.replyEphemeral("Pong!");
    return ok(undefined);
  }

  async prefix(ctx: CommandContext) {
    await ctx.reply("Pong!");
    return ok(undefined);
  }
}
```

Dispatch order: **subcommand method** (when `subcommandMethods: true`) → **kind hook** (`slash` / `prefix` / `menu`) → **`execute`**. Context menus use `menu` (`ctx.kind === "contextMenu"`). Helpers: `isSlash`, `isPrefix`, `isMenu`.

## 2. Bootstrap the client

```ts
// src/main.ts
import { createStambhaBot } from "@stambha/core";
import {
  attachStambhaClient,
  combineIntents,
  createGatewayEventHub,
  createNativeGatewayClient,
  GatewayIntent,
} from "@stambha/gateway";
import { loadPieces } from "@stambha/loader";
import { createNativeRestPort } from "@stambha/rest";

const token = process.env.DISCORD_TOKEN!;
const client = createStambhaBot({
  prefix: "!",
  restPort: createNativeRestPort(token),
});

await loadPieces(client);

const hub = createGatewayEventHub();
attachStambhaClient(hub, client, {
  applicationId: process.env.DISCORD_APPLICATION_ID,
  mentionCommands: true, // @Bot ping
});
client.setBridge(hub);

await client.start();

const gateway = await createNativeGatewayClient({
  token,
  hub,
  intents: combineIntents(
    GatewayIntent.Guilds,
    GatewayIntent.GuildMessages,
    GatewayIntent.MessageContent,
  ),
});
await gateway.connect();
```

`attachStambhaClient` wires hub events into `InboundRouter` — prefix, slash, signals, autocomplete, and scouts. See [Gateway](/deployment/gateway) for the full options table.

## 3. Slash options and gates

```ts
import { SlashArgs } from "@stambha/args";
import { Command, ok, SlashOptionType, type CommandContext, type Registry } from "@stambha/core";
import { guildOnlyGate, Permission, userPermissionsGate } from "@stambha/gates";

export class SayCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "say",
      description: "Repeat a message",
      kinds: ["slash"],
      slashOptions: [
        { name: "text", description: "Message", type: SlashOptionType.String, required: true },
      ],
      gates: [guildOnlyGate(), userPermissionsGate(Permission.SendMessages)],
    });
  }

  async execute(ctx: CommandContext) {
    const text = SlashArgs.fromContext(ctx).getString("text");
    await ctx.reply(text ?? "(empty)");
    return ok(text);
  }
}
```

On the native stack, slash interactions populate `ctx.meta` (permissions, channel type) for gates — no manual bridge code.

Staff hierarchy beyond Discord bits → [Capabilities](/features/capabilities) (`capabilityGate`), not numeric levels.

## 4. Signals (buttons)

```ts
// src/signals/ConfirmSignal.ts
import { Signal, type Registry, type SignalContext } from "@stambha/core";

export class ConfirmSignal extends Signal {
  constructor(registry: Registry<Signal>) {
    super(registry, { name: "confirm", types: ["button"] });
  }

  async run(ctx: SignalContext) {
    await ctx.reply("Confirmed!");
  }
}
```

Post a button from a command:

```ts
const signal = this.client.registries.signals.get("confirm");
await ctx.reply({
  content: "Are you sure?",
  components: [{
    type: 1,
    components: [{
      type: 2, style: 1, label: "Yes",
      custom_id: signal!.customId("yes"), // → stambha:confirm:yes
    }],
  }],
});
```

`attachStambhaClient` routes `interactionCreate` with `stambha:` custom ids to your signal pieces. See [Signals](/features/signals). For production UI, read [Components & embeds](/features/components) — it separates **classic embeds**, **classic buttons**, and **Components V2** (Container is only one V2 type, not the whole mode).

## 5. Deploy slash commands

```ts
import { deployCommands } from "@stambha/rest";

await deployCommands({
  token: process.env.DISCORD_TOKEN!,
  applicationId: process.env.DISCORD_APPLICATION_ID!,
  commands: client.registries.commands.values(),
});
```

For guild-scoped testing, pass `guildId`. In sharded bots, deploy from shard 0 only — see [Slash deploy](/deployment/slash-deploy).

User-installable commands: set `integrationTypes` / `contexts` on the Command — see [Command tree](/features/command-tree#installation--interaction-contexts).

## 6. Grow beyond basic

| Next need | Guide / example |
|-----------|-----------------|
| Vault, authz, polls, V2 panels | [`examples/bot`](https://github.com/Mivaya/Stambha/tree/main/examples/bot) |
| REST worker / multi-process | [Tier split](/deployment/tier-split), [`examples/bigbot`](https://github.com/Mivaya/Stambha/tree/main/examples/bigbot) |
| Many shards | [Resharding](/deployment/resharding) |
| HTTP-only / Workers | [`examples/http-interactions`](https://github.com/Mivaya/Stambha/tree/main/examples/http-interactions), [HTTP interactions](/deployment/http-interactions) |
| Premium SKUs | [Monetization](/features/monetization) |
| Polls / scheduled events / automod | [Polls](/features/polls), [REST surface](/features/rest-surface) |

## Next steps

- [Examples by scale](/guide/examples) — minimal → basic → advanced → bigbot → http-interactions
- [Architecture](/guide/architecture) — how events flow through the native stack
- [Project structure](/guide/project-structure) — folder layout
- [Pieces & pipeline](/guide/pieces) — scouts, conduits, barriers, gates, epilogues
- [Deployment overview](/deployment/overview) — monolith vs tier-split
- [Known gaps](/guide/known-gaps) — what is still missing
