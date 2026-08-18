---
layout: doc
---

# API Reference

TypeScript API documentation for **`@stambha/*`** packages — separate from the narrative [Guide](/guide/getting-started). Use the **Guide | API** switcher in the navbar to move between them.

## Packages

| Package | Summary |
|---------|---------|
| [`@stambha/core`](/api/core/) | Client, command pipeline, registries, components |
| [`@stambha/loader`](/api/loader/) | Auto-load commands, gates, hooks, and other pieces |
| [`@stambha/gates`](/api/gates/) | Cooldowns, permissions, channel-type checks |
| [`@stambha/vault`](/api/vault/) | Blueprint, Ledger, Record, drivers |
| [`@stambha/rest`](/api/rest/) | Discord REST client, deploy helpers, rate limits |
| [`@stambha/gateway`](/api/gateway/) | WebSocket shards, event hub, collectors |

Additional packages (`@stambha/transform`, `@stambha/args`, `@stambha/authz`, …) are documented in the [transport map](/reference/transport) and feature guides until their reference pages are added.

## How to read these pages

Each package index lists **classes**, **functions**, **interfaces**, and **type aliases** extracted from source. Symbol pages include signatures, parameters, and links to related types.

For tutorials and architecture, switch to **Guide** mode — start at [Getting started](/guide/getting-started).

## Switch modes

- **Desktop** — **Guide | API** pill in the top bar
- **Mobile** — floating button (bottom-right) opens the mode drawer

Your last selected mode is stored in the browser (`stambha-docs-mode`).
