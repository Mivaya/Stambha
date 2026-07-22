import { Args, SlashArgs, stringArg, unwrapArg } from "@stambha/args";
import {
  Command,
  type CommandContext,
  ok,
  type Registry,
  SlashOptionType,
} from "@stambha/core";
import { formatCommandHelp, formatHelpCatalog } from "./format.js";

export interface HelpCommandOptions {
  /** Command name (default `help`). */
  name?: string;
  /** Category for the help command itself (default `General`). */
  category?: string;
  /** Shown in help listings. */
  description?: string;
  /** Prefix character hint in detailed help (default `!`). */
  prefixHint?: string;
}

/**
 * Built-in help command — lists commands by category; optional `command` arg for details.
 * Hybrid: `kinds: ['prefix','slash']`.
 */
export class HelpCommand extends Command {
  private readonly prefixHint: string;

  constructor(registry: Registry<Command>, options: HelpCommandOptions = {}) {
    super(registry, {
      name: options.name ?? "help",
      description: options.description ?? "List available commands",
      detailedDescription:
        "Show all commands by category, or details for one command with `help <name>`.",
      kinds: ["prefix", "slash"],
      category: options.category ?? "General",
      slashOptions: [
        {
          name: "command",
          description: "Command name for detailed help",
          type: SlashOptionType.String,
          required: false,
        },
      ],
    });
    this.prefixHint = options.prefixHint ?? "!";
  }

  async execute(ctx: CommandContext) {
    const query = this.resolveQuery(ctx);
    const commands = this.client.registries.commands.values();

    if (query) {
      const primary = this.client.commandIndex.resolvePrefixName(query);
      const command = this.client.getCommand(primary);
      if (!command || !command.enabled || command.hidden) {
        await ctx.reply(`Unknown command \`${query}\`.`);
        return ok(undefined);
      }
      await ctx.reply(formatCommandHelp(command, this.prefixHint));
      return ok(command.name);
    }

    const byCategory = this.client.commandIndex.byCategory(commands);
    const body = formatHelpCatalog(byCategory);
    await ctx.reply(body);
    return ok(body);
  }

  private resolveQuery(ctx: CommandContext): string | null {
    if (ctx.kind === "slash") {
      const value = SlashArgs.fromContext(ctx).getString("command");
      return value?.trim() ? value.trim() : null;
    }

    const args = Args.fromContext(ctx);
    if (args.finished) return null;
    const picked = args.pick(stringArg);
    if (!picked.ok) return null;
    const value = unwrapArg(picked).trim();
    return value.length > 0 ? value : null;
  }
}

/** Factory for {@link HelpCommand} (optional options). */
export function createHelpCommand(
  registry: Registry<Command>,
  options?: HelpCommandOptions,
): HelpCommand {
  return new HelpCommand(registry, options);
}
