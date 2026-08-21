# Sequences (multi-step interactions)

Sequences chain **buttons → selects** (and modal *definitions*) without hand-rolled collectors. Prefer **`runSequence`** for framework-owned sessions, step UI, wrong-user handling, and timeouts.

For a **single** await (reply / reaction / button) with `time` / `max`, use [Collectors](/features/collectors) on the gateway hub instead.

## Happy path — `runSequence`

```ts
import { runSequence, sequence } from "@stambha/core";

const flow = sequence()
  .timeout(60_000)
  .button("role", "Pick a role:", [
    { id: "mod", label: "Moderator" },
    { id: "member", label: "Member" },
  ])
  .select("channel", "Pick channel:", [
    { label: "General", value: "general" },
    { label: "Announcements", value: "announcements" },
  ])
  .build();

const result = await runSequence(ctx, flow);
if (!result.cancelled) {
  // result.answers.role, result.answers.channel
}
```

What `runSequence` owns:

1. **Session** — `client.sequences.createSession` / `endSession`
2. **Step UI** — `renderSequenceStep` (button / select rows with `stambha:seq:…` ids)
3. **Wait / complete** — `waitForStep` + built-in **`SeqSignal`** (`name: "seq"`, auto-registered if missing)
4. **Wrong-user / unknown** — ephemeral replies from `SeqSignal`
5. **Timeout** — cancels with a recoverable message; returns `{ cancelled: true }`

`ctx.client` is injected by `StambhaClient.invoke` during command execution. In unit tests, pass `options.client` or set `ctx.client` yourself.

Slash flows use `deferReply` + `editReply` when available; prefix replies once per step.

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

`Signal.parseCustomId` treats these as signal name **`seq`**. `runSequence` registers core’s `SeqSignal` automatically; you may still provide your own Signal named `seq` if you need custom copy.

## Advanced — manual loop

If you need custom rendering or mid-flow Vault writes, keep the manual pattern:

1. **Build** the flow with `sequence()…build()`.
2. **Create a session** — `client.sequences.createSession({ userId, guildId, channelId, timeoutMs })`.
3. **Send each step** — `renderSequenceStep(sessionId, step)` or your own payload.
4. **Wait** — `await client.sequences.waitForStep(sessionId, stepId, timeoutMs)`.
5. **Complete from a Signal** — `ensureSeqSignal(client)` or a custom `seq` Signal calling `completeStep`.
6. **Finish** — summarize answers, optionally persist to [Vault](/features/vault), then `endSession`.

### Manual Signal (optional)

```ts
import { ensureSeqSignal, SeqSignal } from "@stambha/core";

ensureSeqSignal(client); // or register `new SeqSignal(client.registries.signals)`
```

`completeStep` returns `"ok" | "wrong_user" | "unknown"`. Always acknowledge the component interaction (ephemeral is enough) so Discord does not show “interaction failed”.

## Example bot

| Piece | Role |
|-------|------|
| `commands/Admin/SetupCommand.ts` | `runSequence` + summary reply |

```bash
cd examples/bot && pnpm start
# /setup or !setup — click role, then pick channel type
```

## Modal steps

`.modal(…)` defines fields for a future show-modal callback. **`runSequence` throws** if it encounters a modal step today — use **button + select** for production flows, or open a modal yourself from a button Signal and `completeStep` on modal submit (`types: ["modal"]` on a custom Signal).

## Related

- [Signals](/features/signals) — `stambha:` custom ids for components
- [Components & embeds](/features/components) — builders for rows and selects
- [Vault](/features/vault) — persist sequence answers to schema
- [API: `@stambha/core`](/api/core/) — `runSequence`, `sequence`, `SequenceStore`, custom-id helpers
- [Known gaps](/guide/known-gaps) — remaining sequence / scale work
