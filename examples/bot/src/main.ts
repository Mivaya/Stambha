import {
  attachStambhaClient,
  combineIntents,
  createGatewayEventHub,
  createNativeGatewayClient,
  GatewayIntent,
  type NativeGatewayClient,
} from "@stambha/gateway";
import { createNativeRestWorker } from "@stambha/rest";
import type { StambhaInteraction, StambhaMessage } from "@stambha/transform";
import { deployExampleSlashCommands } from "./lib/deploySlash.js";
import { setupBot } from "./lib/setup.js";

const demo = process.env.DEMO === "1";
const token = process.env.DISCORD_TOKEN;

if (!demo && !token) {
  console.error("Set DISCORD_TOKEN or run with DEMO=1 (pnpm demo).");
  process.exit(1);
}

const { client } = await setupBot({ demo });

const hub = createGatewayEventHub();
attachStambhaClient(hub, client, {
  applicationId: process.env.DISCORD_APPLICATION_ID,
  mentionCommands: true,
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
  const botUserId = process.env.BOT_USER_ID ?? "demo-bot";
  hub.markReady({ user: { id: botUserId, username: "StambhaBot" } });
}

await client.start();

console.log("Stambha bot online (native gateway + REST).");
console.log(
  "Folder layout: commands, listeners, scouts, barriers, gates, conduits, epilogues, signals, tasks, schemas.",
);

if (demo) {
  const botUserId = process.env.BOT_USER_ID ?? "demo-bot";
  console.log("\n--- demo events ---\n");

  hub.emit("messageCreate", {
    id: "1",
    content: "!ping",
    channelId: "c1",
    guildId: "g1",
    author: { id: "u1", bot: false },
  } satisfies StambhaMessage);

  hub.emit("messageCreate", {
    id: "2",
    content: "!say hello from demo",
    channelId: "c1",
    guildId: "g1",
    author: { id: "u1", bot: false },
  } satisfies StambhaMessage);

  hub.emit("messageCreate", {
    id: "2b",
    content: "!confirm",
    channelId: "c1",
    guildId: "g1",
    author: { id: "u1", bot: false },
  } satisfies StambhaMessage);

  hub.emit("interactionCreate", {
    kind: "component",
    id: "i-demo",
    token: "demo-token",
    applicationId: process.env.DISCORD_APPLICATION_ID ?? "demo-app",
    user: { id: "u1", bot: false },
    guildId: "g1",
    channelId: "c1",
    customId: "stambha:confirm:yes",
    componentType: "button",
    raw: {},
  } satisfies StambhaInteraction);

  hub.emit("messageCreate", {
    id: "3",
    content: `<@${botUserId}> ping`,
    channelId: "c1",
    guildId: "g1",
    author: { id: "u2", bot: false },
  } satisfies StambhaMessage);

  hub.emit("messageCreate", {
    id: "3b",
    content: `<@${botUserId}> hey`,
    channelId: "c1",
    guildId: "g1",
    author: { id: "u2", bot: false },
  } satisfies StambhaMessage);

  console.log("\n--- end demo ---\n");
} else if (token) {
  const gatewayOptions = {
    token,
    hub,
    intents: combineIntents(
      GatewayIntent.Guilds,
      GatewayIntent.GuildMessages,
      GatewayIntent.MessageContent,
      GatewayIntent.DirectMessages,
    ),
  };
  if (process.env.TOTAL_SHARDS) {
    Object.assign(gatewayOptions, { totalShards: Number(process.env.TOTAL_SHARDS) });
  }
  gateway = await createNativeGatewayClient(gatewayOptions);
  hub.once("ready", () => {
    void deployExampleSlashCommands(client, { shardId: 0 });
  });
  await gateway.connect();
  console.log(`Native WebSocket gateway connected (${gateway.shards.length} shard(s)).`);
}

process.on("SIGINT", async () => {
  await gateway?.disconnect();
  await client.stop();
  if (restCloser) await restCloser();
  process.exit(0);
});
