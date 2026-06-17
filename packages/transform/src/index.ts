/** @deprecated Use {@link defaultDiscordenoDesiredProperties} */
export {
  buildDiscordenoDesiredProperties,
  type DiscordenoInteractionLike,
  type DiscordenoMessageLike,
  defaultDiscordenoDesiredProperties,
  defaultDiscordenoDesiredProperties as stambhaDesiredProperties,
  messageFromDiscordeno,
  metaFromDiscordenoMessage,
  metaFromDiscordenoSlash,
  slashInteractionFromDiscordeno,
  userFromDiscordeno,
} from "./discordeno.js";
export {
  messageFromDiscordJs,
  metaFromDiscordJsMessage,
  metaFromDiscordJsSlash,
  slashInteractionFromDiscordJs,
  userFromDiscordJs,
} from "./discordjs.js";

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
