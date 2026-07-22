import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { StambhaClient } from "@stambha/core";
import { afterEach, describe, expect, it } from "vitest";
import { loadPieces } from "./loadPieces.js";

describe("loadPieces lifecycle", () => {
  afterEach(() => {
    delete (globalThis as { __stambhaLoadOrder?: string[] }).__stambhaLoadOrder;
  });

  it("awaits onLoad in folder order (gates before commands)", async () => {
    const order: string[] = [];
    (globalThis as { __stambhaLoadOrder?: string[] }).__stambhaLoadOrder = order;

    const root = await mkdtemp(join(tmpdir(), "stambha-load-"));
    const gatesDir = join(root, "src", "gates");
    const commandsDir = join(root, "src", "commands");
    await mkdir(gatesDir, { recursive: true });
    await mkdir(commandsDir, { recursive: true });

    const coreUrl = pathToFileURL(
      join(fileURLToPath(new URL("../../core/dist/index.js", import.meta.url))),
    ).href;

    await writeFile(
      join(gatesDir, "AlphaGate.mjs"),
      `
import { Gate } from ${JSON.stringify(coreUrl)};
export class AlphaGate extends Gate {
  constructor(registry) {
    super(registry, { name: "alpha" });
  }
  async onLoad() {
    globalThis.__stambhaLoadOrder.push("gate:alpha");
  }
  async check() { return { allow: true }; }
}
`,
    );

    await writeFile(
      join(commandsDir, "BetaCommand.mjs"),
      `
import { Command, ok } from ${JSON.stringify(coreUrl)};
export class BetaCommand extends Command {
  constructor(registry) {
    super(registry, { name: "beta", kinds: ["prefix"] });
  }
  async onLoad() {
    globalThis.__stambhaLoadOrder.push("command:beta");
  }
  async execute() { return ok(undefined); }
}
`,
    );

    const client = new StambhaClient();
    const result = await loadPieces(client, {
      basePath: root,
      paths: {
        barriers: false,
        conduits: false,
        epilogues: false,
        scouts: false,
        signals: false,
        tasks: false,
        listeners: false,
      },
    });

    expect(result.errors).toEqual([]);
    expect(order).toEqual(["gate:alpha", "command:beta"]);
    expect(client.registries.gates.get("alpha")?.loaded).toBe(true);
    expect(client.getCommand("beta")?.loaded).toBe(true);
  });
});
