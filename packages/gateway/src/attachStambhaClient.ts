import type { Bridge, PrefixResolver, StambhaClient } from "@stambha/core";
import { createMentionPrefixResolver } from "@stambha/core";
import {
  commandContextFromStambhaMessageViaRest,
  type StambhaInteraction,
  type StambhaMessage,
  scoutContextFromStambhaMessage,
} from "@stambha/transform";
import { routeStambhaInteraction } from "./http/routeInteraction.js";
import { PrefixEditTracker } from "./prefixEditTracking.js";

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
   * When true, re-run prefix commands on `messageUpdate` and PATCH the prior bot reply
   * (Poise/Akairo-style edit tracking). Requires message ids on create/update payloads.
   */
  editTracking?: boolean;
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

/** Like {@link asStambhaMessage}, but fills author from the edit tracker when Discord omits it. */
function asEditableMessage(
  payload: unknown,
  tracker: PrefixEditTracker,
): StambhaMessage | null {
  const full = asStambhaMessage(payload);
  if (full) return full;
  if (!payload || typeof payload !== "object") return null;
  const m = payload as StambhaMessage;
  if (typeof m.content !== "string" || !m.id) return null;
  const tracked = tracker.get(m.id);
  if (!tracked) return null;
  return {
    id: m.id,
    content: m.content,
    channelId: m.channelId ?? tracked.channelId,
    guildId: m.guildId ?? null,
    author: { id: tracked.userId, bot: false },
  };
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
    editTracking = false,
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
  const tracker = editTracking ? new PrefixEditTracker() : null;

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
      const message = tracker
        ? (asEditableMessage(payload, tracker) ?? asStambhaMessage(payload))
        : asStambhaMessage(payload);
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

      const ctxOpts = {
        ...buildOptions(),
        ...(tracker && message.id
          ? {
              onPrefixReplyCreated: (replyId: string) => {
                if (!message.channelId) return;
                tracker.remember(message.id!, {
                  channelId: message.channelId,
                  replyId,
                  userId: message.author.id,
                });
              },
            }
          : {}),
      };

      const ctx = commandContextFromStambhaMessageViaRest(
        message,
        parsed.name,
        client.restPort,
        parsed.args,
        ctxOpts,
      );
      await client.router.processPrefixCommand(ctx);
    });

    if (tracker) {
      on("messageUpdate", async (payload) => {
        const message = asEditableMessage(payload, tracker) ?? asStambhaMessage(payload);
        if (!message?.content || message.author.bot || !message.id) return;

        if (!client.restPort) {
          throw new Error(
            "Native prefix commands require restPort (createNativeRestPort or HttpRestPort)",
          );
        }

        const prefixCtx = { userId: message.author.id };
        if (message.guildId) Object.assign(prefixCtx, { guildId: message.guildId });
        if (message.channelId) Object.assign(prefixCtx, { channelId: message.channelId });
        const parsed = await client.router.parsePrefixCommand(message.content, prefixCtx);
        const tracked = tracker.get(message.id);

        if (!parsed) {
          if (tracked) {
            try {
              await client.restPort.request({
                method: "DELETE",
                route: `/channels/${tracked.channelId}/messages/${tracked.replyId}`,
              });
            } catch {
              // reply may already be gone
            }
            tracker.forget(message.id);
          }
          return;
        }

        const ctxOpts = {
          ...buildOptions(),
          ...(tracked
            ? { editReplyMessageId: tracked.replyId }
            : {
                onPrefixReplyCreated: (replyId: string) => {
                  if (!message.channelId) return;
                  tracker.remember(message.id!, {
                    channelId: message.channelId,
                    replyId,
                    userId: message.author.id,
                  });
                },
              }),
        };

        const ctx = commandContextFromStambhaMessageViaRest(
          message,
          parsed.name,
          client.restPort,
          parsed.args,
          ctxOpts,
        );
        await client.router.processPrefixCommand(ctx);
      });
    }
  }

  const needsInteractions = slashCommands || signals || autocomplete;
  if (needsInteractions) {
    on("interactionCreate", async (payload) => {
      const interaction = asStambhaInteraction(payload);
      if (!interaction) return;

      if (!client.restPort) {
        throw new Error("Native interactions require restPort");
      }

      await routeStambhaInteraction(client, interaction, client.restPort, {
        slashCommands,
        signals,
        autocomplete,
        applicationId: applicationId ?? null,
      });
    });
  }

  return () => {
    for (const off of unsubs) off();
    tracker?.clear();
    if (resolvePrefix || mentionCommands) {
      client.resolvePrefix = previousResolvePrefix;
    }
  };
}
