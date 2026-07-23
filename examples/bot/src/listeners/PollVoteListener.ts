import type { StambhaLogger } from "@stambha/core";
import { Hook, type Registry } from "@stambha/core";
import type { LoaderContext } from "@stambha/loader";
import { isMessagePollVotePayload } from "@stambha/transform";

/** Logs camelCase `messagePollVoteAdd` payloads from the native gateway hub. */
export class PollVoteListener extends Hook {
  static create(ctx: LoaderContext) {
    const logger = ctx.logger ?? ctx.client.container.logger;
    return new PollVoteListener(ctx.client.registries.hooks, logger);
  }

  constructor(
    registry: Registry<Hook>,
    private readonly logger: StambhaLogger,
  ) {
    super(registry, { name: "poll-vote-log", event: "messagePollVoteAdd" });
  }

  handle(payload: unknown): void {
    if (!isMessagePollVotePayload(payload)) {
      this.logger.warn("[listener:poll-vote] unexpected payload shape");
      return;
    }
    this.logger.info(
      `[listener:poll-vote] user ${payload.userId} voted answer ${payload.answerId} on message ${payload.messageId}`,
    );
  }
}
