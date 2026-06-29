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
