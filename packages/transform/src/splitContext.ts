import type {
  AutocompleteChoice,
  AutocompleteContext,
  CommandContext,
  ReplyPayload,
  ResolvedDesiredProperties,
  RestPort,
  ScoutContext,
  SignalContext,
} from "@stambha/core";
import { Signal, slimCommandContext, slimMeta } from "@stambha/core";
import {
  autocompleteCallbackBody,
  channelMessageBody,
  interactionDeferBody,
  interactionReplyBody,
  webhookMessageBody,
} from "./rest.js";
import type {
  StambhaAutocompleteInteraction,
  StambhaComponentInteraction,
  StambhaInteractionBase,
  StambhaMessage,
  StambhaModalInteraction,
  StambhaSlashInteraction,
} from "./shapes.js";

export interface ContextBuildOptions {
  desired?: ResolvedDesiredProperties;
  /** Discord application id — used for slash `editReply` webhook route when not on the interaction payload. */
  applicationId?: string | null;
  /**
   * Prefix edit-tracking: when set, `reply` PATCHes this message instead of POSTing a new one.
   */
  editReplyMessageId?: string;
  /**
   * Prefix edit-tracking: called with the created message id after a successful POST reply.
   */
  onPrefixReplyCreated?: (replyMessageId: string) => void;
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
  interaction: StambhaInteractionBase,
  options?: ContextBuildOptions,
): string | null {
  return interaction.applicationId ?? options?.applicationId ?? null;
}

function slashInteractionCallbacks(
  interaction: StambhaInteractionBase,
  restPort: RestPort,
  options?: ContextBuildOptions,
): {
  reply: CommandContext["reply"];
  replyEphemeral: CommandContext["replyEphemeral"];
  deferReply: (ephemeral?: boolean) => Promise<void>;
  editReply: ((payload: ReplyPayload) => Promise<void>) | null;
} {
  const interactionId = interaction.id;
  const token = interaction.token;
  if (!interactionId || !token) {
    throw new Error("interaction id and token are required for REST replies");
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

  return {
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
    deferReply: async (ephemeral = false) => {
      await restPort.request({
        method: "POST",
        route: `/interactions/${interactionId}/${token}/callback`,
        body: interactionDeferBody(ephemeral),
      });
    },
    editReply,
  };
}

function signalInteractionCallbacks(
  interaction: StambhaInteractionBase,
  restPort: RestPort,
  options?: ContextBuildOptions,
): {
  reply: SignalContext["reply"];
  replyEphemeral: SignalContext["replyEphemeral"];
  deferReply: (ephemeral?: boolean) => Promise<void>;
  editReply?: SignalContext["editReply"];
} {
  const callbacks = slashInteractionCallbacks(interaction, restPort, options);
  return {
    reply: callbacks.reply,
    replyEphemeral: callbacks.replyEphemeral,
    deferReply: callbacks.deferReply,
    ...(callbacks.editReply ? { editReply: callbacks.editReply } : {}),
  };
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
  const editReplyMessageId = options?.editReplyMessageId;
  const onPrefixReplyCreated = options?.onPrefixReplyCreated;

  const sendOrEdit = async (messageOrPayload: string | ReplyPayload) => {
    const body = {
      ...channelMessageBody(messageOrPayload),
      ...(editReplyMessageId ? {} : messageReference),
    };
    if (editReplyMessageId) {
      await restPort.request({
        method: "PATCH",
        route: `/channels/${channelId}/messages/${editReplyMessageId}`,
        body,
      });
      return;
    }
    const created = await restPort.request<{ id?: string }>({
      method: "POST",
      route: `/channels/${channelId}/messages`,
      body,
    });
    if (created?.id && onPrefixReplyCreated) {
      onPrefixReplyCreated(created.id);
    }
  };

  const full: CommandContext = {
    kind: "prefix",
    commandName,
    userId: message.author.id,
    guildId: message.guildId,
    channelId,
    ...(argsText.length > 0 ? { argsText } : {}),
    raw: message,
    reply: sendOrEdit,
    replyEphemeral: async (messageOrPayload) => {
      const payload: ReplyPayload =
        typeof messageOrPayload === "string"
          ? { content: messageOrPayload, ephemeral: true }
          : { ...messageOrPayload, ephemeral: true };
      await sendOrEdit(payload);
    },
  };
  return finalize(full, desired);
}

/** Slash command context — replies via {@link RestPort}. */
export function commandContextFromStambhaSlashViaRest(
  interaction: StambhaSlashInteraction,
  restPort: RestPort,
  options?: ContextBuildOptions,
): CommandContext {
  const desired = options?.desired;
  const channelId = interaction.channelId;
  if (!channelId) {
    throw new Error("interaction channelId is required for REST replies");
  }

  const callbacks = slashInteractionCallbacks(interaction, restPort, options);

  const full: CommandContext = {
    kind: "slash",
    commandName: interaction.commandName,
    userId: interaction.user.id,
    guildId: interaction.guildId,
    channelId,
    ...(interaction.meta ? { meta: interaction.meta } : {}),
    slashPath: interaction.slashPath,
    slashOptions: interaction.slashOptions,
    raw: interaction,
    reply: callbacks.reply,
    replyEphemeral: callbacks.replyEphemeral,
    deferReply: callbacks.deferReply,
    ...(callbacks.editReply ? { editReply: callbacks.editReply } : {}),
  };
  return finalize(full, desired);
}

/** Autocomplete context — responds via interaction callback type 8. */
export function autocompleteContextFromStambhaInteraction(
  interaction: StambhaAutocompleteInteraction,
  restPort: RestPort,
): AutocompleteContext {
  const interactionId = interaction.id;
  const token = interaction.token;
  if (!interactionId || !token) {
    throw new Error("interaction id and token are required for autocomplete");
  }

  return {
    commandName: interaction.commandName,
    slashPath: interaction.slashPath,
    focusedOption: interaction.focusedOption,
    userInput: interaction.userInput,
    userId: interaction.user.id,
    guildId: interaction.guildId,
    channelId: interaction.channelId,
    raw: interaction,
    respond: async (choices: AutocompleteChoice[]) => {
      await restPort.request({
        method: "POST",
        route: `/interactions/${interactionId}/${token}/callback`,
        body: autocompleteCallbackBody(choices),
      });
    },
  };
}

/** Component or modal signal context. */
export function signalContextFromStambhaInteraction(
  interaction: StambhaComponentInteraction | StambhaModalInteraction,
  signalName: string,
  restPort: RestPort,
  options?: ContextBuildOptions,
): SignalContext {
  const callbacks = signalInteractionCallbacks(interaction, restPort, options);
  return {
    signalName,
    userId: interaction.user.id,
    guildId: interaction.guildId,
    channelId: interaction.channelId,
    customId: interaction.customId,
    values: interaction.kind === "component" ? interaction.values : [],
    raw: interaction,
    reply: callbacks.reply,
    replyEphemeral: callbacks.replyEphemeral,
    deferReply: callbacks.deferReply,
    ...(callbacks.editReply ? { editReply: callbacks.editReply } : {}),
  };
}

/** Resolve signal name from custom id; returns null when not a `stambha:` id. */
export function signalNameFromCustomId(customId: string): string | null {
  return Signal.parseCustomId(customId)?.name ?? null;
}
