import fs from "node:fs/promises";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { isTemplateName, TEMPLATES, type TemplateName } from "./constants.js";
import { scaffoldProject } from "./scaffold.js";

export interface CliOptions {
  targetDir?: string | undefined;
  template?: TemplateName | undefined;
  yes?: boolean | undefined;
}

function usage(): string {
  return `Usage: create-stambha [directory] [options]

Options:
  --template, -t   minimal | basic (default: basic)
  --yes, -y        Use defaults without prompts

Examples:
  npm create stambha@latest my-bot
  pnpm create stambha my-bot --template minimal
`;
}

export function parseArgs(argv: string[]): CliOptions | "help" {
  const opts: CliOptions = {};
  let targetDir: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") return "help";
    if (arg === "--yes" || arg === "-y") {
      opts.yes = true;
      continue;
    }
    if (arg === "--template" || arg === "-t") {
      const value = argv[++i];
      if (!value || !isTemplateName(value)) {
        throw new Error(`--template must be one of: ${TEMPLATES.join(", ")}`);
      }
      opts.template = value;
      continue;
    }
    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }
    if (!targetDir) targetDir = arg;
    else throw new Error(`Unexpected argument: ${arg}`);
  }

  if (targetDir) opts.targetDir = targetDir;
  return opts;
}

function defaultProjectName(dir: string): string {
  const base = path.basename(path.resolve(dir));
  return base.replace(/[^a-z0-9-_]/gi, "-").toLowerCase() || "stambha-bot";
}

async function promptChoice(question: string, choices: readonly string[]): Promise<string> {
  const rl = readline.createInterface({ input, output });
  try {
    const list = choices.map((c, i) => `  ${i + 1}. ${c}`).join("\n");
    console.log(`${question}\n${list}`);
    while (true) {
      const answer = (await rl.question(`Pick 1-${choices.length} [1]: `)).trim();
      if (!answer) return choices[0] ?? "";
      const n = Number.parseInt(answer, 10);
      if (n >= 1 && n <= choices.length) return choices[n - 1] ?? "";
      if (choices.includes(answer)) return answer;
      console.log("Invalid choice — try again.");
    }
  } finally {
    rl.close();
  }
}

async function promptText(question: string, fallback: string): Promise<string> {
  const rl = readline.createInterface({ input, output });
  try {
    const answer = (await rl.question(`${question} [${fallback}]: `)).trim();
    return answer || fallback;
  } finally {
    rl.close();
  }
}

export async function runCli(argv: string[] = process.argv.slice(2)): Promise<number> {
  const parsed = parseArgs(argv);
  if (parsed === "help") {
    console.log(usage());
    return 0;
  }

  const interactive = process.stdin.isTTY && !parsed.yes;
  const targetDir = path.resolve(parsed.targetDir ?? (interactive ? "." : "stambha-bot"));
  const projectName = interactive
    ? await promptText("Project name (package.json)", defaultProjectName(targetDir))
    : defaultProjectName(targetDir);

  let template: TemplateName = parsed.template ?? "basic";
  if (!parsed.template && interactive) {
    const picked = await promptChoice("Template:", TEMPLATES);
    if (isTemplateName(picked)) template = picked;
  }

  try {
    await fs.access(targetDir);
    const stat = await fs.stat(targetDir);
    if (stat.isDirectory()) {
      const entries = await fs.readdir(targetDir);
      if (entries.length > 0) {
        throw new Error(`Directory "${targetDir}" is not empty.`);
      }
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }

  const files = await scaffoldProject({ targetDir, projectName, template });

  console.log(`\nCreated ${projectName} (${template}) at ${targetDir}`);
  console.log(`  ${files.length} file(s) written\n`);
  console.log("Next:");
  console.log(`  cd ${path.relative(process.cwd(), targetDir) || "."}`);
  console.log("  pnpm install");
  if (template === "basic") {
    console.log("  cp .env.example .env   # add DISCORD_TOKEN + DISCORD_APPLICATION_ID");
    console.log("  pnpm demo              # no token");
    console.log("  pnpm start             # live bot");
  } else {
    console.log("  pnpm start             # MockBridge smoke");
  }

  return 0;
}
