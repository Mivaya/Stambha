# Known gaps

What Stambha **does not** ship yet — and where to go instead. For what *is* ready in **1.3.0**, see the [Changelog](https://github.com/Mivaya/Stambha/blob/main/CHANGELOG.md), [What's new in 1.3.0](/guide/whats-new-1.3), [Getting started](/guide/getting-started), [Components & embeds](/features/components), and the [project board](https://github.com/orgs/Mivaya/projects/2).

---

## Shipped in 1.3.0 (no longer gaps)

These were open after **1.2.1** and are **closed** on the 1.3.0 release train:

| Topic | Notes |
|-------|--------|
| Declarative command gates | `cooldown`, `runIn`, permissions on `Command` options |
| Hybrid args + help + lifecycle | `@stambha/args`, `@stambha/help`, `onLoad` / `onCommandError` |
| Kind hooks / subcommand methods | `slash` / `prefix` / `menu`, `subcommandMethods` |
| Entity select builders | `userSelect` / `roleSelect` / `mentionableSelect` / `channelSelect` |
| Components V2 + classic embeds | Builders + `EmbedView` / `ContainerView` |
| TS interface augmentation | [TypeScript augmentation](/features/typescript-augmentation) |
| REST/Gateway correctness docs | [Correctness](/deployment/correctness) |
| Capability ⊕ permission composition | [Capabilities](/features/capabilities#capability-permission-composition) |

| G3 tiers 2–4 + `GatewayEventMap` + G1 reshard | CamelCase expansion; `dispatchNormalize: 'raw'` escape hatch |
| Native-only transform | discord.js / Discordeno shape adapters **removed** |
| User-install contexts, polls, SKUs, HTTP interactions | Platform DX on core REST/gateway |
| Collectors, typing, `fetchApplication` | Gateway/REST helpers |
| Capabilities authz | `@stambha/authz` |

---

## Still open in core / plugins (post-1.3)


| Gap | Status | Notes |
| --- | ------ | ----- |
| Slash name/description localizations | Core (**F2**) | Deploy-time locale maps |
| `create-stambha` scaffolder | Core/ops (**F3**) | Project generator |
| Prefix flags + prompt/retry | Core (**F7**) | Revisits WONT-prompting with an ADR |
| Desired-properties rename | Core (**F9**) | Stambha metaphor vs Discordeno naming |
| Embed→Container migration / Managers | Plugins (**EPIC-DISPLAY**) | Former `panel()` DX in `@stambha/display` |
| Shared Redis cache across workers | Plugins | [`@stambha/cache-redis`](/extensions/cache#redis-shared-workers) (**A1**) |
| Redis cooldown driver package | Plugins | Async store in core; driver (**A2**) |
| Hot reload in dev | Plugins | Planned `@stambha/dev-reload` |
| Hosted admin dashboard UI | Out of core | HTTP settings via [`@stambha/api`](/extensions/api) |
| Entity cache layer | Epic (**EPIC-ENTITIES**) | Opt-in Guild/Channel/Member stores |
| Voice package | Plugins (**VOICE**) | Not in core (WONT-voice) |


---

## Deferred to 2.0


| ID | Gap |
| -- | --- |
| **D1** | Automatic `runSequence` orchestration (today: `sequence()` + Signal wiring) |
| **A3** | RabbitMQ / distributed worker bus |
| **D2** | Distributed Chron across workers |
| **G2** | Gateway proxy for zero-downtime deploys |


---

## Hard boundaries (by design)


| Not supported | Do this instead |
| ------------- | --------------- |
| discord.js (or Discordeno) owning the gateway while Stambha only owns commands | Full [native bootstrap](/guide/getting-started) |
| Library shape adapters in `@stambha/transform` | Removed in 1.3.0 — native stack only ([ADR 005](/decisions/005-native-only-migration)) |
| `PanelBuilder` / `panel()` in core | `ContainerBuilder` + `componentsV2`, or future `@stambha/display` |
| Editing a poll message after create | [Create / end poll](/features/polls) APIs only |


---

## Docs / product follow-ups


| Topic | Note |
| ----- | ---- |
| **1.3.0 doc archive** | Planned for **1.3.1** release — `pnpm docs:archive 1.3.0 f325f54` ([hosting guide](https://github.com/mivaya/Stambha/blob/main/docs/guide/hosting-the-docs.md)) |
| Extension peer matrix | Updated on latest docs for core **^1.3.0** — see [Extensions](/extensions/) |
| Live shard reconnect after reshard plan | [Resharding](/deployment/resharding) — reconnect loop stays in your worker |
| Interaction fan-out on tier-split | Bot worker must receive every `interactionCreate` — [Tier split](/deployment/tier-split) |


---

## Related

- [Examples by scale](/guide/examples) — minimal → basic → bot → bigbot + http-interactions
- [Vault and your ORM](/guide/vault-and-orm) — settings vs relational domain
- [Deployment overview](/deployment/overview) — monolith vs tier-split
- [Changelog](https://github.com/Mivaya/Stambha/blob/main/CHANGELOG.md) — shipped releases
