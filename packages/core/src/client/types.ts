import type { Bridge, Tier, WorkerRole } from "../bridge/types.js";
import type { StambhaContainerLike } from "../container/types.js";
import type { RestPort, TierBus } from "../tier/types.js";

export interface StambhaClientOptions {
  tier?: Tier;
  workerRole?: WorkerRole;
  /** Remote REST worker (gateway role in split tier). */
  restPort?: RestPort;
  /** Optional cross-worker event bus. */
  tierBus?: TierBus;
  bridge?: Bridge;
  prefix?: string;
  /** Dynamic prefix (per-guild, database, Vault). Falls back to {@link prefix} when unset. */
  resolvePrefix?: import("./prefix.js").PrefixResolver;
  /** Shared services + logger (defaults to {@link DefaultStambhaContainer}). */
  container?: StambhaContainerLike;
  /** Context field mask for bridges (defaults to full context). */
  desiredProperties?: import("../desired/DesiredProperties.js").DesiredProperties;
  /** Registered plugins to extend the client's behavior. */
  plugins?: import("../plugins/types.js").StambhaPlugin[];
}

export interface CreateStambhaBotOptions extends StambhaClientOptions {
  autostart?: boolean;
}

export interface StambhaRegistries {
  commands: import("../pieces/Registry.js").Registry<import("../registries/Command.js").Command>;
  hooks: import("../pieces/Registry.js").Registry<import("../registries/Hook.js").Hook>;
  scouts: import("../pieces/Registry.js").Registry<import("../registries/Scout.js").Scout>;
  barriers: import("../pieces/Registry.js").Registry<import("../registries/Barrier.js").Barrier>;
  gates: import("../pieces/Registry.js").Registry<import("../registries/Gate.js").Gate>;
  conduits: import("../pieces/Registry.js").Registry<import("../registries/Conduit.js").Conduit>;
  epilogues: import("../pieces/Registry.js").Registry<import("../registries/Epilogue.js").Epilogue>;
  signals: import("../pieces/Registry.js").Registry<import("../registries/Signal.js").Signal>;
  chrons: import("../pieces/Registry.js").Registry<import("../registries/Chron.js").Chron>;
}

export type StambhaClientEvents = {
  ready: [];
  unitRegistered: [{ registry: string; unit: import("../pieces/Unit.js").Unit }];
  unitUnregistered: [{ registry: string; name: string }];
  unitLoaded: [{ registry: string; unit: import("../pieces/Unit.js").Unit }];
  unitUnloaded: [{ registry: string; name: string }];
  unitLoadError: [{ registry: string; unit: string; error: unknown }];
  unitUnloadError: [{ registry: string; unit: string; error: unknown }];
  scoutError: [{ scout: string; error: unknown; ctx: import("../context/types.js").ScoutContext }];
  commandBlocked: [
    {
      ctx: import("../context/types.js").CommandContext;
      reason?: string;
      silent?: boolean;
    },
  ];
  commandDenied: [
    {
      ctx: import("../context/types.js").CommandContext;
      error: { message: string; silent: boolean; gate: string };
    },
  ];
  commandSuccess: [
    {
      ctx: import("../context/types.js").CommandContext;
      command: string;
      durationMs: number;
    },
  ];
  commandError: [
    {
      ctx: import("../context/types.js").CommandContext;
      command: string;
      error: unknown;
    },
  ];
  commandErrorHookError: [
    {
      command: string;
      error: unknown;
      ctx: import("../context/types.js").CommandContext;
    },
  ];
  epilogueError: [
    { epilogue: string; error: unknown; ctx: import("../context/types.js").EpilogueContext },
  ];
  hookError: [{ hook: string; error: unknown }];
  signalError: [
    { signal: string; error: unknown; ctx: import("../context/SignalContext.js").SignalContext },
  ];
  autocompleteError: [
    {
      command: string;
      error: unknown;
      ctx: import("../context/autocomplete.js").AutocompleteContext;
    },
  ];
  chronError: [{ chron: string; error: unknown }];
};

export type { Binder } from "../binder/Binder.js";
export { ConsoleLogger } from "../container/ConsoleLogger.js";
export { DefaultStambhaContainer } from "../container/DefaultStambhaContainer.js";
export type { StambhaContainerLike, StambhaLogger } from "../container/types.js";
export type { PluginHookName, PluginLifecycle } from "../plugins/types.js";
