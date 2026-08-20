---
layout: home

hero:
  name: Stambha
  text: Discord bots. Native. Scalable.
  tagline: Piece-based commands in TypeScript — native gateway and REST, no discord.js required.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Why Stambha
      link: /guide/why-stambha
    - theme: alt
      text: View on GitHub
      link: https://github.com/mivaya/Stambha

features:
  - title: Commands, organized
    details: Familiar folders — commands, gates, signals, hooks — loaded from disk. Slash, prefix, and @mention in one Command class, with optional kind hooks and Components V2 builders.
  - title: Scale on your terms
    details: One process today. Split gateway, REST, and bot workers tomorrow — same pipeline.
  - title: Native REST & gateway
    details: Centralized rate limits and WebSocket shards via @stambha/rest and @stambha/gateway — no discord.js in your hot path.
  - title: Vault
    details: Typed guild, user, and member config alongside your ORM — prefixes, flags, and module toggles without a second schema.
  - title: Sequences & signals
    details: Multi-step flows and button/modal/select routing without boilerplate state machines.
  - title: Extensions
    details: Optional pagination, HTTP API, cache, metrics, and Vault SQL from Stambha-plugins — independent 1.0.0+ line, peers on core **^1.3.0**.
---

## Try it now

```bash
cd examples/basic && pnpm install && pnpm demo
```

No Discord token required — small Discord-shaped bot, real pipeline. Feature-complete demo: `examples/bot`. Scale matrix: [Examples by scale](/guide/examples). Walkthrough: [Getting started](/guide/getting-started).

## Quick install

```bash
pnpm add @stambha/core @stambha/rest @stambha/gateway @stambha/transform @stambha/loader
```

Requires **Node.js 20+**. Samples: [`examples/basic`](https://github.com/mivaya/Stambha/tree/main/examples/basic) → [`examples/bot`](https://github.com/mivaya/Stambha/tree/main/examples/bot) → [`examples/bigbot`](https://github.com/mivaya/Stambha/tree/main/examples/bigbot) · serverless: [`examples/http-interactions`](https://github.com/mivaya/Stambha/tree/main/examples/http-interactions).

## Migrating?

Coming from another bot stack? See [migration guides](/migration/) — use the native stack (`@stambha/rest`, `@stambha/gateway`, `@stambha/transform`).