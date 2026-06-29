# Slash command deploy

Register application commands with {@link @stambha/rest!deployCommands}. In **sharded** bots, only **one** process should deploy (shard **0**) to avoid rate limits and races.

---

## Shard 0 only (N5)

| Topology | Who deploys | When |
|----------|-------------|------|
| **Monolith** (one process, native gateway) | Shard 0 | On `ready` from gateway |
| **Multi-process** (`SHARD_ID` per child) | Process where `SHARD_ID=0` | After gateway ready |
| **Tier split** (gateway + bot worker) | **Bot worker** once at startup | After `loadPieces` — not gateway shards |
| **CI / scripts** | N/A | `dryRun: true` — no Discord `PUT` |

### Helpers (`@stambha/rest`)

```ts
import {
  deployCommands,
  deployCommandsIfShardZero,
  shouldDeploySlashCommands,
  resolveShardIdFromEnv,
  formatDeployDiff,
} from "@stambha/rest";

if (shouldDeploySlashCommands({ shardId: resolveShardIdFromEnv() })) {
  const result = await deployCommands({
    token: process.env.DISCORD_TOKEN!,
    applicationId: process.env.DISCORD_APPLICATION_ID!,
    commands: client.registries.commands.values(),
    guildId: process.env.DISCORD_GUILD_ID, // omit for global
    diff: true,
  });
  if (result.diff) console.log(formatDeployDiff(result.diff));
}
```

Or use {@link deployCommandsIfShardZero} — returns `null` when not shard 0.

### Environment

| Variable | Purpose |
|----------|---------|
| `DISCORD_APPLICATION_ID` | Application id for REST routes |
| `DISCORD_GUILD_ID` | Guild-scoped deploy (dev); omit for global |
| `SHARD_ID` / `SHARD` | Current process shard; only `0` deploys |
| `SKIP_SLASH_DEPLOY=1` | Disable deploy in this process |

### Monolith example (`examples/bot`)

```ts
hub.once("ready", () => {
  void deployExampleSlashCommands(client, { shardId: 0 });
});
await gateway.connect();
```

### Tier split

Gateway workers **do not** deploy. The bot worker deploys once:

```ts
await deployExampleSlashCommands(client, { force: true });
```

See `examples/bot/src/workers/bot.ts`.

---

## Dry-run & diff (N6)

Validate payloads in CI without a Discord token:

```ts
const result = await deployCommands({
  token: "unused",
  applicationId: "0",
  commands: client.registries.commands.values(),
  dryRun: true,
  diff: true,
  existing: [], // or a saved snapshot for offline diff
});
console.log(formatDeployDiff(result.diff!));
```

### CI

GitHub Actions runs the example bot dry-run after tests:

```bash
pnpm --filter @stambha/example-bot deploy:dry-run
```

Locally:

```bash
cd examples/bot && pnpm deploy:dry-run
```

### Live deploy with diff

When `dryRun` is false and `diff: true`, existing commands are fetched from Discord before `PUT`:

```ts
await deployCommands({
  token,
  applicationId,
  commands: client.registries.commands.values(),
  diff: true,
});
// result.diff → { added, removed, updated } command names
```

Pass `existing: [...]` to diff against a snapshot without network (useful in CI).

---

## Related

- [Command tree](/features/command-tree) — slash metadata on `Command`
- [Native REST](/deployment/native-rest) — REST worker for tier split
- [Gateway](/deployment/gateway) — shard ready / `SHARD_ID`