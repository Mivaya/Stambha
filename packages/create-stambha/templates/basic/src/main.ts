import { createStambhaBot, type RestPort, type RestRequest } from "@stambha/core";
import {
  attachStambhaClient,
  combineIntents,
  createGatewayEventHub,
  createNativeGatewayClient,
  GatewayIntent,
  type NativeGatewayClient,
} from "@stambha/gateway";
import { loadPieces } from "@stambha/loader";
import { createNativeRestPort } from "@stambha/rest";
import type { StambhaMessage } from "@stambha/transform";

const demo = process.env.DEMO === "1";
const token = process.env.DISCORD_TOKEN;

if (!demo && !token) {
  console.error("Set DISCORD_TOKEN or run with DEMO=1 (pnpm demo).");
  process.exit(1);
}

function createDemoRestPort(): RestPort {
  return {
    async request<T>(req: RestRequest) {
      const body = req.body as { content?: string; data?: { content?: string } } | undefined;
      const text = body?.content ?? body?.data?.content;
      if (text) console.log(`[demo:reply] ${text}`);
      return {} as T;
    },
  };
}

const client = createStambhaBot({
  prefix: "!",
  restPort: demo ? createDemoRestPort() : createNativeRestPort(token!),
});

const loaded = await loadPieces(client);
if (loaded.errors.length > 0) {
  for (const { file, error } of loaded.errors) {
    console.error(`[loader] ${file}:`, error);
  }
}

const hub = createGatewayEventHub();
attachStambhaClient(hub, client, {
  ...(process.env.DISCORD_APPLICATION_ID
    ? { applicationId: process.env.DISCORD_APPLICATION_ID }
    : {}),
  mentionCommands: true,
});
client.setBridge(hub);

if (demo) {
  hub.markReady({ user: { id: "demo-bot", username: "BasicBot" } });
}

await client.start();
console.log("Basic Stambha bot online.");

let gateway: NativeGatewayClient | null = null;

if (demo) {
  console.log("\n--- demo ---\n");
  hub.emit("messageCreate", {
    id: "1",
    content: "!ping",
    channelId: "c1",
    guildId: "g1",
    author: { id: "u1", bot: false },
  } satisfies StambhaMessage);
  hub.emit("messageCreate", {
    id: "2",
    content: "!say hello",
    channelId: "c1",
    guildId: "g1",
    author: { id: "u1", bot: false },
  } satisfies StambhaMessage);
  await new Promise((r) => setTimeout(r, 100));
  console.log("\n--- end demo ---\n");
  await client.stop();
  process.exit(0);
} else if (token) {
  gateway = await createNativeGatewayClient({
    token,
    hub,
    intents: combineIntents(
      GatewayIntent.Guilds,
      GatewayIntent.GuildMessages,
      GatewayIntent.MessageContent,
    ),
  });
  await gateway.connect();
}

async function shutdown() {
  await gateway?.disconnect();
  await client.stop();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
