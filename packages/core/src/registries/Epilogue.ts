import type { EpilogueContext, EpiloguePhase } from "../context/types.js";
import type { Registry } from "../pieces/Registry.js";
import { Unit, type UnitOptions } from "../pieces/Unit.js";

export type EpilogueRunOn = "success" | "failure" | "always" | "denied" | "blocked";

export type { EpiloguePhase } from "../context/types.js";

export interface EpilogueOptions extends UnitOptions {
  runOn?: EpilogueRunOn;
  priority?: number;
}

export abstract class Epilogue extends Unit<EpilogueOptions> {
  readonly runOn: EpilogueRunOn;
  readonly priority: number;

  constructor(registry: Registry<Epilogue>, options: EpilogueOptions) {
    super(registry, options);
    this.runOn = options.runOn ?? "success";
    this.priority = options.priority ?? 100;
  }

  abstract run(ctx: EpilogueContext): Promise<void>;

  matches(phase: EpiloguePhase, outcomeOk: boolean): boolean {
    if (this.runOn === "always") return true;
    if (this.runOn === "denied") return phase === "denied";
    if (this.runOn === "blocked") return phase === "blocked";
    if (phase !== "completed") return false;
    if (this.runOn === "success") return outcomeOk;
    return !outcomeOk;
  }
}
