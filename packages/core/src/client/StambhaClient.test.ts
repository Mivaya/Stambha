import { describe, expect, it, vi } from "vitest";
import { StambhaClient } from "./StambhaClient.js";
import { MockBridge } from "../bridge/MockBridge.js";
import type { StambhaPlugin } from "../plugins/types.js";

describe("StambhaClient Plugin Enhancements", () => {
  it("should register plugins via constructor and registerPlugin", () => {
    const pluginA: StambhaPlugin = { name: "A" };
    const pluginB: StambhaPlugin = { name: "B" };

    const client = new StambhaClient({ plugins: [pluginA] });
    expect(client.plugins).toContain(pluginA);
    expect(client.plugins).not.toContain(pluginB);

    client.registerPlugin(pluginB);
    expect(client.plugins).toContain(pluginB);
  });

  it("should run initialize preInit and postInit hooks exactly once", async () => {
    const preInitSpy = vi.fn();
    const postInitSpy = vi.fn();
    const plugin: StambhaPlugin = {
      name: "test-plugin",
      hooks: {
        preInit: preInitSpy,
        postInit: postInitSpy,
      },
    };

    const client = new StambhaClient({ plugins: [plugin] });
    await client.initialize();
    expect(preInitSpy).toHaveBeenCalledTimes(1);
    expect(postInitSpy).toHaveBeenCalledTimes(1);

    // Call again, should not run hooks again
    await client.initialize();
    expect(preInitSpy).toHaveBeenCalledTimes(1);
    expect(postInitSpy).toHaveBeenCalledTimes(1);
  });

  it("should execute lifecycle hooks during client start/stop", async () => {
    const hooksRun: string[] = [];
    const plugin: StambhaPlugin = {
      name: "test-lifecycle",
      hooks: {
        preStart: () => { hooksRun.push("preStart"); },
        postStart: () => { hooksRun.push("postStart"); },
        onShutdown: () => { hooksRun.push("onShutdown"); },
      },
    };

    const client = new StambhaClient({ plugins: [plugin] });
    client.setBridge(new MockBridge());
    await client.start();
    expect(hooksRun).toEqual(["preStart", "postStart"]);

    await client.stop();
    expect(hooksRun).toEqual(["preStart", "postStart", "onShutdown"]);
  });
});
