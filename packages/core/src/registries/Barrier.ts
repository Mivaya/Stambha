import type { CommandContext } from "../context/types.js";
import type { Registry } from "../pieces/Registry.js";
import { Unit, type UnitOptions } from "../pieces/Unit.js";

export interface BarrierResult {
  block: boolean;
  reason?: string;
  silent?: boolean;
}

export interface BarrierOptions extends UnitOptions {
  priority?: number;
  /** Skip this barrier when generating help (e.g. spam-protection barriers). */
  skipOnHelp?: boolean;
}

export abstract class Barrier extends Unit<BarrierOptions> {
  readonly priority: number;
  readonly skipOnHelp: boolean;

  constructor(registry: Registry<Barrier>, options: BarrierOptions) {
    super(registry, options);
    this.priority = options.priority ?? 50;
    this.skipOnHelp = options.skipOnHelp ?? false;
  }

  abstract block(ctx: CommandContext): Promise<BarrierResult>;
}
