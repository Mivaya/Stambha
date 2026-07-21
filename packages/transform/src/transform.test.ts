import {
  gatesDesiredProperties,
  resolveDesiredProperties,
  slimCommandContext,
  slimMeta,
} from "@stambha/core";
import { describe, expect, it } from "vitest";
import { interactionReplyBody } from "./rest.js";

describe("@stambha/transform", () => {
  it("builds interaction reply REST body", () => {
    expect(interactionReplyBody("hi", true)).toEqual({
      type: 4,
      data: { content: "hi", flags: 64 },
    });
  });

  it("slims via core helper", () => {
    const desired = resolveDesiredProperties(gatesDesiredProperties);
    const slim = slimCommandContext(
      {
        kind: "prefix",
        commandName: "ping",
        userId: "1",
        guildId: null,
        channelId: "2",
        meta: { channelType: "dm", memberPermissions: 1n, clientPermissions: 2n },
        raw: {},
        reply: async () => {},
        replyEphemeral: async () => {},
      },
      desired,
    );
    expect(slim.raw).toBe(null);
    expect(slimMeta(slim.meta, desired.meta)).toEqual({
      channelType: "dm",
      memberPermissions: 1n,
      clientPermissions: 2n,
    });
  });
});
