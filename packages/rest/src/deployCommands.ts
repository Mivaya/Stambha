import type { Command } from "@stambha/core";
import { buildApplicationCommands, diffApplicationCommands } from "@stambha/core";
import { type RestClient, createRestClient } from "./RestClient.js";

export interface DeployCommandsOptions {
  token: string;
  applicationId: string;
  guildId?: string;
  commands: Iterable<Command>;
  /** Build payload only — no `PUT` to Discord. */
  dryRun?: boolean;
  /** Compare desired vs existing command names. */
  diff?: boolean;
  /**
   * Existing command names for offline diff (`dryRun` + `diff` in CI).
   * When omitted and not dry-run, fetched from Discord REST.
   */
  existing?: readonly { name: string }[];
  /** Reuse an existing REST client (optional). */
  rest?: RestClient;
}

export interface DeployCommandsResult {
  count: number;
  guildId?: string;
  global: boolean;
  diff?: { added: string[]; removed: string[]; updated: string[] };
}

async function fetchExisting(
  rest: RestClient,
  applicationId: string,
  guildId?: string,
): Promise<{ name: string }[]> {
  const route = guildId
    ? `/applications/${applicationId}/guilds/${guildId}/commands`
    : `/applications/${applicationId}/commands`;

  try {
    return await rest.request<{ name: string }[]>({ method: "GET", route });
  } catch {
    return [];
  }
}

/** Sync slash command metadata to Discord via native REST (no bridge). */
export async function deployCommands(
  options: DeployCommandsOptions,
): Promise<DeployCommandsResult> {
  const rest =
    options.rest ??
    createRestClient({ token: options.token, applicationId: options.applicationId });

  const payload = buildApplicationCommands(options.commands);

  let diffResult: DeployCommandsResult["diff"];
  if (options.diff) {
    const existing =
      options.existing ??
      (options.dryRun ? [] : await fetchExisting(rest, options.applicationId, options.guildId));
    diffResult = diffApplicationCommands(existing, payload);
  }

  if (options.dryRun) {
    const result: DeployCommandsResult = {
      count: payload.length,
      global: !options.guildId,
    };
    if (options.guildId !== undefined) result.guildId = options.guildId;
    if (diffResult !== undefined) result.diff = diffResult;
    return result;
  }

  const route = options.guildId
    ? `/applications/${options.applicationId}/guilds/${options.guildId}/commands`
    : `/applications/${options.applicationId}/commands`;

  await rest.request({ method: "PUT", route, body: payload });

  return {
    count: payload.length,
    global: !options.guildId,
    ...(options.guildId !== undefined ? { guildId: options.guildId } : {}),
    ...(diffResult !== undefined ? { diff: diffResult } : {}),
  };
}
