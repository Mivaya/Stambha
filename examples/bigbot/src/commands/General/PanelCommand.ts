import {
  button,
  ButtonStyle,
  buttonRow,
  Command,
  type CommandContext,
  componentsV2,
  container,
  ok,
  type Registry,
  separator,
  textDisplay,
} from "@stambha/core";

/**
 * Demo: Discord Components V2 layout (`IS_COMPONENTS_V2`) with a Signal button.
 * Try `!panel` / `/panel` — clicks route via `stambha:confirm:…`.
 */
export class PanelCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "panel",
      description: "Components V2 container demo",
      kinds: ["slash", "prefix"],
      category: "General",
    });
  }

  async execute(ctx: CommandContext) {
    const signal = this.client.registries.signals.get("confirm");
    const actions = signal
      ? buttonRow(
          button({
            customId: signal.customId("yes"),
            label: "Looks good",
            style: ButtonStyle.Success,
          }),
          button({
            customId: signal.customId("no"),
            label: "Cancel",
            style: ButtonStyle.Secondary,
          }),
        )
      : buttonRow(
          button({
            customId: "stambha:confirm:yes",
            label: "Looks good",
            style: ButtonStyle.Success,
          }),
        );

    await ctx.reply(
      componentsV2({
        components: [
          container({
            accentColor: 0x57f287,
            components: [
              textDisplay({ content: "# Components V2" }),
              textDisplay({
                content:
                  "This message uses a **Container** + **Text Display** (no classic `content` / embeds).",
              }),
              separator(),
              textDisplay({ content: "Buttons still use `stambha:` Signal ids." }),
              actions,
            ],
          }),
        ],
      }),
    );
    return ok(undefined);
  }
}
