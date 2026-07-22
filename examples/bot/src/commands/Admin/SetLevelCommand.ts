import {
  Command,
  type CommandContext,
  ok,
  type Registry,
  SlashOptionType,
} from "@stambha/core";
import type { LoaderContext } from "@stambha/loader";
import {
  clearMemberPermissionLevel,
  getMemberPermissionLevel,
  PermissionLevel,
  permissionLevelGate,
  resolvePermissionLevel,
  setMemberPermissionLevel,
} from "@stambha/levels";
import type { Vault } from "@stambha/vault";

function parseUserId(raw: string | undefined): string | null {
  if (!raw) return null;
  const mention = raw.match(/^<@!?(\d+)>$/);
  if (mention?.[1]) return mention[1];
  if (/^\d{17,20}$/.test(raw)) return raw;
  return null;
}

function parseLevel(raw: string | undefined): number | null {
  if (raw === undefined || raw === "") return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > PermissionLevel.BotOwner) return null;
  return n;
}

/**
 * Admin command: set / clear / show Vault permission level overrides.
 * Usage:
 * - `!setlevel <@user|id> <0-10>`
 * - `!setlevel <@user|id> clear`
 * - `!setlevel <@user|id>` (show override + resolved)
 */
export class SetLevelCommand extends Command {
  static create(ctx: LoaderContext) {
    return new SetLevelCommand(ctx.client.registries.commands, ctx.vault as Vault);
  }

  constructor(
    registry: Registry<Command>,
    private readonly vault: Vault,
  ) {
    super(registry, {
      name: "setlevel",
      description: "Set or clear a member permission level override (Vault)",
      kinds: ["slash", "prefix"],
      category: "Admin",
      gates: [permissionLevelGate(PermissionLevel.Administrator)],
      slashOptions: [
        {
          name: "user",
          description: "Member to configure",
          type: SlashOptionType.User,
          required: true,
        },
        {
          name: "level",
          description: "Level 0–10, or omit with action",
          type: SlashOptionType.Integer,
          required: false,
          minValue: 0,
          maxValue: PermissionLevel.BotOwner,
        },
        {
          name: "action",
          description: "set (default) or clear",
          type: SlashOptionType.String,
          required: false,
          choices: [
            { name: "set", value: "set" },
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

    const { userId, level, action } = this.parseArgs(ctx);
    if (!userId) {
      await ctx.reply("Usage: `setlevel <user> [level|clear|show]`");
      return ok(undefined);
    }

    if (action === "clear") {
      const cleared = await clearMemberPermissionLevel(this.vault, ctx.guildId, userId);
      await ctx.reply(
        cleared
          ? `Cleared Vault override for \`${userId}\`.`
          : `No Vault override for \`${userId}\`.`,
      );
      return ok({ userId, cleared });
    }

    if (action === "show" || level === null) {
      const override = await getMemberPermissionLevel(this.vault, ctx.guildId, userId);
      const resolved = await resolvePermissionLevel({
        ...ctx,
        userId,
      });
      await ctx.reply(
        `User \`${userId}\` — Vault override: ${
          override === null ? "_none_" : String(override)
        } · resolved level: **${resolved}**`,
      );
      return ok({ userId, override, resolved });
    }

    await setMemberPermissionLevel(this.vault, ctx.guildId, userId, level);
    await ctx.reply(`Set Vault override for \`${userId}\` to level **${level}**.`);
    return ok({ userId, level });
  }

  private parseArgs(ctx: CommandContext): {
    userId: string | null;
    level: number | null;
    action: "set" | "clear" | "show";
  } {
    if (ctx.kind === "slash") {
      const userOpt = ctx.slashOptions?.find((o) => o.name === "user");
      const levelOpt = ctx.slashOptions?.find((o) => o.name === "level");
      const actionOpt = ctx.slashOptions?.find((o) => o.name === "action");
      const userId = typeof userOpt?.value === "string" ? userOpt.value : null;
      const level = typeof levelOpt?.value === "number" ? levelOpt.value : null;
      const actionRaw = typeof actionOpt?.value === "string" ? actionOpt.value : "set";
      const action =
        actionRaw === "clear" || actionRaw === "show" ? actionRaw : ("set" as const);
      if (action === "set" && level === null) {
        return { userId, level: null, action: "show" };
      }
      return { userId, level, action };
    }

    const parts = (ctx.argsText ?? "").trim().split(/\s+/).filter(Boolean);
    const userId = parseUserId(parts[0]);
    const second = parts[1]?.toLowerCase();
    if (second === "clear") return { userId, level: null, action: "clear" };
    if (second === "show" || second === undefined) {
      return { userId, level: null, action: "show" };
    }
    return { userId, level: parseLevel(parts[1]), action: "set" };
  }
}
