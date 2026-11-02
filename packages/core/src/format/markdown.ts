/** Discord message content formatters (mentions, time, code, style). */

export function userMention(userId: string): string {
  return `<@${userId}>`;
}

export function roleMention(roleId: string): string {
  return `<@&${roleId}>`;
}

export function channelMention(channelId: string): string {
  return `<#${channelId}>`;
}

export function slashCommandMention(name: string, commandId: string): string {
  return `</${name}:${commandId}>`;
}

/** Discord timestamp styles. */
export type TimestampStyle = "t" | "T" | "d" | "D" | "f" | "F" | "R";

/** Unix seconds (or Date / ms) → Discord timestamp markdown. */
export function time(value: Date | number, style: TimestampStyle = "f"): string {
  const seconds =
    value instanceof Date
      ? Math.floor(value.getTime() / 1000)
      : value > 1e12
        ? Math.floor(value / 1000)
        : value;
  return `<t:${seconds}:${style}>`;
}

export function bold(text: string): string {
  return `**${text}**`;
}

export function italic(text: string): string {
  return `*${text}*`;
}

export function underline(text: string): string {
  return `__${text}__`;
}

export function strikethrough(text: string): string {
  return `~~${text}~~`;
}

export function spoiler(text: string): string {
  return `||${text}||`;
}

export function inlineCode(text: string): string {
  return `\`${text.replace(/`/g, "ˋ")}\``;
}

export function codeBlock(text: string, language = ""): string {
  const safe = text.replace(/```/g, "ˋˋˋ");
  return `\`\`\`${language}\n${safe}\n\`\`\``;
}

export function quote(text: string): string {
  return text
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
}
