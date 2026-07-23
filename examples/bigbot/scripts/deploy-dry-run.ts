/**
 * CI / local dry-run — validates slash payload from bigbot pieces (no Discord token).
 */
import { deployCommands, formatDeployDiff } from "@stambha/rest";
import { setupBot } from "../src/lib/setup.js";

const { client } = await setupBot({ demo: true });

const result = await deployCommands({
  token: "ci-dry-run",
  applicationId: "0",
  commands: client.registries.commands.values(),
  dryRun: true,
  diff: true,
  existing: [],
});

if (result.count < 1) {
  console.error("[deploy:dry-run] expected at least one slash command in bigbot");
  process.exit(1);
}

console.log(`[deploy:dry-run] ${result.count} slash command(s) in payload`);
if (result.diff) {
  console.log(formatDeployDiff(result.diff));
}
