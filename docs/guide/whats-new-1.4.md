# What's coming in 1.4.0

Planning page for the **1.4** adoption minor. Shipped pieces already on `main` are listed under [Known gaps — Shipped since 1.3](/guide/known-gaps#shipped-since-1.3-extensions--1.4). Remaining Sprint Ready work is tracked on the project board (catalog: `scripts/kanban/catalog.mjs`).

## Already on main (pre-tag)

| Area | What |
|------|------|
| Scaffolder | `pnpm create stambha` (`create-stambha`) |
| Bootstrap | `bootstrapNativeBot` happy path |
| Sequences | `runSequence` orchestration |
| Vault docs | vault-sql onboarding + Redis hygiene |
| Gateway / REST | Request Guild Members `rateLimited`, guilds `shard` query, channel obfuscation helpers, sorted integration/contexts |

## Sprint Ready for the 1.4 tag

| Area | Packages / docs |
|------|-----------------|
| Display DX | `@stambha/display` — managers + embed→container migration |
| Format / attach | `@stambha/format`, `AttachmentBuilder` |
| Piece DX | Options-first / factory Command registration |
| Docs | First-hour pipeline concept map |
| Modals | Label / radio / checkbox builders |
| Discord API surface | Voice messages, role member counts, activity instance, permission helpers |
| Deploy | Bulk-overwrite hook for slash registry PUT |

## Docs rules for this release

- Product pages describe **Stambha** and the **Discord API**.
- Dedicated [migration](/migration/) guides stay the place for “coming from another stack” detail.
- Prefer Discord’s component and REST names in examples (`ContainerBuilder`, `Label`, …).

## Next steps

- [Known gaps](/guide/known-gaps) — planned vs deferred
- [Getting started](/guide/getting-started) — scaffolder + bootstrap
- [Sequences](/features/sequences) — `runSequence`
