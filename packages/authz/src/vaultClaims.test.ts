import { defineBlueprint, MemoryDriver, Vault } from "@stambha/vault";
import type { CommandContext } from "@stambha/core";
import { afterEach, describe, expect, it } from "vitest";
import { defineCapability, hasCapability, resetAuthz } from "./resolve.js";
import {
  attachVaultCapabilityClaims,
  capabilityClaimsField,
  clearMemberCapability,
  denyMemberCapability,
  getMemberCapabilityClaims,
  grantMemberCapability,
} from "./vaultClaims.js";

const ManageMessages = 1n << 13n;

const GuildBlueprint = defineBlueprint({
  capabilityClaims: capabilityClaimsField(),
});

function ctx(userId: string): CommandContext {
  return {
    kind: "slash",
    commandName: "test",
    userId,
    guildId: "g1",
    channelId: "c1",
    raw: {},
    meta: { memberPermissions: ManageMessages },
    reply: async () => {},
    replyEphemeral: async () => {},
  };
}

describe("vault capability claims", () => {
  afterEach(() => {
    resetAuthz();
  });

  it("grants, denies, and clears via Vault", async () => {
    const vault = new Vault({ driver: new MemoryDriver(), debounceMs: 0 });
    vault.registerLedger("guild", { blueprint: GuildBlueprint });
    await vault.init();

    defineCapability("mod.purge", { discordPermissions: ManageMessages });
    attachVaultCapabilityClaims(vault, {
      authz: { botOwners: ["owner"] },
    });

    await grantMemberCapability(vault, "g1", "mod-user", "mod.purge");
    expect(await getMemberCapabilityClaims(vault, "g1", "mod-user")).toEqual({
      userId: "mod-user",
      grants: ["mod.purge"],
      denies: [],
    });
    expect(await hasCapability(ctx("mod-user"), "mod.purge")).toBe(true);
    expect(await hasCapability(ctx("nobody"), "mod.purge")).toBe(false);
    expect(await hasCapability(ctx("owner"), "mod.purge")).toBe(true);

    await denyMemberCapability(vault, "g1", "mod-user", "mod.purge");
    expect(await hasCapability(ctx("mod-user"), "mod.purge")).toBe(false);

    expect(await clearMemberCapability(vault, "g1", "mod-user", "mod.purge")).toBe(true);
    expect(await getMemberCapabilityClaims(vault, "g1", "mod-user")).toBeNull();
  });
});
