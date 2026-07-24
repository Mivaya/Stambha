import type { PluginHookName, StambhaClient, StambhaPlugin as CorePlugin, PluginContext as CoreContext } from "@stambha/core";
import type { StambhaContainer } from "./StambhaContainer.js";

export interface PluginContext extends Omit<CoreContext, "container"> {
  client: StambhaClient;
  container: StambhaContainer;
}

export type PluginHookFn = (ctx: PluginContext) => void | Promise<void>;

export interface StambhaPlugin extends Omit<CorePlugin, "hooks"> {
  name: string;
  hooks?: Partial<Record<PluginHookName, PluginHookFn>>;
}

