import {
  button,
  ButtonStyle,
  Command,
  type CommandContext,
  confirmCancelRow,
  ok,
  type Registry,
} from "@stambha/core";

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
    const components = signal
      ? [confirmCancelRow(signal)]
      : [
          {
            type: 1 as const,
            components: [
              button({
                customId: "stambha:confirm:yes",
                label: "Confirm",
                style: ButtonStyle.Success,
              }),
            ],
          },
        ];

    await ctx.reply({
      content: "Press a button to confirm or cancel:",
      components,
    });
    return ok(undefined);
  }
}
