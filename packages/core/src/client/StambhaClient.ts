import { EventEmitter } from "node:events";
import type { Binder } from "../binder/Binder.js";
import type { Bridge, Tier, WorkerRole } from "../bridge/types.js";
import { ChronScheduler } from "../chron/ChronScheduler.js";
import { CommandIndex } from "../command/CommandIndex.js";
import { DefaultStambhaContainer } from "../container/DefaultStambhaContainer.js";
import type { StambhaContainerLike } from "../container/types.js";
import type { CommandContext } from "../context/types.js";
import type { ResolvedDesiredProperties } from "../desired/DesiredProperties.js";
import { resolveDesiredProperties } from "../desired/DesiredProperties.js";
import { resolveCommandGates } from "../gates/resolveCommandGates.js";
import type { Outcome } from "../outcome/Outcome.js";
import { Registry } from "../pieces/Registry.js";
import { ExecutionPipeline } from "../pipeline/ExecutionPipeline.js";
import type { PluginHookName, PluginLifecycle, StambhaPlugin } from "../plugins/types.js";
import type { Barrier } from "../registries/Barrier.js";
import type { Chron } from "../registries/Chron.js";
import type { Command } from "../registries/Command.js";
import type { Conduit } from "../registries/Conduit.js";
import type { Epilogue } from "../registries/Epilogue.js";
import type { Gate } from "../registries/Gate.js";
import type { Hook } from "../registries/Hook.js";
import type { Scout } from "../registries/Scout.js";
import type { Signal } from "../registries/Signal.js";
import { SequenceStore } from "../sequence/SequenceStore.js";
import type { RestPort, TierBus } from "../tier/types.js";
import { InboundRouter } from "./InboundRouter.js";
import type { PrefixResolver } from "./prefix.js";
import { SignalRouter } from "./SignalRouter.js";
import type { StambhaClientEvents, StambhaClientOptions, StambhaRegistries } from "./types.js";

export class StambhaClient extends EventEmitter implements PluginLifecycle {
  readonly tier: Tier;
  readonly workerRole: WorkerRole;
  readonly restPort: RestPort | null;
  readonly tierBus: TierBus | null;
  readonly binder: Binder;
  readonly container: StambhaContainerLike;
  readonly pipeline: ExecutionPipeline;
  readonly router: InboundRouter;
  readonly signalRouter: SignalRouter;
  readonly sequences: SequenceStore;
  readonly chronScheduler: ChronScheduler;
  readonly commandIndex: CommandIndex;
  readonly desiredProperties: ResolvedDesiredProperties;
  readonly registries: StambhaRegistries;
  readonly plugins: StambhaPlugin[] = [];

  bridge: Bridge | null = null;
  prefix: string;
  resolvePrefix: PrefixResolver | null;
  botUserId: string | null = null;
  /** Defaults to the client itself running hooks on natively registered plugins. */
  pluginLifecycle: PluginLifecycle = this;
  private started = false;
  private hooksBound = false;
  private initialized = false;

  constructor(options: StambhaClientOptions = {}) {
    super();
    this.tier = options.tier ?? "monolith";
    this.workerRole = options.workerRole ?? (this.tier === "split" ? "gateway" : "monolith");
    this.restPort = options.restPort ?? null;
    this.tierBus = options.tierBus ?? null;
    this.prefix = options.prefix ?? "!";
    this.resolvePrefix = options.resolvePrefix ?? null;
    this.bridge = options.bridge ?? null;
    this.container = options.container ?? new DefaultStambhaContainer();
    this.binder = this.container.binder;
    this.pipeline = new ExecutionPipeline(this);
    this.router = new InboundRouter(this);
    this.signalRouter = new SignalRouter(this);
    this.sequences = new SequenceStore();
    this.chronScheduler = new ChronScheduler();
    this.commandIndex = new CommandIndex();
    this.desiredProperties = resolveDesiredProperties(options.desiredProperties);

    this.registries = {
      commands: new Registry<Command>(this, "commands"),
      hooks: new Registry<Hook>(this, "hooks"),
      scouts: new Registry<Scout>(this, "scouts"),
      barriers: new Registry<Barrier>(this, "barriers"),
      gates: new Registry<Gate>(this, "gates"),
      conduits: new Registry<Conduit>(this, "conduits"),
      epilogues: new Registry<Epilogue>(this, "epilogues"),
      signals: new Registry<Signal>(this, "signals"),
      chrons: new Registry<Chron>(this, "chrons"),
    };

    if (options.plugins) {
      for (const plugin of options.plugins) {
        this.registerPlugin(plugin);
      }
    }
  }

  get isReady(): boolean {
    return this.started;
  }

  setBridge(bridge: Bridge): void {
    this.bridge = bridge;
    this.hooksBound = false;
  }

  setBotUserId(userId: string): void {
    this.botUserId = userId;
  }

  register(command: Command): Command {
    const registered = this.registries.commands.register(command);
    this.rebuildCommandIndex();
    return registered;
  }

  /** Register a command and await {@link Command.onLoad}. */
  async loadCommand(command: Command): Promise<Command> {
    const loaded = await this.registries.commands.load(command);
    this.rebuildCommandIndex();
    return loaded;
  }

  /** Await {@link Command.onUnload} and remove from the command registry. */
  async unloadCommand(name: string): Promise<boolean> {
    const removed = await this.registries.commands.unload(name);
    if (removed) this.rebuildCommandIndex();
    return removed;
  }

  rebuildCommandIndex(): void {
    this.commandIndex.rebuild(this.registries.commands.values());
  }

  /** Validate {@link CommandOptions.gateNames} against the gate registry. Called by {@link loadPieces}. */
  resolveCommandGates(): void {
    resolveCommandGates(this);
  }

  registerPlugin(plugin: StambhaPlugin): this {
    this.plugins.push(plugin);
    return this;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    await this.runHook("preInit");
    await this.runHook("postInit");
  }

  async runHook(name: PluginHookName): Promise<void> {
    const ctx = { client: this, container: this.container };
    for (const plugin of this.plugins) {
      const hook = plugin.hooks?.[name];
      if (hook) {
        await hook(ctx);
      }
    }
  }

  getCommand(name: string): Command | undefined {
    return this.registries.commands.get(name);
  }

  /** @deprecated Use {@link getCommand} */
  getDirective(name: string): Command | undefined {
    return this.getCommand(name);
  }

  async invoke(commandName: string, ctx: CommandContext): Promise<Outcome<unknown, unknown>> {
    const command = this.getCommand(commandName);
    if (!command) {
      return { ok: false, error: new Error(`Unknown command: ${commandName}`) };
    }
    if (!command.supports(ctx.kind)) {
      return {
        ok: false,
        error: new Error(`Command "${commandName}" does not support kind "${ctx.kind}"`),
      };
    }
    return this.pipeline.runCommand(command, ctx);
  }

  async start(): Promise<void> {
    if (!this.bridge) {
      throw new Error(
        "No bridge configured. Pass bridge in options or call setBridge() before start().",
      );
    }
    if (this.tier === "split" && this.workerRole === "gateway" && !this.restPort) {
      throw new Error(
        "Split-tier gateway requires a RestPort (e.g. new HttpRestPort({ baseUrl })).",
      );
    }
    await this.pluginLifecycle?.runHook("preStart");
    await this.bridge.connect();
    this.bindHooks();
    this.startChrons();
    this.rebuildCommandIndex();
    this.started = true;
    this.emit("ready");
    await this.pluginLifecycle?.runHook("postStart");
  }

  async stop(): Promise<void> {
    this.chronScheduler.stop();
    await this.pluginLifecycle?.runHook("onShutdown");
    if (this.bridge) {
      await this.bridge.disconnect();
    }
    this.started = false;
  }

  private startChrons(): void {
    this.chronScheduler.stop();
    this.chronScheduler.start(this.registries.chrons.values(), (chron, error) => {
      this.emit("chronError", { chron: chron.name, error });
    });
  }

  private bindHooks(): void {
    if (!this.bridge || this.hooksBound) return;
    this.hooksBound = true;

    for (const hook of this.registries.hooks.values()) {
      const handler = async (payload: unknown) => {
        try {
          await hook.handle(payload);
        } catch (error) {
          this.emit("hookError", { hook: hook.name, error });
        }
      };

      if (hook.once) {
        this.bridge.once(hook.event, handler);
      } else {
        this.bridge.on(hook.event, handler);
      }
    }
  }

  override emit<K extends keyof StambhaClientEvents>(
    event: K,
    ...args: StambhaClientEvents[K]
  ): boolean {
    return super.emit(event, ...args);
  }

  override on<K extends keyof StambhaClientEvents>(
    event: K,
    listener: (...args: StambhaClientEvents[K]) => void,
  ): this {
    return super.on(event, listener);
  }
}
