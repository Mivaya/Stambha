# Stambha Kanban — GitHub Project #2

**Board:** https://github.com/orgs/Mivaya/projects/2

Ticket bodies and acceptance criteria live on GitHub Project cards. The machine-readable catalog is:

```text
scripts/kanban/catalog.mjs    ← edit here, then sync
scripts/kanban/templates.mjs  ← epic + feature body templates
scripts/sync-kanban-project.mjs
```

Public product gaps: [docs/guide/known-gaps.md](../../docs/guide/known-gaps.md). Architecture decisions: [docs/decisions/](../../docs/decisions/).

## Columns (left → right)

| Column | WIP | Meaning |
|--------|-----|---------|
| **Backlog** | ∞ | Prioritized; not sprint-ready |
| **Sprint Ready** | ≤ 5 | Refined; API syntax / acceptance clear |
| **In Progress** | ≤ 3 | Active implementation |
| **Review** | ≤ 3 | PR open; peer review |
| **Done** | hide in sprint view | Shipped or decided |
| **Icebox** | — | 2.0+ / no commitment |
| **Won't** | — | ADR decisions |

## Custom fields

| Field | Purpose |
|-------|---------|
| **Track** | `stambha` \| `stambha-plugins` |
| **Work type** | Epic \| Feature \| Task \| Release \| Decision |
| **Pillar** | A, B, C, D, E, G, Vault, Docs, Ops, Plugins |
| **Release** | Target semver lane (`1.3`, `1.2.0`, `2.0`, …) |
| **Priority** | `blocker` \| `high` \| `medium` \| `low` |
| **Lane** | `Expedite` \| `Standard` \| `Tech debt` (swimlane substitute) |

## Ticket shapes

**Epic** — Objective, Architecture, Child tickets (checkboxes), Success criteria.  
**Feature** — User story, Developer syntax (API sketch), Scope, Acceptance, DoD.  
**Release / Task** — Shipped deliverables or ops checklist.  
**Decision** — Won't column; links to [docs/decisions/](../../docs/decisions/).

## Recommended views (create in GitHub Projects UI)

1. **Sprint** — Status ≠ Done; filter `Release = 1.3` (or current); group by Status  
2. **Core** — `Track = stambha`; hide Done  
3. **Plugins** — `Track = stambha-plugins`  
4. **Epics** — `Work type = Epic`  
5. **Expedite** — `Priority = blocker` OR `Lane = Expedite`  
6. **Shipped** — Status = Done (archive / history)

## Sync

```bash
./scripts/sync-kanban-project.sh --setup-fields   # Review column + Priority + Lane fields
./scripts/sync-kanban-project.sh --enrich-bodies  # refresh card bodies from catalog
./scripts/sync-kanban-project.sh --sync-fields    # status, track, priority, …
./scripts/sync-kanban-project.sh --all
```

Requires `gh` auth with `project` scope on org **Mivaya**.
