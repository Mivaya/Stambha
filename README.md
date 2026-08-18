# Stambha

**Discord bots. Native. Scalable.**

Piece-based commands in TypeScript — with a native gateway and REST stack you can run in one process today, or split when you grow. No discord.js required.

[![GitHub](https://img.shields.io/github/license/mivaya/Stambha)](https://github.com/mivaya/Stambha/blob/main/LICENSE)
[![Node](https://img.shields.io/node/v/@stambha/core?color=339933&logo=node.js)](https://nodejs.org)
[![npm](https://img.shields.io/npm/v/@stambha/core?color=cb3837&logo=npm)](https://www.npmjs.com/package/@stambha/core)

---

## Try it now

No Discord token required:

```bash
git clone https://github.com/mivaya/Stambha.git
cd Stambha/examples/basic
pnpm install
pnpm demo
```

Small Discord-shaped bot (ping/say). Full feature demo: `cd examples/bot && pnpm demo`. Scale guide: [Examples by scale](docs/guide/examples.md).

---

## Quick start

### Command

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

### Bootstrap

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

Install:

```bash
pnpm add @stambha/core @stambha/rest @stambha/gateway @stambha/transform @stambha/loader
```

Requires **Node.js 20+**. Full walkthrough: [Getting started](docs/guide/getting-started.md). Working sample: [`examples/bot`](examples/bot).

---

## Why Stambha

Three things that matter when you ship a bot:

### Commands, organized

Familiar folders — `commands/`, `listeners/`, `gates/`, `signals/` — loaded by `@stambha/loader`. Slash, prefix, and `@mention` in one `Command` class — optional **kind hooks** (`slash` / `prefix` / `menu`) and `subcommandMethods` when you want method-per-kind dispatch. Gates and hooks keep checks and side effects out of your handlers. Classic buttons/selects and **Components V2** builders live in `@stambha/core`.

### Scale on your terms

Start in one process. When rate limits or shard count demand it, run gateway, REST, and bot logic in separate processes — same command model. See [deployment](docs/deployment/tier-split.md).

### Config without an ORM

**Vault** holds typed guild/user/member settings (prefix, flags, modules). Use Prisma or SQL for economy and logs — Vault is not a full ORM.

---

## Native stack

Stambha’s core does **not** depend on discord.js or Discordeno. Connectivity is `@stambha/gateway` + `@stambha/rest` + `@stambha/transform`.

That means:

- **Test without a live socket** — emit hub events or use `MockBridge` / `pnpm demo`
- **One command model** — one process today; separate gateway / REST / bot processes tomorrow
- **No library types in your hot path** — commands see Stambha contexts, not client-library objects

Official path is the **native stack only** — not discord.js owning the gateway while Stambha owns commands. Details: [Why Stambha](docs/guide/why-stambha.md) · [Architecture](docs/guide/architecture.md).

---

## Examples

| Example | Scale | What it is |
|---------|-------|------------|
| [`examples/minimal`](examples/minimal) | Smoke | `MockBridge` pipeline only |
| [`examples/basic`](examples/basic) | Basic | Native gateway + REST, ping/say |
| [`examples/bot`](examples/bot) | Advanced | Full piece layout — vault, authz, signals, entity selects, Components V2; `pnpm demo` without a token |
| [`examples/bigbot`](examples/bigbot) | Enterprise | Self-contained tier-split + desired properties + scale checklist |
| [`examples/http-interactions`](examples/http-interactions) | Serverless slash | Interactions Endpoint URL — no WebSocket |

Docs: [Examples by scale](docs/guide/examples.md) · [Deployment overview](docs/deployment/overview.md).

---

## Packages

Published under [@stambha on npm](https://www.npmjs.com/org/stambha).

| Package | Role |
|---------|------|
| [`@stambha/core`](packages/core) | Client, pipeline, registries, sequences |
| [`@stambha/gateway`](packages/gateway) | Native gateway, sharding, worker bus |
| [`@stambha/rest`](packages/rest) | Native REST + worker |
| [`@stambha/transform`](packages/transform) | Dispatch shapes & REST contexts |
| [`@stambha/loader`](packages/loader) | Auto-load piece folders |
| [`@stambha/vault`](packages/vault) | Typed settings |
| [`@stambha/gates`](packages/gates) · [`@stambha/args`](packages/args) · [`@stambha/help`](packages/help) · [`@stambha/authz`](packages/authz) | Checks, parsing, help & capabilities |
| [`@stambha/plugins`](packages/plugins) · [`@stambha/runtime`](packages/runtime) · [`@stambha/transport`](packages/transport) | Host, cross-runtime, API constants |

Optional extensions ([`Stambha-plugins`](https://github.com/Mivaya/Stambha-plugins), peers on core **^1.3.0**): [pagination](docs/extensions/pagination.md), [HTTP API](docs/extensions/api.md), [cache](docs/extensions/cache.md), [metrics](docs/extensions/metrics.md), vault-sql. Hub: [Extensions](docs/extensions/index.md).

---

## Documentation

| | |
|---|---|
| [Getting started](docs/guide/getting-started.md) | First bot |
| [What's new in 1.3.0](docs/guide/whats-new-1.3.md) | Upgrade map since 1.2.1 |
| [Examples by scale](docs/guide/examples.md) | minimal → basic → advanced → bigbot |
| [Components & embeds](docs/features/components.md) | Classic UI, entity selects, Components V2 |
| [Architecture](docs/guide/architecture.md) | How events flow |
| [Extensions](docs/extensions/index.md) | Stambha-plugins hub |
| [Why Stambha](docs/guide/why-stambha.md) | Design choices |
| [Migration](docs/migration/) | From other stacks |
| [Known gaps](docs/guide/known-gaps.md) | What is still missing |

Local docs site: `pnpm docs:dev`.

**Contributing:** [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md)
