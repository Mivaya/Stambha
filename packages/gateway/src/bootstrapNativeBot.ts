import {
  createStambhaBot,
  type CreateStambhaBotOptions,
  type RestPort,
  type StambhaClient,
} from "@stambha/core";
import { createNativeRestPort } from "@stambha/rest";
import {
  type AttachStambhaClientOptions,
  attachStambhaClient,
} from "./attachStambhaClient.js";
import { createGatewayEventHub, type GatewayEventHub } from "./GatewayEventHub.js";
import {
  createNativeGatewayClient,
  type NativeGatewayClient,
  type NativeGatewayClientOptions,
} from "./ws/createNativeGatewayClient.js";

export interface BootstrapNativeBotOptions {
  /** Bot token — used for REST (unless `restPort` is set) and gateway identify. */
  token: string;
  /** Discord application id — enables slash `editReply` when missing from payloads. */
  applicationId?: string;
  /** Static prefix (default `"!"`). */
  prefix?: string;
  /** Gateway intents bitmask. */
  intents: number | bigint;
  /**
   * Route `@Bot ping` style messages (default `true`).
   * Set `false` to disable mention commands.
   */
  mentionCommands?: boolean;
  /** Override REST port (tests / demo / remote REST worker). */
  restPort?: RestPort;
  /**
   * Extra {@link createStambhaBot} options.
   * `bridge` and `restPort` are owned by this helper — do not set them here.
   */
  client?: Omit<CreateStambhaBotOptions, "bridge" | "restPort" | "prefix">;
  /** Extra {@link attachStambhaClient} options (`applicationId` / `mentionCommands` from top-level). */
  attach?: Omit<AttachStambhaClientOptions, "applicationId" | "mentionCommands">;
  /** Extra {@link createNativeGatewayClient} options (`token` / `hub` / `intents` from top-level). */
  gateway?: Omit<NativeGatewayClientOptions, "token" | "hub" | "intents">;
  /** Call {@link StambhaClient.start} after wiring (default `true`). */
  start?: boolean;
}

export interface BootstrapNativeBotResult {
  client: StambhaClient;
  hub: GatewayEventHub;
  /** Native gateway client — call `gateway.connect()` when ready (after `loadPieces`). */
  gateway: NativeGatewayClient;
}

/**
 * Monolith happy-path bootstrap: REST + client + hub attach + gateway client.
 *
 * Does **not** load pieces or connect the gateway — keep those explicit:
 *
 * ```ts
 * const { client, gateway } = await bootstrapNativeBot({
 *   token,
 *   applicationId,
 *   prefix: "!",
 *   intents: combineIntents(GatewayIntent.Guilds, GatewayIntent.GuildMessages, GatewayIntent.MessageContent),
 * });
 * await loadPieces(client);
 * await gateway.connect();
 * ```
 *
 * Tier-split / advanced bots should keep raw `attachStambhaClient` wiring.
 */
export async function bootstrapNativeBot(
  options: BootstrapNativeBotOptions,
): Promise<BootstrapNativeBotResult> {
  const {
    token,
    applicationId,
    prefix = "!",
    intents,
    mentionCommands = true,
    restPort: restPortOverride,
    client: clientExtras,
    attach: attachExtras,
    gateway: gatewayExtras,
    start = true,
  } = options;

  const restPort = restPortOverride ?? createNativeRestPort(token);
  const client = createStambhaBot({
    ...clientExtras,
    prefix,
    restPort,
  });

  const hub = createGatewayEventHub();
  attachStambhaClient(hub, client, {
    ...attachExtras,
    ...(applicationId ? { applicationId } : {}),
    mentionCommands,
  });
  client.setBridge(hub);

  if (start) {
    await client.start();
  }

  const gateway = await createNativeGatewayClient({
    ...gatewayExtras,
    token,
    hub,
    intents,
  });

  return { client, hub, gateway };
}
