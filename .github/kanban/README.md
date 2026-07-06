# Stambha Kanban — GitHub Project #2

**Board:** https://github.com/orgs/Mivaya/projects/2

This folder documents the program board. **Ticket bodies and acceptance criteria live on the GitHub Project cards** — the machine-readable catalog is:

```text
scripts/kanban/catalog.mjs    ← edit here, then sync
scripts/kanban/templates.mjs  ← industry-standard body sections
scripts/sync-kanban-project.mjs
```

## Why not docs/internal?

`docs/internal/*` is maintainer-only and planned for removal. The board + catalog are the durable backlog; public product gaps remain in [docs/guide/known-gaps.md](../docs/guide/known-gaps.md).

## Columns

| Column | Meaning |
|--------|---------|
| **Done** | Shipped or decided |
| **In Progress** | Active sprint (WIP ≤ 5) |
| **Sprint Ready** | Next sprint — refined, unblocked |
| **Backlog** | Prioritized 1.x work |
| **Icebox** | 2.0+ / no commitment |
| **Won't** | ADR decisions |

## Custom fields

| Field | Purpose |
|-------|---------|
| **Track** | `stambha` \| `stambha-plugins` |
| **Work type** | Epic \| Feature \| Task \| Release \| Decision |
| **Pillar** | A, B, C, D, E, G, Vault, Docs, Ops, Plugins |
| **Release** | Target semver lane |

## Ticket template (every card)

Each catalog entry includes:

1. **User story** (Features)
2. **Summary**
3. **Problem / context**
4. **Scope** (in / out)
5. **Acceptance criteria** (checkboxes)
6. **Definition of done**
7. **Metadata** table (ID, Pillar, Epic, Branch, …)
8. **Dependencies**
9. **Technical notes** (when needed)
10. **References** (public docs, ADRs — not internal-only paths)

## Sync

```bash
./scripts/sync-kanban-project.sh --enrich-bodies   # refresh all card bodies
./scripts/sync-kanban-project.sh --seed            # add missing cards
./scripts/sync-kanban-project.sh --all             # fields + seed + enrich
```

Requires `gh` auth with `project` scope on org **Mivaya**.

## Recommended views

1. **Board** — Status × Track=stambha  
2. **Plugins** — Status × Track=stambha-plugins  
3. **Epics** — Work type=Epic  
4. **Sprint** — Release=1.1 (or current)
