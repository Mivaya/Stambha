/**
 * Default source folders for bot pieces.
 * Used by `@stambha/loader` and documented for project layout.
 */
export const PiecePaths = {
  /** Command pieces (`commands/`). */
  commands: "src/commands",
  /** Event listeners (`listeners/`). */
  listeners: "src/listeners",
  /** Alias for {@link PiecePaths.listeners}. */
  events: "src/listeners",
  /** Scout pieces (`scouts/`). */
  scouts: "src/scouts",
  /** Barrier pieces (`barriers/`). */
  barriers: "src/barriers",
  /** Gate pieces (`gates/`). */
  gates: "src/gates",
  /** Alias for {@link PiecePaths.gates}. */
  preconditions: "src/gates",
  /** Epilogue pieces (`epilogues/`). */
  epilogues: "src/epilogues",
  /** Alias for {@link PiecePaths.epilogues}. */
  finalizers: "src/epilogues",
  /** Conduit middleware (`conduits/`). */
  conduits: "src/conduits",
  /** Signal pieces — buttons, modals, selects (`signals/`). */
  signals: "src/signals",
  /** Chron scheduled jobs (`tasks/`). */
  tasks: "src/tasks",
  /** Vault blueprints / ledger schemas */
  schemas: "src/schemas",
  /**
   * Conventional folder for `@stambha/api` file-based routes (`loadRoutes` / `routesDir`).
   * Not scanned by `@stambha/loader` — pass as `routesDir` to createApiPlugin / createApiServerAsync.
   */
  routes: "src/routes",
} as const;

export type PiecePathKey = keyof typeof PiecePaths;
