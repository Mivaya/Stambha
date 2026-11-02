import { createSession } from "@stambha/transport";
import { describe, expect, it } from "vitest";
import {
  buildIdentifyPayload,
  buildRequestGuildMembersPayload,
  GatewayIdentifyCapability,
} from "./identify.js";

const session = createSession({ token: "t" });

describe("buildIdentifyPayload", () => {
  it("includes capabilities when set", () => {
    const payload = buildIdentifyPayload({
      session,
      shardId: 0,
      totalShards: 1,
      intents: 0,
      capabilities: GatewayIdentifyCapability.PrivateChannelObfuscation,
    });
    expect(payload.d.capabilities).toBe(1 << 15);
  });

  it("omits capabilities when unset", () => {
    const payload = buildIdentifyPayload({
      session,
      shardId: 0,
      totalShards: 1,
      intents: 0,
    });
    expect(payload.d.capabilities).toBeUndefined();
  });
});

describe("buildRequestGuildMembersPayload", () => {
  it("defaults to all-members request (empty query, limit 0)", () => {
    expect(buildRequestGuildMembersPayload({ guildId: "g1" })).toEqual({
      op: 8,
      d: { guild_id: "g1", query: "", limit: 0 },
    });
  });

  it("includes optional fields", () => {
    expect(
      buildRequestGuildMembersPayload({
        guildId: "g1",
        query: "a",
        limit: 10,
        nonce: "n1",
        presences: true,
      }),
    ).toEqual({
      op: 8,
      d: {
        guild_id: "g1",
        query: "a",
        limit: 10,
        nonce: "n1",
        presences: true,
      },
    });
  });
});
