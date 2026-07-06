import type { Bridge, PrefixResolver, StambhaClient } from "@stambha/core";
import { createMentionPrefixResolver, Signal } from "@stambha/core";
import {
  autocompleteContextFromStambhaInteraction,
  commandContextFromStambhaMessageViaRest,
  commandContextFromStambhaSlashViaRest,
  type StambhaInteraction,
  type StambhaMessage,
  scoutContextFromStambhaMessage,
  signalContextFromStambhaInteraction,
} from "@stambha/transform";

export interface AttachStambhaClientOptions {
  prefixCommands?: boolean;
  slashCommands?: boolean;
  signals?: boolean;
  autocomplete?: boolean;
  scouts?: boolean;
  /**
   * Route `@Bot ping` style messages via {@link createMentionPrefixResolver}.
   * Wires `client.resolvePrefix` on `ready` using the bot user id (or an existing
   * {@link StambhaClient.botUserId}). Ignored when `resolvePrefix` is set explicitly.
   */
  mentionCommands?: boolean;
  /**
   * Per-guild or dynamic prefix. Sets {@link StambhaClient.resolvePrefix} for the lifetime of the attach.
   * When omitted, uses {@link StambhaClient.prefix}.
   */
  resolvePrefix?: PrefixResolver;
  /** Discord application id — enables slash `editReply` when missing from interaction payloads. */
  applicationId?: string;
}

function asStambhaMessage(payload: unknown): StambhaMessage | null {
  if (!payload || typeof payload !== "object") return null;
  const m = payload as StambhaMessage;
  if (typeof m.content !== "string" || !m.author?.id) return null;
  return m;
}

function asStambhaInteraction(payload: unknown): StambhaInteraction | null {
  if (!payload || typeof payload !== "object") return null;
  const i = payload as StambhaInteraction;
  if (!i.kind || !i.user?.id) return null;
  return i;
}

/**
 * Wire a native {@link GatewayEventHub} (or any {@link Bridge}) to Stambha routing.
 * Expects normalized `messageCreate` / `interactionCreate` payloads from gateway dispatch.
 */
export function attachStambhaClient(
  hub: Bridge,
  client: StambhaClient,
  options: AttachStambhaClientOptions = {},
): () => void {
  const {
    prefixCommands = true,
    slashCommands = true,
    signals = true,
    autocomplete = true,
    scouts = true,
    mentionCommands = false,
    resolvePrefix,
    applicationId,
  } = options;
  const previousResolvePrefix = client.resolvePrefix;
  if (resolvePrefix) {
    client.resolvePrefix = resolvePrefix;
  } else if (mentionCommands) {
    const wireMentionResolver = (botUserId: string) => {
      client.resolvePrefix = createMentionPrefixResolver(botUserId, client.prefix);
    };
    if (client.botUserId) wireMentionResolver(client.botUserId);
  }
  const unsubs: (() => void)[] = [];

  const on = (event: string, handler: (payload: unknown) => void | Promise<void>) => {
    hub.on(event, handler);
    unsubs.push(() => hub.off(event, handler));
  };

  const buildOptions = () => ({
    desired: client.desiredProperties,
    applicationId: applicationId ?? null,
  });

  on("ready", (payload) => {
    const user = (payload as { user?: { id: string } })?.user;
    if (user?.id) {
      client.setBotUserId(user.id);
      if (mentionCommands && !resolvePrefix) {
        client.resolvePrefix = createMentionPrefixResolver(user.id, client.prefix);
      }
    }
  });

  if (scouts) {
    on("messageCreate", async (payload) => {
      const message = asStambhaMessage(payload);
      if (!message?.content) return;
      await client.router.processScout(scoutContextFromStambhaMessage(message, "message"));
    });

    on("messageUpdate", async (payload) => {
      const message = asStambhaMessage(payload);
      if (!message?.content) return;
      await client.router.processScout(scoutContextFromStambhaMessage(message, "messageUpdate"));
    });
  }

  if (prefixCommands) {
    on("messageCreate", async (payload) => {
      const message = asStambhaMessage(payload);
      if (!message?.content || message.author.bot) return;

      const prefixCtx = { userId: message.author.id };
      if (message.guildId) Object.assign(prefixCtx, { guildId: message.guildId });
      if (message.channelId) Object.assign(prefixCtx, { channelId: message.channelId });
      const parsed = await client.router.parsePrefixCommand(message.content, prefixCtx);
      if (!parsed) return;

      if (!client.restPort) {
        throw new Error(
          "Native prefix commands require restPort (createNativeRestPort or HttpRestPort)",
        );
      }

      const ctx = commandContextFromStambhaMessageViaRest(
        message,
        parsed.name,
        client.restPort,
        parsed.args,
        buildOptions(),
      );
      await client.router.processPrefixCommand(ctx);
    });
  }

  const needsInteractions = slashCommands || signals || autocomplete;
  if (needsInteractions) {
    on("interactionCreate", async (payload) => {
      const interaction = asStambhaInteraction(payload);
      if (!interaction) return;

      if (!client.restPort) {
        throw new Error("Native interactions require restPort");
      }

      const ctxOpts = {
        ...buildOptions(),
        applicationId: interaction.applicationId ?? applicationId ?? null,
      };

      switch (interaction.kind) {
        case "slash": {
          if (!slashCommands) return;
          const ctx = commandContextFromStambhaSlashViaRest(interaction, client.restPort, ctxOpts);
          await client.router.processSlashCommand(ctx);
          return;
        }
        case "autocomplete": {
          if (!autocomplete) return;
          const ctx = autocompleteContextFromStambhaInteraction(interaction, client.restPort);
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
            client.restPort,
            ctxOpts,
          );
          await client.signalRouter.dispatch(signalCtx, signalType);
          return;
        }
        default:
          return;
      }
    });
  }

  return () => {
    for (const off of unsubs) off();
    if (resolvePrefix || mentionCommands) {
      client.resolvePrefix = previousResolvePrefix;
    }
  };
}
