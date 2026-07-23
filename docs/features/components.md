# Components

Helpers for Discord **message components** and **modals** — classic action rows plus **Components V2** layouts (Containers, Sections, Text Display) — and `registerPersistentSignals()` for long-lived `stambha:` UIs.

## Classic builders

```ts
import {
  button,
  buttonRow,
  ButtonStyle,
  confirmCancelRow,
  modal,
  selectRow,
  stringSelect,
  textInput,
  TextInputStyle,
} from "@stambha/core";

const signal = client.registries.signals.get("confirm")!;

await ctx.reply({
  content: "Continue?",
  components: [confirmCancelRow(signal)],
});
```

| Helper | Output |
|--------|--------|
| `button` / `linkButton` | Button (type 2) |
| `buttonRow` / `actionRow` | Action row (type 1) |
| `stringSelect` / `selectRow` | String select in a row |
| `confirmCancelRow(signal)` | Success + secondary buttons |
| `textInput` / `modal` | Modal layout |

Custom ids should come from `signal.customId(suffix?)` so [`SignalRouter`](/features/signals) can route them.

## Components V2

V2 messages set `MessageFlags.IsComponentsV2` (`1 << 15`). With that flag, Discord does **not** use top-level `content` / `embeds` — put copy in `textDisplay` instead.

```ts
import {
  button,
  ButtonStyle,
  buttonRow,
  componentsV2,
  container,
  separator,
  textDisplay,
} from "@stambha/core";

const signal = client.registries.signals.get("confirm")!;

await ctx.reply(
  componentsV2({
    components: [
      container({
        accentColor: 0x5865f2,
        components: [
          textDisplay({ content: "# Hello" }),
          separator(),
          textDisplay({ content: "Pick an action." }),
          buttonRow(
            button({
              customId: signal.customId("yes"),
              label: "OK",
              style: ButtonStyle.Success,
            }),
          ),
        ],
      }),
    ],
  }),
);
```

| Helper | Type | Role |
|--------|------|------|
| `componentsV2({ components })` | reply helper | Sets `IS_COMPONENTS_V2` |
| `container` | 17 | Accent group; nests rows / text / media |
| `textDisplay` | 10 | Markdown text |
| `section` | 9 | Text + button/thumbnail accessory |
| `thumbnail` | 11 | Section accessory image |
| `mediaGallery` | 12 | Image grid |
| `separator` | 14 | Divider / padding |
| `fileComponent` | 13 | `attachment://…` file display |

**Signals:** nest `buttonRow` / `selectRow` inside a container (or top-level). Interactive children still use `stambha:` custom ids — no special router mode.

Example bot: `!panel` / `/panel`.

## Persistent signals

Session ids (pagination, sequences) die on restart. **Persistent** UIs use stable ids like `stambha:colors` and re-register the same signal pieces on every boot.

```ts
import { registerPersistentSignals } from "@stambha/core";

registerPersistentSignals(client, (registry) => [
  new ColorMenuSignal(registry),
]);
```

- Skips names already loaded (safe after `loadPieces`).
- File-based pieces under `src/signals/` are already persistent when you call `loadPieces` on startup.
- Prefer `registerPersistentSignals` when wiring panels in bootstrap instead of (or in addition to) folders.

Select handlers read `ctx.values` (from the interaction payload).

## See also

- [Signals](/features/signals) — routing and `SignalContext`
- [Pagination](/extensions/pagination) — session-scoped component ids
- [Examples bot](https://github.com/Mivaya/Stambha/tree/main/examples/bot) — `!confirm`, `!menu`, `!panel`
