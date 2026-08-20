# Sequences (multi-step interactions)

Sequences chain **buttons → selects → modals** without hand-rolled collectors. You define steps with `sequence()`, open a `SequenceStore` session, send components with `stambha:seq:…` custom ids, and complete each wait from a [Signal](/features/signals).

Automatic `runSequence` orchestration (framework-owned step routing) is planned for **2.0** — see [Known gaps](/guide/known-gaps).

For a **single** await (reply / reaction / button) with `time` / `max`, use [Collectors](/features/collectors) on the gateway hub instead.

## Define a flow

```ts
import { sequence } from "@stambha/core";

const flow = sequence()
  .timeout(60_000) // default per-step timeout
  .button("role", "Pick a role:", [
    { id: "mod", label: "Moderator" },
    { id: "member", label: "Member" },
  ])
  .select("channel", "Pick channel:", [
    { label: "General", value: "general" },
    { label: "Announcements", value: "announcements" },
  ])
  .modal("note", "Add a note:", {
    title: "Note",
    fields: [{ id: "text", label: "Note", style: "paragraph" }],
  })
  .build();

// flow.steps — SequenceStep[]
// flow.defaultTimeoutMs
```

`client.sequences` is the session store (timeouts, wrong-user checks, `waitForStep` / `completeStep`).

## Custom id format

Reply with components whose custom ids use:

```text
stambha:seq:{sessionId}|{stepId}|{part}
```

| Part | Meaning |
|------|---------|
| `sessionId` | From `client.sequences.createSession(…)` |
| `stepId` | Step `id` from the builder (must not contain `\|`) |
| `part` | Optional — button option id; omit for selects (values come from the menu) |

Helpers:

```ts
import { sequenceCustomId, parseSequenceCustomId } from "@stambha/core";

sequenceCustomId(session.id, "role", "mod");
// → stambha:seq:{uuid}|role|mod

parseSequenceCustomId(ctx.customId);
// → { sessionId, stepId, part? }
```

`Signal.parseCustomId` treats these as signal name **`seq`** — register a Signal with `name: "seq"` so the router finds it.

## End-to-end pattern (1.x)

1. **Build** the flow with `sequence()…build()`.
2. **Create a session** — `client.sequences.createSession({ userId, guildId, channelId, timeoutMs })`.
3. **Send each step** — map the step to Discord components with `sequenceCustomId`, then `reply` / `editReply`.
4. **Wait** — `await client.sequences.waitForStep(sessionId, stepId, timeoutMs)`.
5. **Complete from a Signal** — on click/select, `parseSequenceCustomId` → `completeStep(sessionId, stepId, userId, value)`.
6. **Finish** — summarize answers, optionally persist to [Vault](/features/vault), then `endSession`.

### Command (await each step)

```ts
const session = client.sequences.createSession({
  userId: ctx.userId,
  guildId: ctx.guildId,
  channelId: ctx.channelId!,
  timeoutMs: flow.defaultTimeoutMs,
});

await ctx.deferReply?.();

for (const step of flow.steps) {
  await ctx.editReply?.(renderStep(session.id, step)); // or ctx.reply for prefix
  const value = await client.sequences.waitForStep(
    session.id,
    step.id,
    step.timeoutMs ?? flow.defaultTimeoutMs,
  );
  answers[step.id] = value;
}

client.sequences.endSession(session.id);
```

Slash flows work best with `deferReply` + `editReply` so one message advances through steps. Prefix can `reply` a new message per step.

### Signal (complete the wait)

```ts
import {
  parseSequenceCustomId,
  Signal,
  type Registry,
  type SignalContext,
} from "@stambha/core";

export class SeqSignal extends Signal {
  constructor(registry: Registry<Signal>) {
    super(registry, { name: "seq", types: ["button", "select"] });
  }

  async run(ctx: SignalContext) {
    const parsed = parseSequenceCustomId(ctx.customId);
    if (!parsed) return;

    const value =
      parsed.part !== undefined
        ? parsed.part
        : ctx.values.length === 1
          ? ctx.values[0]
          : [...ctx.values];

    const status = this.client.sequences.completeStep(
      parsed.sessionId,
      parsed.stepId,
      ctx.userId,
      value,
    );

    if (status === "wrong_user") {
      await ctx.replyEphemeral("This menu is not for you.");
      return;
    }
    if (status === "unknown") {
      await ctx.replyEphemeral("This step is no longer active.");
      return;
    }

    await ctx.replyEphemeral("Got it.");
  }
}
```

`completeStep` returns `"ok" | "wrong_user" | "unknown"`. Always acknowledge the component interaction (ephemeral is enough) so Discord does not show “interaction failed”.

## Example bot

Live wiring lives in `examples/bot`:

| Piece | Role |
|-------|------|
| `commands/Admin/SetupCommand.ts` | Builds the flow, session, step UI, `waitForStep` loop |
| `signals/SeqSignal.ts` | Completes waits for `stambha:seq:…` |

```bash
cd examples/bot && pnpm start
# /setup or !setup — click role, then pick channel type
```

`pnpm demo` still covers confirm + mention routing; use a real token for the interactive sequence.

## Modal steps

`.modal(…)` defines fields for a future show-modal callback. Until `runSequence` / a `showModal` helper lands, prefer **button + select** steps for production flows, or open a modal yourself from a button Signal and complete the step on modal submit (`types: ["modal"]`).

## 2.0 — native `runSequence`

Planned: framework-owned step routing, timeout cleanup, and wrong-user guards without per-bot Signal glue. Track progress on [Known gaps](/guide/known-gaps).

## Related

- [Signals](/features/signals) — `stambha:` custom ids for components
- [Components & embeds](/features/components) — builders for rows and selects
- [Vault](/features/vault) — persist sequence answers to schema
- [API: `@stambha/core`](/api/core/) — `sequence`, `SequenceStore`, custom-id helpers
- [Known gaps](/guide/known-gaps) — D1 / `runSequence` backlog
