# Basic bot

Smallest **live Discord** example: native gateway + REST, piece loader, `ping` / `say`, slash deploy on ready.

For pipeline-only smoke tests (no Discord), use [`../minimal`](../minimal). For vault, authz, signals, and polls, use [`../bot`](../bot) (advanced).

## Try without a token

```bash
pnpm install
pnpm demo
```

## Run against Discord

```bash
cp .env.example .env
# DISCORD_TOKEN + DISCORD_APPLICATION_ID
pnpm start
```

## Layout

```text
src/
  commands/General/   PingCommand, SayCommand
  listeners/          ReadyListener (slash deploy)
  main.ts
```

## Next

- [Examples by scale](../../docs/guide/examples.md)
- Advanced: [`../bot`](../bot)
- Enterprise / tier-split: [`../bigbot`](../bigbot)
