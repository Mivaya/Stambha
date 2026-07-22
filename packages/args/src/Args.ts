import type { CommandContext } from "@stambha/core";
import type { ArgResult } from "./errors.js";
import { argMissing } from "./errors.js";
import type { AsyncArgResolver } from "./entities.js";
import { type FlagValue, joinFrom, parsePrefixArgs } from "./lexer.js";
import { type ArgResolver, type BuiltinArgType, defaultArgRegistry } from "./resolvers.js";

export class Args {
  private index = 0;

  readonly source: string;
  readonly tokens: readonly string[];
  readonly flags: ReadonlyMap<string, FlagValue>;

  constructor(
    source: string,
    tokens?: readonly string[],
    flags?: ReadonlyMap<string, FlagValue>,
  ) {
    this.source = source;
    if (tokens !== undefined && flags !== undefined) {
      this.tokens = tokens;
      this.flags = flags;
    } else if (tokens !== undefined) {
      this.tokens = tokens;
      this.flags = new Map();
    } else {
      const parsed = parsePrefixArgs(source);
      this.tokens = parsed.tokens;
      this.flags = parsed.flags;
    }
  }

  static fromText(text: string): Args {
    const parsed = parsePrefixArgs(text);
    return new Args(text, parsed.tokens, parsed.flags);
  }

  static fromContext(ctx: CommandContext): Args {
    return Args.fromText(ctx.argsText ?? "");
  }

  get finished(): boolean {
    return this.index >= this.tokens.length;
  }

  get remaining(): number {
    return Math.max(0, this.tokens.length - this.index);
  }

  peek(): string | undefined {
    return this.tokens[this.index];
  }

  /** Save cursor position for backtracking. */
  save(): number {
    return this.index;
  }

  restore(state: number): this {
    this.index = state;
    return this;
  }

  reset(): this {
    this.index = 0;
    return this;
  }

  /** True when `--name` was present (boolean flag or any valued option). */
  hasFlag(name: string): boolean {
    return this.flags.has(name.toLowerCase());
  }

  /** Boolean presence (`--verbose`) or coerced `--name=true|false`. */
  flag(name: string): boolean {
    const value = this.flags.get(name.toLowerCase());
    if (value === undefined) return false;
    if (typeof value === "boolean") return value;
    const lower = value.toLowerCase();
    if (lower === "false" || lower === "0" || lower === "no") return false;
    return true;
  }

  /** String value for `--name=value` / `--name value`; `undefined` if absent or bare boolean. */
  option(name: string): string | undefined {
    const value = this.flags.get(name.toLowerCase());
    if (value === undefined || typeof value === "boolean") return undefined;
    return value;
  }

  pickResult<T>(resolver: ArgResolver<T>): ArgResult<T> {
    const parameter = this.tokens[this.index];
    if (parameter === undefined) {
      return argMissing("Missing required argument.");
    }

    const result = resolver(parameter);
    if (result.ok) this.index++;
    return result;
  }

  pick<T>(resolver: ArgResolver<T>): ArgResult<T> {
    return this.pickResult(resolver);
  }

  /** Async entity resolvers (e.g. REST-backed {@link userArg}). */
  async pickAsync<T>(resolver: AsyncArgResolver<T>): Promise<ArgResult<T>> {
    const parameter = this.tokens[this.index];
    if (parameter === undefined) {
      return argMissing("Missing required argument.");
    }
    const result = await resolver(parameter);
    if (result.ok) this.index++;
    return result;
  }

  pickType(type: BuiltinArgType | string): ArgResult<unknown> {
    const parameter = this.tokens[this.index];
    if (parameter === undefined) {
      return argMissing("Missing required argument.");
    }

    const registry = defaultArgRegistry;
    const result = registry.resolve(type, parameter);
    if (result.ok) this.index++;
    return result;
  }

  maybeResult<T>(resolver: ArgResolver<T>): ArgResult<T | null> {
    const parameter = this.peek();
    if (parameter === undefined) return { ok: true, value: null };
    return this.pickResult(resolver);
  }

  maybeType(type: BuiltinArgType | string): ArgResult<unknown | null> {
    if (this.finished) return { ok: true, value: null };
    return this.pickType(type);
  }

  /** All remaining tokens joined with spaces. */
  rest(): string {
    return joinFrom(this.tokens, this.index);
  }

  pickRest(): ArgResult<string> {
    if (this.finished) return argMissing("Missing required argument.");
    const value = this.rest();
    this.index = this.tokens.length;
    return { ok: true, value };
  }
}

/** @deprecated Prefer {@link Args.fromText} which parses flags; kept for raw tokenize-only use. */
export function argsFromTokens(source: string, tokens: readonly string[]): Args {
  return new Args(source, tokens, new Map());
}
