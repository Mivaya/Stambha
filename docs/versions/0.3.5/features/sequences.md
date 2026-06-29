# Sequences (multi-step interactions)

Sequences chain **buttons → selects → modals** without manual collectors.

## Core (`@stambha/core`)

```ts
import { sequence } from "@stambha/core";

const flow = sequence()
  .button("role", "Pick a role:", [
    { id: "mod", label: "Moderator" },
    { id: "member", label: "Member" },
  ])
  .select("channel", "Pick channel:", [
    { label: "General", value: "general" },
  ])
  .modal("note", "Add a note:", {
    title: "Note",
    fields: [{ id: "text", label: "Note", style: "paragraph" }],
  });
```

`client.sequences` is the session store (timeouts, wrong-user checks).

Wire sequence steps to Discord components in your gateway worker — reply with buttons/selects/modals whose custom IDs use `stambha:seq:{sessionId}|{stepId}|{part}` (step IDs must not contain `|`).

## Example

See `examples/bot/src/commands/Admin/SetupCommand.ts`.

Native `runSequence` orchestration (automatic step routing) is planned for **2.0** — today you wire component clicks through [Signals](/features/signals) or manual `SequenceStore` handlers.

## Related

- [Signals](/features/signals) — `stambha:` custom ids for components
- [Vault](/features/vault) — persist sequence answers to schema