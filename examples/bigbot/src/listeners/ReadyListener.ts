import type { StambhaLogger } from "@stambha/core";
import { Hook, type Registry } from "@stambha/core";
import type { LoaderContext } from "@stambha/loader";

export class ReadyListener extends Hook {
  static create(ctx: LoaderContext) {
    const logger = ctx.logger ?? ctx.client.container.logger;
    return new ReadyListener(ctx.client.registries.hooks, logger);
  }

  constructor(
    registry: Registry<Hook>,
    private readonly logger: StambhaLogger,
  ) {
    super(registry, { name: "ready-log", event: "ready", once: true });
  }

  handle(payload: unknown): void {
    const user = (payload as { user?: { id: string; username?: string } })?.user;
    const label = user?.username ?? user?.id ?? "unknown";
    this.logger.info(`[listener:ready] Logged in as ${label}`);
  }
}
