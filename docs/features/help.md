# Help (`@stambha/help`)

Built-in help command that lists registered commands **by category**, with optional per-command details.

## Installation

```bash
pnpm add @stambha/help
```

## Usage

```ts
import { HelpCommand } from "@stambha/help";

client.register(new HelpCommand(client.registries.commands, { prefixHint: "!" }));
```

Or place a re-export under `src/commands/` and let `@stambha/loader` register it (see `examples/bot`).

| Invocation | Result |
|------------|--------|
| `!help` / `/help` | Catalog grouped by `Command.category` |
| `!help ping` / `/help` + `command` option | `detailedDescription` or `description` |

## Metadata on commands

| Option | Effect |
|--------|--------|
| `category` | Help section (default `General`) |
| `description` | Short line in the catalog |
| `detailedDescription` | Body for `help <name>` |
| `hidden: true` | Omitted from help (still runnable) |
| `enabled: false` | Omitted from help and not indexed for deploy/run |

`client.commandIndex.byCategory()` skips hidden and disabled commands.

## See also

- [Command tree](/features/command-tree) — categories, slash deploy
- [Arguments](/features/args) — parsing `help <command>`
