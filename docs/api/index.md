---
layout: doc
---

# API reference

Generated TypeScript docs for **`@stambha/*`**. This is the signature layer — options, classes, and return types. For install and first-bot steps, switch to **Guide** (`Getting started`).

## Start here

| Task | Jump |
|------|------|
| Create the client | [`createStambhaBot`](/api/core/functions/createStambhaBot) |
| Write a command | [`Command`](/api/core/classes/Command) · [`CommandOptions`](/api/core/interfaces/CommandOptions) |
| Load `src/commands` | [`loadPieces`](/api/loader/functions/loadPieces) |
| Attach gateway | [`attachStambhaClient`](/api/gateway/functions/attachStambhaClient) |
| Discord REST | [`createNativeRestPort`](/api/rest/functions/createNativeRestPort) |
| Guild settings | [`Vault`](/api/vault/classes/Vault) · [`defineBlueprint`](/api/vault/functions/defineBlueprint) |
| Cooldowns / permissions | [`@stambha/gates`](/api/gates/) |
| Staff capabilities | [`@stambha/authz`](/api/authz/) |
| Prefix / slash args | [`@stambha/args`](/api/args/) |

## Packages

| Package | Use it for |
|---------|------------|
| [`@stambha/core`](/api/core/) | Client, pipeline, registries, components |
| [`@stambha/loader`](/api/loader/) | Disk auto-load for pieces |
| [`@stambha/gates`](/api/gates/) | Cooldowns, permissions, channel checks |
| [`@stambha/vault`](/api/vault/) | Typed config documents |
| [`@stambha/rest`](/api/rest/) | Discord HTTP, slash deploy, rate limits |
| [`@stambha/gateway`](/api/gateway/) | Shards, event hub, collectors |
| [`@stambha/transform`](/api/transform/) | Gateway payloads → `StambhaMessage` / `StambhaInteraction` |
| [`@stambha/args`](/api/args/) | Prefix lexer and slash option accessors |
| [`@stambha/authz`](/api/authz/) | Named capability grants / denies |
| [`@stambha/plugins`](/api/plugins/) | Plugin lifecycle and container |
| [`@stambha/help`](/api/help/) | Help catalog helpers |
| [`@stambha/transport`](/api/transport/) | Session, route keys, rate-limit model |

Optional add-ons from [Stambha-plugins](https://github.com/Mivaya/Stambha-plugins) (`@stambha/api`, pagination, cache, metrics, vault-sql) are documented under [Extensions](/extensions/) in Guide mode.

## How to read a symbol page

Each package index lists **classes**, **functions**, **interfaces**, and **type aliases**. Open a symbol for parameters, defaults, and source links on GitHub.

Tutorial context lives in the Guide — for example [Pieces & pipeline](/guide/pieces) pairs with [`Command`](/api/core/classes/Command), and [Vault](/features/vault) pairs with [`Vault`](/api/vault/classes/Vault).
