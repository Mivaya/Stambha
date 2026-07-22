import type { CommandContext } from "@stambha/core";
import { Args } from "./Args.js";
import type { ArgResult } from "./errors.js";
import { argInvalid, argMissing, argOk } from "./errors.js";
import { booleanArg, integerArg, numberArg, parseUserMentionId } from "./resolvers.js";
import { SlashArgs } from "./SlashArgs.js";

/**
 * Shared named-arg accessors for hybrid commands (`kinds: ['slash','prefix']`).
 *
 * - **Slash:** reads `slashOptions` by name
 * - **Prefix:** prefers `--name=value`, then the next positional token
 */
export class HybridArgs {
  private readonly slash: SlashArgs | null;
  private readonly prefix: Args | null;

  private constructor(ctx: CommandContext) {
    if (ctx.kind === "slash") {
      this.slash = SlashArgs.fromContext(ctx);
      this.prefix = null;
    } else {
      this.slash = null;
      this.prefix = Args.fromContext(ctx);
    }
  }

  static fromContext(ctx: CommandContext): HybridArgs {
    return new HybridArgs(ctx);
  }

  /** Underlying prefix {@link Args} (flags + positionals), or `null` for slash. */
  get prefixArgs(): Args | null {
    return this.prefix;
  }

  /** Underlying {@link SlashArgs}, or `null` for prefix. */
  get slashArgs(): SlashArgs | null {
    return this.slash;
  }

  private takePrefixString(name: string): string | null {
    if (!this.prefix) return null;
    const fromFlag = this.prefix.option(name);
    if (fromFlag !== undefined) return fromFlag;
    // Bare `--name` is a boolean flag, not a string value.
    if (this.prefix.hasFlag(name)) return null;
    const peeked = this.prefix.peek();
    if (peeked === undefined) return null;
    this.prefix.pickResult((p) => argOk(p));
    return peeked;
  }

  getString(name: string): string | null {
    if (this.slash) return this.slash.getString(name);
    return this.takePrefixString(name);
  }

  getInteger(name: string): number | null {
    if (this.slash) return this.slash.getInteger(name);
    const raw = this.takePrefixString(name);
    if (raw === null) return null;
    const parsed = integerArg(raw);
    return parsed.ok ? parsed.value : null;
  }

  getNumber(name: string): number | null {
    if (this.slash) return this.slash.getNumber(name);
    const raw = this.takePrefixString(name);
    if (raw === null) return null;
    const parsed = numberArg(raw);
    return parsed.ok ? parsed.value : null;
  }

  getBoolean(name: string): boolean | null {
    if (this.slash) return this.slash.getBoolean(name);
    if (!this.prefix) return null;
    if (this.prefix.hasFlag(name)) {
      return this.prefix.flag(name);
    }
    const raw = this.prefix.peek();
    if (raw === undefined) return null;
    const parsed = booleanArg(raw);
    if (!parsed.ok) return null;
    this.prefix.pickResult(booleanArg);
    return parsed.value;
  }

  getSnowflake(name: string): string | null {
    if (this.slash) return this.slash.getSnowflake(name);
    const raw = this.takePrefixString(name);
    if (raw === null) return null;
    const parsed = parseUserMentionId(raw);
    return parsed.ok ? parsed.value : null;
  }

  requireString(name: string): ArgResult<string> {
    if (this.slash) return this.slash.requireString(name);
    const value = this.getString(name);
    if (value === null) {
      return argMissing(`Missing required argument "${name}".`);
    }
    return argOk(value);
  }

  requireInteger(name: string): ArgResult<number> {
    if (this.slash) return this.slash.requireInteger(name);
    const raw = this.takePrefixString(name);
    if (raw === null) {
      return argMissing(`Missing required argument "${name}".`);
    }
    const parsed = integerArg(raw);
    if (!parsed.ok) {
      return argInvalid(name, parsed.error.message);
    }
    return parsed;
  }
}

/** Shorthand for {@link HybridArgs.fromContext}. */
export function hybridArgsFromContext(ctx: CommandContext): HybridArgs {
  return HybridArgs.fromContext(ctx);
}
