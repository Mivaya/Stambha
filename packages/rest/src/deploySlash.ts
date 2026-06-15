import type { DeployCommandsOptions, DeployCommandsResult } from "./deployCommands.js";
import { deployCommands } from "./deployCommands.js";

export interface ShouldDeploySlashOptions {
  /** Current process shard id. Omit when not sharded (single process → deploy). */
  shardId?: number;
  /** Force skip (or set env `SKIP_SLASH_DEPLOY=1`). */
  skip?: boolean;
}

/** Read `SHARD_ID` / `SHARD` from the environment when not passed explicitly. */
export function resolveShardIdFromEnv(): number | undefined {
  const raw = process.env.SHARD_ID ?? process.env.SHARD;
  if (raw === undefined || raw === "") return undefined;
  const id = Number(raw);
  return Number.isFinite(id) ? id : undefined;
}

/**
 * Whether this process should call {@link deployCommands}.
 * Only **shard 0** deploys when sharded; a single non-sharded process always deploys.
 */
export function shouldDeploySlashCommands(options: ShouldDeploySlashOptions = {}): boolean {
  if (options.skip || process.env.SKIP_SLASH_DEPLOY === "1") return false;
  const shardId = options.shardId ?? resolveShardIdFromEnv();
  if (shardId === undefined) return true;
  return shardId === 0;
}

/** Human-readable summary for {@link DeployCommandsResult.diff}. */
export function formatDeployDiff(diff: NonNullable<DeployCommandsResult["diff"]>): string {
  const lines: string[] = [];
  if (diff.added.length > 0) {
    lines.push(`+ added (${diff.added.length}): ${diff.added.join(", ")}`);
  }
  if (diff.removed.length > 0) {
    lines.push(`- removed (${diff.removed.length}): ${diff.removed.join(", ")}`);
  }
  if (diff.updated.length > 0) {
    lines.push(`~ updated (${diff.updated.length}): ${diff.updated.join(", ")}`);
  }
  if (lines.length === 0) return "no slash command name changes";
  return lines.join("\n");
}

export type DeployCommandsIfShardZeroOptions = DeployCommandsOptions & ShouldDeploySlashOptions;

/**
 * {@link deployCommands} when {@link shouldDeploySlashCommands} is true; otherwise `null`.
 * Use on shard 0 ready or on a single bot worker at startup.
 */
export async function deployCommandsIfShardZero(
  options: DeployCommandsIfShardZeroOptions,
): Promise<DeployCommandsResult | null> {
  const { shardId, skip, ...deployOpts } = options;
  const guard: ShouldDeploySlashOptions = {};
  if (shardId !== undefined) guard.shardId = shardId;
  if (skip !== undefined) guard.skip = skip;
  if (!shouldDeploySlashCommands(guard)) return null;
  return deployCommands(deployOpts);
}
