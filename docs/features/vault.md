# Vault (`@stambha/vault`)

**Ledger → Blueprint → Record** — typed persistence for **bot config and bot-shaped data**, not a replacement for Prisma or your domain ORM.

## Why Vault exists (alongside an ORM)

Many production bots already use **Prisma, Drizzle, or SQL** for economy, quests, achievements, and analytics. Stambha still ships Vault because that stack does **not** solve the same problem:


| Problem                                          | Without Vault                                   | With Vault                                        |
| ------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------- |
| Guild prefix, module toggles, log channels       | Custom `GuildConfig` table + validation + cache | Blueprint + `record.get` / `set`                  |
| Per-guild settings (`prefix`, channels, toggles) | Custom tables + validation + cache              | Ledgers + drivers                                 |
| Dashboard editing config                         | Ad-hoc JSON routes                              | Typed blueprints + [`@stambha/api`](/extensions/api) OAuth settings routes (bring your own UI) |
| Permission level overrides per guild             | Hardcoded or extra SQL columns                  | Guild blueprint + `@stambha/levels`               |
| Tests without Postgres                           | Mock Prisma or spin up DB                       | `MemoryDriver`                                    |
| Split-tier workers sharing config                | In-memory Maps or custom Redis glue             | Shared Vault driver (SQL / Redis)                 |


**Use Vault** for settings-shaped and bot-shaped documents (guild, user, member, feature flags).  
**Use your ORM** for heavy relational domain (transactions, quest graphs, large mod-log tables, BI).

Both together is the **recommended** pattern for large bots:

```ts
await loadPieces(client, {
  context: { vault, prisma, logger },
});
```

## What Vault covers (Path B)


| In scope             | Examples                                                         |
| -------------------- | ---------------------------------------------------------------- |
| Guild config         | `prefix`, `modLogChannel`, `disabledModules`, nested toggles     |
| User / member config | Per-user prefs; per-guild member XP/points **as simple ledgers** |
| Feature flags        | Module on/off, beta flags                                        |
| Level overrides      | `userId → permission level` in guild blueprint (1.x)             |
| Setup wizards        | Sequences writing to Vault records                               |



| Out of scope (use ORM)      | Examples                                      |
| --------------------------- | --------------------------------------------- |
| Complex economy             | Shops, inventories, multi-table transfers     |
| Large audit / mod history   | Millions of cases, reporting queries          |
| Analytics                   | Aggregations, dashboards over arbitrary SQL   |
| Arbitrary relational models | Anything you’d model in `schema.prisma` today |


---

## Concepts


| Term            | Role                                                           |
| --------------- | -------------------------------------------------------------- |
| **Ledger**      | Namespace for records (`guild`, `user`, `member`)              |
| **Blueprint**   | Schema + defaults for one document shape                       |
| **Record**      | One loaded document (sync, get, set, save)                     |
| **VaultDriver** | Storage backend (`MemoryDriver` built-in; SQL via `vault-sql`) |


Typical ledgers:

```text
guild     → one record per guild id
user      → one record per user id
member    → one record per `${guildId}.${userId}` (composite id)
```

---

## Project folders

```text
src/schemas/          # Blueprint definitions (GuildBlueprint.ts)
```

Register ledgers in bootstrap (loader automation planned). Pass `vault` via loader `context` so commands and gates can resolve settings.

---

## Quick start

```ts
import { Vault, MemoryDriver, defineBlueprint, field } from "@stambha/vault";

export const GuildBlueprint = defineBlueprint({
  prefix: field.string().default("!"),
  modLogChannel: field.string().nullable().default(null),
  modules: field.object({
    economy: field.boolean().default(true),
    moderation: field.boolean().default(true),
  }),
});

const vault = new Vault({ driver: new MemoryDriver() });
vault.registerLedger("guild", { blueprint: GuildBlueprint });
await vault.init();

const record = vault.ledger("guild").acquire(guildId);
await record.sync();
record.set("prefix", "?");
await record.save(); // or rely on debounced auto-save from .set()
```

### With Prisma in the same bot

```ts
// bootstrap.ts — illustrative
const vault = new Vault({ driver: new PostgresDriver(pool) });
vault.registerLedger("guild", { blueprint: GuildBlueprint });
await vault.init();

const prisma = new PrismaClient();

const client = createStambhaBot({ restPort, container: { vault, prisma } });
await loadPieces(client, { context: client.container });
```

- **Vault:** `record.get("prefix")`, module flags, level overrides.  
- **Prisma:** `prisma.achievement.findMany()`, economy balances, social alerts.

---

## API highlights

- `record.sync()` — load from driver
- `record.set` / `record.patch` — validate + queue debounced write
- `record.save()` — flush immediately
- `record.reset()` / `record.destroy()`
- `record.pluck("prefix", "modLogChannel")`
- `vault.flush()` — flush all pending writes (call on shutdown)

---

## Events

```ts
vault.on("recordSync", ({ ledger, id }) => {});
vault.on("recordSave", ({ ledger, id }) => {});
vault.on("recordDelete", ({ ledger, id }) => {});
```

---

## Roadmap (Vault)

- [x] Blueprint + field builders
- [x] Memory driver
- [x] Debounced sync batcher
- [x] SQLite / Postgres drivers (`@stambha/vault-sql`)
- [ ] Blueprint migrations
- [ ] Discord field types + `record.resolve()` (channel, role, user ids)
- [ ] Array update ops (`add` / `remove` / `overwrite` / index) for settings arrays
- [ ] Guild settings attach ergonomics (`ctx` / client integration)
- [ ] 1.x — `@stambha/levels` + guild blueprint overrides
- [ ] Plugins — hosted dashboard UI on top of [`@stambha/api`](/extensions/api); optional `vault-redis` for split tier
- [x] Plugins — [`@stambha/api`](/extensions/api) Discord OAuth + `/guilds/…/settings`

**Not planned:** Vault as a general-purpose ORM or Prisma replacement.

---

## SQL drivers

Persist Vault ledgers with SQLite or PostgreSQL via [`@stambha/vault-sql`](https://github.com/Mivaya/Stambha-plugins/tree/main/packages/vault-sql) (Stambha-plugins **1.0.0**, peer `@stambha/vault@^1.2.0`).

```bash
pnpm add @stambha/vault-sql @stambha/vault
```

SQLite needs **Node.js 22.5+** (`node:sqlite`). Postgres works on Node 20+.

```ts
import { Vault } from "@stambha/vault";
import { SQLiteDriver } from "@stambha/vault-sql";
// or: import { PostgresDriver } from "@stambha/vault-sql";

const driver = new SQLiteDriver({ path: "./data/vault.sqlite" });
const vault = new Vault({ driver });
```

Full driver options: [package README](https://github.com/Mivaya/Stambha-plugins/blob/main/packages/vault-sql/README.md).

---

## Related

- [Getting started](/guide/getting-started) — Vault is optional at install time
- [Migration guides](/migration/) — when to add Vault (settings & config)
- [Extensions](/extensions/) — other Stambha-plugins packages
- [HTTP API](/extensions/api) — OAuth + guild settings routes for your admin frontend

