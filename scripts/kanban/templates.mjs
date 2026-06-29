/** Industry-standard ticket body templates for GitHub Project #2. */

const DEFAULT_DOD = [
  "Code reviewed and merged to `main` (or release branch)",
  "`pnpm build` and `pnpm test` pass in CI",
  "User-facing changes documented in CHANGELOG and public docs",
];

export function ticketBody({
  userStory,
  summary,
  problem,
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

export function epicBody({
  vision,
  outcomes = [],
  childFeatures = [],
  acceptance = [],
  meta = {},
  dependencies = "1.0.0 stable release",
  references = [],
}) {
  return ticketBody({
    summary: vision,
    problem: "Epic — groups related Features. Keep in **Backlog** until children are Sprint Ready.",
    inScope: outcomes,
    outOfScope: ["Implementation detail belongs on child Feature cards"],
    acceptance: acceptance.length
      ? acceptance
      : ["All child Features ticketed with acceptance criteria", "Epic closed when children ship or defer to Icebox"],
    definitionOfDone: ["Child Features meet their Definition of done", "Epic outcomes verified in release notes"],
    meta: { ...meta, "Work type": "Epic" },
    dependencies,
    technicalNotes: childFeatures.length ? [`**Child features:** ${childFeatures.join(", ")}`] : [],
    references,
  });
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
