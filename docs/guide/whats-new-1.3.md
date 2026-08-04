# What's new in 1.3.0

Release tag: **`v1.3.0`**. Full notes: [CHANGELOG](https://github.com/Mivaya/Stambha/blob/main/CHANGELOG.md#130---2026-08-04). Gaps that remain: [Known gaps](/guide/known-gaps).

## Pick your upgrade path

| If you… | Do this |
|---------|---------|
| Only use slash/prefix commands + classic buttons | Update deps to `@stambha/*@1.3.0`; skim [kind hooks](/guide/getting-started#kind-hooks-optional) |
| Listen on `hub.on` for guild/member/invite/… events | Confirm camelCase fields for **dispatch tiers 2–4**, or keep `dispatchNormalize: 'raw'` briefly |
| Imported discord.js/Discordeno helpers from `@stambha/transform` | **Remove them** — adapters are gone; use [native bootstrap](/guide/getting-started) |
| Used `panel()` / `PanelBuilder` | Switch to [`ContainerBuilder` + `componentsV2`](/features/components) |
| Build Components V2 UIs | Read [Components & embeds](/features/components) (V2 mode ≠ Container) |

## Feature map (since 1.2.1)

```text
1.3.0
├── Command DX ………… kind hooks, subcommandMethods, declarative gates, help, args, lifecycle, plugins
├── UI ………………… classic + entity selects, Components V2 builders, Embed/Container Views
├── Authz …………… @stambha/authz capabilities (+ capability ⊕ permission docs)
├── Gateway ……… camelCase tiers 2–4, GatewayEventMap, auto-reshard, collectors, HTTP interactions
├── REST …………… typing, fetchApplication, polls, SKUs, scheduled events / automod / soundboard
├── Docs …………… TS augmentation, REST/Gateway correctness map
└── Harden ……… global RL, route keys, Cloudflare guard, resume / identify / backfill
```

## Publish checklist (maintainers)

```bash
pnpm build && pnpm test && pnpm lint && pnpm typecheck
pnpm docs:archive 1.3.0 $(git rev-parse HEAD)
git tag v1.3.0 && git push origin v1.3.0
# Publish GitHub Release for the tag (required for npm CI) — do not leave as draft
```

See [.github/PUBLISHING.md](https://github.com/Mivaya/Stambha/blob/main/.github/PUBLISHING.md).
