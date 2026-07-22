import type { CommandContext } from "@stambha/core";
import { afterEach, describe, expect, it } from "vitest";
import { capabilityGate } from "./capabilityGate.js";
import {
  configureAuthz,
  defineCapability,
  hasCapability,
  resetAuthz,
  resolveCapability,
} from "./resolve.js";

const ManageMessages = 1n << 13n;
const KickMembers = 1n << 1n;

function ctx(partial: Partial<CommandContext> & Pick<CommandContext, "userId">): CommandContext {
  return {
    kind: "slash",
    commandName: "test",
    guildId: "g1",
    channelId: "c1",
    raw: {},
    reply: async () => {},
    replyEphemeral: async () => {},
    ...partial,
  };
}

describe("@stambha/authz", () => {
  afterEach(() => {
    resetAuthz();
  });

  it("denies unknown capabilities (fail closed)", async () => {
    const decision = await resolveCapability(ctx({ userId: "u1" }), "mod.purge");
    expect(decision).toEqual({ allow: false, reason: "unknown_capability" });
  });

  it("allows bot owners without Discord bits", async () => {
    defineCapability("mod.purge", { discordPermissions: ManageMessages });
    configureAuthz({ botOwners: ["owner"] });
    expect(await hasCapability(ctx({ userId: "owner" }), "mod.purge")).toBe(true);
    expect(
      (await resolveCapability(ctx({ userId: "owner" }), "mod.purge")).reason,
    ).toBe("bot_owner");
  });

  it("requires Discord permission floor before role grants", async () => {
    defineCapability("mod.purge", {
      discordPermissions: ManageMessages,
      roleIds: ["mod-role"],
    });
    expect(
      await hasCapability(
        ctx({ userId: "u1", meta: { memberRoleIds: ["mod-role"] } }),
        "mod.purge",
      ),
    ).toBe(false);

    expect(
      await hasCapability(
        ctx({
          userId: "u1",
          meta: { memberRoleIds: ["mod-role"], memberPermissions: ManageMessages },
        }),
        "mod.purge",
      ),
    ).toBe(true);
  });

  it("Administrator bit satisfies the Discord floor", async () => {
    defineCapability("mod.purge", { discordPermissions: ManageMessages, roleIds: ["mod"] });
    expect(
      await hasCapability(
        ctx({
          userId: "u1",
          meta: { memberRoleIds: ["mod"], memberPermissions: 1n << 3n },
        }),
        "mod.purge",
      ),
    ).toBe(true);
  });

  it("vault deny wins; vault grant allows after floor", async () => {
    defineCapability("mod.purge", { discordPermissions: ManageMessages });
    configureAuthz({
      resolveClaim: (_ctx, id) => (id === "mod.purge" ? "deny" : null),
    });
    expect(
      await hasCapability(
        ctx({ userId: "u1", meta: { memberPermissions: ManageMessages } }),
        "mod.purge",
      ),
    ).toBe(false);

    resetAuthz();
    defineCapability("mod.purge", { discordPermissions: ManageMessages });
    configureAuthz({
      resolveClaim: () => "grant",
    });
    expect(
      await hasCapability(
        ctx({ userId: "u1", meta: { memberPermissions: ManageMessages } }),
        "mod.purge",
      ),
    ).toBe(true);
    expect(
      await hasCapability(ctx({ userId: "u1" }), "mod.purge"),
    ).toBe(false);
  });

  it("allowGuildOwner after Discord floor", async () => {
    defineCapability("mod.purge", {
      discordPermissions: ManageMessages,
      allowGuildOwner: true,
    });
    expect(
      await hasCapability(
        ctx({
          userId: "owner",
          meta: { guildOwnerId: "owner", memberPermissions: ManageMessages },
        }),
        "mod.purge",
      ),
    ).toBe(true);
  });

  it("roleCapabilities map grants after floor", async () => {
    defineCapability("economy.admin", { discordPermissions: KickMembers });
    configureAuthz({
      roleCapabilities: { "econ-role": ["economy.admin"] },
    });
    expect(
      await hasCapability(
        ctx({
          userId: "u1",
          meta: { memberRoleIds: ["econ-role"], memberPermissions: KickMembers },
        }),
        "economy.admin",
      ),
    ).toBe(true);
  });

  it("capabilityGate denies and allows", async () => {
    defineCapability("mod.purge", {
      discordPermissions: ManageMessages,
      roleIds: ["mod"],
    });
    const gate = capabilityGate("mod.purge");

    const denied = await gate.check(ctx({ userId: "pleb" }));
    expect(denied.allow).toBe(false);

    const allowed = await gate.check(
      ctx({
        userId: "mod",
        meta: { memberRoleIds: ["mod"], memberPermissions: ManageMessages },
      }),
    );
    expect(allowed.allow).toBe(true);
  });
});
