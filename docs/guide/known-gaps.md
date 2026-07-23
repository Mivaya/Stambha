# Known gaps

What Stambha **does not** ship yet — and where to go instead. For a feature inventory of what *is* ready, see [Getting started](/guide/getting-started), [Examples by scale](/guide/examples), and the [project board](https://github.com/orgs/Mivaya/projects/2).

---

## Still open in core (1.x / plugins)


| Gap                               | Status      | Notes                                                                                                                                     |
| --------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Shared Redis cache across workers | Plugins     | `[@stambha/cache-redis](/extensions/cache#redis-shared-workers)` in [Stambha-plugins](https://github.com/Mivaya/Stambha-plugins) (**A1**) |
| Shared Redis cooldown store       | Plugins     | Async `CooldownStore` in core; Redis driver planned (**A2**)                                                                              |
| Hosted admin dashboard UI         | Out of core | HTTP settings already in `[@stambha/api](/extensions/api)`; SPA is a separate product                                                     |
| Hot reload in dev                 | Plugins     | Planned `@stambha/dev-reload`                                                                                                             |


---



## Deferred to 2.0


| ID     | Gap                                                                                    |
| ------ | -------------------------------------------------------------------------------------- |
| **D1** | Automatic `runSequence` orchestration (today: build with `sequence()` + Signal wiring) |
| **A3** | RabbitMQ / distributed worker bus                                                      |
| **D2** | Distributed Chron across workers                                                       |
| **G2** | Gateway proxy for zero-downtime deploys                                                |


---



## Hard boundaries (by design)


| Not supported                                                                  | Do this instead                                         |
| ------------------------------------------------------------------------------ | ------------------------------------------------------- |
| discord.js (or Discordeno) owning the gateway while Stambha only owns commands | Full [native bootstrap](/guide/getting-started)         |
| Numeric style permission levels                                                | `[@stambha/authz](/features/capabilities)` capabilities |
| Editing a poll message after create                                            | [Create / end poll](/features/polls) APIs only          |


---



## Docs / product follow-ups


| Topic                                   | Note                                                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Versioned doc archives                  | Snapshots under `docs/versions/`; cut a new archive when you publish the next minor                           |
| Live shard reconnect after reshard plan | [Resharding](/deployment/resharding) plans + identify budget are in core; reconnect loop stays in your worker |
| Interaction fan-out on tier-split       | Bot worker must receive every `interactionCreate` — see [Tier split](/deployment/tier-split)                  |


---



## Related

- [Examples by scale](/guide/examples) — minimal → basic → advanced → bigbot
- [Deployment overview](/deployment/overview) — monolith vs tier-split
- [Changelog](https://github.com/Mivaya/Stambha/blob/main/CHANGELOG.md) — shipped releases

