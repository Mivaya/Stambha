import { describe, expect, it } from "vitest";
import { createMentionPrefixResolver } from "./prefix.js";

describe("createMentionPrefixResolver", () => {
  const botId = "123456789012345678";
  const resolver = createMentionPrefixResolver(botId, "!");

  it("returns nick mention prefix for <@!id>", async () => {
    const content = `<@!${botId}> ping`;
    expect(await resolver({ userId: "u1", content })).toBe(`<@!${botId}>`);
  });

  it("returns mention prefix for <@id>", async () => {
    const content = `<@${botId}> ping`;
    expect(await resolver({ userId: "u1", content })).toBe(`<@${botId}>`);
  });

  it("falls back to text prefix", async () => {
    expect(await resolver({ userId: "u1", content: "!ping" })).toBe("!");
  });
});
