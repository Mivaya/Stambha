# Known gaps

What Stambha **does not** ship yet — and where to go instead. For what *is* ready in **1.3.0**, see the [Changelog](https://github.com/Mivaya/Stambha/blob/main/CHANGELOG.md), [What's new in 1.3.0](/guide/whats-new-1.3), [Getting started](/guide/getting-started), and [Components & embeds](/features/components).

---

## Shipped in 1.3.0 (no longer gaps)

These were open after **1.2.1** and are **closed** on the 1.3.0 release:

| Topic | Notes |
|-------|--------|
| Declarative command gates | `cooldown`, `runIn`, permissions on `Command` options |
| Hybrid args + help + lifecycle | `@stambha/args`, `@stambha/help`, `onLoad` / `onCommandError` |
| Kind hooks / subcommand methods | `slash` / `prefix` / `menu`, `subcommandMethods` |
| Entity select builders | `userSelect` / `roleSelect` / `mentionableSelect` / `channelSelect` |
| Components V2 + classic embeds | Builders + `EmbedView` / `ContainerView` |
| TypeScript augmentation | [TypeScript augmentation](/features/typescript-augmentation) |
| REST & Gateway correctness docs | [Correctness](/deployment/correctness) |
| Capability ⊕ permission composition | [Capabilities](/features/capabilities#capability-permission-composition) |
| Gateway dispatch tiers + typed event map | CamelCase hub payloads; `dispatchNormalize: 'raw'` escape hatch |
| Native-only transform | discord.js / Discordeno shape adapters **removed** |
| User-install contexts, polls, SKUs, HTTP interactions | Platform DX on core REST/gateway |
| Collectors, typing, `fetchApplication` | Gateway/REST helpers |
| Capabilities authz | `@stambha/authz` |
| Auto resharding threshold | [Resharding](/deployment/resharding) monitor APIs |

---

## Still open in core / plugins (post-1.3)


| Gap | Notes |
| --- | ----- |
| Slash name/description localizations | Deploy-time locale maps |
| `create-stambha` scaffolder | Project generator CLI (1.4 — see F3) |
| Prefix flags + prompt/retry | Interactive prefix parsing improvements |
| Desired-properties naming | Stambha metaphor vs legacy Discordeno naming |
| Embed→Container migration helpers | Former `panel()` DX in planned `@stambha/display` plugin |
| Shared Redis cache on npm | Code in Stambha-plugins — **awaiting A1 publish** of [`@stambha/cache-redis`](/extensions/cache#redis-shared-workers) |
| Hot reload in dev | Planned `@stambha/dev-reload` |
| Hosted admin dashboard UI | Out of core — HTTP settings via [`@stambha/api`](/extensions/api) |
| Entity cache layer | Opt-in Guild/Channel/Member stores |
| Voice package | Not in core — use Discord voice libraries directly if needed |


---

## Shipped since 1.3 (extensions / 1.4)

| Topic | Notes |
| ----- | ----- |
| Redis cooldown store | [`@stambha/cooldown-redis`](https://github.com/Mivaya/Stambha-plugins/tree/main/packages/cooldown-redis) on npm — [Gates](/features/gates) |
| `runSequence` orchestration | Lands with **D1** / 1.4 — [Sequences](/features/sequences) |


---

## Deferred to 2.0


| Gap |
| --- |
| RabbitMQ / distributed worker bus |
| Distributed Chron across workers |
| Gateway proxy for zero-downtime deploys |


---

## Hard boundaries (by design)


| Not supported | Do this instead |
| ------------- | --------------- |
| discord.js (or Discordeno) owning the gateway while Stambha only owns commands | Full [native bootstrap](/guide/getting-started) |
| Library shape adapters in `@stambha/transform` | Removed in 1.3.0 — [native migration](/migration/) only |
| `PanelBuilder` / `panel()` in core | `ContainerBuilder` + `componentsV2`, or future `@stambha/display` |
| Editing a poll message after create | [Create / end poll](/features/polls) APIs only |


---

## Documentation follow-ups


| Topic | Note |
| ----- | ---- |
| Version archive for 1.3.0 | Shipped in **1.3.1** — use the version dropdown |
| More API packages | `@stambha/transform`, `@stambha/args`, `@stambha/authz` — see [API overview](/api/) |
| Live shard reconnect after reshard plan | [Resharding](/deployment/resharding) — reconnect loop stays in your worker |
| Interaction fan-out on tier-split | Bot worker must receive every `interactionCreate` — [Tier split](/deployment/tier-split) |


### Not in 1.3.1 (explicit deferrals)

These leftover guide topics stay out of this patch — use the pointers below until dedicated pages land:

| Topic | Status | Use instead |
| ----- | ------ | ----------- |
| Dedicated testing guide | **Deferred** — not in 1.3.1 | `examples/bot` `pnpm demo` (demo REST stub); Vault unit tests via [`MemoryDriver`](/features/vault); smoke with [`examples/minimal`](/guide/examples) |
| Operator recipes (Docker / PM2) | **Deferred** — not in 1.3.1 | Process model in [Deployment overview](/deployment/overview) and [Tier split](/deployment/tier-split); host the VitePress site via [Hosting the docs](/guide/hosting-the-docs) (contributor) |
| `create-stambha` scaffolder docs | **Deferred** (scaffolder itself is a core gap) | Copy [`examples/basic`](/guide/examples) or [`examples/bot`](/guide/examples) |
| i18n / localization guide | **Deferred** (slash localizations still open) | Discord deploy-time locale maps when you add them yourself |


---

## Related

- [Examples by scale](/guide/examples) — minimal → basic → bot → bigbot + http-interactions
- [Vault and your ORM](/guide/vault-and-orm) — settings vs relational domain
- [API Reference](/api/) — generated TypeScript docs
- [Deployment overview](/deployment/overview) — monolith vs tier-split
- [Changelog](https://github.com/Mivaya/Stambha/blob/main/CHANGELOG.md) — shipped releases
