import { Command, createStambhaBot, ok, type RestPort } from "@stambha/core";
import type { StambhaMessage } from "@stambha/transform";
import { describe, expect, it, vi } from "vitest";
import { attachStambhaClient } from "./attachStambhaClient.js";
import { createGatewayEventHub } from "./GatewayEventHub.js";

class PingCommand extends Command {
  async execute() {
    return ok(undefined);
  }
}

const mockRestPort: RestPort = {
  request: vi.fn(async () => ({})),
};

describe("attachStambhaClient", () => {
  it("routes mention prefix commands when mentionCommands is true", async () => {
    const botId = "111222333444555666";
    const client = createStambhaBot({
      prefix: "!",
      restPort: mockRestPort,
    });
    client.register(
      new PingCommand(client.registries.commands, { name: "ping", kinds: ["prefix"] }),
    );

    const hub = createGatewayEventHub();
    const processSpy = vi.spyOn(client.router, "processPrefixCommand");
    attachStambhaClient(hub, client, { mentionCommands: true, scouts: false });

    hub.emit("ready", { user: { id: botId } });

    const message: StambhaMessage = {
      id: "m1",
      content: `<@${botId}> ping`,
      channelId: "c1",
      guildId: "g1",
      author: { id: "u1", bot: false },
    };
    hub.emit("messageCreate", message);

    await vi.waitFor(() => expect(processSpy).toHaveBeenCalledOnce());
  });
});
