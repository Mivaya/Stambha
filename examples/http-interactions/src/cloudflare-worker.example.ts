/**
 * Cloudflare Worker shape — copy into a Workers project.
 * Uses the same createHttpInteractionHandler as Node `src/main.ts`.
 *
 * Bundlers: pin `@stambha/*` from npm; Web Crypto verifies signatures.
 *
 * @example
 * ```ts
 * import { createStambhaBot } from "@stambha/core";
 * import { createHttpInteractionHandler } from "@stambha/gateway";
 * import { createNativeRestPort } from "@stambha/rest";
 * // register slash commands in-module or loadPieces from a bundle
 *
 * const client = createStambhaBot({
 *   restPort: createNativeRestPort(env.DISCORD_TOKEN),
 * });
 * // client.register(new PingCommand(...));
 *
 * const handle = createHttpInteractionHandler({
 *   publicKey: env.DISCORD_PUBLIC_KEY,
 *   client,
 *   applicationId: env.DISCORD_APPLICATION_ID,
 * });
 *
 * export default {
 *   async fetch(req: Request, env: Env): Promise<Response> {
 *     if (req.method !== "POST") return new Response("ok");
 *     const rawBody = await req.arrayBuffer();
 *     const result = await handle({
 *       rawBody,
 *       signature: req.headers.get("X-Signature-Ed25519"),
 *       timestamp: req.headers.get("X-Signature-Timestamp"),
 *     });
 *     const body =
 *       typeof result.body === "string" ? result.body : JSON.stringify(result.body);
 *     return new Response(body, { status: result.status, headers: result.headers });
 *   },
 * };
 * ```
 */
export {};
