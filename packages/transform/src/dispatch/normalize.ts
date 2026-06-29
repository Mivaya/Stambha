import { interactionFromDispatch } from "../discordNative.js";
import { messageFromDispatch, readyFromDispatch } from "./messages.js";

/**
 * Normalize a gateway DISPATCH payload for hub emit.
 * Routing-critical events use Stambha shapes; others pass through raw `d`.
 */
export function normalizeDispatch(dispatchName: string, data: unknown): unknown {
  switch (dispatchName) {
    case "MESSAGE_CREATE":
    case "MESSAGE_UPDATE":
      return messageFromDispatch(data) ?? data;
    case "INTERACTION_CREATE":
      return interactionFromDispatch(data) ?? data;
    case "READY":
      return readyFromDispatch(data);
    default:
      return data;
  }
}
