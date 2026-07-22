import type { CommandContext } from "@stambha/core";
import { afterEach, describe, expect, it } from "vitest";
import { PermissionLevel } from "./ladder.js";
import { permissionLevelGate } from "./permissionLevelGate.js";
import {
  configurePermissionLevels,
  resetPermissionLevels,
  resolvePermissionLevel,
} from "./resolve.js";

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

describe("@stambha/levels", () => {
  afterEach(() => {
    resetPermissionLevels();
  });

  it("exports the default ladder", () => {
    expect(PermissionLevel.Everyone).toBe(0);
    expect(PermissionLevel.BotOwner).toBe(10);
    expect(PermissionLevel.Moderator).toBeLessThan(PermissionLevel.Administrator);
  });

  it("resolves bot owners and guild owners", async () => {
    configurePermissionLevels({
      botOwners: ["bot-owner"],
      guildOwners: { g1: "guild-owner" },
    });
    expect(await resolvePermissionLevel(ctx({ userId: "bot-owner" }))).toBe(
      PermissionLevel.BotOwner,
    );
    expect(await resolvePermissionLevel(ctx({ userId: "guild-owner" }))).toBe(
      PermissionLevel.GuildOwner,
    );
    expect(
      await resolvePermissionLevel(
        ctx({ userId: "u1", meta: { guildOwnerId: "u1" } }),
      ),
    ).toBe(PermissionLevel.GuildOwner);
  });

  it("resolves role maps and bitfield fallback", async () => {
    configurePermissionLevels({
      moderatorRoleIds: ["mod-role"],
      administratorRoleIds: ["admin-role"],
    });
    expect(
      await resolvePermissionLevel(
        ctx({ userId: "u1", meta: { memberRoleIds: ["mod-role"] } }),
      ),
    ).toBe(PermissionLevel.Moderator);
    expect(
      await resolvePermissionLevel(
        ctx({
          userId: "u1",
          meta: { memberPermissions: 1n << 3n }, // Administrator
        }),
      ),
    ).toBe(PermissionLevel.Administrator);
  });

  it("permissionLevelGate denies below min and allows at/above", async () => {
    configurePermissionLevels({ botOwners: ["owner"] });
    const gate = permissionLevelGate(PermissionLevel.Moderator);

    const denied = await gate.check(ctx({ userId: "pleb" }));
    expect(denied.allow).toBe(false);

    const allowed = await gate.check(ctx({ userId: "owner" }));
    expect(allowed.allow).toBe(true);
  });

  it("resolveOverride wins below BotOwner/GuildOwner", async () => {
    configurePermissionLevels({
      resolveOverride: () => 7,
    });
    expect(await resolvePermissionLevel(ctx({ userId: "u1" }))).toBe(7);
  });
});
