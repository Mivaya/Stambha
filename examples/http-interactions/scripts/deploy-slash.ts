/**
 * Register slash commands for the HTTP interactions example.
 * Run once (or after command changes). No gateway required.
 */
import { deployCommands } from "@stambha/rest";
import { createHttpApp } from "../src/createApp.js";

const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;
const publicKey = process.env.DISCORD_PUBLIC_KEY ?? "0".repeat(64);

if (!token || !applicationId) {
  console.error("Set DISCORD_TOKEN and DISCORD_APPLICATION_ID");
  process.exit(1);
}

const { client } = await createHttpApp({
  publicKey,
  token,
  applicationId,
});

const result = await deployCommands({
  token,
  applicationId,
  commands: client.registries.commands.values(),
  ...(process.env.DISCORD_GUILD_ID ? { guildId: process.env.DISCORD_GUILD_ID } : {}),
});

console.log(`Slash deploy: ${result.count} command(s).`);
await client.stop();
