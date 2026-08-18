---
layout: doc
---

# API Reference

Generated **TypeScript API documentation** for `@stambha/*` packages — separate from the narrative [Guide](/guide/getting-started), reachable via the **Guide / API** switcher in the navbar.

## Status

**Phase 0** — sidebar structure and mode switcher are live. Symbol pages below are **placeholders** until [TypeDoc](https://typedoc.org/) is wired in CI (`DOCS-api-reference`).

## Packages (planned)

| Package | Role |
|---------|------|
| [`@stambha/core`](/api/core/command) | Client, command pipeline, registries |
| [`@stambha/loader`](/api/loader/load-pieces) | Auto-load pieces from disk |
| [`@stambha/gates`](/api/gates/overview) | Cooldowns, permissions, channel checks |
| [`@stambha/vault`](/api/vault/vault) | Blueprint, Ledger, Record |
| [`@stambha/rest`](/api/rest/create-native-rest-port) | Discord REST client |
| [`@stambha/gateway`](/api/gateway/attach-stambha-client) | WebSocket shards, event hub |
| [`@stambha/transform`](/reference/transport) | Payload normalization |
| [`@stambha/args`](/reference/transport) | Prefix/slash argument parsing |
| [`@stambha/authz`](/features/capabilities) | Capability gates |

Until generation ships, use [Transport map](/reference/transport), package READMEs on [GitHub](https://github.com/mivaya/Stambha/tree/main/packages), and feature guides under **Guide** mode.

## Switch modes

- **Desktop** — **Guide | API** pill in the top bar  
- **Mobile** — floating button (bottom-right) opens the mode drawer  

Your last mode is stored in `localStorage` (`stambha-docs-mode`).
