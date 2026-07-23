import { createServer, type IncomingMessage } from "node:http";
import { createHttpApp } from "./createApp.js";
import { createDemoKeys } from "./lib/demoKeys.js";

const demo = process.env.DEMO === "1";
const port = Number(process.env.PORT ?? 8787);

async function readRawBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

function logResult(label: string, status: number, body: unknown) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  console.log(`[${label}] ${status} ${text}`);
}

if (demo) {
  const { publicKeyHex, signBody } = createDemoKeys();
  const { client, handle } = await createHttpApp({ demo: true, publicKey: publicKeyHex });

  console.log("HTTP interactions demo (no Discord token, no WebSocket).\n");

  // 1) Discord endpoint validation PING
  {
    const timestamp = "1000";
    const rawBody = JSON.stringify({ type: 1 });
    const result = await handle({
      rawBody,
      signature: signBody(timestamp, rawBody),
      timestamp,
    });
    logResult("PING→PONG", result.status, result.body);
  }

  // 2) Slash /ping
  {
    const timestamp = "1001";
    const rawBody = JSON.stringify({
      id: "i1",
      token: "demo-token",
      type: 2,
      application_id: "demo-app",
      channel_id: "c1",
      guild_id: "g1",
      user: { id: "u1" },
      data: { name: "ping", id: "cmd-ping" },
    });
    const result = await handle({
      rawBody,
      signature: signBody(timestamp, rawBody),
      timestamp,
    });
    logResult("slash /ping", result.status, result.body);
  }

  // 3) Slash /say
  {
    const timestamp = "1002";
    const rawBody = JSON.stringify({
      id: "i2",
      token: "demo-token",
      type: 2,
      application_id: "demo-app",
      channel_id: "c1",
      guild_id: "g1",
      user: { id: "u1" },
      data: {
        name: "say",
        id: "cmd-say",
        options: [{ name: "text", type: 3, value: "hello http" }],
      },
    });
    const result = await handle({
      rawBody,
      signature: signBody(timestamp, rawBody),
      timestamp,
    });
    logResult("slash /say", result.status, result.body);
  }

  // 4) Bad signature → 401 (Discord probes this)
  {
    const result = await handle({
      rawBody: JSON.stringify({ type: 1 }),
      signature: "00",
      timestamp: "1",
    });
    logResult("bad sig", result.status, result.body);
  }

  console.log("\n--- end demo ---");
  await client.stop();
  process.exit(0);
}

const token = process.env.DISCORD_TOKEN;
const publicKey = process.env.DISCORD_PUBLIC_KEY;
const applicationId = process.env.DISCORD_APPLICATION_ID;

if (!token || !publicKey) {
  console.error(
    "Set DISCORD_TOKEN + DISCORD_PUBLIC_KEY (and usually DISCORD_APPLICATION_ID), or run pnpm demo.",
  );
  process.exit(1);
}

const { client, handle } = await createHttpApp({
  publicKey,
  token,
  ...(applicationId ? { applicationId } : {}),
});

const server = createServer(async (req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, mode: "http-interactions" }));
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405).end("method not allowed");
    return;
  }

  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers["x-signature-ed25519"];
    const timestamp = req.headers["x-signature-timestamp"];
    const result = await handle({
      rawBody,
      signature: Array.isArray(signature) ? signature[0] : signature,
      timestamp: Array.isArray(timestamp) ? timestamp[0] : timestamp,
    });
    const body =
      typeof result.body === "string" ? result.body : JSON.stringify(result.body);
    res.writeHead(result.status, result.headers);
    res.end(body);
  } catch (err) {
    console.error("[http]", err);
    res.writeHead(500).end("internal error");
  }
});

server.listen(port, () => {
  console.log(`HTTP interactions listening on http://127.0.0.1:${port}`);
  console.log("Point Discord → Interactions Endpoint URL at this HTTPS URL (use a tunnel locally).");
  console.log("Deploy slash commands once: pnpm deploy:slash");
});

async function shutdown() {
  server.close();
  await client.stop();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
