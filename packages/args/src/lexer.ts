/**
 * Tokenize prefix command argument text (Sapphire / lexure inspired).
 * Supports single and double quoted strings with basic backslash escapes.
 */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;

  while (i < input.length) {
    while (i < input.length && /\s/.test(input[i]!)) i++;
    if (i >= input.length) break;

    const char = input[i]!;

    if (char === '"' || char === "'") {
      const quote = char;
      i++;
      let value = "";
      while (i < input.length && input[i] !== quote) {
        if (input[i] === "\\" && i + 1 < input.length) {
          i++;
          value += input[i];
        } else {
          value += input[i];
        }
        i++;
      }
      if (i < input.length) i++;
      tokens.push(value);
      continue;
    }

    let value = "";
    while (i < input.length && !/\s/.test(input[i]!)) {
      value += input[i];
      i++;
    }

    // Support `--flag="quoted value"` spanning whitespace after `=`.
    const eq = value.indexOf("=");
    if (value.startsWith("--") && eq >= 0) {
      const after = value.slice(eq + 1);
      const quote = after[0];
      if (
        (quote === '"' || quote === "'") &&
        (after.length === 1 || after[after.length - 1] !== quote)
      ) {
        while (i < input.length && /\s/.test(input[i]!)) {
          value += input[i];
          i++;
        }
        while (i < input.length && input[i] !== quote) {
          value += input[i];
          i++;
        }
        if (i < input.length) {
          value += input[i];
          i++;
        }
      }
    }

    tokens.push(value);
  }

  return tokens;
}

/** Join tokens from index onward (unparsed remainder). */
export function joinFrom(tokens: readonly string[], startIndex: number): string {
  return tokens.slice(startIndex).join(" ");
}

/** Flag values: boolean presence flags or string option values (`--foo=bar`). */
export type FlagValue = string | boolean;

export interface ParsedPrefixArgs {
  /** Positional tokens (flags removed). */
  readonly tokens: readonly string[];
  /** Long flags keyed without leading `--` (lowercased). */
  readonly flags: ReadonlyMap<string, FlagValue>;
}

function isLongFlag(token: string): boolean {
  return token.startsWith("--") && token.length > 2;
}

/**
 * Split prefix arg text into positionals and FlagConverter-style long flags.
 *
 * Supported forms:
 * - `--verbose` → boolean `true` (does **not** consume the next token)
 * - `--foo=bar` / `--foo="bar baz"` → string `"bar"` / `"bar baz"`
 * - `--` alone ends flag parsing; remaining tokens stay positional
 *
 * Use `--foo=bar` (not `--foo bar`) for string option values so positionals stay intact.
 */
export function parsePrefixArgs(input: string): ParsedPrefixArgs {
  const raw = tokenize(input);
  const tokens: string[] = [];
  const flags = new Map<string, FlagValue>();
  let i = 0;
  let flagsDone = false;

  while (i < raw.length) {
    const token = raw[i]!;

    if (!flagsDone && token === "--") {
      flagsDone = true;
      i++;
      continue;
    }

    if (!flagsDone && isLongFlag(token)) {
      const body = token.slice(2);
      const eq = body.indexOf("=");
      if (eq >= 0) {
        const name = body.slice(0, eq).toLowerCase();
        let value = body.slice(eq + 1);
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (name) flags.set(name, value);
        i++;
        continue;
      }

      const name = body.toLowerCase();
      if (name) flags.set(name, true);
      i++;
      continue;
    }

    tokens.push(token);
    i++;
  }

  return { tokens, flags };
}
