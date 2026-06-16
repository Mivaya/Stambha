export type {
  StambhaUser,
  StambhaMessage,
  StambhaSlashInteraction,
  StambhaAutocompleteInteraction,
  StambhaComponentInteraction,
  StambhaModalInteraction,
  StambhaInteraction,
} from "./shapes.js";

export {
  userFromDiscordJs,
  messageFromDiscordJs,
  slashInteractionFromDiscordJs,
  metaFromDiscordJsMessage,
  metaFromDiscordJsSlash,
} from "./discordjs.js";

export {
  userFromDiscordeno,
  messageFromDiscordeno,
  slashInteractionFromDiscordeno,
  metaFromDiscordenoMessage,
  metaFromDiscordenoSlash,
  defaultDiscordenoDesiredProperties,
  buildDiscordenoDesiredProperties,
  type DiscordenoMessageLike,
  type DiscordenoInteractionLike,
} from "./discordeno.js";

export { interactionFromDispatch, metaFromDiscordInteraction } from "./discordNative.js";

export {
  channelMessageBody,
  interactionReplyBody,
  interactionDeferBody,
  webhookMessageBody,
  autocompleteCallbackBody,
} from "./rest.js";

export {
  scoutContextFromStambhaMessage,
  commandContextFromStambhaMessageViaRest,
  commandContextFromStambhaSlashViaRest,
  autocompleteContextFromStambhaInteraction,
  signalContextFromStambhaInteraction,
  signalNameFromCustomId,
  type ContextBuildOptions,
} from "./splitContext.js";

/** @deprecated Use {@link defaultDiscordenoDesiredProperties} */
export { defaultDiscordenoDesiredProperties as stambhaDesiredProperties } from "./discordeno.js";
