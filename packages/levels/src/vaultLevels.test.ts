import { MemoryDriver, Vault } from "@stambha/vault";
import { defineBlueprint } from "@stambha/vault";
import { afterEach, describe, expect, it } from "vitest";
import { PermissionLevel } from "./ladder.js";
import { resetPermissionLevels, resolvePermissionLevel } from "./resolve.js";
import {
  attachVaultLevelOverrides,
  clearMemberPermissionLevel,
  getMemberPermissionLevel,
  permissionLevelsField,
  setMemberPermissionLevel,
} from "./vaultLevels.js";
import type { CommandContext } from "@stambha/core";

const GuildBlueprint = defineBlueprint({
  prefix: { type: "string", default: "!" },
  permissionLevels: permissionLevelsField(),
});

function ctx(userId: string, guildId = "g1"): CommandContext {
  return {
    kind: "slash",
    commandName: "test",
    userId,
    guildId,
    channelId: "c1",
    raw: {},
    reply: async () => {},
    replyEphemeral: async () => {},
  };
}

describe("vault level overrides", () => {
  afterEach(() => {
    resetPermissionLevels();
  });

  it("sets, gets, clears, and resolves via attachVaultLevelOverrides", async () => {
    const vault = new Vault({ driver: new MemoryDriver(), debounceMs: 1 });
    vault.registerLedger("guild", { blueprint: GuildBlueprint });
    await vault.init();

    attachVaultLevelOverrides(vault, {
      levels: { botOwners: ["owner"], permissionBitFallback: false },
    });

    await setMemberPermissionLevel(vault, "g1", "mod-user", PermissionLevel.Moderator);
    expect(await getMemberPermissionLevel(vault, "g1", "mod-user")).toBe(
      PermissionLevel.Moderator,
    );

    expect(await resolvePermissionLevel(ctx("mod-user"))).toBe(PermissionLevel.Moderator);
    expect(await resolvePermissionLevel(ctx("nobody"))).toBe(PermissionLevel.Everyone);
    expect(await resolvePermissionLevel(ctx("owner"))).toBe(PermissionLevel.BotOwner);

    expect(await clearMemberPermissionLevel(vault, "g1", "mod-user")).toBe(true);
    expect(await getMemberPermissionLevel(vault, "g1", "mod-user")).toBeNull();
    expect(await resolvePermissionLevel(ctx("mod-user"))).toBe(PermissionLevel.Everyone);
  });
});
