import type {
  Barrier,
  Chron,
  Command,
  Conduit,
  Epilogue,
  Gate,
  Hook,
  Scout,
  Signal,
} from "@stambha/core";
import { PiecePaths, type StambhaClient } from "@stambha/core";
import { basename, cwd, extname, pathToFileURL, resolve } from "@stambha/runtime";
import { applyLoaderBindings, buildLoaderContext } from "./factory.js";
import { scanFiles } from "./scan.js";
import type { LoaderContext, LoadPiecesOptions, LoadPiecesResult, PieceKind } from "./types.js";

const DEFAULT_PATHS: Record<PieceKind, string> = {
  commands: PiecePaths.commands,
  listeners: PiecePaths.listeners,
  scouts: PiecePaths.scouts,
  barriers: PiecePaths.barriers,
  gates: PiecePaths.gates,
  epilogues: PiecePaths.epilogues,
  conduits: PiecePaths.conduits,
  signals: PiecePaths.signals,
  tasks: PiecePaths.tasks,
};

/** Load gates before commands so {@link CommandOptions.gateNames} can resolve at construct time. */
const LOAD_ORDER: PieceKind[] = [
  "gates",
  "barriers",
  "conduits",
  "epilogues",
  "scouts",
  "signals",
  "tasks",
  "listeners",
  "commands",
];

/**
 * Load pieces from disk using Stambha folder conventions.
 */
export async function loadPieces(
  client: StambhaClient,
  options: LoadPiecesOptions = {},
): Promise<LoadPiecesResult> {
  await client.initialize();
  const basePath = options.basePath ?? cwd();
  applyLoaderBindings(client.binder, options.bindings);
  const ctx: LoaderContext = buildLoaderContext(
    client,
    options.context as LoaderContext | undefined,
  );

  const result: LoadPiecesResult = {
    loaded: {
      commands: [],
      listeners: [],
      scouts: [],
      barriers: [],
      gates: [],
      epilogues: [],
      conduits: [],
      signals: [],
      tasks: [],
    },
    errors: [],
  };

  for (const kind of LOAD_ORDER) {
    const custom = options.paths?.[kind];
    if (custom === false) continue;

    const rel = custom ?? DEFAULT_PATHS[kind];
    const abs = resolve(basePath, rel);
    const files = await scanFiles(abs);

    for (const file of files) {
      try {
        const mod = await import(pathToFileURL(file).href);
        const PieceClass = resolveExport(mod, file);
        if (!PieceClass) continue;

        await registerPiece(kind, client, PieceClass, ctx);
        result.loaded[kind].push(file);
      } catch (error) {
        result.errors.push({ file, error });
      }
    }
  }

  client.resolveCommandGates();
  client.rebuildCommandIndex();
  await client.pluginLifecycle?.runHook("postLoad");
  return result;
}

function resolveExport(
  mod: Record<string, unknown>,
  file: string,
): (new (...a: never[]) => unknown) | null {
  if (typeof mod.default === "function") {
    return mod.default as new (
      ...a: never[]
    ) => unknown;
  }
  const base = basename(file, extname(file));
  const named = mod[base];
  if (typeof named === "function") return named as new (...a: never[]) => unknown;
  return null;
}

function registerPiece(
  kind: PieceKind,
  client: StambhaClient,
  PieceClass: new (...args: never[]) => unknown,
  ctx: LoaderContext,
): Promise<void> {
  switch (kind) {
    case "commands": {
      const instance = instantiate(PieceClass, ctx, client.registries.commands);
      return client.registries.commands.load(instance as Command).then(() => undefined);
    }
    case "listeners": {
      const instance = instantiate(PieceClass, ctx, client.registries.hooks);
      return client.registries.hooks.load(instance as Hook).then(() => undefined);
    }
    case "scouts": {
      const instance = instantiate(PieceClass, ctx, client.registries.scouts);
      return client.registries.scouts.load(instance as Scout).then(() => undefined);
    }
    case "barriers": {
      const instance = instantiate(PieceClass, ctx, client.registries.barriers);
      return client.registries.barriers.load(instance as Barrier).then(() => undefined);
    }
    case "gates": {
      const instance = instantiate(PieceClass, ctx, client.registries.gates);
      return client.registries.gates.load(instance as Gate).then(() => undefined);
    }
    case "epilogues": {
      const instance = instantiate(PieceClass, ctx, client.registries.epilogues);
      return client.registries.epilogues.load(instance as Epilogue).then(() => undefined);
    }
    case "conduits": {
      const instance = instantiate(PieceClass, ctx, client.registries.conduits);
      return client.registries.conduits.load(instance as Conduit).then(() => undefined);
    }
    case "signals": {
      const instance = instantiate(PieceClass, ctx, client.registries.signals);
      return client.registries.signals.load(instance as Signal).then(() => undefined);
    }
    case "tasks": {
      const instance = instantiate(PieceClass, ctx, client.registries.chrons);
      return client.registries.chrons.load(instance as Chron).then(() => undefined);
    }
  }
}

function instantiate(
  PieceClass: new (...args: never[]) => unknown,
  ctx: LoaderContext,
  registry: unknown,
): unknown {
  const factory = (PieceClass as { create?: (ctx: LoaderContext) => unknown }).create;
  if (typeof factory === "function") {
    return factory(ctx);
  }
  return new PieceClass(registry as never);
}
