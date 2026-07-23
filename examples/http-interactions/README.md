# HTTP interactions (serverless slash)

**No WebSocket gateway.** Discord POSTs to your **Interactions Endpoint URL**; Stambha verifies Ed25519 signatures and runs the same slash / component pipeline as `attachStambhaClient`.

Self-contained — copy only this folder. Prefix / message commands are **not** available (no `MESSAGE_CREATE`).

Docs: [HTTP interactions](../../docs/deployment/http-interactions.md).

## Try without Discord

```bash
pnpm install
pnpm demo
```

Simulates signed `PING` → `PONG`, `/ping`, `/say`, and a bad-signature `401`.

## Run a local endpoint

```bash
cp .env.example .env
# DISCORD_TOKEN, DISCORD_APPLICATION_ID, DISCORD_PUBLIC_KEY
pnpm deploy:slash    # once — registers /ping and /say
pnpm start           # http://127.0.0.1:8787
```

Expose HTTPS (ngrok, cloudflared, …) and paste the URL into the Developer Portal → **Interactions Endpoint URL**. Discord will send a signed `PING`; a valid `PONG` activates the endpoint.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DISCORD_TOKEN` | live | REST for deferred edits / follow-ups |
| `DISCORD_PUBLIC_KEY` | live | Ed25519 verify (hex from portal) |
| `DISCORD_APPLICATION_ID` | deploy / routing | Application id |
| `DISCORD_GUILD_ID` | optional | Guild-scoped slash deploy while testing |
| `PORT` | optional | Listen port (default `8787`) |

## Layout

```text
src/
  commands/General/   PingCommand, SayCommand (slash-only)
  createApp.ts        client + createHttpInteractionHandler
  main.ts             Node http server + DEMO=1
  cloudflare-worker.example.ts   Fetch API sketch
scripts/deploy-slash.ts
```

## Cloudflare Workers / Lambda

Same handler — see `src/cloudflare-worker.example.ts` and the [HTTP interactions guide](../../docs/deployment/http-interactions.md). Transport changes; pieces stay the same.

## Next

- Gateway + messages → [`../basic`](../basic) or [`../bot`](../bot)
- Scale matrix → [Examples by scale](../../docs/guide/examples.md)
