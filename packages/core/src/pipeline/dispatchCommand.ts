import type { AutocompleteContext } from "../context/autocomplete.js";
import type { CommandContext, CommandKind } from "../context/types.js";
import type { Outcome } from "../outcome/Outcome.js";
import type { Command } from "../registries/Command.js";

/** Methods on {@link Command} that must not be treated as subcommand handlers. */
const RESERVED_HANDLER_NAMES = new Set([
  "constructor",
  "execute",
  "slash",
  "prefix",
  "menu",
  "autocomplete",
  "onCommandError",
  "supports",
  "success",
  "onLoad",
  "onUnload",
  "enable",
  "disable",
]);

/** True when the invocation is a slash command. */
export function isSlash(ctx: CommandContext): boolean {
  return ctx.kind === "slash";
}

/** True when the invocation is a prefix command. */
export function isPrefix(ctx: CommandContext): boolean {
  return ctx.kind === "prefix";
}

/** True when the invocation is a context-menu command. */
export function isMenu(ctx: CommandContext): boolean {
  return ctx.kind === "contextMenu";
}

type KindHandler = (ctx: CommandContext) => Promise<Outcome<unknown>>;

function kindHook(command: Command, kind: CommandKind): KindHandler | undefined {
  if (kind === "slash" && typeof command.slash === "function") {
    return (ctx) => command.slash!(ctx);
  }
  if (kind === "prefix" && typeof command.prefix === "function") {
    return (ctx) => command.prefix!(ctx);
  }
  if (kind === "contextMenu" && typeof command.menu === "function") {
    return (ctx) => command.menu!(ctx);
  }
  return undefined;
}

function isCallableHandler(command: Command, name: string): boolean {
  if (!/^[A-Za-z_][\w]*$/.test(name)) return false;
  if (RESERVED_HANDLER_NAMES.has(name)) return false;
  const value = Reflect.get(command, name);
  return typeof value === "function";
}

/**
 * Resolve leaf subcommand method when {@link CommandOptions.subcommandMethods} is enabled.
 * Uses `slashPath.subcommand` as the method name (group is ignored for naming).
 */
export function resolveSubcommandHandler(
  command: Command,
  ctx: CommandContext,
): KindHandler | undefined {
  if (!command.subcommandMethods) return undefined;
  if (ctx.kind !== "slash") return undefined;
  const leaf = ctx.slashPath?.subcommand;
  if (!leaf || !isCallableHandler(command, leaf)) return undefined;
  const fn = Reflect.get(command, leaf) as KindHandler;
  return (c) => fn.call(command, c);
}

/**
 * Pick the handler for a command invocation.
 * Order: subcommand method → kind hook (`slash` / `prefix` / `menu`) → {@link Command.execute}.
 */
export function resolveCommandHandler(command: Command, ctx: CommandContext): KindHandler {
  const sub = resolveSubcommandHandler(command, ctx);
  if (sub) return sub;

  const hook = kindHook(command, ctx.kind);
  if (hook) return hook;

  return (c) => command.execute(c);
}

/** Run the resolved command handler. */
export async function dispatchCommand(
  command: Command,
  ctx: CommandContext,
): Promise<Outcome<unknown>> {
  return resolveCommandHandler(command, ctx)(ctx);
}

/**
 * Resolve autocomplete: `${subcommand}Autocomplete` when `subcommandMethods` is on,
 * else {@link Command.autocomplete}. No-ops when neither is defined.
 */
export async function dispatchAutocomplete(
  command: Command,
  ctx: AutocompleteContext,
): Promise<void> {
  if (command.subcommandMethods) {
    const leaf = ctx.slashPath?.subcommand;
    if (leaf) {
      const name = `${leaf}Autocomplete`;
      if (isCallableHandler(command, name)) {
        const fn = Reflect.get(command, name) as (c: AutocompleteContext) => Promise<void>;
        await fn.call(command, ctx);
        return;
      }
    }
  }
  if (typeof command.autocomplete === "function") {
    await command.autocomplete(ctx);
  }
}
