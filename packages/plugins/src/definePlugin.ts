import type { PluginHookName } from "@stambha/core";
import type { PluginHookFn, StambhaPlugin } from "./types.js";

/** Define a plugin from hook callbacks (no class required). */
export function definePlugin(
  name: string,
  hooks: Partial<Record<PluginHookName, PluginHookFn>>,
): StambhaPlugin {
  return { name, hooks };
}
