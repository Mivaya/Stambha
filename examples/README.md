# Stambha examples

Pick a scale — details in [Examples by scale](../docs/guide/examples.md).

**Each folder is self-contained.** You can keep only the example you need (e.g. delete the others) and it still runs.

| Directory | Scale | Purpose |
|-----------|-------|---------|
| [`minimal/`](./minimal) | Smoke | `MockBridge` pipeline only — no Discord |
| [`basic/`](./basic) | Basic | Native gateway + REST, ping/say, slash deploy |
| [`bot/`](./bot) | Advanced | Full piece layout — vault, authz, signals, polls, Components V2 |
| [`bigbot/`](./bigbot) | Enterprise | Self-contained — same features + tier-split + desired properties |
| [`http-interactions/`](./http-interactions) | Serverless slash | Interactions Endpoint URL — no WebSocket |

## First time here?

```bash
cd examples/basic
pnpm install
pnpm demo          # no Discord token
```

Or the full advanced demo:

```bash
cd examples/bot
pnpm install
pnpm demo
```

## Tier-split

```bash
cd examples/bigbot   # or examples/bot
pnpm split:rest      # terminal 1
pnpm split:bot       # terminal 2 (REST_WORKER_URL=…)
pnpm split:gateway   # terminal 3 (BOT_WORKER_URL=…)
```

See [Tier split](../docs/deployment/tier-split.md).
