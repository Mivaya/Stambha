# @stambha/core

## 0.3.3

### Added

- **`EpiloguePhase`**, `runOn: "denied" | "blocked"` — epilogues run when gates/barriers stop a command.
- **`attachCommandLifecycleEpilogues`**, **`createCommandLoggingEpilogue`** — replace bootstrap `client.on('command*')`.
- Extended **`EpilogueContext`** with `phase`, optional `denied` / `blocked`, nullable `outcome`.

### Changed

- **`Hook`** JSDoc — documents `static create(ctx)` factory pattern.

## 0.2.2

### Patch Changes

- 5a1c34d: 0.2.2 — Sapphire migration DX: per-command `gateNames`, opt-in `global` gates, dynamic `resolvePrefix`, gates-before-commands loader order, and registry iteration docs.
  - @stambha/runtime@0.2.2
