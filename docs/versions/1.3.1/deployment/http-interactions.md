# HTTP interactions (no gateway)

Receive Discord **Interactions Endpoint URL** traffic over HTTPS — verify Ed25519 signatures, answer `PING`, and run the same slash / signal / autocomplete pipeline as `attachStambhaClient`, without a WebSocket gateway.

Use this for serverless hosts (Cloudflare Workers, AWS Lambda, Fly Machines) or any app that cannot keep a gateway connection.

## Setup

1. In the [Discord Developer Portal](https://discord.com/developers/applications) → your app → **General Information**, copy the **Public Key**.
2. Deploy an HTTPS endpoint that uses `createHttpInteractionHandler`.
3. Paste that URL into **Interactions Endpoint URL**. Discord will send a signed `PING`; a valid `PONG` + signature checks activates the endpoint.

You typically still need a bot token + `RestPort` for deferred edits and follow-ups after the initial HTTP response.

## Handler

```ts
import { createStambhaBot } from "@stambha/core";
import { createHttpInteractionHandler } from "@stambha/gateway";
import { createNativeRestPort } from "@stambha/rest";

const token = process.env.DISCORD_TOKEN!;
const client = createStambhaBot({
  restPort: createNativeRestPort(token),
});
// loadPieces / register commands …

const handle = createHttpInteractionHandler({
  publicKey: process.env.DISCORD_PUBLIC_KEY!,
  client,
  applicationId: process.env.DISCORD_APPLICATION_ID,
});
```

### Cloudflare Worker / Fetch API

```ts
export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method !== "POST") return new Response("ok");
    const rawBody = await req.arrayBuffer();
    const result = await handle({
      rawBody,
      signature: req.headers.get("X-Signature-Ed25519"),
      timestamp: req.headers.get("X-Signature-Timestamp"),
    });
    const body =
      typeof result.body === "string" ? result.body : JSON.stringify(result.body);
    return new Response(body, { status: result.status, headers: result.headers });
  },
};
```

### Node `http` / Express

Read the **raw** body (do not `JSON.parse` before verification). Pass that string/buffer into `handle`, then `res.status(result.status).set(result.headers).send(...)`.

## Behaviour

| Step | Result |
|------|--------|
| Bad signature | `401` — Discord probes invalid signatures on purpose |
| `type: 1` PING | `200` + `{ type: 1 }` PONG |
| Slash / component / autocomplete | Same routing as gateway `attachStambhaClient` |
| First `POST /interactions/…/callback` | Captured and returned as the HTTP JSON body |
| No reply from the command | Default `{ type: 5 }` (deferred) so Discord is acknowledged |

Commands that need more than ~3 seconds should `deferReply()` early (that becomes the HTTP response), then `editReply()` via `restPort`.

## Low-level exports

| Export | Role |
|--------|------|
| `verifyDiscordInteractionRequest` | Ed25519 check only |
| `routeStambhaInteraction` | Pipeline routing without HTTP |
| `CapturingInteractionRestPort` | Capture the first interaction callback |

## Gateway vs HTTP

| | Gateway | HTTP interactions |
|--|---------|-------------------|
| Prefix commands / messages | Yes | No (no `MESSAGE_CREATE`) |
| Slash / components / modals | Yes | Yes |
| Always-on process | Required | Optional (serverless OK) |
| Scouts / collectors on messages | Yes | No |

Many bots use **both**: gateway for messages, or HTTP-only for slash-centric apps.

## See also

- [`examples/http-interactions`](https://github.com/Mivaya/Stambha/tree/main/examples/http-interactions) — runnable Node server + `pnpm demo` (no token)
- [Gateway](/deployment/gateway) — WebSocket attach path
- [Native REST](/deployment/native-rest) — `RestPort` for follow-ups
- [Discord: receiving and responding](https://docs.discord.com/developers/interactions/receiving-and-responding)