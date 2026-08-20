# Sequences (multi-step interactions)

Sequences chain **buttons → selects → modals** without manual collectors. Today you **wire each step** through [Signals](/features/signals) or direct `SequenceStore` handlers; automatic `runSequence` orchestration is planned for **2.0**.

For a **single** await (reply / reaction / button) with `time` / `max`, use [Collectors](/features/collectors) on the gateway hub.

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

## Custom id format

Reply with components whose custom IDs use:

```text
stambha:seq:{sessionId}|{stepId}|{part}
```

Step IDs must not contain `|`. The session id ties clicks to one user flow.

## Manual wiring today (1.0.0)

1. **Start a session** in a command — create store entry, send first step components.
2. **Handle clicks** in a Signal (or hook) — parse `stambha:seq:…`, validate user, advance `SequenceStore`.
3. **Finish** — persist answers to [Vault](/features/vault) or reply with summary.

```ts
// In a Signal.run():
const parsed = Signal.parseCustomId(ctx.customId);
if (!parsed || !ctx.customId.startsWith("stambha:seq:")) return;

const [, sessionId, stepId, part] = ctx.customId.split(/[:|]/);
const session = client.sequences.get(sessionId);
if (!session || session.userId !== ctx.userId) {
  await ctx.replyEphemeral("This menu is not for you.");
  return;
}
// advance step, send next components…
```

## Example

`examples/bot/src/commands/Admin/SetupCommand.ts` builds a sequence definition (builder demo). Full live multi-step routing is left as an exercise until **2.0 D1** `runSequence`.

## 2.0 — native `runSequence`

Planned: framework-owned step routing, timeout cleanup, and wrong-user guards without per-bot Signal glue. Track progress on [Known gaps](/guide/known-gaps).

## Related

- [Signals](/features/signals) — `stambha:` custom ids for components
- [Vault](/features/vault) — persist sequence answers to schema
- [Known gaps](/guide/known-gaps) — D1 backlog