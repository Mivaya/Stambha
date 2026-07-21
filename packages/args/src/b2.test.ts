import type { RestPort } from "@stambha/core";
import { describe, expect, it, vi } from "vitest";
import { Args } from "./Args.js";
import { resolveUser, userArg } from "./entities.js";
import { unwrapArg } from "./errors.js";
import { HybridArgs } from "./hybrid.js";
import { parsePrefixArgs, tokenize } from "./lexer.js";
import { stringArg } from "./resolvers.js";

describe("parsePrefixArgs flags", () => {
  it("parses boolean long flags", () => {
    const parsed = parsePrefixArgs("hello --verbose world");
    expect(parsed.tokens).toEqual(["hello", "world"]);
    expect(parsed.flags.get("verbose")).toBe(true);
  });

  it("parses --foo=bar valued flags", () => {
    expect(parsePrefixArgs("--text=hi there").flags.get("text")).toBe("hi");
    expect(parsePrefixArgs("--text=hi there").tokens).toEqual(["there"]);
    expect(parsePrefixArgs('echo --text="hello world"').flags.get("text")).toBe("hello world");
    // Bare `--text hello` keeps `hello` positional (use `--text=hello` for values).
    expect(parsePrefixArgs("echo --text hello").flags.get("text")).toBe(true);
    expect(parsePrefixArgs("echo --text hello").tokens).toEqual(["echo", "hello"]);
  });

  it("stops flag parsing after bare --", () => {
    const parsed = parsePrefixArgs("a -- --not-a-flag");
    expect(parsed.tokens).toEqual(["a", "--not-a-flag"]);
    expect(parsed.flags.size).toBe(0);
  });
});

describe("Args flags", () => {
  it("exposes flag() and option()", () => {
    const args = Args.fromText("ping --verbose --name=bob leftover");
    expect(args.flag("verbose")).toBe(true);
    expect(args.option("name")).toBe("bob");
    expect(unwrapArg(args.pick(stringArg))).toBe("ping");
    expect(unwrapArg(args.pick(stringArg))).toBe("leftover");
  });
});

describe("HybridArgs", () => {
  it("reads the same name from slash options and prefix flags/positionals", () => {
    const slash = HybridArgs.fromContext({
      kind: "slash",
      commandName: "say",
      userId: "1",
      guildId: null,
      channelId: "c",
      slashOptions: [{ name: "text", type: "string", value: "hello" }],
      raw: {},
      reply: async () => {},
      replyEphemeral: async () => {},
    });
    expect(slash.getString("text")).toBe("hello");
    expect(unwrapArg(slash.requireString("text"))).toBe("hello");

    const prefixFlag = HybridArgs.fromContext({
      kind: "prefix",
      commandName: "say",
      userId: "1",
      guildId: null,
      channelId: "c",
      argsText: "--text=hello",
      raw: {},
      reply: async () => {},
      replyEphemeral: async () => {},
    });
    expect(prefixFlag.getString("text")).toBe("hello");

    const prefixPos = HybridArgs.fromContext({
      kind: "prefix",
      commandName: "say",
      userId: "1",
      guildId: null,
      channelId: "c",
      argsText: "hello world",
      raw: {},
      reply: async () => {},
      replyEphemeral: async () => {},
    });
    expect(prefixPos.getString("text")).toBe("hello");
    expect(prefixPos.prefixArgs?.rest()).toBe("world");
  });
});

describe("userArg / resolveUser", () => {
  it("fetches a user via RestPort", async () => {
    const request = vi.fn(async () => ({
      id: "123456789012345678",
      username: "alice",
      bot: false,
    }));
    const rest: RestPort = { request };

    const result = await resolveUser(rest, "<@123456789012345678>");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe("123456789012345678");
      expect(result.value.username).toBe("alice");
    }
    expect(request).toHaveBeenCalledWith({
      method: "GET",
      route: "/users/123456789012345678",
    });
  });

  it("pickAsync consumes the token on success", async () => {
    const rest: RestPort = {
      request: async () => ({ id: "123456789012345678", username: "bob" }),
    };
    const args = Args.fromText("<@123456789012345678> extra");
    const user = await args.pickAsync(userArg(rest));
    expect(unwrapArg(user).username).toBe("bob");
    expect(unwrapArg(args.pick(stringArg))).toBe("extra");
  });

  it("fails without RestPort", async () => {
    const args = Args.fromText("123456789012345678");
    const result = await args.pickAsync(userArg(null));
    expect(result.ok).toBe(false);
  });
});

describe("tokenize still works", () => {
  it("splits quoted strings", () => {
    expect(tokenize('say "hello world"')).toEqual(["say", "hello world"]);
  });
});
