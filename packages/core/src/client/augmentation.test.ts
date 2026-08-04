import { describe, expect, it } from "vitest";
import { createStambhaBot } from "../client/createStambhaBot.js";
import type { StambhaContainerLike } from "../container/types.js";

/**
 * B9 — declaration merging demo (same pattern apps use with `declare module "@stambha/core"`).
 */
declare module "../client/types.js" {
  interface StambhaClientOptions {
    /** Example: app-owned Vault handle passed at bootstrap. */
    vault?: { get(key: string): unknown };
  }
}

declare module "../container/types.js" {
  interface StambhaContainerLike {
    /** Example: typed service on the shared container. */
    metrics?: { inc(name: string): void };
  }
}

describe("B9 TypeScript interface augmentation", () => {
  it("accepts augmented StambhaClientOptions fields", () => {
    const vault = { get: (_key: string) => 1 as unknown };
    const bot = createStambhaBot({
      prefix: "!",
      vault,
    });
    expect(bot.prefix).toBe("!");
    // Options are not re-exported on the client; augmentation is for callers' typecheck.
    expect(vault.get("x")).toBe(1);
  });

  it("allows augmented container fields via StambhaContainerLike", () => {
    const metrics = { inc: (_name: string) => {} };
    const base = createStambhaBot().container;
    const container = {
      binder: base.binder,
      logger: base.logger,
      metrics,
    } satisfies StambhaContainerLike;
    expect(container.metrics).toBe(metrics);
  });
});
