import type { StambhaClient } from "@stambha/core";
import { Signal } from "@stambha/core";
import {
  autocompleteContextFromStambhaInteraction,
  commandContextFromStambhaSlashViaRest,
  type StambhaInteraction,
  signalContextFromStambhaInteraction,
} from "@stambha/transform";
import type { RestPort } from "@stambha/core";

export interface RouteStambhaInteractionOptions {
  slashCommands?: boolean;
  signals?: boolean;
  autocomplete?: boolean;
  applicationId?: string | null;
}

/**
 * Route a normalized {@link StambhaInteraction} through the client pipeline
 * (same path as {@link attachStambhaClient}'s `interactionCreate` handler).
 */
export async function routeStambhaInteraction(
  client: StambhaClient,
  interaction: StambhaInteraction,
  restPort: RestPort,
  options: RouteStambhaInteractionOptions = {},
): Promise<void> {
  const {
    slashCommands = true,
    signals = true,
    autocomplete = true,
    applicationId = null,
  } = options;

  const ctxOpts = {
    desired: client.desiredProperties,
    applicationId: interaction.applicationId ?? applicationId ?? null,
  };

  switch (interaction.kind) {
    case "slash": {
      if (!slashCommands) return;
      const ctx = commandContextFromStambhaSlashViaRest(interaction, restPort, ctxOpts);
      await client.router.processSlashCommand(ctx);
      return;
    }
    case "autocomplete": {
      if (!autocomplete) return;
      const ctx = autocompleteContextFromStambhaInteraction(interaction, restPort);
      await client.router.processAutocomplete(ctx);
      return;
    }
    case "component":
    case "modal": {
      if (!signals) return;
      const parsed = Signal.parseCustomId(interaction.customId);
      if (!parsed) return;
      const signalType = interaction.kind === "modal" ? "modal" : interaction.componentType;
      const signalCtx = signalContextFromStambhaInteraction(
        interaction,
        parsed.name,
        restPort,
        ctxOpts,
      );
      await client.signalRouter.dispatch(signalCtx, signalType);
      return;
    }
    default:
      return;
  }
}
