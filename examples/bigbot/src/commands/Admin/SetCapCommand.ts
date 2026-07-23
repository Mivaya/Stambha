import {
  Command,
  type CommandContext,
  ok,
  type Registry,
  SlashOptionType,
} from "@stambha/core";
import type { LoaderContext } from "@stambha/loader";
import {
  capabilityGate,
  clearMemberCapability,
  denyMemberCapability,
  getMemberCapabilityClaims,
  grantMemberCapability,
  hasCapability,
} from "@stambha/authz";
import type { Vault } from "@stambha/vault";

function parseUserId(raw: string | undefined): string | null {
  if (!raw) return null;
  const mention = raw.match(/^<@!?(\d+)>$/);
  if (mention?.[1]) return mention[1];
  if (/^\d{17,20}$/.test(raw)) return raw;
  return null;
}

/**
 * Admin command: grant / deny / clear / show Vault capability claims.
 * Usage:
 * - `!setcap <@user|id> <capability> grant|deny|clear|show`
 * - `!setcap <@user|id> show` (all claims)
 */
export class SetCapCommand extends Command {
  static create(ctx: LoaderContext) {
    return new SetCapCommand(ctx.client.registries.commands, ctx.vault as Vault);
  }

  constructor(
    registry: Registry<Command>,
    private readonly vault: Vault,
  ) {
    super(registry, {
      name: "setcap",
      description: "Grant, deny, or clear a member capability claim (Vault)",
      kinds: ["slash", "prefix"],
      category: "Admin",
      gates: [capabilityGate("admin.config")],
      slashOptions: [
        {
          name: "user",
          description: "Member to configure",
          type: SlashOptionType.User,
          required: true,
        },
        {
          name: "capability",
          description: "Capability id (e.g. mod.purge)",
          type: SlashOptionType.String,
          required: false,
        },
        {
          name: "action",
          description: "grant, deny, clear, or show",
          type: SlashOptionType.String,
          required: false,
          choices: [
            { name: "grant", value: "grant" },
            { name: "deny", value: "deny" },
            { name: "clear", value: "clear" },
            { name: "show", value: "show" },
          ],
        },
      ],
    });
  }

  async execute(ctx: CommandContext) {
    if (!ctx.guildId) {
      await ctx.reply("Guild-only command.");
      return ok(undefined);
    }

    const { userId, capabilityId, action } = this.parseArgs(ctx);
    if (!userId) {
      await ctx.reply("Usage: `setcap <user> [capability] [grant|deny|clear|show]`");
      return ok(undefined);
    }

    if (action === "show" || !capabilityId) {
      const claims = await getMemberCapabilityClaims(this.vault, ctx.guildId, userId);
      const allowed = capabilityId
        ? await hasCapability({ ...ctx, userId }, capabilityId)
        : null;
      await ctx.reply(
        [
          `User \`${userId}\``,
          `Vault grants: ${claims?.grants.join(", ") || "_none_"}`,
          `Vault denies: ${claims?.denies.join(", ") || "_none_"}`,
          capabilityId
            ? `Resolved \`${capabilityId}\`: **${allowed ? "allow" : "deny"}**`
            : null,
        ]
          .filter(Boolean)
          .join("\n"),
      );
      return ok({ userId, claims, allowed });
    }

    if (action === "clear") {
      const cleared = await clearMemberCapability(
        this.vault,
        ctx.guildId,
        userId,
        capabilityId,
      );
      await ctx.reply(
        cleared
          ? `Cleared Vault claim \`${capabilityId}\` for \`${userId}\`.`
          : `No Vault claim \`${capabilityId}\` for \`${userId}\`.`,
      );
      return ok({ userId, capabilityId, cleared });
    }

    if (action === "deny") {
      await denyMemberCapability(this.vault, ctx.guildId, userId, capabilityId);
      await ctx.reply(`Denied \`${capabilityId}\` for \`${userId}\` in Vault.`);
      return ok({ userId, capabilityId, action });
    }

    await grantMemberCapability(this.vault, ctx.guildId, userId, capabilityId);
    await ctx.reply(`Granted \`${capabilityId}\` for \`${userId}\` in Vault.`);
    return ok({ userId, capabilityId, action: "grant" });
  }

  private parseArgs(ctx: CommandContext): {
    userId: string | null;
    capabilityId: string | null;
    action: "grant" | "deny" | "clear" | "show";
  } {
    if (ctx.kind === "slash") {
      const userOpt = ctx.slashOptions?.find((o) => o.name === "user");
      const capOpt = ctx.slashOptions?.find((o) => o.name === "capability");
      const actionOpt = ctx.slashOptions?.find((o) => o.name === "action");
      const userId = typeof userOpt?.value === "string" ? userOpt.value : null;
      const capabilityId = typeof capOpt?.value === "string" ? capOpt.value : null;
      const actionRaw = typeof actionOpt?.value === "string" ? actionOpt.value : "show";
      const action =
        actionRaw === "grant" ||
        actionRaw === "deny" ||
        actionRaw === "clear" ||
        actionRaw === "show"
          ? actionRaw
          : ("show" as const);
      return { userId, capabilityId, action };
    }

    const parts = (ctx.argsText ?? "").trim().split(/\s+/).filter(Boolean);
    const userId = parseUserId(parts[0]);
    const second = parts[1];
    const third = parts[2]?.toLowerCase();
    if (!second || second === "show") {
      return { userId, capabilityId: null, action: "show" };
    }
    if (third === "deny" || third === "clear" || third === "show" || third === "grant") {
      return { userId, capabilityId: second, action: third };
    }
    if (second === "clear" || second === "deny" || second === "grant") {
      return { userId, capabilityId: null, action: second };
    }
    return { userId, capabilityId: second, action: "show" };
  }
}
