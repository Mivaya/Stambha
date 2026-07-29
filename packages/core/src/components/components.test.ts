import { describe, expect, it } from "vitest";
import { StambhaClient } from "../client/StambhaClient.js";
import { Signal } from "../registries/Signal.js";
import {
  actionRow,
  ButtonStyle,
  button,
  buttonRow,
  ComponentType,
  collectCustomIds,
  componentsV2,
  confirmCancelRow,
  container,
  EmbedBuilder,
  MessageFlags,
  modal,
  PanelBuilder,
  panel,
  registerPersistentSignals,
  section,
  selectRow,
  separator,
  stringSelect,
  TextInputStyle,
  textDisplay,
  textInput,
  thumbnail,
  V2Builder,
} from "./index.js";

describe("component builders", () => {
  it("builds button rows and confirm/cancel", () => {
    const client = new StambhaClient();
    const signal = new (class extends Signal {
      run = async () => {};
    })(client.registries.signals, { name: "confirm" });

    const row = confirmCancelRow(signal);
    expect(row.type).toBe(ComponentType.ActionRow);
    expect(row.components).toHaveLength(2);
    expect(row.components[0]).toMatchObject({
      type: ComponentType.Button,
      style: ButtonStyle.Success,
      custom_id: "stambha:confirm:yes",
      label: "Confirm",
    });
    expect(row.components[1]).toMatchObject({
      custom_id: "stambha:confirm:no",
      style: ButtonStyle.Secondary,
    });
  });

  it("builds string select rows", () => {
    const row = selectRow(
      stringSelect({
        customId: "stambha:colors",
        placeholder: "Pick",
        options: [
          { label: "Red", value: "red" },
          { label: "Blue", value: "blue" },
        ],
      }),
    );
    expect(row.components[0]).toMatchObject({
      type: ComponentType.StringSelect,
      custom_id: "stambha:colors",
      placeholder: "Pick",
    });
  });

  it("builds modals with text inputs", () => {
    const m = modal({
      customId: "stambha:note",
      title: "Note",
      components: [
        actionRow(textInput({ customId: "body", label: "Body", style: TextInputStyle.Paragraph })),
      ],
    });
    expect(m.custom_id).toBe("stambha:note");
    expect(m.components[0]?.components[0]).toMatchObject({
      type: ComponentType.TextInput,
      custom_id: "body",
    });
  });

  it("rejects invalid row layouts", () => {
    expect(() => buttonRow()).toThrow(/1–5/);
    expect(() =>
      actionRow(
        button({ customId: "a", label: "A" }),
        stringSelect({ customId: "s", options: [{ label: "x", value: "x" }] }),
      ),
    ).toThrow(/alone/);
  });
});

describe("Components V2 builders", () => {
  it("builds container with text, separator, and signal buttons", () => {
    const client = new StambhaClient();
    const signal = new (class extends Signal {
      run = async () => {};
    })(client.registries.signals, { name: "panel" });

    const panel = container({
      accentColor: 0x5865f2,
      components: [
        textDisplay({ content: "# Panel" }),
        separator(),
        textDisplay({ content: "Choose an action." }),
        buttonRow(
          button({
            customId: signal.customId("go"),
            label: "Go",
            style: ButtonStyle.Primary,
          }),
        ),
      ],
    });

    expect(panel).toMatchObject({
      type: ComponentType.Container,
      accent_color: 0x5865f2,
    });
    expect(panel.components).toHaveLength(4);

    const reply = componentsV2({ components: [panel] });
    expect(reply.flags).toBe(MessageFlags.IsComponentsV2);
    expect(collectCustomIds(reply.components!)).toEqual(["stambha:panel:go"]);
  });

  it("builds section with thumbnail accessory", () => {
    const s = section({
      text: [textDisplay({ content: "# Title" }), textDisplay({ content: "Body" })],
      accessory: thumbnail({ url: "https://example.com/a.png", description: "Art" }),
    });
    expect(s.type).toBe(ComponentType.Section);
    expect(s.accessory).toMatchObject({
      type: ComponentType.Thumbnail,
      media: { url: "https://example.com/a.png" },
    });
  });

  it("rejects empty containers and oversized sections", () => {
    expect(() => container({ components: [] })).toThrow(/at least one/);
    expect(() =>
      section({
        text: [],
        accessory: thumbnail({ url: "https://example.com/a.png" }),
      }),
    ).toThrow(/1–3/);
  });

  it("auto-wraps simple string in componentsV2", () => {
    const payload = componentsV2("Hello V2", { accentColor: 0xff0000, ephemeral: true });
    expect(payload.flags).toBe(MessageFlags.IsComponentsV2);
    expect(payload.ephemeral).toBe(true);
    expect(payload.components).toHaveLength(1);

    const wrapper = payload.components![0] as any;
    expect(wrapper).toMatchObject({
      type: ComponentType.Container,
      accent_color: 0xff0000,
    });
    expect(wrapper.components).toHaveLength(1);
    expect(wrapper.components![0]).toMatchObject({
      type: ComponentType.TextDisplay,
      content: "Hello V2",
    });
  });

  it("builds component tree sequentially via V2Builder", () => {
    const payload = new V2Builder()
      .container(0x5865f2)
      .text("Line A")
      .text("Line B")
      .setEphemeral(true)
      .build();

    expect(payload.flags).toBe(MessageFlags.IsComponentsV2);
    expect(payload.ephemeral).toBe(true);
    expect(payload.components).toHaveLength(1);

    const c = payload.components![0] as any;
    expect(c).toMatchObject({
      type: ComponentType.Container,
      accent_color: 0x5865f2,
    });
    expect(c.components).toHaveLength(2);
    expect(c.components![0]).toMatchObject({ type: ComponentType.TextDisplay, content: "Line A" });
    expect(c.components![1]).toMatchObject({ type: ComponentType.TextDisplay, content: "Line B" });
  });
});

describe("registerPersistentSignals", () => {
  it("registers new signals and skips existing names", () => {
    const client = new StambhaClient();
    class PanelSignal extends Signal {
      run = async () => {};
    }

    const first = registerPersistentSignals(client, (registry) => [
      new PanelSignal(registry, { name: "panel", types: ["button"] }),
    ]);
    expect(first).toHaveLength(1);
    expect(client.registries.signals.get("panel")).toBe(first[0]);

    const second = registerPersistentSignals(client, (registry) => [
      new PanelSignal(registry, { name: "panel", types: ["button"] }),
      new PanelSignal(registry, { name: "panel-b", types: ["select"] }),
    ]);
    expect(second.map((s) => s.name)).toEqual(["panel-b"]);
    expect(client.registries.signals.size).toBe(2);
  });
});

describe("EmbedBuilder", () => {
  it("builds classic Discord embed JSON using fluent chaining", () => {
    const embed = new EmbedBuilder()
      .setTitle("Command: !ping")
      .setDescription("Check bot responsiveness")
      .setUrl("https://stambha.dev")
      .setColor(0x57f287)
      .setAuthor({ name: "Mivaya", iconUrl: "https://stambha.dev/icon.png" })
      .setThumbnail("https://stambha.dev/thumb.png")
      .setImage("https://stambha.dev/banner.png")
      .setFooter({ text: "Requested by User", iconUrl: "https://stambha.dev/user.png" })
      .setTimestamp(new Date("2026-07-29T12:00:00Z"))
      .addFields(
        { name: "Module", value: "General", inline: true },
        { name: "Aliases", value: "!pong", inline: true },
      )
      .toJSON();

    expect(embed).toEqual({
      title: "Command: !ping",
      description: "Check bot responsiveness",
      url: "https://stambha.dev",
      color: 0x57f287,
      author: { name: "Mivaya", icon_url: "https://stambha.dev/icon.png" },
      thumbnail: { url: "https://stambha.dev/thumb.png" },
      image: { url: "https://stambha.dev/banner.png" },
      footer: { text: "Requested by User", icon_url: "https://stambha.dev/user.png" },
      timestamp: "2026-07-29T12:00:00.000Z",
      fields: [
        { name: "Module", value: "General", inline: true },
        { name: "Aliases", value: "!pong", inline: true },
      ],
    });
  });

  it("handles field modification via spliceFields and setFields", () => {
    const builder = new EmbedBuilder().addFields(
      { name: "A", value: "1" },
      { name: "B", value: "2" },
    );

    builder.spliceFields(1, 1, { name: "C", value: "3" });
    expect(builder.toJSON().fields).toEqual([
      { name: "A", value: "1" },
      { name: "C", value: "3" },
    ]);

    builder.setFields([{ name: "D", value: "4" }]);
    expect(builder.toJSON().fields).toEqual([{ name: "D", value: "4" }]);
  });
});

describe("panel() and PanelBuilder", () => {
  it("constructs a Components V2 panel payload with fields, footer, and accent color", () => {
    const payload = panel({
      title: "Command: !ping",
      description: "Check bot responsiveness and API latency.",
      color: 0x57f287,
      fields: [
        { name: "Module", value: "General", inline: true },
        { name: "Aliases", value: "!pong", inline: true },
        { name: "Usage", value: "`!ping`", inline: false },
      ],
      footer: { text: "Requested by User" },
      timestamp: 1700000000,
      ephemeral: true,
    });

    expect(payload.flags).toBe(MessageFlags.IsComponentsV2);
    expect(payload.ephemeral).toBe(true);
    expect(payload.components).toHaveLength(1);

    const cont = payload.components![0] as any;
    expect(cont.type).toBe(ComponentType.Container);
    expect(cont.accent_color).toBe(0x57f287);
    expect(cont.components.length).toBeGreaterThan(0);
  });

  it("builds identical payload using PanelBuilder class", () => {
    const payloadFromFn = panel({
      title: "Title",
      description: "Desc",
      color: 0xff0000,
    });

    const payloadFromBuilder = new PanelBuilder()
      .setTitle("Title")
      .setDescription("Desc")
      .setColor(0xff0000)
      .build();

    expect(payloadFromBuilder).toEqual(payloadFromFn);
  });

  it("handles header with thumbnail accessory", () => {
    const payload = panel({
      title: "Header with Thumb",
      thumbnail: "https://example.com/thumb.png",
    });

    const cont = payload.components![0] as any;
    const headerSection = cont.components[0];
    expect(headerSection.type).toBe(ComponentType.Section);
    expect(headerSection.accessory.type).toBe(ComponentType.Thumbnail);
    expect(headerSection.accessory.media.url).toBe("https://example.com/thumb.png");
  });
});
