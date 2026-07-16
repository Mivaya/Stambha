#!/usr/bin/env node
/**
 * Sync Stambha kanban catalog → GitHub Project #2 (Mivaya).
 *
 * Source of truth: scripts/kanban/catalog.mjs
 * Board guide: .github/kanban/README.md
 *
 * Usage:
 *   node scripts/sync-kanban-project.mjs --setup-fields
 *   node scripts/sync-kanban-project.mjs --seed
 *   node scripts/sync-kanban-project.mjs --enrich-bodies
 *   node scripts/sync-kanban-project.mjs --all
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CARD_CATALOG, resolveCardId, allCatalogCards } from "./kanban/catalog.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OWNER = "Mivaya";
const PROJECT_NUMBER = 2;
const PROJECT_ID = "PVT_kwDOEUrQYs4Ba7UF";
const STATUS_FIELD_ID = "PVTSSF_lADOEUrQYs4Ba7UFzhVvZ9U";
const TRACK_FIELD_ID = "PVTSSF_lADOEUrQYs4Ba7UFzhVvbJw";
const FIELD_IDS_PATH = join(__dirname, "kanban", "field-ids.json");

/** Fallback IDs — refreshed from GitHub after --setup-fields. */
const STATUS_IDS_FALLBACK = {
  Backlog: "5c8f2b73",
  "Sprint Ready": "5dfdda1c",
  "In Progress": "a935317a",
  Review: null,
  Done: "d44b819e",
  Icebox: "32739817",
  "Won't": "0742b589",
};

const TRACK_IDS = {
  stambha: "cc14f4e2",
  "stambha-plugins": "633eb0b6",
};

let statusIds = { ...STATUS_IDS_FALLBACK };

function loadStatusIds() {
  if (!existsSync(FIELD_IDS_PATH)) return statusIds;
  try {
    const cache = JSON.parse(readFileSync(FIELD_IDS_PATH, "utf8"));
    if (cache.Status?.options) {
      statusIds = { ...STATUS_IDS_FALLBACK, ...cache.Status.options };
    }
  } catch {
    /* use fallback */
  }
  return statusIds;
}

loadStatusIds();

const args = new Set(process.argv.slice(2));
const runSetup = args.has("--setup-fields") || args.has("--all");
const runSeed = args.has("--seed") || args.has("--all");
const runEnrich = args.has("--enrich-bodies") || args.has("--all");
const runSyncFields = args.has("--sync-fields") || args.has("--all");

function graphqlMutation(mutation, variables = {}) {
  const payload = JSON.stringify({ query: mutation, variables });
  const out = execFileSync("gh", ["api", "graphql", "--input", "-"], {
    input: payload,
    encoding: "utf8",
  });
  const result = JSON.parse(out);
  if (result.errors?.length) {
    throw new Error(result.errors.map((e) => e.message).join("; "));
  }
  return result;
}

function listFields() {
  const data = graphqlMutation(
    `query($org: String!, $n: Int!) {
      organization(login: $org) {
        projectV2(number: $n) {
          fields(first: 50) {
            nodes {
              ... on ProjectV2Field { id name }
              ... on ProjectV2SingleSelectField { id name options { id name } }
            }
          }
        }
      }
    }`,
    { org: OWNER, n: PROJECT_NUMBER },
  );
  return data.data.organization.projectV2.fields.nodes;
}

function listProjectItemsGraphql() {
  const items = [];
  let after = null;
  for (;;) {
    const data = graphqlMutation(
      `query($org: String!, $n: Int!, $after: String) {
        organization(login: $org) {
          projectV2(number: $n) {
            items(first: 100, after: $after) {
              pageInfo { hasNextPage endCursor }
              nodes {
                id
                content {
                  __typename
                  ... on DraftIssue { id title body }
                }
              }
            }
          }
        }
      }`,
      { org: OWNER, n: PROJECT_NUMBER, after },
    );
    const conn = data.data.organization.projectV2.items;
    items.push(...conn.nodes);
    if (!conn.pageInfo.hasNextPage) break;
    after = conn.pageInfo.endCursor;
  }
  return items;
}

function setupStatusNames() {
  const fields = listFields();
  const statusField = fields.find((f) => f.id === STATUS_FIELD_ID);
  const existing = Object.fromEntries((statusField?.options ?? []).map((o) => [o.name, o.id]));

  const reviewId = existing.Review ?? statusIds.Review;

  const options = [
    { id: existing.Backlog ?? statusIds.Backlog, name: "Backlog", color: "GRAY", description: "Prioritized; not sprint-ready" },
    { id: existing["Sprint Ready"] ?? statusIds["Sprint Ready"], name: "Sprint Ready", color: "BLUE", description: "Refined; WIP ≤ 5" },
    { id: existing["In Progress"] ?? statusIds["In Progress"], name: "In Progress", color: "YELLOW", description: "Active coding" },
    reviewId
      ? { id: reviewId, name: "Review", color: "ORANGE", description: "PR open; peer review" }
      : { name: "Review", color: "ORANGE", description: "PR open; peer review" },
    { id: existing.Done ?? statusIds.Done, name: "Done", color: "GREEN", description: "Shipped or decided" },
    { id: existing.Icebox ?? statusIds.Icebox, name: "Icebox", color: "PURPLE", description: "2.0+ / no commitment" },
    { id: existing["Won't"] ?? statusIds["Won't"], name: "Won't", color: "RED", description: "ADR decisions" },
  ];

  graphqlMutation(
    `mutation($input: UpdateProjectV2FieldInput!) {
      updateProjectV2Field(input: $input) {
        projectV2Field { ... on ProjectV2SingleSelectField { name options { id name } } }
      }
    }`,
    { input: { fieldId: STATUS_FIELD_ID, singleSelectOptions: options } },
  );
  console.log("✓ Status columns OK (incl. Review)");
}

function ensureSelectField(name, options) {
  const fields = listFields();
  const existing = fields.find((f) => f.name === name);
  if (existing?.options) {
    console.log(`· Field "${name}" exists`);
    return existing;
  }
  const out = execFileSync(
    "gh",
    [
      "project",
      "field-create",
      String(PROJECT_NUMBER),
      "--owner",
      OWNER,
      "--name",
      name,
      "--data-type",
      "SINGLE_SELECT",
      "--single-select-options",
      options.join(","),
      "--format",
      "json",
    ],
    { encoding: "utf8" },
  );
  console.log(`✓ Created field "${name}"`);
  return JSON.parse(out);
}

function setupCustomFields() {
  setupStatusNames();
  ensureSelectField("Work type", ["Epic", "Feature", "Task", "Release", "Decision"]);
  ensureSelectField("Pillar", ["A", "B", "C", "D", "E", "G", "Vault", "Docs", "Ops", "Plugins"]);
  ensureSelectField("Priority", ["blocker", "high", "medium", "low"]);
  ensureSelectField("Lane", ["Expedite", "Standard", "Tech debt"]);
  ensureSelectField("Release", [
    "1.0.0",
    "1.1.0",
    "1.1",
    "1.2.0",
    "1.2",
    "1.3",
    "1.4",
    "1.5",
    "1.x",
    "2.0",
  ]);
  const fields = listFields();
  const cache = {};
  for (const f of fields) {
    if (f.options) {
      cache[f.name] = {
        id: f.id,
        options: Object.fromEntries(f.options.map((o) => [o.name, o.id])),
      };
    }
  }
  writeFileSync(FIELD_IDS_PATH, JSON.stringify(cache, null, 2) + "\n");
  console.log(`✓ Wrote ${FIELD_IDS_PATH}`);
  loadStatusIds();
  return cache;
}

function loadFieldCache() {
  if (!existsSync(FIELD_IDS_PATH)) return setupCustomFields();
  loadStatusIds();
  return JSON.parse(readFileSync(FIELD_IDS_PATH, "utf8"));
}

function setField(itemId, fieldId, { optionId }) {
  try {
    execFileSync(
      "gh",
      [
        "project",
        "item-edit",
        "--id",
        itemId,
        "--project-id",
        PROJECT_ID,
        "--field-id",
        fieldId,
        "--single-select-option-id",
        optionId,
      ],
      { stdio: "pipe" },
    );
  } catch (e) {
    console.warn(`· Field update skipped for item ${itemId}: ${e.message?.split("\n")[0]}`);
  }
}

function applyCardFields(itemId, card, fieldCache) {
  if (card.status && statusIds[card.status]) {
    setField(itemId, STATUS_FIELD_ID, { optionId: statusIds[card.status] });
  }
  if (card.track && TRACK_IDS[card.track]) {
    setField(itemId, TRACK_FIELD_ID, { optionId: TRACK_IDS[card.track] });
  }
  if (fieldCache["Work type"]?.options[card.type]) {
    setField(itemId, fieldCache["Work type"].id, {
      optionId: fieldCache["Work type"].options[card.type],
    });
  }
  if (fieldCache.Pillar?.options[card.pillar]) {
    setField(itemId, fieldCache.Pillar.id, { optionId: fieldCache.Pillar.options[card.pillar] });
  }
  if (card.release && fieldCache.Release?.options[card.release]) {
    setField(itemId, fieldCache.Release.id, { optionId: fieldCache.Release.options[card.release] });
  }
  if (card.priority && fieldCache.Priority?.options[card.priority]) {
    setField(itemId, fieldCache.Priority.id, { optionId: fieldCache.Priority.options[card.priority] });
  }
  if (card.lane && fieldCache.Lane?.options[card.lane]) {
    setField(itemId, fieldCache.Lane.id, { optionId: fieldCache.Lane.options[card.lane] });
  }
}

function updateDraftIssue(draftIssueId, title, body) {
  graphqlMutation(
    `mutation($input: UpdateProjectV2DraftIssueInput!) {
      updateProjectV2DraftIssue(input: $input) {
        draftIssue { id title }
      }
    }`,
    { input: { draftIssueId, title, body } },
  );
}

function createDraft(title, body) {
  const out = execFileSync(
    "gh",
    [
      "project",
      "item-create",
      String(PROJECT_NUMBER),
      "--owner",
      OWNER,
      "--title",
      title,
      "--body",
      body,
      "--format",
      "json",
    ],
    { encoding: "utf8" },
  );
  return JSON.parse(out);
}

function seedCards() {
  const fieldCache = loadFieldCache();
  const onBoard = new Set(
    listProjectItemsGraphql()
      .map((n) => n.content?.title)
      .filter(Boolean),
  );
  const catalogTitles = new Set(allCatalogCards().map((c) => c.title));

  for (const card of allCatalogCards()) {
    if (onBoard.has(card.title)) continue;
    const created = createDraft(card.title, card.body);
    applyCardFields(created.id, card, fieldCache);
    console.log(`✓ Created: ${card.title}`);
    onBoard.add(card.title);
  }

  const missing = [...catalogTitles].filter((t) => !onBoard.has(t));
  if (missing.length) {
    console.log(`· ${missing.length} catalog titles not on board (check TITLE_TO_ID aliases after enrich)`);
  }
}

function enrichBodies() {
  const fieldCache = loadFieldCache();
  const items = listProjectItemsGraphql();
  let updated = 0;
  let skipped = 0;

  for (const node of items) {
    const content = node.content;
    if (content?.__typename !== "DraftIssue") {
      skipped++;
      continue;
    }
    const cardId = resolveCardId(content.title, content.body ?? "");
    if (!cardId || !CARD_CATALOG[cardId]) {
      console.warn(`⚠ No catalog entry: "${content.title}"`);
      skipped++;
      continue;
    }
    const card = CARD_CATALOG[cardId];
    const needsUpdate =
      content.title !== card.title ||
      content.body !== card.body ||
      !content.body?.includes("## Definition of done") ||
      (card.type === "Epic" && !content.body?.includes("## Objective"));

    if (!needsUpdate) {
      skipped++;
      continue;
    }

    updateDraftIssue(content.id, card.title, card.body);
    applyCardFields(node.id, card, fieldCache);
    updated++;
    console.log(`✓ Enriched: ${card.title}`);
  }

  console.log(`\nEnrich complete: ${updated} updated, ${skipped} unchanged/skipped, ${items.length} total`);
}

function syncFields() {
  const fieldCache = loadFieldCache();
  const items = listProjectItemsGraphql();
  let updated = 0;
  let skipped = 0;

  for (const node of items) {
    const content = node.content;
    if (content?.__typename !== "DraftIssue") {
      skipped++;
      continue;
    }
    const cardId = resolveCardId(content.title, content.body ?? "");
    if (!cardId || !CARD_CATALOG[cardId]) {
      skipped++;
      continue;
    }
    applyCardFields(node.id, CARD_CATALOG[cardId], fieldCache);
    updated++;
    console.log(`✓ Fields: ${CARD_CATALOG[cardId].title}`);
  }

  console.log(`\nSync fields complete: ${updated} updated, ${skipped} skipped, ${items.length} total`);
}

function updateProjectReadme() {
  try {
    execFileSync(
      "gh",
      [
        "project",
        "edit",
        String(PROJECT_NUMBER),
        "--owner",
        OWNER,
        "--description",
        "Stambha program board. Source: scripts/kanban/catalog.mjs. Columns: Backlog → Sprint Ready → In Progress → Review → Done | Icebox | Won't. Views: Sprint (hide Done), Plugins track, Epics.",
      ],
      { stdio: "pipe" },
    );
    console.log("✓ Project description updated");
  } catch (e) {
    console.warn("· Project description:", e.message);
  }
}

if (runSetup) {
  setupCustomFields();
  updateProjectReadme();
}
if (runSeed) seedCards();
if (runEnrich) enrichBodies();
if (runSyncFields) syncFields();

if (!runSetup && !runSeed && !runEnrich && !runSyncFields) {
  console.log(
    `Usage: node scripts/sync-kanban-project.mjs [--setup-fields] [--seed] [--enrich-bodies] [--sync-fields] [--all]`,
  );
  process.exit(1);
}
