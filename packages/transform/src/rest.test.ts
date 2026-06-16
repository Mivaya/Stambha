import { describe, expect, it, vi } from "vitest";
import type { RestPort } from "@stambha/core";
import {
  channelMessageBody,
  interactionReplyBody,
  webhookMessageBody,
} from "./rest.js";
import { commandContextFromStambhaSlashViaRest } from "./splitContext.js";

describe("rest payloads", () => {
  it("builds channel message with embeds", () => {
    expect(channelMessageBody({ content: "hi", embeds: [{ title: "x" }] })).toEqual({
      content: "hi",
      embeds: [{ title: "x" }],
    });
  });

  it("builds interaction reply with ephemeral flag", () => {
    expect(interactionReplyBody({ embeds: [{ title: "x" }], ephemeral: true })).toEqual({
      type: 4,
      data: { embeds: [{ title: "x" }], flags: 64 },
    });
  });

  it("passes embed-only webhook edit bodies through", () => {
    expect(webhookMessageBody({ embeds: [{ title: "only" }] })).toEqual({
      embeds: [{ title: "only" }],
    });
  });
});

describe("slash editReply", () => {
  it("patches the interaction webhook message", async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const rest: RestPort = { request };

    const ctx = commandContextFromStambhaSlashViaRest(
      {
        id: "i1",
        token: "tok",
        applicationId: "app1",
        user: { id: "u1" },
        guildId: "g1",
        channelId: "c1",
      },
      "ping",
      rest,
    );

    await ctx.editReply?.({ content: "done" });

    expect(request).toHaveBeenCalledWith({
      method: "PATCH",
      route: "/webhooks/app1/tok/messages/@original",
      body: { content: "done" },
    });
  });
});
