import type { StambhaClient } from "../client/StambhaClient.js";
import type { Registry } from "../pieces/Registry.js";
import type { Signal } from "../registries/Signal.js";

export type PersistentSignalFactory = (registry: Registry<Signal>) => readonly Signal[];

/**
 * Register signals intended for **long-lived** message components (role panels, permanent menus).
 *
 * Use stable `signal.customId()` / `signal.customId("part")` ids — no session tokens — so clicks
 * still route after a process restart (as long as you call this again on boot, or load the same
 * pieces via `@stambha/loader`).
 *
 * Skips names already present in the registry (safe after `loadPieces`).
 *
 * @returns The signals that were newly registered.
 */
export function registerPersistentSignals(
  client: StambhaClient,
  create: PersistentSignalFactory,
): Signal[] {
  const registry = client.registries.signals;
  const created = create(registry);
  const registered: Signal[] = [];
  for (const signal of created) {
    if (registry.has(signal.name)) continue;
    registry.register(signal);
    registered.push(signal);
  }
  return registered;
}
