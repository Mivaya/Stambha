# Why Stambha

## Benefits in plain English

| You want… | Stambha gives you… |
|-----------|-------------------|
| Familiar command folders without discord.js in every process | Piece layout (`commands/`, `gates/`, …) on a **native** gateway + REST stack |
| To test without spinning up Discord | `hub.emit`, `MockBridge`, and `examples/bot` `pnpm demo` |
| To grow from one process to many | Same pipeline in one process or split across gateway / REST / bot workers |
| Guild settings without inventing a schema | **Vault** for prefix/flags/modules — keep Prisma/SQL for domain data |

---

## The problem

Building a serious Discord bot today usually means picking a lane:

| Lane | What you get | What you give up |
|------|----------------|------------------|
| **Piece-based framework on discord.js** | Strong command DX — folders, preconditions, plugins | The client library in the hot path; harder to split gateway, REST, and bot workers cleanly |
| **Native transport stack** | Sharding, REST proxy patterns, worker-friendly layout | A different command model; more wiring for piece-based ergonomics |
| **discord.js alone** | Full API surface | No opinion on structure, gates, deploy, or multi-process layout |

Teams coming from piece-based layouts want to **keep familiar folders** (`commands/`, `listeners/`, `gates/`). Teams scaling across processes want **first-class process split** without bolting e.g. discord.js onto every worker.

Git commits are a poor place to capture *why* you chose a connectivity shape or where guild config should live. Those decisions belong in docs and code you can reason about when you onboard the next maintainer.

## The solution

Stambha ships a **native stack by default** — your bot logic is not coupled to a third-party Discord client library. Official connectivity is `@stambha/gateway` + `@stambha/rest`, not a hybrid where discord.js owns the WebSocket:

```text
@stambha/gateway  →  events, sharding, worker bus
@stambha/rest     →  centralized rate limits, deploy, REST worker
@stambha/transform →  stable command contexts (no library types in core)
@stambha/core     →  pipeline, pieces, vault hooks, sequences
```

You write **pieces** (commands, hooks, gates, scouts, …) against Stambha APIs. Discord connectivity comes from Stambha-owned packages — not from wrapping another framework or requiring discord.js in core.

### Design choices (in one place)

**Piece-based DX, native wire protocol**

- Class-based pieces and registries, familiar folder paths
- Gates for pre-command checks; `ok()` / `err()` outcomes instead of exceptions in commands
- Command tree, args, and plugins host in core — not a separate framework install

**Multi-process topology, one command model**

- Split gateway / REST / bot workers via `RestPort` and worker bus
- Resharding helpers, identify budget, metrics hooks
- Monolith still works: one process, one hub, same APIs

**Config vs domain data**

- **Vault** — typed guild/user/member settings (prefix, flags, modules)
- **Your ORM** — economy, mod logs, analytics, anything heavy
- Coexistence is intentional: Vault does not replace Prisma or SQL

**Extensions stay optional**

- Core repo ships the framework
- [`Stambha-plugins`](https://github.com/Mivaya/Stambha-plugins) ships `@stambha/cache`, `@stambha/metrics`, `@stambha/vault-sql`, and future dashboard/i18n packages on their own release cadence

## The result

A Stambha bot is organized like this:

```text
src/
  commands/     # Command pieces
  listeners/    # Hook pieces
  gates/        # Gate pieces (pre-command checks)
  schemas/      # Vault blueprints (optional)
```

At runtime, inbound events flow through a **single pipeline**:

```text
Scout → InboundRouter → Conduit → Barrier → Gate → Command → Epilogue
Signals (buttons / selects / modals) route in parallel on interactionCreate
```

You get:

1. **One connectivity story** — native REST and gateway; no official hybrid path that keeps e.g. discord.js for gateway and Stambha for commands only
2. **Predictable scaling** — start in one process; split gateway / REST / bot workers when rate limits or shard count demand it
3. **Migration guides** — [piece-based layouts and native stacks](/migration/) without renaming your entire tree
4. **Room to grow** — sequences, signals, chron, desired properties, and vault-backed config without forking the framework

## Who Stambha is for

**Good fit**

- Teams moving from a piece-based bot to a native stack while keeping folder structure
- New bots that want process split from day one without discord.js in every process
- Bots that need typed guild config *and* a real database for domain data

**Less ideal**

- Drop-in replacement for every third-party plugin from another ecosystem (use core features + [Stambha-plugins](https://github.com/Mivaya/Stambha-plugins) instead)
- Split stack where discord.js owns the gateway and another layer owns commands — use the [native bootstrap](/guide/getting-started) path
- Single-file bots with no interest in pieces or deployment shape — a minimal discord.js script may be simpler

## Next steps

- [Getting started](/guide/getting-started) — minimal native bot (or `pnpm demo` in `examples/bot`)
- [Architecture](/guide/architecture) — event flow through the native stack
- [Project structure](/guide/project-structure) — folders and `PiecePaths`
- [Pieces & pipeline](/guide/pieces) — how registries and the pipeline fit together
