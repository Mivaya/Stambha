# Vault and your ORM

Stambha ships **`@stambha/vault`** for settings-shaped documents. Most production bots also run **Prisma, Drizzle, or raw SQL** for relational domain data. Both together is the **recommended** pattern — not a migration failure.

See also: [Vault](/features/vault) · [ADR 004 — Vault scope and ORM coexistence](https://github.com/mivaya/Stambha/blob/main/docs/decisions/004-vault-scope-orm-coexistence.md)

---

## Two persistence zones

| Use **Vault** | Use **your ORM** |
|---------------|------------------|
| Guild prefix, module toggles, log channel ids | Economy, shops, inventories |
| Feature flags, dashboard-editable config | Quest graphs, achievements, complex relations |
| Capability claims ([`@stambha/authz`](/features/capabilities)) | Large mod-log tables and analytics |
| Per-member prefs as simple ledgers | Anything in `schema.prisma` today |
| Tests with `MemoryDriver` | Existing domain models and migrations |

Vault is **not** a Prisma replacement. Stambha will not ship a general-purpose ORM in core.

---

## Wiring both in bootstrap

Register Vault ledgers once at startup. Create your ORM client the same way. Pass both through loader `context` so commands and gates can resolve either:

```ts
import { createStambhaBot } from "@stambha/core";
import { loadPieces } from "@stambha/loader";
import { Vault, MemoryDriver } from "@stambha/vault";
import { PrismaClient } from "@prisma/client";
import { GuildBlueprint } from "./schemas/GuildBlueprint.js";

const vault = new Vault({ driver: new MemoryDriver() });
vault.registerLedger("guild", { blueprint: GuildBlueprint });
await vault.init();

const prisma = new PrismaClient();

const client = createStambhaBot({
  restPort,
  container: { vault, prisma },
});

await loadPieces(client, { context: client.container });
```

Production: swap `MemoryDriver` for [`@stambha/vault-sql`](https://github.com/Mivaya/Stambha-plugins/tree/main/packages/vault-sql) (`SQLiteDriver` or `PostgresDriver`). Your Prisma schema stays separate — typically the same Postgres instance with different tables, or SQLite for Vault only in small bots.

---

## Reading settings in a command

Vault:

```ts
const record = this.vault.ledger("guild").acquire(ctx.guildId);
await record.sync();
const prefix = record.get("prefix");
```

ORM (illustrative):

```ts
const balance = await this.prisma.userBalance.findUnique({
  where: { guildId_userId: { guildId: ctx.guildId, userId: ctx.userId } },
});
```

Use Vault for **config reads/writes** that operators might edit via [`@stambha/api`](/extensions/api) settings routes. Use the ORM for **domain transactions** (transfers, case inserts, quest progress).

---

## Ledgers to model

Typical Vault namespaces:

```text
guild   → one record per guild id
user    → one record per user id
member  → one record per `${guildId}.${userId}`
```

Define blueprints under `src/schemas/` and call `vault.registerLedger()` in bootstrap. Loader does **not** auto-scan schemas yet — registration is explicit (see [Vault roadmap](/features/vault#roadmap-vault)).

---

## Dashboard editing

[`@stambha/api`](/extensions/api) exposes `GET/PATCH /guilds/[guildId]/settings` when you pass a `vault` instance. Bring your own admin SPA — Stambha does not ship a hosted dashboard.

ORM-backed admin screens (mod case search, economy reports) are **your** routes and queries, not Vault settings routes.

---

## What not to put in Vault

- Multi-table economy with ACID invariants
- Millions of moderation cases with reporting SQL
- Arbitrary joins or analytics over domain tables

Those belong in the ORM. Trying to embed large arrays inside Vault documents leads to the same pain as JSON blobs in a `GuildConfig` table.

---

## Related

- [Vault](/features/vault) — Blueprint, Record, drivers, capability claims
- [Extensions — vault-sql](/features/vault#sql-drivers) — SQLite / Postgres persistence
- [HTTP API](/extensions/api) — OAuth + guild settings for operators
- [Examples by scale](/guide/examples) — `examples/bot` wires Vault; add Prisma alongside using the pattern above
