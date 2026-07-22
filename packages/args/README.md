# @stambha/args

**Typed argument parsing** — prefix lexer (with flags), slash options, hybrid shared names, and REST-backed user resolvers. Sapphire Args parity without coupling to discord.js.

Part of the [**@stambha**](https://www.npmjs.com/org/stambha) monorepo · [GitHub](https://github.com/mivaya/Stambha)

---

## Install

```bash
npm install @stambha/args @stambha/core
```

Requires **Node.js 20+**.

---

## Quick start

### Hybrid slash + prefix

```ts
import { HybridArgs, replyIfArgError, unwrapArg } from "@stambha/args";

const args = HybridArgs.fromContext(ctx);
const text = args.requireString("text"); // slash option or `--text=` / positional
if (await replyIfArgError(ctx, text)) return ok(undefined);
await ctx.reply(unwrapArg(text));
```

### Prefix commands + flags

```ts
import { Args, replyIfArgError, stringArg, unwrapArg } from "@stambha/args";

const args = Args.fromText("run --verbose --name=bob leftover");
args.flag("verbose"); // true
args.option("name"); // "bob"
const leftover = unwrapArg(args.pick(stringArg)); // "run" then "leftover"
```

### Slash commands

```ts
import { SlashArgs } from "@stambha/args";

const args = SlashArgs.fromContext(ctx);
const target = args.getString("target");
const count = args.getInteger("count");
```

### REST user entity

```ts
import { Args, replyIfArgError, userArg, unwrapArg } from "@stambha/args";

const args = Args.fromContext(ctx);
const user = await args.pickAsync(userArg(client.restPort));
if (await replyIfArgError(ctx, user)) return ok(undefined);
await ctx.reply(`Hello ${unwrapArg(user).username}`);
```

---

## Built-in resolvers

| Resolver | Parses |
|----------|--------|
| `stringArg` | Raw token |
| `integerArg`, `numberArg`, `booleanArg` | Numeric / boolean literals |
| `snowflakeArg` | Discord snowflake id |
| `userMentionArg` | `<@id>` mention or raw id |
| `channelMentionArg` | `<#id>` mention or raw id |
| `roleMentionArg` | `<@&id>` mention or raw id |
| `userArg(rest)` | Mention/id → `GET /users/:id` via `RestPort` |
| `rest` (via registry) | Remaining tokens as one string |

Low-level lexer: `tokenize`, `parsePrefixArgs`, `joinFrom`.

---

## Key exports

| Export | Purpose |
|--------|---------|
| `Args` | Prefix parsers + `flag` / `option` / `pickAsync` |
| `HybridArgs` | Shared named getters for slash + prefix |
| `SlashArgs`, `slashArgsFromContext` | Slash option parsers |
| `userArg`, `resolveUser` | REST user entity |
| `tokenize`, `parsePrefixArgs`, `joinFrom` | Prefix lexer |
| `replyArgError`, `replyIfArgError` | User-facing arg errors |

---

## Related packages

| Package | Role |
|---------|------|
| [`@stambha/core`](../core) | `CommandContext`, `RestPort` |
| [`@stambha/gates`](../gates) | Run checks before parsing |
| [`@stambha/rest`](../rest) | `createNativeRestPort` for `userArg` |

---

## Development

```bash
pnpm --filter @stambha/args build
pnpm --filter @stambha/args test
```
