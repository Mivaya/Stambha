import { DISCORD_API_BASE } from "@stambha/transport";

export interface GatewayBotResponse {
  readonly url: string;
  readonly shards: number;
  readonly session_start_limit?: {
    readonly total: number;
    readonly remaining: number;
    readonly reset_after: number;
    readonly max_concurrency: number;
  };
}

/** Fetch recommended shard count and gateway URL from Discord REST. */
export async function fetchGatewayBot(
  token: string,
  fetchFn: typeof fetch = fetch,
): Promise<GatewayBotResponse> {
  const res = await fetchFn(`${DISCORD_API_BASE}/gateway/bot`, {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GET /gateway/bot failed (${res.status}): ${body}`);
  }
  return (await res.json()) as GatewayBotResponse;
}
