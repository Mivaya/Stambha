import { describe, expect, it } from "vitest";
import {
  bold,
  channelMention,
  codeBlock,
  inlineCode,
  roleMention,
  spoiler,
  time,
  userMention,
} from "./markdown.js";

describe("format markdown", () => {
  it("builds mentions", () => {
    expect(userMention("1")).toBe("<@1>");
    expect(roleMention("2")).toBe("<@&2>");
    expect(channelMention("3")).toBe("<#3>");
  });

  it("builds timestamps from Date and seconds", () => {
    expect(time(1_700_000_000, "R")).toBe("<t:1700000000:R>");
    expect(time(new Date(1_700_000_000_000), "f")).toBe("<t:1700000000:f>");
  });

  it("escapes code fences lightly", () => {
    expect(inlineCode("a`b")).toContain("ˋ");
    expect(codeBlock("x", "ts")).toContain("```ts");
    expect(bold("hi")).toBe("**hi**");
    expect(spoiler("secret")).toBe("||secret||");
  });
});
