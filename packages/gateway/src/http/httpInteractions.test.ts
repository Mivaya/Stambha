import { generateKeyPairSync, sign } from "node:crypto";
import { Command, createStambhaBot, ok, type CommandContext, type Registry } from "@stambha/core";
import { describe, expect, it, vi } from "vitest";
import { createHttpInteractionHandler } from "./createHttpInteractionHandler.js";
import { verifyDiscordInteractionRequest } from "./verifyKey.js";

function ed25519Fixture() {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  const publicKeyHex = Buffer.from(
    publicKey.export({ type: "spki", format: "der" }).subarray(-32),
  ).toString("hex");
  const signBody = (timestamp: string, body: string) => {
    const message = Buffer.from(timestamp + body);
    return sign(null, message, privateKey).toString("hex");
  };
  return { publicKeyHex, signBody };
}

describe("verifyDiscordInteractionRequest", () => {
  it("accepts a valid signature and rejects tampering", async () => {
    const { publicKeyHex, signBody } = ed25519Fixture();
    const timestamp = "1234567890";
    const body = '{"type":1}';
    const signature = signBody(timestamp, body);

    await expect(
      verifyDiscordInteractionRequest(body, signature, timestamp, publicKeyHex),
    ).resolves.toBe(true);

    await expect(
      verifyDiscordInteractionRequest('{"type":2}', signature, timestamp, publicKeyHex),
    ).resolves.toBe(false);

    await expect(
      verifyDiscordInteractionRequest(body, "00", timestamp, publicKeyHex),
    ).resolves.toBe(false);
  });
});

describe("createHttpInteractionHandler", () => {
  it("returns PONG for PING after verification", async () => {
    const { publicKeyHex, signBody } = ed25519Fixture();
    const client = createStambhaBot({ restPort: { request: vi.fn() } });
    const handle = createHttpInteractionHandler({ publicKey: publicKeyHex, client });

    const timestamp = "100";
    const rawBody = JSON.stringify({ type: 1 });
    const result = await handle({
      rawBody,
      signature: signBody(timestamp, rawBody),
      timestamp,
    });

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ type: 1 });
  });

  it("returns 401 for invalid signatures", async () => {
    const { publicKeyHex } = ed25519Fixture();
    const client = createStambhaBot({ restPort: { request: vi.fn() } });
    const handle = createHttpInteractionHandler({ publicKey: publicKeyHex, client });

    const result = await handle({
      rawBody: JSON.stringify({ type: 1 }),
      signature: "deadbeef",
      timestamp: "1",
    });
    expect(result.status).toBe(401);
  });

  it("routes slash commands and returns the interaction callback body", async () => {
    const { publicKeyHex, signBody } = ed25519Fixture();
    const request = vi.fn().mockResolvedValue({});
    const client = createStambhaBot({ restPort: { request } });

    class PingCommand extends Command {
      constructor(registry: Registry<Command>) {
        super(registry, { name: "ping", kinds: ["slash"] });
      }
      async execute(ctx: CommandContext) {
        await ctx.reply("pong");
        return ok(undefined);
      }
    }
    client.register(new PingCommand(client.registries.commands));

    const handle = createHttpInteractionHandler({
      publicKey: publicKeyHex,
      client,
      restPort: { request },
    });

    const interaction = {
      id: "i1",
      token: "tok",
      type: 2,
      application_id: "app",
      channel_id: "c1",
      user: { id: "u1" },
      data: { name: "ping" },
    };
    const timestamp = "200";
    const rawBody = JSON.stringify(interaction);
    const result = await handle({
      rawBody,
      signature: signBody(timestamp, rawBody),
      timestamp,
    });

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({
      type: 4,
      data: { content: "pong" },
    });
    // Initial callback was captured — not forwarded to REST
    expect(request).not.toHaveBeenCalled();
  });
});
