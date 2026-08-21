// Client

// DI
export { Binder, type ServiceFactory, type ServiceToken } from "./binder/Binder.js";
export { MockBridge } from "./bridge/MockBridge.js";
// Bridge
export type { Bridge, BridgeEventHandler, BridgeOptions, Tier } from "./bridge/types.js";
export { type ChronErrorHandler, ChronScheduler } from "./chron/ChronScheduler.js";
export { createStambhaBot } from "./client/createStambhaBot.js";
export { InboundRouter } from "./client/InboundRouter.js";
export type { PrefixResolveContext, PrefixResolver } from "./client/prefix.js";
export { createMentionPrefixResolver } from "./client/prefix.js";
export { SignalRouter } from "./client/SignalRouter.js";
export { StambhaClient } from "./client/StambhaClient.js";
export type {
  CreateStambhaBotOptions,
  StambhaClientOptions,
  StambhaRegistries,
} from "./client/types.js";
export { buildApplicationCommands, diffApplicationCommands } from "./command/buildSlashPayload.js";
export { CommandIndex } from "./command/CommandIndex.js";
export type {
  ApplicationCommandJSON,
  ApplicationCommandOptionJSON,
  CommandSlashPath,
  SlashChoiceDefinition,
  SlashOptionDefinition,
  SubcommandDefinition,
  SubcommandGroupDefinition,
} from "./command/slashTypes.js";
export { SlashOptionType } from "./command/slashTypes.js";
// Components (message / modal builders)
export {
  type ActionRowChild,
  type ActionRowComponent,
  actionRow,
  type ButtonComponent,
  type ButtonOptions,
  ButtonStyle,
  type ButtonStyleId,
  button,
  buttonRow,
  ChannelSelectChannelType,
  type ChannelSelectChannelTypeId,
  type ChannelSelectComponent,
  type ChannelSelectOptions,
  type ColorInput,
  type ComponentEmoji,
  type ComponentsV2Options,
  ComponentType,
  type ComponentTypeId,
  // Fluent builder classes + views
  ContainerBuilder,
  type ContainerChild,
  type ContainerComponent,
  type ContainerOptions,
  ContainerView,
  channelSelect,
  collectCustomIds,
  componentsV2,
  confirmCancelRow,
  container,
  type DiscordEmbedAuthor,
  type DiscordEmbedField,
  type DiscordEmbedFooter,
  type DiscordEmbedImage,
  type DiscordEmbedJSON,
  type DiscordEmbedProvider,
  type DiscordEmbedThumbnail,
  type DiscordEmbedVideo,
  type EmbedAssetData,
  type EmbedAuthorData,
  EmbedBuilder,
  type EmbedFieldData,
  type EmbedFooterData,
  type EmbedJSON,
  type EmbedProviderData,
  EmbedView,
  type EntitySelectComponent,
  type EntitySelectOptions,
  embed,
  FileBuilder,
  type FileComponent,
  type FileComponentOptions,
  type FileOptions,
  file,
  /** @deprecated Use file() */
  fileComponent,
  hexColor,
  type LinkButtonOptions,
  linkButton,
  MediaGalleryBuilder,
  type MediaGalleryComponent,
  type MediaGalleryItem,
  type MediaGalleryOptions,
  type MentionableSelectComponent,
  type MessageComponentV2,
  type MessageFlag,
  MessageFlags,
  type ModalComponent,
  type ModalOptions,
  mediaGallery,
  mentionableSelect,
  modal,
  type PersistentSignalFactory,
  type PremiumButtonOptions,
  premiumButton,
  type RoleSelectComponent,
  registerPersistentSignals,
  resolveColor,
  roleSelect,
  type SectionAccessory,
  SectionBuilder,
  type SectionComponent,
  type SectionOptions,
  type SelectDefaultValue,
  type SelectOption,
  SeparatorBuilder,
  type SeparatorComponent,
  type SeparatorOptions,
  SeparatorSpacing,
  type SeparatorSpacingId,
  type StringSelectComponent,
  type StringSelectOptions,
  section,
  selectRow,
  separator,
  stringSelect,
  TextDisplayBuilder,
  type TextDisplayComponent,
  type TextDisplayOptions,
  type TextInputComponent,
  type TextInputOptions,
  TextInputStyle,
  type TextInputStyleId,
  ThumbnailBuilder,
  type ThumbnailComponent,
  type ThumbnailOptions,
  textDisplay,
  textInput,
  thumbnail,
  type UnfurledMediaItem,
  type UserSelectComponent,
  userSelect,
  V2Builder,
} from "./components/index.js";
// Piece paths (default project layout)
export { type PiecePathKey, PiecePaths } from "./constants/piecePaths.js";
export { ConsoleLogger } from "./container/ConsoleLogger.js";
export { DefaultStambhaContainer } from "./container/DefaultStambhaContainer.js";
export type { StambhaContainerLike, StambhaLogger } from "./container/types.js";
export type { ArgsText, ParsedSlashOptionType, SlashOption } from "./context/args.js";
export type { AutocompleteChoice, AutocompleteContext } from "./context/autocomplete.js";
export type {
  AuthorizingIntegrationOwners,
  IntegrationTypeName,
  IntegrationTypeValue,
  InteractionContextName,
  InteractionContextTypeValue,
} from "./context/installContext.js";
export {
  authorizingIntegrationOwnersFromApi,
  IntegrationType,
  InteractionContextType,
  integrationTypesToApi,
  interactionContextFromApi,
  interactionContextsToApi,
} from "./context/installContext.js";
export type { ChannelType, CommandContextMeta, EntitlementSummary } from "./context/meta.js";
export { isGuildChannelType } from "./context/meta.js";
export type { ReplyPayload } from "./context/reply.js";
export { normalizeReplyData } from "./context/reply.js";
export type { SignalContext } from "./context/SignalContext.js";
// Context
export type {
  ChronContext,
  CommandContext,
  CommandKind,
  DirectiveContext,
  DirectiveKind,
  EpilogueContext,
  EpiloguePhase,
  ScoutContext,
  ScoutTrigger,
} from "./context/types.js";
export type {
  DesiredContextFields,
  DesiredMetaFields,
  DesiredProperties,
  ResolvedDesiredProperties,
} from "./desired/DesiredProperties.js";
export {
  defaultDesiredProperties,
  gatesDesiredProperties,
  minimalDesiredProperties,
  resolveDesiredProperties,
} from "./desired/DesiredProperties.js";
export { slimCommandContext, slimMeta } from "./desired/slimContext.js";
export {
  attachCommandLifecycleEpilogues,
  type CommandLifecycleEpilogueOptions,
  type CommandLifecycleHandlers,
  createCommandLoggingEpilogue,
} from "./epilogues/commandLifecycle.js";
// Gates resolution
export {
  clearDeclarativeGatesResolver,
  commandGatesForRun,
  type DeclarativeGatesResolver,
  globalGates,
  registerDeclarativeGatesResolver,
  resolveCommandGates,
  resolveNamedGates,
} from "./gates/resolveCommandGates.js";
// Outcome
export {
  type Err,
  err,
  isErr,
  isOk,
  type Ok,
  type Outcome,
  ok,
  StambhaError,
} from "./outcome/Outcome.js";
export { Registry, type UnitConstructor } from "./pieces/Registry.js";
// Pieces
export { Unit, type UnitOptions } from "./pieces/Unit.js";
// Pipeline
export {
  dispatchAutocomplete,
  dispatchCommand,
  isMenu,
  isPrefix,
  isSlash,
  resolveCommandHandler,
  resolveSubcommandHandler,
} from "./pipeline/dispatchCommand.js";
export { ExecutionPipeline, type PipelineRunOptions } from "./pipeline/ExecutionPipeline.js";
export type {
  PluginContext,
  PluginHookName,
  PluginLifecycle,
  StambhaPlugin,
} from "./plugins/types.js";
export { Barrier, type BarrierOptions, type BarrierResult } from "./registries/Barrier.js";
export { Chron, type ChronOptions, type ChronSchedule } from "./registries/Chron.js";
// Registries (unit types)
// Deprecated aliases
export {
  Command,
  Command as Directive,
  type CommandCooldownOption,
  type CommandOptions,
  type CommandOptions as DirectiveOptions,
  type CommandRunInOption,
} from "./registries/Command.js";
export { Conduit, type ConduitOptions } from "./registries/Conduit.js";
export { Epilogue, type EpilogueOptions, type EpilogueRunOn } from "./registries/Epilogue.js";
export {
  defineGate,
  Gate,
  type GateDeniedError,
  type GateLike,
  type GateOptions,
  type GateResult,
  gateAnd,
  gateOr,
} from "./registries/Gate.js";
export { Hook, type HookOptions } from "./registries/Hook.js";
export { Scout, type ScoutOptions } from "./registries/Scout.js";
export { Signal, type SignalOptions, type SignalType } from "./registries/Signal.js";
export {
  isSequenceCustomId,
  parseSequenceCustomId,
  sequenceCustomId,
} from "./sequence/customId.js";
export { renderSequenceStep } from "./sequence/renderSequenceStep.js";
export {
  type RunSequenceOptions,
  runSequence,
  type SequenceFlow,
} from "./sequence/runSequence.js";
export {
  ensureSeqSignal,
  SeqSignal,
  type SeqSignalMessages,
} from "./sequence/SeqSignal.js";
export { SequenceBuilder, sequence } from "./sequence/SequenceBuilder.js";
export { SequenceStore } from "./sequence/SequenceStore.js";
export type {
  SequenceAnswers,
  SequenceButtonStep,
  SequenceModalStep,
  SequenceResult,
  SequenceSelectStep,
  SequenceSession,
  SequenceStep,
  SequenceStepType,
} from "./sequence/types.js";
export {
  createRestWorkerServer,
  type RestWorkerServerHandle,
  type RestWorkerServerOptions,
} from "./tier/createRestWorkerServer.js";
export { HttpRestPort, type HttpRestPortOptions } from "./tier/HttpRestPort.js";
export { InMemoryTierBus } from "./tier/InMemoryTierBus.js";
export type {
  RestErrorResponse,
  RestMethod,
  RestPort,
  RestRequest,
  RestResponse,
  RestResult,
  TierBus,
  TierEvent,
  WorkerRole,
} from "./tier/types.js";
