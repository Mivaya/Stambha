import type { StambhaLogger } from "@stambha/core";
import { Hook, type Registry } from "@stambha/core";
import type { LoaderContext } from "@stambha/loader";
import { isMessageReactionAddPayload } from "@stambha/transform";

/** Logs camelCase `messageReactionAdd` payloads from the native gateway hub. */
export class ReactionListener extends Hook {
  static create(ctx: LoaderContext) {
    const logger = ctx.logger ?? ctx.client.container.logger;
    return new ReactionListener(ctx.client.registries.hooks, logger);
  }

  constructor(
    registry: Registry<Hook>,
    private readonly logger: StambhaLogger,
  ) {
    super(registry, { name: "reaction-log", event: "messageReactionAdd" });
  }

  handle(payload: unknown): void {
    if (!isMessageReactionAddPayload(payload)) {
      this.logger.warn("[listener:reaction] unexpected payload shape");
      return;
    }
    const emoji = payload.emoji.id ? `:${payload.emoji.name}:` : payload.emoji.name;
    this.logger.info(
      `[listener:reaction] user ${payload.userId} reacted ${emoji} on message ${payload.messageId}`,
    );
  }
}
