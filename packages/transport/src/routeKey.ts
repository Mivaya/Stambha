const SNOWFLAKE = /^\d{17,20}$/;

/**
 * Discord major resources — their snowflake ids stay in the rate-limit route key
 * so distinct guilds/channels/webhooks do not share a local bucket before the
 * first `X-RateLimit-Bucket` header arrives.
 *
 * @see https://discord.com/developers/docs/topics/rate-limits#rate-limits
 */
const MAJOR_RESOURCES = new Set(["guilds", "channels", "webhooks"]);

/** HTTP verb for route bucketing (matches {@link RestMethod} in core). */
export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

/** Normalized route + method pair (Discord major-parameter rules). */
export interface RouteKey {
  readonly method: HttpMethod;
  /**
   * Route with non-major snowflakes replaced by `:id`.
   * Guild / channel / webhook ids are preserved (leading slash).
   */
  readonly route: string;
}

/**
 * Normalize a Discord REST route for rate-limit grouping.
 * Keeps major parameters (`guilds/:id`, `channels/:id`, `webhooks/:id`);
 * replaces other snowflake path segments with `:id`.
 */
export function normalizeRoute(route: string): string {
  const path = route.startsWith("/") ? route : `/${route}`;
  const segments = path.split("/");
  const normalized = segments.map((segment, index) => {
    if (!SNOWFLAKE.test(segment)) return segment;
    const prev = segments[index - 1];
    if (prev && MAJOR_RESOURCES.has(prev)) return segment;
    return ":id";
  });
  return normalized.join("/") || "/";
}

/** Build a {@link RouteKey} from a raw route and HTTP method. */
export function parseRouteKey(route: string, method: HttpMethod): RouteKey {
  return Object.freeze({
    method,
    route: normalizeRoute(route),
  });
}

/** Stable bucket lookup key when Discord does not send `x-ratelimit-bucket`. */
export function fallbackBucketId(key: RouteKey): string {
  return `${key.method}:${key.route}`;
}
