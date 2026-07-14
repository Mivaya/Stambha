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

Sequence steps use `stambha:seq:{sessionId}|{stepId}|{part}` — see [Sequences](/features/sequences).

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

Send a button from a command via `ReplyPayload.components`:

```ts
const signal = this.client.registries.signals.get("confirm");

await ctx.reply({
  content: "Are you sure?",
  components: [{
    type: 1,
    components: [{
      type: 2,
      style: 1,
      label: "Yes",
      custom_id: signal!.customId("yes"),
    }],
  }],
});
```

## SignalContext

| Field | Description |
|-------|-------------|
| `signalName` | Parsed from custom id |
| `customId` | Full Discord custom id |
| `userId`, `guildId`, `channelId` | Interaction context |
| `reply(text \| payload)` | Interaction callback reply |
| `replyEphemeral(text)` | Ephemeral callback |
| `deferReply?(ephemeral?)` | Defer before slow work (native attach, 0.3.5+) |
| `editReply?(payload)` | Edit deferred or follow-up message |

## Signal types

| `types` option | Discord component |
|----------------|-------------------|
| `"button"` | Button |
| `"select"` | String / user / role / channel select |
| `"modal"` | Modal submit |
| `"autocomplete"` | Reserved — use `Command.autocomplete()` for slash autocomplete |

## Native attach (0.3.5+)

With `createNativeGatewayClient` + `attachStambhaClient`, no manual routing is required:

```ts
import { attachStambhaClient, createGatewayEventHub } from "@stambha/gateway";

const hub = createGatewayEventHub();
attachStambhaClient(hub, client, {
  applicationId: process.env.DISCORD_APPLICATION_ID,
  signals: true, // default
});
```

The gateway normalizes `INTERACTION_CREATE` into `StambhaInteraction`. Component and modal kinds with `stambha:` ids dispatch to `client.signalRouter`.

Toggle routing:

| Option | Effect |
|--------|--------|
| `signals: false` | Ignore button/select/modal interactions |
| `slashCommands: false` | Ignore slash commands only |
| `autocomplete: false` | Ignore autocomplete |

## Manual routing (tests / custom workers)

```ts
import { resolveInteractionTarget } from "@stambha/plugins";

const target = resolveInteractionTarget(client, {
  kind: "signal",
  customId: "stambha:confirm:yes",
});

if (target?.kind === "signal") {
  await client.signalRouter.dispatch(signalContext, "button");
}
```

## Related

- [Sequences](/features/sequences) — multi-step flows using `stambha:seq:` ids
- [Extensions](/extensions/) — `@stambha/pagination` for embed pages
- [Pagination](/extensions/pagination) — prev / next / dismiss helper
- [Getting started](/guide/getting-started) — confirm button walkthrough
- [Gateway](/deployment/gateway) — `attachStambhaClient` options
- [Hooks](/features/hooks) — when to use Hook vs Signal
