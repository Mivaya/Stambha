# Display (`@stambha/display`)

Managers and classic-embed → Components V2 helpers. Ships from [Stambha-plugins](https://github.com/Mivaya/Stambha-plugins/tree/main/packages/display) (independent semver). Core keeps Discord-shaped builders; this package adds orchestration.

## Install

```bash
pnpm add @stambha/display@^1.0.0 @stambha/core@^1.3.3
```

## EmbedManager

```ts
import { EmbedManager } from "@stambha/display";

await ctx.reply(
  EmbedManager.fromClassic({
    title: "Status",
    description: "All good",
    color: 0x57f287,
  }).toReply(),
);
```

## ContainerManager

```ts
import { ContainerManager } from "@stambha/display";

await ctx.reply(
  ContainerManager.fromClassicOptions({
    title: "Welcome",
    description: "Thanks for joining.",
    accentColor: "#5865F2",
  }).toReply(),
);
```

### Migrate classic embeds → Container

```ts
import { ContainerManager, EmbedManager } from "@stambha/display";

const embed = EmbedManager.fromClassic({ title: "Old card", description: "…" });
await ctx.reply(ContainerManager.fromEmbed(embed).toReply());
```

`PanelBuilder` / `panel()` are **not** re-exported — use `fromClassicOptions` / `fromEmbed`.

## Related

- [Components & embeds](/features/components) — core builders
- [Extensions hub](/extensions/)
