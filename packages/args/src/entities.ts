import type { RestPort } from "@stambha/core";
import type { ArgResult } from "./errors.js";
import { argInvalid, argMissing, argOk } from "./errors.js";
import { parseUserMentionId } from "./resolvers.js";

/** Minimal user shape returned by {@link resolveUser} / {@link userArg}. */
export interface ResolvedUser {
  readonly id: string;
  readonly username?: string;
  readonly globalName?: string | null;
  readonly avatar?: string | null;
  readonly bot?: boolean;
}

/** Async resolver used by {@link Args.pickAsync}. */
export type AsyncArgResolver<T> = (parameter: string) => Promise<ArgResult<T>>;

interface DiscordUserPayload {
  id?: string;
  username?: string;
  global_name?: string | null;
  avatar?: string | null;
  bot?: boolean;
}

function mapUser(payload: DiscordUserPayload): ResolvedUser | null {
  if (typeof payload.id !== "string" || payload.id.length === 0) return null;
  return {
    id: payload.id,
    ...(payload.username !== undefined ? { username: payload.username } : {}),
    ...(payload.global_name !== undefined ? { globalName: payload.global_name } : {}),
    ...(payload.avatar !== undefined ? { avatar: payload.avatar } : {}),
    ...(payload.bot !== undefined ? { bot: payload.bot } : {}),
  };
}

/**
 * Parse a user mention / snowflake and `GET /users/:id` via {@link RestPort}.
 */
export async function resolveUser(rest: RestPort, parameter: string): Promise<ArgResult<ResolvedUser>> {
  const idResult = parseUserMentionId(parameter);
  if (!idResult.ok) return idResult;

  try {
    const raw = await rest.request<DiscordUserPayload>({
      method: "GET",
      route: `/users/${idResult.value}`,
    });
    const user = mapUser(raw ?? {});
    if (!user) {
      return argInvalid(parameter, `User "${idResult.value}" not found.`);
    }
    return argOk(user);
  } catch {
    return argInvalid(parameter, `Failed to fetch user "${idResult.value}".`);
  }
}

/**
 * REST-backed user entity resolver for prefix args.
 *
 * @example
 * ```ts
 * const args = Args.fromContext(ctx);
 * const user = await args.pickAsync(userArg(client.restPort!));
 * if (await replyIfArgError(ctx, user)) return ok(undefined);
 * ```
 */
export function userArg(rest: RestPort | null | undefined): AsyncArgResolver<ResolvedUser> {
  return async (parameter) => {
    if (!rest) {
      return argMissing("RestPort is required to resolve users (pass client.restPort).");
    }
    return resolveUser(rest, parameter);
  };
}
