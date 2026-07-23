# Command tree & deploy

Slash command groups, subcommands, prefix aliases, autocomplete, and deploy v2.

## Prefix aliases

```ts
super(registry, {
  name: "ping",
  aliases: ["p"],
  kinds: ["slash", "prefix"],
});
```

`!p` resolves to `ping` via `CommandIndex` and `InboundRouter.parsePrefixCommand`.

## Slash subcommands

### Inline tree (single Command class)

```ts
import { SlashOptionType } from "@stambha/core";

super(registry, {
  name: "config",
  description: "Bot configuration",
  subcommands: [
    { name: "show", description: "Show settings" },
    {
      name: "prefix",
      description: "Set prefix",
      options: [
        { name: "value", description: "New prefix", type: SlashOptionType.String, required: true },
      ],
    },
  ],
});

async execute(ctx: CommandContext) {
  const sub = ctx.slashPath?.subcommand;
  if (sub === "show") { ... }
}
```

### Leaf pieces (merged deploy)

```ts
// commands/Mod/BanCommand.ts
super(registry, {
  name: "ban",
  description: "Ban a member",
  slashRoot: "mod",
  slashRootDescription: "Moderation",
  slashSubcommand: "ban",
});
```

Multiple leaves with the same `slashRoot` merge into one `/mod` command at deploy time.

## Categories & help

```ts
category: "General",
subCategory: "Utility",
description: "Short catalog line",
detailedDescription: "Longer text for help <command>",
hidden: false, // omit from help when true
```

Use [`@stambha/help`](/features/help) — `HelpCommand` lists via `client.commandIndex.byCategory()` (skips `hidden` / disabled).

## Autocomplete

Declare autocomplete on slash options and implement `autocomplete()` on the command:

```ts
slashOptions: [
  { name: "fruit", description: "...", type: SlashOptionType.String, autocomplete: true, required: true },
],

async autocomplete(ctx: AutocompleteContext) {
  if (ctx.focusedOption !== "fruit") return;
  await ctx.respond([{ name: "apple", value: "apple" }]);
}
```

Autocomplete is routed on the native path via `attachStambhaClient` (0.3.5+). See [Signals](/features/signals) and [Plugins](/features/plugins#interaction-routing).

## Deploy v2

```ts
import { deployCommands } from "@stambha/rest";

const result = await deployCommands({
  token,
  applicationId: clientId,
  guildId,
  commands: client.registries.commands.values(),
  diff: true, // logs added / removed / updated names
});
```

`buildApplicationCommands()` from `@stambha/core` builds the JSON; `@stambha/rest` sends it to Discord.

### Permissions

```ts
import { Permission } from "@stambha/gates";

defaultMemberPermissions: Permission.BanMembers,
dmPermission: false,
```

Prefer `contexts` for user-installable apps (see below). `dmPermission` remains supported as Discord’s legacy field.

## Installation & interaction contexts

Discord apps can be installed to a **guild**, a **user**, or both. Each slash command can declare:

| Option | Discord field | Values |
|--------|---------------|--------|
| `integrationTypes` | `integration_types` | `"guild"` · `"user"` |
| `contexts` | `contexts` | `"guild"` · `"bot_dm"` · `"private_channel"` |

`private_channel` (other DMs / group DMs) requires `"user"` in `integrationTypes`.

```ts
super(registry, {
  name: "profile",
  description: "Your profile",
  kinds: ["slash"],
  integrationTypes: ["user"],
  contexts: ["guild", "bot_dm", "private_channel"],
});
```

At runtime, slash and signal contexts expose:

| Field | Meaning |
|-------|---------|
| `ctx.interactionContext` | Where the command ran (`guild` / `bot_dm` / `private_channel`) |
| `ctx.authorizingIntegrationOwners` | Install authorizers (`guildInstall` / `userInstall` ids) |

Example — ephemeral profile when not in the bot DM:

```ts
async execute(ctx: CommandContext) {
  if (ctx.interactionContext !== "bot_dm") {
    await ctx.replyEphemeral("Your profile…");
    return ok(undefined);
  }
  await ctx.reply("Your profile…");
  return ok(undefined);
}
```

Enable **User Install** (and scopes) on the [Discord Developer Portal](https://discord.com/developers/applications) Installation page so user-context commands appear for users.

## Context fields

| Field | Description |
|-------|-------------|
| `slashPath.root` | Top-level slash command name |
| `slashPath.group` | Subcommand group (if any) |
| `slashPath.subcommand` | Subcommand name (if any) |
| `commandName` | Same as `slashPath.root` for slash |
| `interactionContext` | Interaction surface (slash / signals) |
| `authorizingIntegrationOwners` | User/guild install authorizers |

## See also

- [Arguments](/features/args) — option parsing
- [Gates](/features/gates) — pre-command checks
- [Plugins](/features/plugins) — lifecycle hooks and container
- [Desired properties](/features/desired-properties) — slim `installContext` via `desired.context.installContext`
