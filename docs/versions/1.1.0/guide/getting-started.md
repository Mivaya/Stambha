# Getting started

This guide walks you through a minimal Stambha bot using the **native stack** (`@stambha/rest`, `@stambha/gateway`, `@stambha/transform`).

## Prerequisites

- Node.js 20 or newer (Node 22+ recommended for bundled WebSocket in `@stambha/gateway`)
- A [Discord application](https://discord.com/developers/applications), bot token, and application ID

## Install

```bash
pnpm add @stambha/core @stambha/rest @stambha/gateway @stambha/transform @stambha/loader @stambha/gates @stambha/args
```

Optional: `@stambha/vault` for typed guild config, `@stambha/metrics` for observability. See [Vault](/features/vault).

> **CommonJS:** Pin `@stambha/*@0.2.1` or newer for `require()`. ESM projects can use current versions.

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

`attachStambhaClient` routes `interactionCreate` with `stambha:` custom ids to your signal pieces. See [Signals](/features/signals).

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

## 6. Run the example

```bash
cd examples/bot
cp .env.example .env   # optional for pnpm demo
pnpm install
pnpm demo              # simulates prefix, signal button, mention scout
```

With a token:

```bash
DISCORD_TOKEN=… DISCORD_APPLICATION_ID=… pnpm start
```

The example demonstrates slash options (`/say`), a confirm button (`/confirm` → `ConfirmSignal`), and permission gates (`/lock`).

## Next steps

- [Project structure](/guide/project-structure) — folder layout
- [Pieces & pipeline](/guide/pieces) — scouts, conduits, barriers, gates, epilogues
- [Known gaps](/guide/known-gaps) — what is planned for 1.x / 2.0
- [Tier split](/deployment/tier-split) — multi-process deployment