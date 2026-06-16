import type { CommandContext, ReplyPayload, ResolvedDesiredProperties, RestPort, ScoutContext } from "@stambha/core";
import { slimCommandContext, slimMeta } from "@stambha/core";
import { channelMessageBody, interactionReplyBody, webhookMessageBody } from "./rest.js";
import type { StambhaMessage, StambhaSlashInteraction } from "./shapes.js";

export interface ContextBuildOptions {
  desired?: ResolvedDesiredProperties;
  /** Discord application id — used for slash `editReply` webhook route when not on the interaction payload. */
  applicationId?: string | null;
}

function finalize(ctx: CommandContext, desired?: ResolvedDesiredProperties): CommandContext {
  if (!desired) return ctx;
  const slim = slimCommandContext(ctx, desired);
  if (desired.context.meta && slim.meta) {
    const meta = slimMeta(slim.meta, desired.meta);
    if (meta !== undefined) return { ...slim, meta };
    const { meta: _removed, ...rest } = slim as CommandContext & { meta?: unknown };
    return rest as CommandContext;
  }
  return slim;
}

function slashApplicationId(
  interaction: StambhaSlashInteraction,
  options?: ContextBuildOptions,
): string | null {
  return interaction.applicationId ?? options?.applicationId ?? null;
}

/** Build scout context from a transport-agnostic message. */
export function scoutContextFromStambhaMessage(
  message: StambhaMessage,
  trigger: ScoutContext["trigger"],
): ScoutContext {
  return {
    trigger,
    userId: message.author.id,
    guildId: message.guildId,
    channelId: message.channelId,
    content: message.content,
    raw: message,
    delete: async () => {
      throw new Error("delete() requires RestPort; wire delete via REST in your gateway worker");
    },
  };
}

/** Prefix command context — replies via {@link RestPort} (native / split tier). */
export function commandContextFromStambhaMessageViaRest(
  message: StambhaMessage,
  commandName: string,
  restPort: RestPort,
  argsText = "",
  options?: ContextBuildOptions,
): CommandContext {
  const desired = options?.desired;
  const channelId = message.channelId;
  if (!channelId) {
    throw new Error("message.channelId is required for REST replies");
  }

  const messageReference = message.id ? { message_reference: { message_id: message.id } } : {};

  const full: CommandContext = {
    kind: "prefix",
    commandName,
    userId: message.author.id,
    guildId: message.guildId,
    channelId,
    ...(argsText.length > 0 ? { argsText } : {}),
    raw: message,
    reply: async (messageOrPayload) => {
      await restPort.request({
        method: "POST",
        route: `/channels/${channelId}/messages`,
        body: {
          ...channelMessageBody(messageOrPayload),
          ...messageReference,
        },
      });
    },
    replyEphemeral: async (messageOrPayload) => {
      const payload: ReplyPayload =
        typeof messageOrPayload === "string"
          ? { content: messageOrPayload, ephemeral: true }
          : { ...messageOrPayload, ephemeral: true };
      await restPort.request({
        method: "POST",
        route: `/channels/${channelId}/messages`,
        body: {
          ...channelMessageBody(payload),
          ...messageReference,
        },
      });
    },
  };
  return finalize(full, desired);
}

/** Slash command context — replies via {@link RestPort}. */
export function commandContextFromStambhaSlashViaRest(
  interaction: StambhaSlashInteraction,
  commandName: string,
  restPort: RestPort,
  options?: ContextBuildOptions,
): CommandContext {
  const desired = options?.desired;
  const channelId = interaction.channelId;
  const interactionId = interaction.id;
  const token = interaction.token;
  if (!channelId || !interactionId || !token) {
    throw new Error("interaction id, token, and channelId are required for REST replies");
  }

  const applicationId = slashApplicationId(interaction, options);

  const editReply = applicationId
    ? async (payload: ReplyPayload) => {
        await restPort.request({
          method: "PATCH",
          route: `/webhooks/${applicationId}/${token}/messages/@original`,
          body: webhookMessageBody(payload),
        });
      }
    : null;

  const full: CommandContext = {
    kind: "slash",
    commandName,
    userId: interaction.user.id,
    guildId: interaction.guildId,
    channelId,
    slashPath: { root: commandName },
    raw: interaction,
    reply: async (messageOrPayload) => {
      await restPort.request({
        method: "POST",
        route: `/interactions/${interactionId}/${token}/callback`,
        body: interactionReplyBody(messageOrPayload),
      });
    },
    replyEphemeral: async (messageOrPayload) => {
      await restPort.request({
        method: "POST",
        route: `/interactions/${interactionId}/${token}/callback`,
        body: interactionReplyBody(messageOrPayload, true),
      });
    },
    ...(editReply ? { editReply } : {}),
  };
  return finalize(full, desired);
}
