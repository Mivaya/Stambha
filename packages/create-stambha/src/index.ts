import { runCli } from "./cli.js";

runCli().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`create-stambha: ${message}`);
  process.exit(1);
});
