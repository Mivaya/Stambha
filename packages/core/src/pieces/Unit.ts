import type { StambhaClient } from "../client/StambhaClient.js";
import type { Registry } from "./Registry.js";

export interface UnitOptions {
  /** Unique name within the registry. */
  name: string;
  /** When false, the unit is skipped by the execution pipeline. */
  enabled?: boolean;
}

export abstract class Unit<TOptions extends UnitOptions = UnitOptions> {
  readonly name: string;
  enabled: boolean;
  /** True after {@link onLoad} has completed via {@link Registry.load}. */
  loaded = false;

  constructor(
    readonly registry: Registry<Unit>,
    options: TOptions,
  ) {
    this.name = options.name;
    this.enabled = options.enabled ?? true;
  }

  get client(): StambhaClient {
    return this.registry.client;
  }

  /**
   * Called by {@link Registry.load} after the unit is registered (Sapphire / cog parity).
   * Override for setup that needs the client (timers, caches, subscriptions).
   */
  async onLoad(): Promise<void> {}

  /**
   * Called by {@link Registry.unload} before the unit is unregistered.
   * Override to tear down resources created in {@link onLoad}.
   */
  async onUnload(): Promise<void> {}
}
