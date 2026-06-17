import {
  gatesDesiredProperties,
  resolveDesiredProperties,
  slimCommandContext,
  slimMeta,
} from "@stambha/core";
import { describe, expect, it, vi } from "vitest";
import { buildDiscordenoDesiredProperties, metaFromDiscordenoSlash } from "./discordeno.js";
import { LEGACY_LIBRARY_ADAPTER_REMOVAL } from "./deprecation.js";
import { interactionReplyBody } from "./rest.js";

describe("@stambha/transform", () => {
  it("warns once when a deprecated library adapter is used", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    buildDiscordenoDesiredProperties(
      resolveDesiredProperties({ context: { meta: true }, meta: { memberPermissions: true } }),
    );
    buildDiscordenoDesiredProperties(
      resolveDesiredProperties({ context: { meta: true }, meta: { memberPermissions: true } }),
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain(LEGACY_LIBRARY_ADAPTER_REMOVAL);
    warn.mockRestore();
  });

  it("builds discordeno desired properties with member when permissions wanted", () => {
    const resolved = resolveDesiredProperties(gatesDesiredProperties);
    const props = buildDiscordenoDesiredProperties(resolved);
    expect((props.interaction as Record<string, boolean>).member).toBe(true);
  });

  it("maps discordeno interaction permissions to meta", () => {
    const meta = metaFromDiscordenoSlash({
      guildId: 1n,
      member: { permissions: 8n },
    });
    expect(meta?.memberPermissions).toBe(8n);
  });

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
