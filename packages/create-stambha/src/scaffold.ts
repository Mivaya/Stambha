import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { STAMBHA_VERSION } from "./constants.js";

export interface ScaffoldOptions {
  targetDir: string;
  projectName: string;
  template: string;
}

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatesRoot = path.join(packageRoot, "templates");

const PLACEHOLDERS: Record<string, string> = {
  __PROJECT_NAME__: "",
  __STAMBHA_VERSION__: STAMBHA_VERSION,
};

/** Copy a template tree into `targetDir`, substituting project placeholders. */
export async function scaffoldProject(options: ScaffoldOptions): Promise<string[]> {
  const templateDir = path.join(templatesRoot, options.template);
  try {
    await fs.access(templateDir);
  } catch {
    throw new Error(`Unknown template "${options.template}".`);
  }

  PLACEHOLDERS.__PROJECT_NAME__ = options.projectName;

  await fs.mkdir(options.targetDir, { recursive: true });
  const written: string[] = [];
  await copyDir(templateDir, options.targetDir, written);
  return written;
}

async function copyDir(source: string, dest: string, written: string[]): Promise<void> {
  const entries = await fs.readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const from = path.join(source, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await fs.mkdir(to, { recursive: true });
      await copyDir(from, to, written);
      continue;
    }
    const raw = await fs.readFile(from, "utf8");
    const content = applyPlaceholders(raw);
    await fs.writeFile(to, content, "utf8");
    written.push(to);
  }
}

function applyPlaceholders(content: string): string {
  let out = content;
  for (const [key, value] of Object.entries(PLACEHOLDERS)) {
    out = out.replaceAll(key, value);
  }
  return out;
}

export function templatesDir(): string {
  return templatesRoot;
}
