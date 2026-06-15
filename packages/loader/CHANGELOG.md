# @stambha/loader

## Unreleased — 0.3.0

### Added

- **`LoaderBinding`** + **`bindings`** option on `loadPieces` — register `client.binder` tokens before scan.
- **`buildLoaderContext`** — auto-injects `binder`, `container`, `logger` on factory context.
- **`PieceFactory`** / **`LoaderPieceConstructor`** types.

## 0.2.2

### Patch Changes

- 5a1c34d: 0.2.2 — Sapphire migration DX: per-command `gateNames`, opt-in `global` gates, dynamic `resolvePrefix`, gates-before-commands loader order, and registry iteration docs.
- Updated dependencies [5a1c34d]
  - @stambha/core@0.2.2
  - @stambha/runtime@0.2.2
