# @stambha/gateway

## Unreleased — 0.3.0

### Minor Changes

- **`createNativeGatewayClient`** — bundled Discord gateway WebSocket client (identify, resume, heartbeat, dispatch → `GatewayEventHub`).
- **`fetchGatewayBot`**, **`normalizeDispatch`**, and related dispatch helpers.
- Dependency: **`ws`** (used when global `WebSocket` is unavailable).

## 0.2.2

### Patch Changes

- 5a1c34d: 0.2.2 — Sapphire migration DX: per-command `gateNames`, opt-in `global` gates, dynamic `resolvePrefix`, gates-before-commands loader order, and registry iteration docs.
- Updated dependencies [5a1c34d]
  - @stambha/core@0.2.2
  - @stambha/transform@0.2.2
  - @stambha/transport@0.2.2
