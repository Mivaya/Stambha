# @stambha/help

Built-in **help** command for Stambha — lists registered commands by category, with optional per-command details. Sapphire help parity without discord.js.

Part of the [**@stambha**](https://www.npmjs.com/org/stambha) monorepo · [GitHub](https://github.com/mivaya/Stambha)

---

## Install

```bash
npm install @stambha/help @stambha/core @stambha/args
```

Requires **Node.js 20+**.

---

## Quick start

Register like any other command (or let the loader pick up a thin re-export):

```ts
import { HelpCommand } from "@stambha/help";
import { createStambhaBot } from "@stambha/core";

const client = createStambhaBot({ /* … */ });
client.register(new HelpCommand(client.registries.commands, { prefixHint: "!" }));
```

| Invocation | Behavior |
|------------|----------|
| `!help` / `/help` | Commands grouped by `category` |
| `!help ping` / `/help command:ping` | `detailedDescription` or `description` |

Hidden (`hidden: true`) and disabled (`enabled: false`) commands are omitted from listings and detail lookups.

---

## Command metadata (core)

```ts
super(registry, {
  name: "lock",
  description: "Lock the channel",
  detailedDescription: "Prevents members from sending messages…",
  category: "Admin",
  hidden: false,
  kinds: ["prefix", "slash"],
});
```

---

## Key exports

| Export | Purpose |
|--------|---------|
| `HelpCommand` | Hybrid prefix + slash help command |
| `createHelpCommand` | Factory |
| `formatHelpCatalog` / `formatCommandHelp` | Pure formatters |

---

## Development

```bash
pnpm --filter @stambha/help build
pnpm --filter @stambha/help test
```
