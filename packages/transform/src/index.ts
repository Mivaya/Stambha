/**
 * Legacy discord.js / Discordeno shape adapters.
 *
 * @deprecated Entire export surface removed in **v1.5.0**. Migrate to native
 * `StambhaMessage`, `interactionFromDispatch`, and `metaFromDiscordInteraction`.
 * Official migrations require a fully native bot before release (ADR 005).
 */
export {
  buildDiscordenoDesiredProperties,
  type DiscordenoInteractionLike,
  type DiscordenoMessageLike,
  defaultDiscordenoDesiredProperties,
  /** @deprecated Use `gatesDesiredProperties` from `@stambha/core`. */
  defaultDiscordenoDesiredProperties as stambhaDesiredProperties,
  messageFromDiscordeno,
  metaFromDiscordenoMessage,
  metaFromDiscordenoSlash,
  slashInteractionFromDiscordeno,
  userFromDiscordeno,
} from "./discordeno.js";

/** @deprecated Removed in v1.5.0 — see {@link LEGACY_LIBRARY_ADAPTER_REMOVAL}. */
export {
  type DiscordJsChannelLike,
  type DiscordJsMemberLike,
  type DiscordJsMessageLike,
  type DiscordJsSlashInteractionLike,
  type DiscordJsUserLike,
  messageFromDiscordJs,
  metaFromDiscordJsMessage,
  metaFromDiscordJsSlash,
  slashInteractionFromDiscordJs,
  userFromDiscordJs,
} from "./discordjs.js";

export { LEGACY_LIBRARY_ADAPTER_REMOVAL } from "./deprecation.js";

export { interactionFromDispatch, metaFromDiscordInteraction } from "./discordNative.js";

export {
  buildDispatchCatalog,
  camelizeDispatch,
  dispatchCatalogEntry,
  dispatchNormalizationTier,
  GATEWAY_DISPATCH_EVENTS,
  gatewayEventToHubName,
  isApplicationCommandPermissionsUpdatePayload,
  isAutoModerationActionExecutionPayload,
  isAutoModerationRuleCreatePayload,
  isChannelCreatePayload,
  isEntitlementCreatePayload,
  isGuildAuditLogEntryCreatePayload,
  isGuildBanAddPayload,
  isGuildCreatePayload,
  isGuildEmojisUpdatePayload,
  isGuildMemberAddPayload,
  isGuildMembersChunkPayload,
  isGuildRoleCreatePayload,
  isGuildScheduledEventCreatePayload,
  isGuildSoundboardSoundCreatePayload,
  isIntegrationCreatePayload,
  isInviteCreatePayload,
  isMessageReactionAddPayload,
  isStageInstanceCreatePayload,
  isStructuralDispatch,
  isSubscriptionCreatePayload,
  isThreadCreatePayload,
  isTier1Dispatch,
  isTier2Dispatch,
  isTier3Dispatch,
  isTier4Dispatch,
  isTypingStartPayload,
  isUserUpdatePayload,
  isVoiceChannelEffectSendPayload,
  isVoiceStateUpdatePayload,
  isWebhooksUpdatePayload,
  messageFromDispatch,
  normalizeDispatch,
  guildIdsFromReady,
  readyFromDispatch,
  type DispatchCatalogEntry,
  type DispatchNormalizationTier,
  type GatewayApplicationCommandPermissionsUpdate,
  type GatewayAutoModerationActionExecution,
  type GatewayAutoModerationRuleCreate,
  type GatewayChannelCreate,
  type GatewayDispatchEventName,
  type GatewayEmoji,
  type GatewayEntitlementCreate,
  type GatewayGuildAuditLogEntryCreate,
  type GatewayGuildBanAdd,
  type GatewayGuildCreate,
  type GatewayGuildEmojisUpdate,
  type GatewayGuildMemberAdd,
  type GatewayGuildMembersChunk,
  type GatewayGuildRoleCreate,
  type GatewayGuildScheduledEventCreate,
  type GatewayGuildSoundboardSoundCreate,
  type GatewayIntegrationCreate,
  type GatewayInviteCreate,
  type GatewayMessageReactionAdd,
  type GatewaySnowflakeUser,
  type GatewayStageInstanceCreate,
  type GatewaySubscriptionCreate,
  type GatewayThreadCreate,
  type GatewayTypingStart,
  type GatewayUserUpdate,
  type GatewayVoiceChannelEffectSend,
  type GatewayVoiceStateUpdate,
  type GatewayWebhooksUpdate,
  type NormalizeDispatchMode,
  type NormalizeDispatchOptions,
} from "./dispatch/index.js";

export {
  autocompleteCallbackBody,
  channelMessageBody,
  interactionDeferBody,
  interactionReplyBody,
  webhookMessageBody,
} from "./rest.js";
export type {
  StambhaAutocompleteInteraction,
  StambhaComponentInteraction,
  StambhaInteraction,
  StambhaMessage,
  StambhaModalInteraction,
  StambhaSlashInteraction,
  StambhaUser,
} from "./shapes.js";
export {
  autocompleteContextFromStambhaInteraction,
  type ContextBuildOptions,
  commandContextFromStambhaMessageViaRest,
  commandContextFromStambhaSlashViaRest,
  scoutContextFromStambhaMessage,
  signalContextFromStambhaInteraction,
  signalNameFromCustomId,
} from "./splitContext.js";
