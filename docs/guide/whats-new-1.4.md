# What's new in 1.4.0

Adoption minor: scaffolder / bootstrap / sequences plus DX surface and Discord API helpers. Core **version bump / npm tag** stays `REL-1.4.0` (separate release PR).

## Included for the 1.4 tag

| Area | What |
|------|------|
| Scaffolder | `pnpm create stambha` (`create-stambha`) |
| Bootstrap | `bootstrapNativeBot` happy path |
| Sequences | `runSequence` orchestration |
| Vault docs | vault-sql onboarding + Redis hygiene |
| Gateway / REST | Request Guild Members `rateLimited`, guilds `shard` query, channel obfuscation helpers, sorted integration/contexts |
| Format | Message helpers (`userMention`, `time`, `codeBlock`, …) from `@stambha/core` |
| Attachments | `AttachmentBuilder` + multipart `files` on REST requests |
| Piece DX | `defineCommand({ … })` options-first factory |
| Display | [`@stambha/display`](/extensions/display) — EmbedManager / ContainerManager + embed→container |
| Modals | Label (18), File Upload, Radio/Checkbox Group, Checkbox builders |
| REST surface | Member/role guild & channel permissions, role member counts, activity instance, `sendVoiceMessage` |
| Deploy | `deployCommands({ onBulkOverwrite })` hook |
| Docs | [Pipeline mental model](/guide/mental-model) |

## Docs rules

- Product pages describe **Stambha** and the **Discord API**.
- Dedicated [migration](/migration/) guides stay the place for “coming from another stack” detail.

## Next steps

- [Known gaps](/guide/known-gaps) — remaining open items only
- [Getting started](/guide/getting-started)
- [REST surface](/features/rest-surface)
- [Slash deploy](/deployment/slash-deploy)
