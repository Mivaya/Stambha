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
  actionRow,
  button,
  buttonRow,
  ButtonStyle,
  type ButtonComponent,
  type ButtonOptions,
  type ButtonStyleId,
  collectCustomIds,
  type ComponentEmoji,
  componentsV2,
  type ComponentsV2Options,
  ComponentType,
  type ComponentTypeId,
  confirmCancelRow,
  container,
  type ContainerChild,
  type ContainerComponent,
  type ContainerOptions,
  fileComponent,
  type FileComponent,
  type FileComponentOptions,
  linkButton,
  type LinkButtonOptions,
  mediaGallery,
  type MediaGalleryComponent,
  type MediaGalleryItem,
  type MediaGalleryOptions,
  type MessageComponentV2,
  type MessageFlag,
  MessageFlags,
  modal,
  type ModalComponent,
  type ModalOptions,
  type PersistentSignalFactory,
  registerPersistentSignals,
  type ActionRowChild,
  type ActionRowComponent,
  section,
  type SectionAccessory,
  type SectionComponent,
  type SectionOptions,
  type SelectOption,
  selectRow,
  separator,
  type SeparatorComponent,
  type SeparatorOptions,
  SeparatorSpacing,
  type SeparatorSpacingId,
  stringSelect,
  type StringSelectComponent,
  type StringSelectOptions,
  textDisplay,
  type TextDisplayComponent,
  type TextDisplayOptions,
  textInput,
  type TextInputComponent,
  type TextInputOptions,
  TextInputStyle,
  type TextInputStyleId,
  thumbnail,
  type ThumbnailComponent,
  type ThumbnailOptions,
  type UnfurledMediaItem,
  V2Builder,
} from "./components/index.js";
// Piece paths (default project layout)
export { type PiecePathKey, PiecePaths } from "./constants/piecePaths.js";
export { ConsoleLogger } from "./container/ConsoleLogger.js";
export { DefaultStambhaContainer } from "./container/DefaultStambhaContainer.js";
export type { StambhaContainerLike, StambhaLogger } from "./container/types.js";
export type { ArgsText, ParsedSlashOptionType, SlashOption } from "./context/args.js";
export type { AutocompleteChoice, AutocompleteContext } from "./context/autocomplete.js";
export type { ChannelType, CommandContextMeta, EntitlementSummary } from "./context/meta.js";
export { isGuildChannelType } from "./context/meta.js";
export type {
  AuthorizingIntegrationOwners,
  IntegrationTypeName,
  IntegrationTypeValue,
  InteractionContextName,
  InteractionContextTypeValue,
} from "./context/installContext.js";
export {
  IntegrationType,
  InteractionContextType,
  authorizingIntegrationOwnersFromApi,
  integrationTypesToApi,
  interactionContextFromApi,
  interactionContextsToApi,
} from "./context/installContext.js";
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
  globalGates,
  registerDeclarativeGatesResolver,
  resolveCommandGates,
  resolveNamedGates,
  type DeclarativeGatesResolver,
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
export { ExecutionPipeline, type PipelineRunOptions } from "./pipeline/ExecutionPipeline.js";
export type { PluginHookName, PluginLifecycle, PluginContext, StambhaPlugin } from "./plugins/types.js";
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
