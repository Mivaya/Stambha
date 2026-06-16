import type { ArgResult } from "./errors.js";
import { argInvalid, argOk } from "./errors.js";

export type BuiltinArgType =
  | "string"
  | "integer"
  | "number"
  | "boolean"
  | "rest"
  | "stringArray"
  | "snowflake";

const SNOWFLAKE_RE = /^\d{17,20}$/;
const USER_MENTION_RE = /^<@!?(\d{17,20})>$/;
const CHANNEL_MENTION_RE = /^<#(\d{17,20})>$/;
const ROLE_MENTION_RE = /^<@&(\d{17,20})>$/;

export function parseSnowflake(parameter: string): ArgResult<string> {
  if (SNOWFLAKE_RE.test(parameter)) return argOk(parameter);
  return argInvalid(parameter, `"${parameter}" is not a valid snowflake id.`);
}

export function parseUserMentionId(parameter: string): ArgResult<string> {
  const match = USER_MENTION_RE.exec(parameter);
  if (match?.[1]) return argOk(match[1]);
  return parseSnowflake(parameter);
}

export function parseChannelMentionId(parameter: string): ArgResult<string> {
  const match = CHANNEL_MENTION_RE.exec(parameter);
  if (match?.[1]) return argOk(match[1]);
  return parseSnowflake(parameter);
}

export function parseRoleMentionId(parameter: string): ArgResult<string> {
  const match = ROLE_MENTION_RE.exec(parameter);
  if (match?.[1]) return argOk(match[1]);
  return parseSnowflake(parameter);
}

export const snowflakeArg: ArgResolver<string> = (parameter) => parseSnowflake(parameter);
export const userMentionArg: ArgResolver<string> = (parameter) => parseUserMentionId(parameter);
export const channelMentionArg: ArgResolver<string> = (parameter) => parseChannelMentionId(parameter);
export const roleMentionArg: ArgResolver<string> = (parameter) => parseRoleMentionId(parameter);

export type ArgResolver<T> = (parameter: string) => ArgResult<T>;

export const stringArg: ArgResolver<string> = (parameter) => argOk(parameter);

export const integerArg: ArgResolver<number> = (parameter) => {
  const n = Number(parameter);
  if (!Number.isInteger(n) || parameter.trim() === "") {
    return argInvalid(parameter, `"${parameter}" is not a valid integer.`);
  }
  return argOk(n);
};

export const numberArg: ArgResolver<number> = (parameter) => {
  const n = Number(parameter);
  if (Number.isNaN(n) || parameter.trim() === "") {
    return argInvalid(parameter, `"${parameter}" is not a valid number.`);
  }
  return argOk(n);
};

export const booleanArg: ArgResolver<boolean> = (parameter) => {
  const lower = parameter.toLowerCase();
  if (lower === "true" || lower === "yes" || lower === "1") return argOk(true);
  if (lower === "false" || lower === "no" || lower === "0") return argOk(false);
  return argInvalid(parameter, `"${parameter}" is not a valid boolean (use true/false).`);
};

const BUILTIN: Record<BuiltinArgType, ArgResolver<unknown>> = {
  string: stringArg,
  integer: integerArg,
  number: numberArg,
  boolean: booleanArg,
  rest: (parameter) => argOk(parameter),
  stringArray: (parameter) => argOk(parameter.split(",").map((s) => s.trim())),
  snowflake: snowflakeArg,
};

export class ArgRegistry {
  private readonly resolvers = new Map<string, ArgResolver<unknown>>(Object.entries(BUILTIN));

  register<T>(name: string, resolver: ArgResolver<T>): void {
    this.resolvers.set(name, resolver as ArgResolver<unknown>);
  }

  get(name: string): ArgResolver<unknown> | undefined {
    return this.resolvers.get(name);
  }

  resolve(name: BuiltinArgType | string, parameter: string): ArgResult<unknown> {
    const resolver = this.resolvers.get(name);
    if (!resolver) {
      return argInvalid(parameter, `Unknown argument type "${name}".`);
    }
    return resolver(parameter);
  }
}

export const defaultArgRegistry = new ArgRegistry();

export function defineArgResolver<T>(name: string, resolver: ArgResolver<T>): ArgResolver<T> {
  defaultArgRegistry.register(name, resolver);
  return resolver;
}

export function resolveBuiltin(name: BuiltinArgType | string, parameter: string): ArgResult<unknown> {
  return defaultArgRegistry.resolve(name, parameter);
}
