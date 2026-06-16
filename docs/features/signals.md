# Signals

**Signals** handle component interactions — buttons, select menus, and modals — routed by Discord `custom_id` values with the `stambha:` prefix.

Place signal pieces under `src/signals/`.

## Custom id format

```text
stambha:{signalName}[:suffix…]
```

Build ids from a signal piece:

```ts
const id = this.customId("delete"); // → stambha:confirm:delete
```

Parse incoming ids:

```ts
Signal.parseCustomId("stambha:confirm:delete");
// → { name: "confirm", suffix: "delete" }
```

## Quick start

```ts
import { Signal, type Registry, type SignalContext } from "@stambha/core";

export class ConfirmSignal extends Signal {
  constructor(registry: Registry<Signal>) {
    super(registry, {
      name: "confirm",
      types: ["button"],
    });
  }

  async run(ctx: SignalContext): Promise<void> {
    const parsed = Signal.parseCustomId(ctx.customId);
    const action = parsed?.suffix ?? "unknown";
    await ctx.reply(`Confirmed: \`${action}\``);
  }
}
```

Send a button in a command reply (via REST or rich `ReplyPayload`):

```ts
await ctx.reply({
  content: "Are you sure?",
  embeds: [{
    // … or use components in REST body via RestPort for full control
  }],
});
// components: [{ type: 1, components: [{ type: 2, style: 1, label: "Yes", custom_id: signal.customId("yes") }] }]
```

## SignalContext

| Field | Description |
|-------|-------------|
| `signalName` | Parsed from custom id |
| `customId` | Full Discord custom id |
| `userId`, `guildId`, `channelId` | Interaction context |
| `reply(text)` / `replyEphemeral(text)` | Interaction callback replies |
| `deferReply?()` | Optional defer helper when wired by your gateway layer |

## Signal types

| `types` option | Discord component |
|----------------|-------------------|
| `"button"` | Button |
| `"select"` | String / user / role / channel select |
| `"modal"` | Modal submit |
| `"autocomplete"` | Reserved — use `Command.autocomplete()` for slash autocomplete |

## Routing interactions

Resolve which piece should handle an interaction:

```ts
import { resolveInteractionTarget, resolveSignal } from "@stambha/plugins";

const target = resolveInteractionTarget(client, {
  kind: "signal",
  customId: "stambha:confirm:yes",
});

if (target?.kind === "signal") {
  await client.signalRouter.dispatch(signalContext, "button");
}
```

`SignalRouter.dispatch(ctx, type)` runs the matching signal's `run()` method.

### Native attach (0.3.5+)

`attachStambhaClient` routes slash commands, autocomplete, buttons/selects, and modals when the gateway emits normalized `StambhaInteraction` payloads from `interactionFromDispatch`.

## Related

- [Sequences](/features/sequences) — multi-step flows using `stambha:seq:` ids
- [Plugins](/features/plugins) — `resolveInteractionTarget` helper
- [Command tree](/features/command-tree) — slash autocomplete on commands
