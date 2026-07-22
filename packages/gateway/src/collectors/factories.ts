import type {
  GatewayMessageReactionAdd,
  StambhaInteraction,
  StambhaMessage,
} from "@stambha/transform";
import {
  Collector,
  type CollectorEndReason,
  type CollectorHub,
  type CollectorOptions,
} from "./Collector.js";

function asMessage(payload: unknown): StambhaMessage | null {
  if (!payload || typeof payload !== "object") return null;
  const m = payload as Partial<StambhaMessage>;
  if (typeof m.content !== "string" || !m.author) return null;
  return payload as StambhaMessage;
}

function asReaction(payload: unknown): GatewayMessageReactionAdd | null {
  if (!payload || typeof payload !== "object") return null;
  const r = payload as Partial<GatewayMessageReactionAdd>;
  if (typeof r.messageId !== "string" || typeof r.userId !== "string") return null;
  return payload as GatewayMessageReactionAdd;
}

function asInteraction(payload: unknown): StambhaInteraction | null {
  if (!payload || typeof payload !== "object") return null;
  const i = payload as Partial<StambhaInteraction>;
  if (!i.kind || !i.user) return null;
  return payload as StambhaInteraction;
}

function createBoundCollector<T>(
  hub: CollectorHub,
  event: string,
  map: (payload: unknown) => T | null,
  options?: CollectorOptions<T>,
): Collector<T> {
  const collector = new Collector<T>(options);
  collector.bindHub(hub, event, map);
  return collector;
}

/** Collect `messageCreate` events from the hub. */
export function createMessageCollector(
  hub: CollectorHub,
  options?: CollectorOptions<StambhaMessage>,
): Collector<StambhaMessage> {
  return createBoundCollector(hub, "messageCreate", asMessage, options);
}

/** Collect `messageReactionAdd` events from the hub. */
export function createReactionCollector(
  hub: CollectorHub,
  options?: CollectorOptions<GatewayMessageReactionAdd>,
): Collector<GatewayMessageReactionAdd> {
  return createBoundCollector(hub, "messageReactionAdd", asReaction, options);
}

/** Collect `interactionCreate` events from the hub. */
export function createInteractionCollector(
  hub: CollectorHub,
  options?: CollectorOptions<StambhaInteraction>,
): Collector<StambhaInteraction> {
  return createBoundCollector(hub, "interactionCreate", asInteraction, options);
}

/** Promise sugar — ends with time / max / stop. */
export function awaitMessages(
  hub: CollectorHub,
  options?: CollectorOptions<StambhaMessage>,
): Promise<{ collected: StambhaMessage[]; reason: CollectorEndReason }> {
  return createMessageCollector(hub, options).wait();
}

export function awaitReactions(
  hub: CollectorHub,
  options?: CollectorOptions<GatewayMessageReactionAdd>,
): Promise<{ collected: GatewayMessageReactionAdd[]; reason: CollectorEndReason }> {
  return createReactionCollector(hub, options).wait();
}

export function awaitInteractions(
  hub: CollectorHub,
  options?: CollectorOptions<StambhaInteraction>,
): Promise<{ collected: StambhaInteraction[]; reason: CollectorEndReason }> {
  return createInteractionCollector(hub, options).wait();
}
