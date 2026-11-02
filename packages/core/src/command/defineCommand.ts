import type { AutocompleteContext } from "../context/autocomplete.js";
import type { CommandContext } from "../context/types.js";
import type { Outcome } from "../outcome/Outcome.js";
import type { Registry } from "../pieces/Registry.js";
import { Command, type CommandOptions } from "../registries/Command.js";

export type CommandHandler = (ctx: CommandContext) => Promise<Outcome<unknown>>;
export type AutocompleteHandler = (ctx: AutocompleteContext) => Promise<void>;

export interface DefineCommandOptions extends CommandOptions {
  execute?: CommandHandler;
  slash?: CommandHandler;
  prefix?: CommandHandler;
  menu?: CommandHandler;
  autocomplete?: AutocompleteHandler;
  onCommandError?: (error: unknown, ctx: CommandContext) => Promise<void>;
}

/**
 * Options-first Command factory — no `constructor(registry) { super(registry, opts) }` boilerplate.
 * Export the returned class as `default` from a `commands/` file for {@link loadPieces}.
 *
 * @example
 * ```ts
 * export default defineCommand({
 *   name: "ping",
 *   description: "Pong!",
 *   kinds: ["slash", "prefix"],
 *   async execute(ctx) {
 *     await ctx.reply("Pong!");
 *     return ok(undefined);
 *   },
 * });
 * ```
 */
export function defineCommand(options: DefineCommandOptions): typeof Command {
  class DefinedCommand extends Command {
    constructor(registry: Registry<Command>) {
      super(registry, options);
    }

    override execute(ctx: CommandContext): Promise<Outcome<unknown>> {
      if (options.execute) return options.execute.call(this, ctx);
      return super.execute(ctx);
    }
  }

  const slashHandler = options.slash;
  if (slashHandler) {
    DefinedCommand.prototype.slash = function slash(this: Command, ctx: CommandContext) {
      return slashHandler.call(this, ctx);
    };
  }
  const prefixHandler = options.prefix;
  if (prefixHandler) {
    DefinedCommand.prototype.prefix = function prefix(this: Command, ctx: CommandContext) {
      return prefixHandler.call(this, ctx);
    };
  }
  const menuHandler = options.menu;
  if (menuHandler) {
    DefinedCommand.prototype.menu = function menu(this: Command, ctx: CommandContext) {
      return menuHandler.call(this, ctx);
    };
  }
  const autocompleteHandler = options.autocomplete;
  if (autocompleteHandler) {
    DefinedCommand.prototype.autocomplete = function autocomplete(
      this: Command,
      ctx: AutocompleteContext,
    ) {
      return autocompleteHandler.call(this, ctx);
    };
  }
  const onCommandErrorHandler = options.onCommandError;
  if (onCommandErrorHandler) {
    DefinedCommand.prototype.onCommandError = function onCommandError(
      this: Command,
      error: unknown,
      ctx: CommandContext,
    ) {
      return onCommandErrorHandler(error, ctx);
    };
  }

  Object.defineProperty(DefinedCommand, "name", {
    value: `DefinedCommand_${options.name}`,
  });

  return DefinedCommand as typeof Command;
}
