export type CollectorEndReason = "time" | "limit" | "user";

export interface CollectorOptions<T> {
  /** Return true to accept the item. May be async. */
  filter?: (item: T) => boolean | Promise<boolean>;
  /** Max matching items before end (`limit`). Default unlimited. */
  max?: number;
  /** Wall-clock ms before end (`time`). */
  time?: number;
}

export type CollectHandler<T> = (item: T) => void;
export type EndHandler<T> = (collected: readonly T[], reason: CollectorEndReason) => void;

/** Minimal hub surface — {@link GatewayEventHub} or a test double. */
export interface CollectorHub {
  on(event: string, handler: (payload: unknown) => void): void;
  off(event: string, handler: (payload: unknown) => void): void;
}

/**
 * Collects filtered hub events until time / max / {@link stop}.
 * Not an EventEmitter — small listener sets only.
 */
export class Collector<T> {
  readonly collected: T[] = [];

  private readonly collectListeners = new Set<CollectHandler<T>>();
  private readonly endListeners = new Set<EndHandler<T>>();
  private readonly filter: ((item: T) => boolean | Promise<boolean>) | undefined;
  private readonly max: number | undefined;
  private ended = false;
  private endReason: CollectorEndReason | undefined;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private waitPromise: Promise<{ collected: T[]; reason: CollectorEndReason }> | undefined;
  private resolveWait:
    | ((value: { collected: T[]; reason: CollectorEndReason }) => void)
    | undefined;
  private disposeHub: (() => void) | undefined;
  /** Serialize async filters so max/limit stays accurate. */
  private queue: Promise<void> = Promise.resolve();

  constructor(options: CollectorOptions<T> = {}) {
    this.filter = options.filter;
    this.max = options.max;
    if (options.time !== undefined && options.time > 0) {
      this.timer = setTimeout(() => this.stop("time"), options.time);
      if (typeof this.timer === "object" && "unref" in this.timer) {
        this.timer.unref();
      }
    }
  }

  /** Wire the hub listener; called by factories after construction. */
  bindHub(hub: CollectorHub, event: string, map: (payload: unknown) => T | null): void {
    if (this.disposeHub) {
      throw new Error("Collector already bound to a hub event");
    }
    const handler = (payload: unknown) => {
      this.ingest(map(payload));
    };
    hub.on(event, handler);
    this.disposeHub = () => hub.off(event, handler);
  }

  on(event: "collect", fn: CollectHandler<T>): void;
  on(event: "end", fn: EndHandler<T>): void;
  on(event: "collect" | "end", fn: CollectHandler<T> | EndHandler<T>): void {
    if (event === "collect") {
      this.collectListeners.add(fn as CollectHandler<T>);
    } else {
      this.endListeners.add(fn as EndHandler<T>);
    }
  }

  off(event: "collect", fn: CollectHandler<T>): void;
  off(event: "end", fn: EndHandler<T>): void;
  off(event: "collect" | "end", fn: CollectHandler<T> | EndHandler<T>): void {
    if (event === "collect") {
      this.collectListeners.delete(fn as CollectHandler<T>);
    } else {
      this.endListeners.delete(fn as EndHandler<T>);
    }
  }

  /** Resolves when the collector ends. */
  wait(): Promise<{ collected: T[]; reason: CollectorEndReason }> {
    if (this.ended) {
      return Promise.resolve({
        collected: [...this.collected],
        reason: this.endReason ?? "user",
      });
    }
    if (!this.waitPromise) {
      this.waitPromise = new Promise((resolve) => {
        this.resolveWait = resolve;
      });
    }
    return this.waitPromise;
  }

  stop(reason: CollectorEndReason = "user"): void {
    if (this.ended) return;
    this.ended = true;
    this.endReason = reason;
    if (this.timer !== undefined) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    this.disposeHub?.();
    this.disposeHub = undefined;

    const collected = [...this.collected];
    for (const fn of this.endListeners) {
      try {
        fn(collected, reason);
      } catch {
        // Listener errors must not break teardown.
      }
    }
    this.resolveWait?.({ collected, reason });
    this.resolveWait = undefined;
  }

  /**
   * Sync filters (and no filter) accept immediately on the hub tick.
   * Async filters are queued so `max` stays correct.
   */
  private ingest(item: T | null): void {
    if (this.ended || item === null) return;

    if (!this.filter) {
      this.accept(item);
      return;
    }

    const result = this.filter(item);
    if (result instanceof Promise) {
      this.queue = this.queue
        .then(async () => {
          if (this.ended) return;
          if (await result) this.accept(item);
        })
        .catch(() => undefined);
      return;
    }

    if (result) this.accept(item);
  }

  private accept(item: T): void {
    if (this.ended) return;
    this.collected.push(item);
    for (const fn of this.collectListeners) {
      try {
        fn(item);
      } catch {
        // ignore
      }
    }
    if (this.max !== undefined && this.collected.length >= this.max) {
      this.stop("limit");
    }
  }
}
