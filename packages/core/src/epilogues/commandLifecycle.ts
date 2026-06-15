import type { StambhaClient } from "../client/StambhaClient.js";
import type { EpilogueContext } from "../context/types.js";
import { isOk } from "../outcome/Outcome.js";
import type { Registry } from "../pieces/Registry.js";
import { Epilogue, type EpilogueRunOn } from "../registries/Epilogue.js";

/** Handlers for command pipeline lifecycle — prefer epilogues over `client.on('command*')`. */
export interface CommandLifecycleHandlers {
  onSuccess?: (ctx: EpilogueContext) => void | Promise<void>;
  onFailure?: (ctx: EpilogueContext) => void | Promise<void>;
  onDenied?: (ctx: EpilogueContext) => void | Promise<void>;
  onBlocked?: (ctx: EpilogueContext) => void | Promise<void>;
}

export interface CommandLifecycleEpilogueOptions {
  name?: string;
  priority?: number;
  handlers: CommandLifecycleHandlers;
}

class HandlerEpilogue extends Epilogue {
  constructor(
    registry: Registry<Epilogue>,
    options: { name: string; runOn: EpilogueRunOn; priority: number },
    private readonly handler: (ctx: EpilogueContext) => void | Promise<void>,
  ) {
    super(registry, options);
  }

  async run(ctx: EpilogueContext): Promise<void> {
    await this.handler(ctx);
  }
}

/**
 * Register epilogue pieces that mirror `commandSuccess`, `commandError`, `commandDenied`, and `commandBlocked`.
 * Returns a function that unregisters all created epilogues.
 */
export function attachCommandLifecycleEpilogues(
  client: StambhaClient,
  handlers: CommandLifecycleHandlers,
  options: { name?: string; priority?: number } = {},
): () => void {
  const base = options.name ?? "lifecycle";
  const priority = options.priority ?? 200;
  const registry = client.registries.epilogues;
  const registered: Epilogue[] = [];

  const add = (
    suffix: string,
    runOn: EpilogueRunOn,
    handler?: CommandLifecycleHandlers[keyof CommandLifecycleHandlers],
  ) => {
    if (!handler) return;
    const epilogue = new HandlerEpilogue(
      registry,
      { name: `${base}:${suffix}`, runOn, priority },
      handler,
    );
    registry.register(epilogue);
    registered.push(epilogue);
  };

  add("success", "success", handlers.onSuccess);
  add("failure", "failure", handlers.onFailure);
  add("denied", "denied", handlers.onDenied);
  add("blocked", "blocked", handlers.onBlocked);

  return () => {
    for (const epilogue of registered) {
      registry.unregister(epilogue.name);
    }
  };
}

/**
 * Factory for a file-based epilogue that logs command outcomes (success / failure / denied / blocked).
 */
export function createCommandLoggingEpilogue(
  registry: Registry<Epilogue>,
  log: (line: string, ctx: EpilogueContext) => void,
  options: { name?: string; priority?: number; runOn?: EpilogueRunOn } = {},
): Epilogue {
  const runOn = options.runOn ?? "always";
  return new (class extends Epilogue {
    constructor() {
      super(registry, {
        name: options.name ?? "command-log",
        runOn,
        priority: options.priority ?? 100,
      });
    }

    async run(ctx: EpilogueContext): Promise<void> {
      if (ctx.phase === "denied") {
        log(`denied ${ctx.commandName} (${ctx.denied?.gate ?? "gate"})`, ctx);
        return;
      }
      if (ctx.phase === "blocked") {
        log(`blocked ${ctx.commandName}`, ctx);
        return;
      }
      const status = ctx.outcome && isOk(ctx.outcome) ? "ok" : "fail";
      log(`${status} ${ctx.commandName} (${ctx.durationMs.toFixed(1)}ms)`, ctx);
    }
  })();
}
