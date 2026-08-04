import {
  channelSelect,
  ChannelSelectChannelType,
  Command,
  type CommandContext,
  ok,
  type Registry,
  selectRow,
  stringSelect,
  userSelect,
} from "@stambha/core";

/** Demo for persistent select menus — string + entity selects (`registerPersistentSignals`). */
export class MenuCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "menu",
      description: "Persistent color + entity selects (survives bot restart)",
      kinds: ["slash", "prefix"],
      category: "General",
    });
  }

  async execute(ctx: CommandContext) {
    const signal = this.client.registries.signals.get("colors");
    const colorId = signal?.customId() ?? "stambha:colors";
    const usersId = signal?.customId("users") ?? "stambha:colors:users";
    const channelId = signal?.customId("channel") ?? "stambha:colors:channel";

    await ctx.reply({
      content:
        "Pick a color, users, or channel (stable `stambha:colors*` ids — work after restart):",
      components: [
        selectRow(
          stringSelect({
            customId: colorId,
            placeholder: "Colors",
            options: [
              { label: "Red", value: "red", description: "Crimson" },
              { label: "Blue", value: "blue", description: "Azure" },
              { label: "Green", value: "green", description: "Emerald" },
            ],
          }),
        ),
        selectRow(
          userSelect({
            customId: usersId,
            placeholder: "Pick users",
            maxValues: 5,
          }),
        ),
        selectRow(
          channelSelect({
            customId: channelId,
            placeholder: "Pick a text channel",
            channelTypes: [ChannelSelectChannelType.GuildText],
          }),
        ),
      ],
    });
    return ok(undefined);
  }
}
