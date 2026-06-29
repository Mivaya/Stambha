import type { RestPort } from "@stambha/core";
import { describe, expect, it, vi } from "vitest";
import {
  channelMessageBody,
  interactionDeferBody,
  interactionReplyBody,
  webhookMessageBody,
} from "./rest.js";
import { commandContextFromStambhaSlashViaRest } from "./splitContext.js";

const slashInteraction = {
  kind: "slash" as const,
  id: "i1",
  token: "tok",
  applicationId: "app1",
  user: { id: "u1" },
  guildId: "g1",
  channelId: "c1",
  commandName: "ping",
  slashPath: { root: "ping" },
  slashOptions: [],
  raw: {},
};

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

  it("passes components through interaction and channel bodies", () => {
    const row = { type: 1, components: [{ type: 2, style: 1, label: "OK", custom_id: "stambha:ok" }] };
    expect(interactionReplyBody({ content: "Pick", components: [row] })).toEqual({
      type: 4,
      data: { content: "Pick", components: [row] },
    });
    expect(channelMessageBody({ content: "Pick", components: [row] })).toEqual({
      content: "Pick",
      components: [row],
    });
  });

  it("builds deferred interaction body", () => {
    expect(interactionDeferBody(true)).toEqual({ type: 5, data: { flags: 64 } });
  });

  it("passes embed-only webhook edit bodies through", () => {
    expect(webhookMessageBody({ embeds: [{ title: "only" }] })).toEqual({
      embeds: [{ title: "only" }],
    });
  });
});

describe("slash callbacks", () => {
  it("patches the interaction webhook message via editReply", async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const rest: RestPort = { request };

    const ctx = commandContextFromStambhaSlashViaRest(slashInteraction, rest);
    await ctx.editReply?.({ content: "done" });

    expect(request).toHaveBeenCalledWith({
      method: "PATCH",
      route: "/webhooks/app1/tok/messages/@original",
      body: { content: "done" },
    });
  });

  it("defers via deferReply", async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const rest: RestPort = { request };

    const ctx = commandContextFromStambhaSlashViaRest(slashInteraction, rest);
    await ctx.deferReply?.(true);

    expect(request).toHaveBeenCalledWith({
      method: "POST",
      route: "/interactions/i1/tok/callback",
      body: { type: 5, data: { flags: 64 } },
    });
  });
});
