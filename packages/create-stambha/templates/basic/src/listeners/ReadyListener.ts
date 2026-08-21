import type { StambhaClient, StambhaLogger } from "@stambha/core";
import { Hook, type Registry } from "@stambha/core";
import type { LoaderContext } from "@stambha/loader";
import { deployCommands } from "@stambha/rest";

/** Deploys slash commands once on READY (monolith / shard 0). */
export class ReadyListener extends Hook {
  static create(ctx: LoaderContext) {
    const logger = ctx.logger ?? ctx.client.container.logger;
    return new ReadyListener(ctx.client.registries.hooks, logger, ctx.client);
  }

  constructor(
    registry: Registry<Hook>,
    private readonly logger: StambhaLogger,
    private readonly bot: StambhaClient,
  ) {
    super(registry, { name: "ready-deploy", event: "ready", once: true });
  }

  async handle(): Promise<void> {
    const token = process.env.DISCORD_TOKEN;
    const applicationId = process.env.DISCORD_APPLICATION_ID;
    if (!token || !applicationId || process.env.DEMO === "1") {
      this.logger.info("Ready (skip slash deploy — DEMO or missing env).");
      return;
    }
    const result = await deployCommands({
      token,
      applicationId,
      commands: this.bot.registries.commands.values(),
      ...(process.env.DISCORD_GUILD_ID ? { guildId: process.env.DISCORD_GUILD_ID } : {}),
    });
    this.logger.info(`Slash deploy: ${result.count} command(s).`);
  }
}
