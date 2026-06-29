import { Command, type CommandContext, ok, type Registry } from "@stambha/core";

export class ConfirmCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "confirm",
      description: "Show a confirm button (Signal demo)",
      kinds: ["slash", "prefix"],
      category: "General",
    });
  }

  async execute(ctx: CommandContext) {
    const signal = this.client.registries.signals.get("confirm");
    const customId = signal?.customId("yes") ?? "stambha:confirm:yes";

    await ctx.reply({
      content: "Press the button to confirm:",
      components: [
        {
          type: 1,
          components: [{ type: 2, style: 1, label: "Confirm", custom_id: customId }],
        },
      ],
    });
    return ok(undefined);
  }
}
