# Known gaps

What Stambha **does not** ship yet — and where to go instead. For shipped work, see the [Changelog](https://github.com/Mivaya/Stambha/blob/main/CHANGELOG.md), [What's new in 1.4.0](/guide/whats-new-1.4), [Getting started](/guide/getting-started), and [Components & embeds](/features/components).

---

## Still open

| Gap | Notes |
| --- | ----- |
| Slash name/description localizations | Deploy-time locale maps |
| Prefix flags + prompt/retry | Interactive prefix parsing improvements |
| Desired-properties naming | Stambha metaphor vs older Discord payload naming |
| Session hooks / token refresh | `@stambha/api` |
| Hub `shardDisconnect` / resume events | Core follow-up |
| Channel obfuscation HTTP omission | Gateway helpers ship; HTTP `GET …/channels` omits inaccessible channels from **2026-11-16** — test with Identify `capabilities` |
| Hot reload in dev | Planned `@stambha/dev-reload` |
| Hosted admin dashboard UI | Out of core — HTTP settings via [`@stambha/api`](/extensions/api) |
| Entity cache layer | Opt-in Guild/Channel/Member stores |
| Voice connect package | Not in core — use a Discord voice library against typed `voiceServerUpdate` |
| Attachment content-scan flags typing | Planned 1.5 (`API-content-scan-flags`) |
| Invite target-user REST | Planned 1.5 |
| Audit CHANNEL/ROLE_POSITION_UPDATE | Planned 1.5 |
| OAuth redirect `iss` (RFC 9207) in `@stambha/api` | Planned 1.5 |

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
| A third-party client owning the gateway while Stambha only owns commands | Full [native bootstrap](/guide/getting-started) |
| Library shape adapters in `@stambha/transform` | Removed — [native migration](/migration/) only |
| `PanelBuilder` / `panel()` in core | `ContainerBuilder` + `componentsV2`, or [`@stambha/display`](/extensions/display) |
| Editing a poll message after create | [Create / end poll](/features/polls) APIs only |

---

## Documentation follow-ups

| Topic | Note |
| ----- | ---- |
| Operator recipes (Docker / PM2) | Process model in [Deployment overview](/deployment/overview) and [Tier split](/deployment/tier-split) |
| Dedicated testing guide | `examples/bot` `pnpm demo`; Vault via [`MemoryDriver`](/features/vault); [`examples/minimal`](/guide/examples) |
| i18n / localization guide | Slash localizations still open — deploy-time locale maps when you add them |

---

## Related

- [Examples by scale](/guide/examples)
- [Pipeline mental model](/guide/mental-model)
- [Vault and your ORM](/guide/vault-and-orm)
- [API Reference](/api/)
- [Changelog](https://github.com/Mivaya/Stambha/blob/main/CHANGELOG.md)
