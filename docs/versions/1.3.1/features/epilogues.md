# Epilogues

Epilogues run **after** the command pipeline decides an outcome — including when a **gate denies** or a **barrier blocks** before `execute()`.

Prefer epilogues over `client.on("commandSuccess")` / `client.on("commandDenied")` in bootstrap.

## File-based epilogue

```ts
import { Epilogue, isOk, type EpilogueContext, type Registry } from "@stambha/core";

export class AuditEpilogue extends Epilogue {
  constructor(registry: Registry<Epilogue>) {
    super(registry, { name: "audit", runOn: "always", priority: 100 });
  }

  async run(ctx: EpilogueContext): Promise<void> {
    if (ctx.phase === "denied") {
      console.log(`denied: ${ctx.commandName} (${ctx.denied?.gate})`);
      return;
    }
    if (ctx.phase === "blocked") {
      console.log(`blocked: ${ctx.commandName}`);
      return;
    }
    const ok = ctx.outcome && isOk(ctx.outcome);
    console.log(`${ctx.commandName} ${ok ? "ok" : "fail"} (${ctx.durationMs.toFixed(1)}ms)`);
  }
}
```

Place under `src/epilogues/` and load with `@stambha/loader`.

## Denied vs blocked

| Phase | Cause | User UX |
|-------|-------|---------|
| `denied` | A **gate** on the command failed | `attachGateDeniedReply` sends the gate reason (optional) |
| `blocked` | A **barrier** stopped the command globally | Barrier `reason` unless `silent: true` |

Both run **before** `execute()`. Epilogues with `runOn: "denied"` or `runOn: "blocked"` audit these paths; conduits have already run but gates may not have.

## `runOn` phases

| `runOn` | When it runs |
|---------|----------------|
| `success` | Command completed with `ok()` |
| `failure` | Command completed with `err()` or threw |
| `denied` | Gate denied before execute |
| `blocked` | Barrier blocked before execute |
| `always` | Any phase (success, failure, denied, blocked) |

## Programmatic templates (bootstrap)

Replace multiple `client.on(...)` handlers with one attach helper:

```ts
import { attachCommandLifecycleEpilogues } from "@stambha/core";

const detach = attachCommandLifecycleEpilogues(client, {
  onSuccess: ({ commandName, durationMs }) => {
    console.log(`[ok] ${commandName} (${durationMs.toFixed(1)}ms)`);
  },
  onFailure: ({ commandName, outcome }) => {
    console.error(`[fail] ${commandName}`, outcome);
  },
  onDenied: ({ commandName, denied }) => {
    console.log(`[denied] ${commandName} — ${denied?.message}`);
  },
  onBlocked: ({ commandName, blocked }) => {
    console.log(`[blocked] ${commandName} — ${blocked?.reason}`);
  },
});

// later: detach();
```

### Logging factory

```ts
import { createCommandLoggingEpilogue } from "@stambha/core";

client.registries.epilogues.register(
  createCommandLoggingEpilogue(client.registries.epilogues, (line) => console.log(line)),
);
```

## vs client events

| Client event | Epilogue replacement |
|--------------|----------------------|
| `commandSuccess` | `runOn: "success"` or `onSuccess` in `attachCommandLifecycleEpilogues` |
| `commandError` | `runOn: "failure"` or `onFailure` |
| `commandDenied` | `runOn: "denied"` or `onDenied` |
| `commandBlocked` | `runOn: "blocked"` or `onBlocked` |

Client events still emit for metrics plugins and backward compatibility. New bots should use epilogues for app logging and auditing. Per-command failures also invoke `Command.onCommandError` (default logger) — see [Pieces — lifecycle](/guide/pieces#lifecycle-onload--onunload--oncommanderror).

## Related

- [Gates](/features/gates) — `attachGateDeniedReply` still handles user-facing denial messages
- [Barriers](/features/barriers) — `phase: "blocked"` epilogues
- [Project structure](/guide/project-structure) — `src/epilogues/`
- [Plugins](/features/plugins) — metrics listen to client events