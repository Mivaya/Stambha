# Stambha examples

## First time here?

```bash
cd examples/bot
pnpm install
pnpm demo          # no Discord token — real pipeline, simulated events
```

That is the fastest path from clone to “it works.” Add a token later with `cp .env.example .env` and `pnpm start`.

| Directory | Purpose |
|-----------|---------|
| [`bot/`](./bot) | **Starter bot** — full piece layout, native gateway + REST |
| [`minimal/`](./minimal) | MockBridge only — smallest pipeline smoke test |

## Quick start

```bash
# Starter bot (recommended)
cd examples/bot && pnpm install && pnpm demo

# Minimal mock invoke
cd examples/minimal && pnpm install && pnpm start
```

See [`bot/README.md`](./bot/README.md) for folder layout, env vars, and optional multi-process workers.
