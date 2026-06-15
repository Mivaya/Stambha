import type { Binder, StambhaClient, StambhaContainerLike, StambhaLogger } from "@stambha/core";
export type PieceKind =
  | "commands"
  | "listeners"
  | "scouts"
  | "barriers"
  | "gates"
  | "epilogues"
  | "conduits"
  | "signals"
  | "tasks";

export interface LoaderContext {
  client: StambhaClient;
  /** Same instance as `client.binder` — register services before `loadPieces` or via `bindings`. */
  binder?: Binder;
  container?: StambhaContainerLike;
  logger?: StambhaLogger;
  vault?: unknown;
  [key: string]: unknown;
}

export type PieceConstructor = new (...args: never[]) => { name: string };

export interface LoadPiecesOptions {
  /** Project root (default: process.cwd()) */
  basePath?: string;
  /** Extra context passed to piece factories (`static create(ctx)`). Merged over client/binder/logger. */
  context?: Omit<LoaderContext, "client" | "binder" | "container" | "logger"> &
    Record<string, unknown>;
  /** Register services on `client.binder` before any piece loads. */
  bindings?: import("./factory.js").LoaderBinding[];
  /** Override paths per kind (defaults from PiecePaths) */
  paths?: Partial<Record<PieceKind, string | false>>;
}

export interface LoadPiecesResult {
  loaded: Record<PieceKind, string[]>;
  errors: { file: string; error: unknown }[];
}
