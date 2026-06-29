import type { CommandContext } from "../context/types.js";
import type { Registry } from "../pieces/Registry.js";
import { Unit, type UnitOptions } from "../pieces/Unit.js";

export interface ConduitOptions extends UnitOptions {
  priority?: number;
}

/** Non-blocking middleware that runs before barriers and gates. */
export abstract class Conduit extends Unit<ConduitOptions> {
  readonly priority: number;

  constructor(registry: Registry<Conduit>, options: ConduitOptions) {
    super(registry, options);
    this.priority = options.priority ?? 10;
  }

  abstract process(ctx: CommandContext): Promise<void>;
}
