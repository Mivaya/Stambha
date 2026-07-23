import {
  attachGatewayRelay,
  combineIntents,
  createGatewayEventHub,
  createHttpWorkerClient,
  createNativeGatewayClient,
  GatewayIntent,
} from "@stambha/gateway";

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error("[gateway worker] DISCORD_TOKEN is required.");
  process.exit(1);
}

const botWorkerUrl = process.env.BOT_WORKER_URL ?? "http://127.0.0.1:5000";

const bus = createHttpWorkerClient({
  baseUrl: botWorkerUrl,
  ...(process.env.WORKER_SECRET ? { secret: process.env.WORKER_SECRET } : {}),
});

const hub = createGatewayEventHub();
attachGatewayRelay(hub, { bus });

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

const gateway = await createNativeGatewayClient(gatewayOptions);

await gateway.connect();

console.log(`Gateway worker online → ${botWorkerUrl} (${gateway.shards.length} shard(s))`);

process.on("SIGINT", async () => {
  await gateway.disconnect();
  process.exit(0);
});
