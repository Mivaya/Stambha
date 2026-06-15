import type { Binder, ServiceFactory, ServiceToken } from "@stambha/core";
import type { LoaderContext } from "./types.js";

/** Register a singleton or factory on {@link Binder} before pieces load. */
export interface LoaderBinding<T = unknown> {
  token: ServiceToken<T>;
  value?: T;
  factory?: ServiceFactory<T>;
}

/** Optional static factory on any piece class — used by {@link loadPieces}. */
export interface PieceFactory<T = unknown> {
  create(ctx: LoaderContext): T;
}

export type PieceConstructor<T = unknown> = (new (
  ...args: never[]
) => T) & {
  create?: PieceFactory<T>["create"];
};

export function applyLoaderBindings(binder: Binder, bindings: LoaderBinding[] | undefined): void {
  if (!bindings) return;
  for (const binding of bindings) {
    if (binding.value !== undefined) {
      binder.registerSingleton(binding.token, binding.value);
    } else if (binding.factory) {
      binder.registerFactory(binding.token, binding.factory);
    }
  }
}

export function buildLoaderContext(
  client: import("@stambha/core").StambhaClient,
  context: LoaderContext | undefined,
): LoaderContext {
  return {
    client,
    binder: client.binder,
    container: client.container,
    logger: client.container.logger,
    ...context,
  };
}
