import { createStambhaBot, type RestPort, type RestRequest } from "@stambha/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { bootstrapNativeBot } from "./bootstrapNativeBot.js";
import { createIdentifyBudget } from "./reshard/IdentifyBudget.js";
import { combineIntents, GatewayIntent } from "./shard/identify.js";

function demoRest(): RestPort {
  return {
    async request<T>(_req: RestRequest) {
      return {} as T;
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("bootstrapNativeBot", () => {
  it("wires client bridge and returns a gateway client without connecting", async () => {
    const createWs = vi.fn();
    const { client, hub, gateway } = await bootstrapNativeBot({
      token: "test-token",
      applicationId: "app-1",
      prefix: "?",
      intents: combineIntents(GatewayIntent.Guilds),
      restPort: demoRest(),
      gateway: {
        totalShards: 1,
        gatewayUrl: "wss://example.test",
        identifyBudget: createIdentifyBudget({ maxConcurrency: 1 }),
        createWebSocket: createWs,
      },
    });

    expect(client.bridge).toBe(hub);
    expect(client.prefix).toBe("?");
    expect(gateway.shards).toHaveLength(1);
    expect(createWs).not.toHaveBeenCalled();

    await client.stop();
  });

  it("leaves createStambhaBot usable for advanced wiring", () => {
    const client = createStambhaBot({ prefix: "!", restPort: demoRest() });
    expect(client.bridge).toBeNull();
  });
});
