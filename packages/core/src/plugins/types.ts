/** Plugin lifecycle hook names. */
export type PluginHookName = "preInit" | "postInit" | "preStart" | "postStart" | "postLoad";

/** Implemented by {@link PluginManager} from `@stambha/plugins`. */
export interface PluginLifecycle {
  runHook(name: PluginHookName): Promise<void>;
}
