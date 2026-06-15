import type { Registry } from "../pieces/Registry.js";
import { Unit, type UnitOptions } from "../pieces/Unit.js";

export interface HookOptions extends UnitOptions {
  /** Discord / bridge event name, e.g. "ready", "guildCreate". */
  event: string;
  once?: boolean;
}

/**
 * Raw lifecycle handler bound to bridge events.
 *
 * ### Dependency injection (0.3.0)
 *
 * Hooks only receive `registry` from the default constructor. For Prisma, Vault, or other
 * services, expose a static factory and let {@link @stambha/loader!loadPieces} call it:
 *
 * ```ts
 * import type { LoaderContext } from "@stambha/loader";
 *
 * export class ReadyListener extends Hook {
 *   static create(ctx: LoaderContext) {
 *     const logger = ctx.logger;
 *     return new ReadyListener(ctx.client.registries.hooks, logger);
 *   }
 *
 *   constructor(registry: Registry<Hook>, private readonly logger: StambhaLogger) {
 *     super(registry, { name: "ready-log", event: "ready", once: true });
 *   }
 *
 *   handle(payload: unknown) {
 *     this.logger.info("ready", payload);
 *   }
 * }
 * ```
 *
 * `LoaderContext` includes `client`, `binder`, `container`, and `logger` (plus your `context` fields).
 */
export abstract class Hook extends Unit<HookOptions> {
  readonly event: string;
  readonly once: boolean;

  constructor(registry: Registry<Hook>, options: HookOptions) {
    super(registry, options);
    this.event = options.event;
    this.once = options.once ?? false;
  }

  abstract handle(payload: unknown): Promise<void> | void;
}
