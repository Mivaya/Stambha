import {
  Command,
  type CommandContext,
  ok,
  type Registry,
  selectRow,
  stringSelect,
} from "@stambha/core";

/** Demo for persistent select menus (`registerPersistentSignals` + builders). */
export class MenuCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "menu",
      description: "Persistent color select (survives bot restart)",
      kinds: ["slash", "prefix"],
      category: "General",
    });
  }

  async execute(ctx: CommandContext) {
    const signal = this.client.registries.signals.get("colors");
    const customId = signal?.customId() ?? "stambha:colors";

    await ctx.reply({
      content: "Pick a color (stable `stambha:colors` id — works after restart):",
      components: [
        selectRow(
          stringSelect({
            customId,
            placeholder: "Colors",
            options: [
              { label: "Red", value: "red", description: "Crimson" },
              { label: "Blue", value: "blue", description: "Azure" },
              { label: "Green", value: "green", description: "Emerald" },
            ],
          }),
        ),
      ],
    });
    return ok(undefined);
  }
}
