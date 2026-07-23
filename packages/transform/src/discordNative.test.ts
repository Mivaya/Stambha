import { describe, expect, it } from "vitest";
import { interactionFromDispatch } from "./discordNative.js";

describe("interactionFromDispatch", () => {
  it("parses slash command with options and subcommand path", () => {
    const interaction = interactionFromDispatch({
      id: "i1",
      token: "tok",
      type: 2,
      application_id: "app",
      guild_id: "g1",
      channel_id: "c1",
      channel: { type: 0, nsfw: false },
      member: { permissions: "8", roles: ["r-mod", "r-other"], user: { id: "u1" } },
      app_permissions: "2147483647",
      data: {
        name: "mod",
        options: [
          {
            name: "action",
            type: 1,
            options: [{ name: "target", type: 6, value: "999" }],
          },
        ],
      },
    });

    expect(interaction?.kind).toBe("slash");
    if (interaction?.kind !== "slash") return;

    expect(interaction.commandName).toBe("mod");
    expect(interaction.slashPath).toEqual({ root: "mod", subcommand: "action" });
    expect(interaction.slashOptions).toEqual([{ name: "target", type: "user", value: "999" }]);
    expect(interaction.meta?.memberPermissions).toBe(8n);
    expect(interaction.meta?.memberRoleIds).toEqual(["r-mod", "r-other"]);
    expect(interaction.meta?.channelType).toBe("guild_text");
  });

  it("maps interaction entitlements onto meta", () => {
    const interaction = interactionFromDispatch({
      id: "i-ent",
      token: "tok",
      type: 2,
      application_id: "app",
      user: { id: "u1" },
      channel_id: "c1",
      entitlements: [
        {
          id: "e1",
          sku_id: "sku-premium",
          application_id: "app",
          user_id: "u1",
          type: 8,
          deleted: false,
          ends_at: null,
        },
      ],
      data: { name: "premium" },
    });

    expect(interaction?.kind).toBe("slash");
    if (interaction?.kind !== "slash") return;
    expect(interaction.meta?.entitlements).toEqual([
      {
        id: "e1",
        skuId: "sku-premium",
        applicationId: "app",
        userId: "u1",
        type: 8,
        deleted: false,
        endsAt: null,
      },
    ]);
  });

  it("parses interaction context and authorizing integration owners", () => {
    const interaction = interactionFromDispatch({
      id: "i5",
      token: "tok5",
      type: 2,
      application_id: "app",
      context: 1,
      authorizing_integration_owners: { "1": "user-installer" },
      user: { id: "u1" },
      channel_id: "c1",
      data: { name: "profile" },
    });

    expect(interaction?.kind).toBe("slash");
    if (interaction?.kind !== "slash") return;
    expect(interaction.interactionContext).toBe("bot_dm");
    expect(interaction.authorizingIntegrationOwners).toEqual({ userInstall: "user-installer" });
  });

  it("parses autocomplete interactions", () => {
    const interaction = interactionFromDispatch({
      id: "i2",
      token: "tok2",
      type: 4,
      user: { id: "u1" },
      data: {
        name: "search",
        options: [{ name: "q", type: 3, value: "ap", focused: true }],
      },
    });

    expect(interaction?.kind).toBe("autocomplete");
    if (interaction?.kind !== "autocomplete") return;
    expect(interaction.focusedOption).toBe("q");
    expect(interaction.userInput).toBe("ap");
  });

  it("parses button components", () => {
    const interaction = interactionFromDispatch({
      id: "i3",
      token: "tok3",
      type: 3,
      user: { id: "u1" },
      data: { custom_id: "stambha:confirm:yes", component_type: 2 },
    });

    expect(interaction?.kind).toBe("component");
    if (interaction?.kind !== "component") return;
    expect(interaction.customId).toBe("stambha:confirm:yes");
    expect(interaction.componentType).toBe("button");
    expect(interaction.values).toEqual([]);
  });

  it("parses select menu values", () => {
    const interaction = interactionFromDispatch({
      id: "i3b",
      token: "tok3b",
      type: 3,
      user: { id: "u1" },
      data: {
        custom_id: "stambha:colors",
        component_type: 3,
        values: ["blue"],
      },
    });

    expect(interaction?.kind).toBe("component");
    if (interaction?.kind !== "component") return;
    expect(interaction.componentType).toBe("select");
    expect(interaction.values).toEqual(["blue"]);
  });

  it("parses modal submit", () => {
    const interaction = interactionFromDispatch({
      id: "i4",
      token: "tok4",
      type: 5,
      user: { id: "u1" },
      data: { custom_id: "stambha:setup:note" },
    });

    expect(interaction?.kind).toBe("modal");
    if (interaction?.kind !== "modal") return;
    expect(interaction.customId).toBe("stambha:setup:note");
  });
});
