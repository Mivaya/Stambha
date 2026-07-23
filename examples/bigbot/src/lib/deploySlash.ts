import type { StambhaClient } from "@stambha/core";
import {
  deployCommands,
  deployCommandsIfShardZero,
  formatDeployDiff,
  resolveShardIdFromEnv,
  shouldDeploySlashCommands,
} from "@stambha/rest";

export interface DeployExampleSlashOptions {
  shardId?: number;
  guildId?: string;
  dryRun?: boolean;
  /** Tier-split bot worker — deploy once at startup (ignore `SHARD_ID`). */
  force?: boolean;
}

/**
 * Deploy slash commands from loaded example-bot pieces.
 * Shard 0 only when sharded (N5); tier-split bot worker uses `force: true`.
 */
export async function deployExampleSlashCommands(
  client: StambhaClient,
  options: DeployExampleSlashOptions = {},
) {
  const token = process.env.DISCORD_TOKEN;
  const applicationId = process.env.DISCORD_APPLICATION_ID;

  if (!token || !applicationId) {
    console.log("[deploy] skip — set DISCORD_TOKEN and DISCORD_APPLICATION_ID");
    return null;
  }

  const shardId = options.shardId ?? resolveShardIdFromEnv();
  const guard: { shardId?: number } = {};
  if (shardId !== undefined) guard.shardId = shardId;
  if (!options.force && !shouldDeploySlashCommands(guard)) {
    const label = shardId ?? "?";
    console.log(`[deploy] skip — shard ${label} (only shard 0 deploys)`);
    return null;
  }

  const guildId = options.guildId ?? process.env.DISCORD_GUILD_ID;
  const base = {
    token,
    applicationId,
    commands: client.registries.commands.values(),
    dryRun: options.dryRun ?? false,
    diff: true as const,
    ...(guildId ? { guildId } : {}),
  };

  const result = options.force
    ? await deployCommands(base)
    : await deployCommandsIfShardZero(shardId !== undefined ? { ...base, shardId } : base);

  if (!result) return null;

  if (result.diff) {
    console.log(formatDeployDiff(result.diff));
  }

  const scope = result.global ? "global" : `guild ${result.guildId}`;
  const mode = options.dryRun ? "dry-run" : "registered";
  console.log(`[deploy] ${result.count} slash command(s) ${mode} (${scope})`);
  return result;
}
