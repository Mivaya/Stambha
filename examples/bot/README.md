# Advanced bot example

**Feature-complete** Stambha starter on the native stack (`@stambha/gateway`, `@stambha/rest`, `@stambha/transform`). Conventional piece folders, vault, capabilities, signals, entity selects, polls, Components V2, monetization demos, and optional tier-split workers.

- Smaller Discord bot → [`../basic`](../basic)
- Enterprise / tier-split first → [`../bigbot`](../bigbot) (self-contained; does not require this folder)
- Pipeline smoke (no Discord) → [`../minimal`](../minimal)

## Try without a token

```bash
pnpm install
pnpm demo
```

Simulates `!ping`, `!say`, `!confirm` + button click, and `@Bot` mention routing against the real pipeline. For the live multi-step sequence (`!setup` / `/setup` via `runSequence`), use `pnpm start` with a token.

## Run against Discord

```bash
cp .env.example .env
# fill DISCORD_TOKEN and DISCORD_APPLICATION_ID
pnpm start
```

### Env vars

| Variable | Required | Purpose |
|----------|----------|---------|
| `DISCORD_TOKEN` | for `pnpm start` | Bot token |
| `DISCORD_APPLICATION_ID` | for slash deploy / `editReply` | Application id from the Discord developer portal |
| `DISCORD_GUILD_ID` | optional | Guild-scoped slash deploy while testing |
| `BOT_USER_ID` | optional (demo) | Bot user id for mention-prefix demos without `ready` |
| `BOT_OWNER_ID` / `OWNER_ID` | optional | Bot owners for authz / owner gate |
| `ENFORCE_OWNER` | optional | `1` to enable owner-only mode |
| `MAINTENANCE` | optional | `1` to enable maintenance barrier |
| `PREMIUM_SKU_ID` | optional | Entitlement gate demo |
| `DEMO` | set by `pnpm demo` | Simulated events, no gateway |

Tier-split vars (`REST_WORKER_URL`, `BOT_WORKER_URL`, …) are documented in `.env.example` and [deployment](../../docs/deployment/tier-split.md).

## Layout

```text
src/
  commands/General/     Ping, say, confirm, menu, panel, poll, premium, help, config, …
  commands/Admin/       Setup, lock (bits), purge (capability), setcap
  listeners/            Ready, reaction, poll vote
  scouts/               Mention logger
  barriers/             Maintenance mode
  gates/                Owner-only mode (optional)
  conduits/             Command logging
  epilogues/            Audit trail
  signals/              ConfirmSignal (buttons); seq Signal is built into core
  tasks/                Heartbeat cron
  schemas/              Vault guild blueprint (capability claims)
  plugins/              Logging plugin (wired in setup)
  lib/setup.ts          Shared client + vault + authz + loadPieces
  workers/              Optional multi-process workers
  main.ts
```

## What this demos

| Area | Commands / pieces |
|------|-------------------|
| Args | `say`, `echo` |
| Signals / components | `confirm`, `menu` (string + user/channel selects), `panel` (Components V2) |
| Sequences | `setup` via `runSequence` (`sequence()` + built-in `SeqSignal`) |
| Polls | `poll`, `endpoll` + vote listener |
| Authz | `purge` (capability ⊕ Manage Messages) + `setcap` (`@stambha/authz`) |
| Monetization | `premium` (`entitlementGate`) |
| Vault | `config` |
| Gates / barriers | `lock`, owner gate, maintenance |

## Split processes (optional)

```bash
pnpm split:rest      # terminal 1
pnpm split:bot       # terminal 2
pnpm split:gateway   # terminal 3
# or single-process: pnpm split:demo
```

Prefer [`../bigbot`](../bigbot) when tier-split is your primary goal (self-contained; scale checklist + `DESIRED=`).

See [deployment — process split](../../docs/deployment/tier-split.md) and [Examples by scale](../../docs/guide/examples.md).
