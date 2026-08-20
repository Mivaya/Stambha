# Arguments (`@stambha/args`)

**Args** for prefix commands, typed **slash option** accessors, **hybrid** shared names, and REST-backed entity resolvers.

## Installation

```bash
pnpm add @stambha/args
```

On the **native** stack, prefix commands populate `CommandContext.argsText` via `attachStambhaClient`. Slash options populate `CommandContext.slashOptions` from `interactionFromDispatch`.

## Hybrid commands (`kinds: ['slash','prefix']`)

Use `HybridArgs` so one `execute` reads the same option names for both kinds:

```ts
import { HybridArgs, replyIfArgError, unwrapArg } from "@stambha/args";

async execute(ctx: CommandContext) {
  const args = HybridArgs.fromContext(ctx);
  const text = args.requireString("text"); // slash option or `--text=` / positional
  if (await replyIfArgError(ctx, text)) return ok(undefined);
  await ctx.reply(unwrapArg(text));
  return ok(undefined);
}
```

| Kind | How `getString("text")` resolves |
|------|----------------------------------|
| Slash | Option `text` |
| Prefix | `--text=value` / `--text value`, else next positional token |

See `examples/bot` `SayCommand`.

## Prefix commands

```ts
import { Args, integerArg, replyIfArgError, stringArg } from "@stambha/args";

async execute(ctx: CommandContext) {
  const args = Args.fromContext(ctx);

  const a = args.pickType("integer");
  if (await replyIfArgError(ctx, a)) return ok(undefined);

  const b = args.pickType("integer");
  if (await replyIfArgError(ctx, b)) return ok(undefined);

  if (a.ok && b.ok) {
    await ctx.reply(`Sum: ${Number(a.value) + Number(b.value)}`);
  }
  return ok(undefined);
}
```

### Lexer and flags

- Whitespace-separated tokens
- `"quoted strings"` and `'quoted strings'`
- Basic `\` escapes inside quotes
- **Long flags** (FlagConverter-style), stripped from positionals:

```ts
import { Args, parsePrefixArgs, tokenize } from "@stambha/args";

tokenize('say "hello world"'); // ["say", "hello world"]

parsePrefixArgs("ping --verbose --name=bob leftover");
// tokens: ["ping", "leftover"], flags: verbose → true, name → "bob"

const args = Args.fromText("run --dry-out path");
args.flag("dry-out");   // true
args.option("name");    // undefined
```

| Form | Result |
|------|--------|
| `--verbose` | boolean `true` (next token stays positional) |
| `--foo=bar` | string `"bar"` |
| `--foo="bar baz"` | string `"bar baz"` |
| `--` | Ends flag parsing; following tokens stay positional |

Use `--name=value` for string options. A bare `--name` is always boolean so `!cmd --verbose target` keeps `target` as a positional.

```ts
args.flag("verbose");   // boolean presence / coerced true|false
args.option("foo");     // string value only
args.hasFlag("foo");    // present in any form
```

### Built-in types

| Type | Resolver |
|------|----------|
| `string` | Raw token |
| `integer` | Whole number |
| `number` | Float |
| `boolean` | true/false, yes/no, 1/0 |
| `rest` | Remaining text (via `pickRest()` / `rest()`) |
| `stringArray` | Comma-separated in one token |

### Mention ids and REST users

```ts
import {
  channelMentionArg,
  roleMentionArg,
  snowflakeArg,
  userArg,
  userMentionArg,
} from "@stambha/args";

const userId = args.pick(userMentionArg); // <@123> or raw snowflake

// REST entity (needs client.restPort):
const user = await args.pickAsync(userArg(client.restPort));
if (await replyIfArgError(ctx, user)) return ok(undefined);
// user.value → { id, username?, globalName?, bot? }
```

### Custom resolvers

```ts
import { defineArgResolver, type ArgResolver } from "@stambha/args";

const hexColor: ArgResolver<string> = (param) => {
  if (!/^#[0-9a-f]{6}$/i.test(param)) {
    return { ok: false, error: { code: "INVALID", message: "Invalid hex color.", parameter: param } };
  }
  return { ok: true, value: param };
};

defineArgResolver("hexColor", hexColor);
args.pickType("hexColor");
```

## Slash commands

```ts
import { SlashArgs } from "@stambha/args";

async execute(ctx: CommandContext) {
  const opts = SlashArgs.fromContext(ctx);
  const text = opts.getString("text");
  const count = opts.getInteger("count") ?? 1;

  const required = opts.requireString("name");
  if (await replyIfArgError(ctx, required)) return ok(undefined);
}
```

## Unified helpers

```ts
import { argsForContext, HybridArgs } from "@stambha/args";

const args = argsForContext(ctx); // Args | SlashArgs (different APIs)
const hybrid = HybridArgs.fromContext(ctx); // shared named getters
```

## Error handling

- `ArgResult<T>` — `{ ok: true, value }` or `{ ok: false, error }`
- `ArgParseError` — thrown by `unwrapArg()`
- `replyArgError(ctx, error)` — user-facing reply
- `replyIfArgError(ctx, result)` — reply and return `true` when failed

## Examples

| Command | Demo |
|---------|------|
| Hybrid say | `examples/bot/src/commands/General/SayCommand.ts` |
| Prefix lexer | `examples/bot/src/commands/General/EchoCommand.ts` |

## See also

- [Gates](/features/gates) — pre-execution checks
- [Command tree & deploy](/features/command-tree) — slash groups, deploy, autocomplete