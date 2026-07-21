import { interactionFromDispatch } from "../discordNative.js";
import { isStructuralDispatch } from "./catalog.js";
import { camelizeDispatch } from "./camelize.js";
import { messageFromDispatch, readyFromDispatch } from "./messages.js";

export type NormalizeDispatchMode = "default" | "raw";

export interface NormalizeDispatchOptions {
  /** When `'raw'`, skip Tier 1–3 structural camelCase (G3 migration escape hatch). */
  mode?: NormalizeDispatchMode;
}

/**
 * Normalize a gateway DISPATCH payload for hub emit.
 * Routing-critical events use Stambha shapes; Tier 1–3 events use camelCase; others pass through raw `d`.
 */
export function normalizeDispatch(
  dispatchName: string,
  data: unknown,
  options?: NormalizeDispatchOptions,
): unknown {
  switch (dispatchName) {
    case "MESSAGE_CREATE":
    case "MESSAGE_UPDATE":
      return messageFromDispatch(data) ?? data;
    case "INTERACTION_CREATE":
      return interactionFromDispatch(data) ?? data;
    case "READY":
      return readyFromDispatch(data);
    default:
      if (options?.mode === "raw") return data;
      if (isStructuralDispatch(dispatchName)) return camelizeDispatch(data);
      return data;
  }
}
