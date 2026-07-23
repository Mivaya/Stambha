# Examples by scale

Pick an example that matches the bot you’re building. All paths are under [`examples/`](https://github.com/Mivaya/Stambha/tree/main/examples) in the monorepo. **Each example is self-contained** — you can copy a single folder (e.g. only `bigbot`) without the others.

## Scale matrix

| Scale | Example | Discord token? | What you learn |
|-------|---------|----------------|----------------|
| **Smoke / CI** | [`minimal`](https://github.com/Mivaya/Stambha/tree/main/examples/minimal) | No | Pipeline + `MockBridge` + one command |
| **Basic** | [`basic`](https://github.com/Mivaya/Stambha/tree/main/examples/basic) | Optional (`DEMO=1`) | Native gateway + REST, loader, ping/say, slash deploy |
| **Advanced** | [`bot`](https://github.com/Mivaya/Stambha/tree/main/examples/bot) | Optional (`pnpm demo`) | Full piece layout — vault, authz, signals, polls, Components V2, monetization, chron |
| **Enterprise / bigbot** | [`bigbot`](https://github.com/Mivaya/Stambha/tree/main/examples/bigbot) | Yes (for live) | Self-contained tier-split workers, desired properties, scale checklist |
| **Serverless slash** | [`http-interactions`](https://github.com/Mivaya/Stambha/tree/main/examples/http-interactions) | Optional (`pnpm demo`) | Interactions Endpoint URL — no WebSocket |

```text
minimal  →  basic  →  bot (advanced)  →  bigbot
 mock        monolith     feature-complete     multi-process + scale

http-interactions  —  slash / components only (serverless / Workers)
```

## Which should I clone?

1. **Learning the pipeline only** → `examples/minimal`
2. **First real Discord bot** → `examples/basic`
3. **Production features (gates, vault, UI)** → `examples/bot`
4. **Rate-limit isolation / many guilds** → `examples/bigbot` + [Tier split](/deployment/tier-split) + [Resharding](/deployment/resharding)
5. **Slash-only / serverless (no gateway)** → `examples/http-interactions` + [HTTP interactions](/deployment/http-interactions)

## Feature coverage (advanced bot)

The [`examples/bot`](https://github.com/Mivaya/Stambha/tree/main/examples/bot) package is the **reference implementation**. It already demos:

| Area | Demo |
|------|------|
| Commands | Prefix + slash, hybrid args, help |
| Authz | `@stambha/authz` capabilities + Vault claims (`setcap`, `purge`) |
| Gates / barriers | Owner gate, Discord bits, entitlements, maintenance |
| UI | Signals, persistent selects, Components V2 panel, polls |
| Config | Vault guild blueprint |
| Lifecycle | Hooks, scouts, conduits, epilogues, chron task, plugins |
| Deploy | Slash deploy on ready + `deploy:dry-run` |
| Split | `pnpm split:rest` / `split:bot` / `split:gateway` |
| Monetization | Premium SKU / entitlement gate demos |
| Install contexts | User-installable / interaction context options on commands |

## Mapping bot size → stack

| You are building… | Start here | Add when needed |
|-------------------|------------|-----------------|
| Learning / unit tests | `minimal` | — |
| Personal / few servers | `basic` | args, gates |
| Community / product bot | `bot` | vault, authz, signals, polls, plugins |
| Large / multi-process | `bigbot` | tier-split, desired properties, reshard |
| Enterprise fleet | `bigbot` + plugins | Redis cache, metrics, vault-sql, HTTP API |
| Slash-only serverless | [`http-interactions`](https://github.com/Mivaya/Stambha/tree/main/examples/http-interactions) | — |

## Tier-split quick path

From **bigbot** or **bot**:

```bash
# three terminals
pnpm split:rest
pnpm split:bot
pnpm split:gateway
```

Details: [Tier split](/deployment/tier-split), [Native REST](/deployment/native-rest), [Deployment overview](/deployment/overview).

## Serverless / HTTP-only

```bash
cd examples/http-interactions && pnpm install && pnpm demo
```

Live endpoint: `pnpm start` + HTTPS tunnel → Discord **Interactions Endpoint URL**. Guide: [HTTP interactions](/deployment/http-interactions).

## Related

- [Getting started](/guide/getting-started)
- [Project structure](/guide/project-structure)
- [Known gaps](/guide/known-gaps) — what is still missing
