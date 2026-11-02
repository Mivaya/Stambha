import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parseArgs } from "./cli.js";
import { STAMBHA_VERSION } from "./constants.js";
import { scaffoldProject } from "./scaffold.js";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

async function mkTemp(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "create-stambha-"));
  tempDirs.push(dir);
  return dir;
}

describe("parseArgs", () => {
  it("parses directory and template flags", () => {
    expect(parseArgs(["my-bot", "--template", "minimal", "-y"])).toEqual({
      targetDir: "my-bot",
      template: "minimal",
      yes: true,
    });
  });

  it("returns help for --help", () => {
    expect(parseArgs(["--help"])).toBe("help");
  });

  it("rejects unknown template", () => {
    expect(() => parseArgs(["--template", "bot"])).toThrow(/minimal, basic/);
  });
});

describe("scaffoldProject", () => {
  it("writes minimal template with substituted package name", async () => {
    const root = await mkTemp();
    const target = path.join(root, "demo-bot");
    const files = await scaffoldProject({
      targetDir: target,
      projectName: "demo-bot",
      template: "minimal",
    });
    expect(files.length).toBeGreaterThan(0);
    const pkg = JSON.parse(await fs.readFile(path.join(target, "package.json"), "utf8"));
    expect(pkg.name).toBe("demo-bot");
    expect(pkg.dependencies["@stambha/core"]).toBe(STAMBHA_VERSION);
    await expect(fs.access(path.join(target, "src/main.ts"))).resolves.toBeUndefined();
  });

  it("writes basic template with demo script and env example", async () => {
    const root = await mkTemp();
    const target = path.join(root, "live-bot");
    await scaffoldProject({
      targetDir: target,
      projectName: "live-bot",
      template: "basic",
    });
    const pkg = JSON.parse(await fs.readFile(path.join(target, "package.json"), "utf8"));
    expect(pkg.scripts.demo).toBeDefined();
    expect(pkg.dependencies["@stambha/gateway"]).toBe(STAMBHA_VERSION);
    await expect(fs.access(path.join(target, ".env.example"))).resolves.toBeUndefined();
    await expect(
      fs.access(path.join(target, "src/commands/General/PingCommand.ts")),
    ).resolves.toBeUndefined();
  });

  it("throws for unknown template", async () => {
    const root = await mkTemp();
    await expect(
      scaffoldProject({ targetDir: path.join(root, "x"), projectName: "x", template: "nope" }),
    ).rejects.toThrow(/Unknown template/);
  });
});
