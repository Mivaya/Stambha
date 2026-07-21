# Components

Helpers for Discord **message components** and **modals** — action rows, buttons, string selects, text inputs — plus `registerPersistentSignals()` for long-lived `stambha:` UIs.

## Builders

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

await ctx.reply({
  content: "Pick one:",
  components: [
    selectRow(
      stringSelect({
        customId: signal.customId(), // stambha:confirm
        options: [
          { label: "A", value: "a" },
          { label: "B", value: "b" },
        ],
      }),
    ),
  ],
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
- [Examples bot](https://github.com/Mivaya/Stambha/tree/main/examples/bot) — `!confirm`, `!menu`
