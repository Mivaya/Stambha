import type { Command } from "@stambha/core";

/** Format the full help listing grouped by category. */
export function formatHelpCatalog(byCategory: Map<string, Command[]>): string {
  const categories = [...byCategory.keys()].sort((a, b) => a.localeCompare(b));
  if (categories.length === 0) {
    return "No commands available.";
  }

  const sections: string[] = ["**Commands**"];
  for (const category of categories) {
    const commands = byCategory.get(category) ?? [];
    const lines = commands.map((cmd) => {
      const desc = cmd.description.trim();
      return desc ? `• \`${cmd.name}\` — ${desc}` : `• \`${cmd.name}\``;
    });
    sections.push(`**${category}**\n${lines.join("\n")}`);
  }
  sections.push("_Use `help <command>` for details._");
  return sections.join("\n\n");
}

/** Format a single command's help (detailedDescription or description). */
export function formatCommandHelp(command: Command, prefixHint = "!"): string {
  const detail = command.detailedDescription.trim() || command.description.trim();
  const kinds = command.kinds.join(", ");
  const lines = [
    `**${command.name}**`,
    detail || "_No description._",
    `Category: ${command.category || "General"}`,
    `Kinds: ${kinds}`,
  ];
  if (command.aliases.length > 0) {
    lines.push(`Aliases: ${command.aliases.map((a) => `\`${a}\``).join(", ")}`);
  }
  if (command.kinds.includes("prefix")) {
    lines.push(`Prefix: \`${prefixHint}${command.name}\``);
  }
  if (command.kinds.includes("slash")) {
    lines.push(`Slash: \`/${command.name}\``);
  }
  return lines.join("\n");
}
