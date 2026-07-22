import { type Registry, Signal, type SignalContext } from "@stambha/core";

/**
 * Persistent color menu — registered via `registerPersistentSignals` in setup
 * (not under `src/signals/`) so the bootstrap path is explicit.
 */
export class ColorMenuSignal extends Signal {
  constructor(registry: Registry<Signal>) {
    super(registry, {
      name: "colors",
      types: ["select"],
    });
  }

  async run(ctx: SignalContext): Promise<void> {
    const picked = ctx.values[0] ?? "nothing";
    await ctx.reply(`You picked: \`${picked}\``);
  }
}
