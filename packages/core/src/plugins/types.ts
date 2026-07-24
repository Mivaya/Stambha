/** Plugin lifecycle hook names. */
export type PluginHookName = "preInit" | "postInit" | "preStart" | "postStart" | "postLoad" | "onShutdown";

export interface PluginContext {
  client: import("../client/StambhaClient.js").StambhaClient;
  container: import("../container/types.js").StambhaContainerLike;
}

export type PluginHookFn = (ctx: PluginContext) => void | Promise<void>;

export interface StambhaPlugin {
  name: string;
  hooks?: Partial<Record<PluginHookName, PluginHookFn>>;
}

/** Implemented by {@link PluginManager} from `@stambha/plugins` or natively by {@link StambhaClient}. */
export interface PluginLifecycle {
  runHook(name: PluginHookName): Promise<void>;
}

