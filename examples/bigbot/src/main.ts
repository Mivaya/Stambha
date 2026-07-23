import {
  attachStambhaClient,
  combineIntents,
  createGatewayEventHub,
  createNativeGatewayClient,
  GatewayIntent,
  type NativeGatewayClient,
} from "@stambha/gateway";
import {
  gatesDesiredProperties,
  minimalDesiredProperties,
  type DesiredProperties,
} from "@stambha/core";
import { createNativeRestWorker } from "@stambha/rest";
import type { StambhaMessage } from "@stambha/transform";
import { deployExampleSlashCommands } from "./lib/deploySlash.js";
import { setupBot } from "./lib/setup.js";

function resolveDesired(): DesiredProperties | undefined {
  const mode = process.env.DESIRED?.toLowerCase();
  if (mode === "gates") return gatesDesiredProperties;
  if (mode === "minimal") return minimalDesiredProperties;
  return undefined;
}

const demo = process.env.DEMO === "1";
const token = process.env.DISCORD_TOKEN;

if (!demo && !token) {
  console.error("Set DISCORD_TOKEN or run with DEMO=1 (pnpm demo).");
  process.exit(1);
}

const desired = resolveDesired();
const { client } = await setupBot({
  demo,
  ...(desired ? { desiredProperties: desired } : {}),
});

if (desired) {
  console.log(`desiredProperties mode: ${process.env.DESIRED}`);
}

const hub = createGatewayEventHub();
attachStambhaClient(hub, client, {
  ...(process.env.DISCORD_APPLICATION_ID
    ? { applicationId: process.env.DISCORD_APPLICATION_ID }
    : {}),
  mentionCommands: true,
  editTracking: true,
});
client.setBridge(hub);

let restCloser: (() => Promise<void>) | null = null;
let gateway: NativeGatewayClient | null = null;

if (!demo && token && !process.env.REST_WORKER_URL) {
  const rest = await createNativeRestWorker({ token, port: Number(process.env.REST_PORT ?? 4000) });
  console.log(`In-process REST worker at ${rest.url}`);
  restCloser = async () => {
    await rest.close();
  };
}

if (demo) {
  hub.markReady({ user: { id: process.env.BOT_USER_ID ?? "demo-bot", username: "BigBot" } });
}

await client.start();
console.log("Bigbot online — self-contained enterprise example (see README).");

if (demo) {
  hub.emit("messageCreate", {
    id: "1",
    content: "!ping",
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
  hub.once("ready", () => {
    void deployExampleSlashCommands(client);
  });
}

async function shutdown() {
  await gateway?.disconnect();
  if (restCloser) await restCloser();
  await client.stop();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
