import type { RestPort, StambhaClient } from "@stambha/core";
import { interactionFromDispatch } from "@stambha/transform";
import { CapturingInteractionRestPort } from "./CapturingRestPort.js";
import { routeStambhaInteraction } from "./routeInteraction.js";
import { verifyDiscordInteractionRequest } from "./verifyKey.js";

export interface HttpInteractionRequest {
  /** Raw body bytes or UTF-8 string — must be unmodified for signature verification. */
  rawBody: string | Uint8Array | ArrayBuffer;
  /** `X-Signature-Ed25519` header. */
  signature: string | null | undefined;
  /** `X-Signature-Timestamp` header. */
  timestamp: string | null | undefined;
}

export interface HttpInteractionResult {
  status: number;
  headers: Record<string, string>;
  /** JSON-serializable body (or empty string for 401). */
  body: unknown;
}

export interface CreateHttpInteractionHandlerOptions {
  /** Application public key from the Discord Developer Portal (hex). */
  publicKey: string;
  client: StambhaClient;
  /**
   * Outbound REST for deferred edits / follow-ups.
   * Defaults to `client.restPort`. Required when commands defer then edit.
   */
  restPort?: RestPort | null;
  applicationId?: string;
  slashCommands?: boolean;
  signals?: boolean;
  autocomplete?: boolean;
  /**
   * When the pipeline never posts an interaction callback, respond with this body.
   * Default: deferred channel message (`type: 5`) so Discord is acknowledged in time.
   */
  fallbackResponse?: unknown;
}

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

function unauthorized(): HttpInteractionResult {
  return { status: 401, headers: { "Content-Type": "text/plain" }, body: "invalid request signature" };
}

function json(status: number, body: unknown): HttpInteractionResult {
  return { status, headers: { ...JSON_HEADERS }, body };
}

function parseBody(rawBody: string | Uint8Array | ArrayBuffer): unknown {
  const text =
    typeof rawBody === "string"
      ? rawBody
      : new TextDecoder().decode(rawBody instanceof Uint8Array ? rawBody : new Uint8Array(rawBody));
  return JSON.parse(text) as unknown;
}

/**
 * Create a Discord Interactions Endpoint handler (no gateway WebSocket).
 *
 * Verifies Ed25519 signatures, answers `PING` with `PONG`, and routes slash /
 * component / autocomplete interactions through the same pipeline as
 * {@link attachStambhaClient}. The first interaction callback is returned as the
 * HTTP response body so serverless hosts can reply within Discord's 3s window.
 *
 * @example
 * ```ts
 * const handle = createHttpInteractionHandler({
 *   publicKey: process.env.DISCORD_PUBLIC_KEY!,
 *   client,
 *   restPort: createNativeRestPort(token),
 * });
 *
 * // Cloudflare Worker / Fetch API:
 * export default {
 *   async fetch(req: Request) {
 *     const rawBody = await req.arrayBuffer();
 *     const result = await handle({
 *       rawBody,
 *       signature: req.headers.get("X-Signature-Ed25519"),
 *       timestamp: req.headers.get("X-Signature-Timestamp"),
 *     });
 *     return new Response(
 *       typeof result.body === "string" ? result.body : JSON.stringify(result.body),
 *       { status: result.status, headers: result.headers },
 *     );
 *   },
 * };
 * ```
 */
export function createHttpInteractionHandler(
  options: CreateHttpInteractionHandlerOptions,
): (request: HttpInteractionRequest) => Promise<HttpInteractionResult> {
  const {
    publicKey,
    client,
    restPort = client.restPort,
    applicationId,
    slashCommands = true,
    signals = true,
    autocomplete = true,
    fallbackResponse = { type: 5 },
  } = options;

  return async (request) => {
    const valid = await verifyDiscordInteractionRequest(
      request.rawBody,
      request.signature,
      request.timestamp,
      publicKey,
    );
    if (!valid) return unauthorized();

    let payload: unknown;
    try {
      payload = parseBody(request.rawBody);
    } catch {
      return json(400, { error: "invalid json" });
    }

    const type =
      payload && typeof payload === "object" && "type" in payload
        ? (payload as { type?: number }).type
        : undefined;

    // Discord endpoint validation + keep-alive probes
    if (type === 1) {
      return json(200, { type: 1 });
    }

    const interaction = interactionFromDispatch(payload);
    if (!interaction) {
      return json(400, { error: "unsupported interaction" });
    }

    const capturing = new CapturingInteractionRestPort(restPort ?? null);
    await routeStambhaInteraction(client, interaction, capturing, {
      slashCommands,
      signals,
      autocomplete,
      applicationId: applicationId ?? null,
    });

    const response = capturing.getInteractionResponse() ?? fallbackResponse;
    return json(200, response);
  };
}
