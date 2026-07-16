/** Ticket body templates for GitHub Project #2. */

const DEFAULT_DOD = [
  "Code reviewed and merged to `main` (or release branch)",
  "`pnpm build` and `pnpm test` pass in CI",
  "User-facing changes documented in CHANGELOG and public docs",
];

export function ticketBody({
  userStory,
  summary,
  problem,
  developerSyntax,
  inScope = [],
  outOfScope = [],
  acceptance = [],
  definitionOfDone = DEFAULT_DOD,
  meta = {},
  dependencies = "None",
  technicalNotes = [],
  references = [],
}) {
  const sections = [];

  if (userStory) sections.push(`## User story\n${userStory}`);
  sections.push(`## Summary\n${summary}`);
  if (problem) sections.push(`## Problem / context\n${problem}`);
  if (developerSyntax) sections.push(`## Developer syntax\n${developerSyntax}`);

  if (inScope.length || outOfScope.length) {
    let scope = "## Scope\n";
    if (inScope.length) {
      scope += "### In scope\n" + inScope.map((s) => `- ${s}`).join("\n") + "\n";
    }
    if (outOfScope.length) {
      scope += "### Out of scope\n" + outOfScope.map((s) => `- ${s}`).join("\n");
    }
    sections.push(scope.trimEnd());
  }

  sections.push(
    `## Acceptance criteria\n${acceptance.map((a) => `- [ ] ${a}`).join("\n")}`,
    `## Definition of done\n${definitionOfDone.map((d) => `- [ ] ${d}`).join("\n")}`,
    `## Metadata\n| Field | Value |\n|-------|-------|\n${Object.entries(meta)
      .map(([k, v]) => `| ${k} | ${v} |`)
      .join("\n")}`,
    `## Dependencies\n${dependencies}`,
  );

  if (technicalNotes.length) {
    sections.push(`## Technical notes\n${technicalNotes.map((n) => `- ${n}`).join("\n")}`);
  }
  if (references.length) {
    sections.push(`## References\n${references.map((r) => `- ${r}`).join("\n")}`);
  }

  return sections.join("\n\n");
}

function formatChildTickets(childTickets, childFeatures) {
  if (childTickets.length) {
    return childTickets
      .map((t) => `- [${t.shipped ? "x" : " "}] **${t.id}** — ${t.title}`)
      .join("\n");
  }
  if (childFeatures.length) {
    return childFeatures.map((id) => `- [ ] **${id}**`).join("\n");
  }
  return "_No child tickets linked yet._";
}

export function epicBody({
  vision,
  objective,
  architecture = [],
  outcomes = [],
  childTickets = [],
  childFeatures = [],
  successCriteria = [],
  acceptance = [],
  meta = {},
  dependencies = "None",
  references = [],
}) {
  const obj = objective ?? vision ?? "";
  const sections = [
    `## Objective\n${obj}`,
  ];

  if (architecture.length) {
    sections.push(`## Architecture\n${architecture.map((a) => `- ${a}`).join("\n")}`);
  }

  if (outcomes.length) {
    sections.push(`## Outcomes\n${outcomes.map((o) => `- ${o}`).join("\n")}`);
  }

  sections.push(`## Child tickets\n${formatChildTickets(childTickets, childFeatures)}`);

  const criteria =
    successCriteria.length > 0
      ? successCriteria
      : acceptance.length > 0
        ? acceptance
        : [
            "All child Features meet their Definition of done",
            "Epic outcomes verified in release notes / CHANGELOG",
          ];

  sections.push(`## Success criteria\n${criteria.map((c) => `- [ ] ${c}`).join("\n")}`);

  sections.push(
    `## Metadata\n| Field | Value |\n|-------|-------|\n${Object.entries({
      ...meta,
      "Work type": "Epic",
    })
      .map(([k, v]) => `| ${k} | ${v} |`)
      .join("\n")}`,
    `## Dependencies\n${dependencies}`,
  );

  if (references.length) {
    sections.push(`## References\n${references.map((r) => `- ${r}`).join("\n")}`);
  }

  return sections.join("\n\n");
}

export function decisionBody({ decision, rationale, alternatives = [], meta = {}, references = [] }) {
  return ticketBody({
    summary: decision,
    problem: rationale,
    inScope: ["Document decision for contributors and migrators"],
    outOfScope: alternatives.map((a) => `Revisit: ${a}`),
    acceptance: ["Decision recorded and linked to ADR or known-gaps", "No open PRs contradict this decision"],
    definitionOfDone: ["Status remains **Won't** unless ADR superseded"],
    meta: { ...meta, "Work type": "Decision" },
    references,
  });
}

export function doneBody({ summary, delivered = [], notes = [], meta = {} }) {
  return ticketBody({
    summary,
    inScope: delivered,
    acceptance: delivered.map((d) => `Delivered: ${d}`),
    definitionOfDone: ["Shipped and tagged on npm/GitHub where applicable"],
    meta: { ...meta, "Work type": "Task", Status: "Done" },
    technicalNotes: notes,
  });
}
