# Starter bot example

Full piece layout on the **native** Stambha stack (`@stambha/gateway`, `@stambha/rest`, `@stambha/transform`). Use this as your first clone target — not a minimal stub.

## Try without a token

```bash
pnpm install
pnpm demo
```

Simulates `!ping`, `!say`, `!confirm` + button click, and `@Bot` mention routing against the real pipeline.

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
| `OWNER_ID` | optional | Used by owner gate demos |
| `ENFORCE_OWNER` | optional | `1` to enable owner-only mode |
| `MAINTENANCE` | optional | `1` to enable maintenance barrier |
| `DEMO` | set by `pnpm demo` | Simulated events, no gateway |

Tier-split vars (`REST_WORKER_URL`, `BOT_WORKER_URL`, …) are documented in `.env.example` and [deployment](../../docs/deployment/tier-split.md).

## Layout

```text
src/
  commands/General/     Ping, say, confirm, echo, help, config
  commands/Admin/       Setup, lock (bitfield), purge (permission levels)
  listeners/            Ready hook
  scouts/               Mention logger
  barriers/             Maintenance mode
  gates/                Owner-only mode (optional)
  conduits/             Command logging
  epilogues/            Audit trail
  signals/              Button confirm handler
  tasks/                Heartbeat cron
  schemas/              Vault guild blueprint
  plugins/              Logging plugin (wired in setup)
  lib/setup.ts          Shared client + vault + loadPieces
  workers/              Optional multi-process workers
  main.ts
```

## Split processes (optional)

```bash
pnpm split:rest      # terminal 1
pnpm split:bot       # terminal 2
pnpm split:gateway   # terminal 3
# or single-process: pnpm split:demo
```

See [deployment — process split](../../docs/deployment/tier-split.md).
