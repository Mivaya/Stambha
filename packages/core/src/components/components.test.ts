import { describe, expect, it } from "vitest";
import { StambhaClient } from "../client/StambhaClient.js";
import { Signal } from "../registries/Signal.js";
import {
  actionRow,
  ButtonStyle,
  button,
  buttonRow,
  ChannelSelectChannelType,
  channelSelect,
  ComponentType,
  collectCustomIds,
  componentsV2,
  confirmCancelRow,
  container,
  ContainerBuilder,
  ContainerView,
  EmbedBuilder,
  file,
  fileComponent,
  FileBuilder,
  MediaGalleryBuilder,
  mentionableSelect,
  MessageFlags,
  modal,
  premiumButton,
  registerPersistentSignals,
  roleSelect,
  section,
  SectionBuilder,
  selectRow,
  separator,
  SeparatorBuilder,
  SeparatorSpacing,
  stringSelect,
  TextDisplayBuilder,
  TextInputStyle,
  textDisplay,
  textInput,
  thumbnail,
  ThumbnailBuilder,
  userSelect,
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

  it("builds entity selects (user / role / mentionable / channel)", () => {
    expect(userSelect({ customId: "u", minValues: 1, maxValues: 3 })).toMatchObject({
      type: ComponentType.UserSelect,
      custom_id: "u",
      min_values: 1,
      max_values: 3,
    });
    expect(roleSelect({ customId: "r", placeholder: "Role" })).toMatchObject({
      type: ComponentType.RoleSelect,
      custom_id: "r",
      placeholder: "Role",
    });
    expect(mentionableSelect({ customId: "m" }).type).toBe(ComponentType.MentionableSelect);
    const ch = channelSelect({
      customId: "c",
      channelTypes: [ChannelSelectChannelType.GuildText, ChannelSelectChannelType.GuildForum],
      defaultValues: [{ id: "1", type: "channel" }],
    });
    expect(ch).toMatchObject({
      type: ComponentType.ChannelSelect,
      custom_id: "c",
      channel_types: [0, 15],
    });
    expect(selectRow(ch).components).toHaveLength(1);
  });

  it("rejects mixing entity select with buttons in one row", () => {
    expect(() =>
      actionRow(userSelect({ customId: "u" }), button({ customId: "b", label: "x" })),
    ).toThrow(/alone/);
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

describe("Components V2 functional builders", () => {
  it("builds container with text, separator, and signal buttons", () => {
    const client = new StambhaClient();
    const signal = new (class extends Signal {
      run = async () => {};
    })(client.registries.signals, { name: "panel" });

    const cont = container({
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

    expect(cont).toMatchObject({
      type: ComponentType.Container,
      accent_color: 0x5865f2,
    });
    expect(cont.components).toHaveLength(4);

    const reply = componentsV2({ components: [cont] });
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

  it("builds file component and backward-compat alias", () => {
    const f = file({ url: "attachment://test.pdf", spoiler: true });
    expect(f).toEqual({ type: ComponentType.File, file: { url: "attachment://test.pdf" }, spoiler: true });
    // deprecated alias should produce the same result
    const f2 = fileComponent({ url: "attachment://test.pdf", spoiler: true });
    expect(f2).toEqual(f);
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
    const embedJson = new EmbedBuilder()
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

    expect(embedJson).toEqual({
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

  it("resolves #hex and RGB tuple colors", () => {
    expect(new EmbedBuilder().setColor("#5865f2").toJSON().color).toBe(0x5865f2);
    expect(new EmbedBuilder().setColor([88, 101, 242]).toJSON().color).toBe(0x5865f2);
  });

  it("round-trips through EmbedView", () => {
    const built = new EmbedBuilder().setTitle("Hi").setColor("#ff0000").addField("a", "b");
    const view = built.toView();
    expect(view.title).toBe("Hi");
    expect(view.hexColor).toBe("#ff0000");
    expect(view.fields).toEqual([{ name: "a", value: "b" }]);
    expect(view.length).toBe("Hi".length + "a".length + "b".length);
    expect(view.equals(built)).toBe(true);
    expect(view.toBuilder().toJSON()).toEqual(built.toJSON());
  });

  it("toReply wraps embeds for classic messages", () => {
    const payload = new EmbedBuilder().setTitle("T").toReply({ content: "x" });
    expect(payload.content).toBe("x");
    expect(payload.embeds?.[0]).toEqual({ title: "T" });
  });
});

// ─── New fluent builder class tests ───────────────────────────────────────────

describe("TextDisplayBuilder", () => {
  it("produces a TextDisplay component via fluent chaining", () => {
    const td = new TextDisplayBuilder().setContent("Hello **world**").setId(1).build();
    expect(td).toEqual({ type: ComponentType.TextDisplay, content: "Hello **world**", id: 1 });
  });

  it("toJSON() is an alias for build()", () => {
    const b = new TextDisplayBuilder().setContent("x");
    expect(b.toJSON()).toEqual(b.build());
  });
});

describe("ThumbnailBuilder", () => {
  it("produces a Thumbnail component with all fields", () => {
    const t = new ThumbnailBuilder()
      .setMedia("https://example.com/img.png")
      .setDescription("Alt text")
      .setSpoiler(true)
      .setId(2)
      .build();
    expect(t).toEqual({
      type: ComponentType.Thumbnail,
      media: { url: "https://example.com/img.png" },
      description: "Alt text",
      spoiler: true,
      id: 2,
    });
  });

  it("accepts null description", () => {
    const t = new ThumbnailBuilder().setMedia("https://x.com/a.png").setDescription(null).build();
    expect(t.description).toBeNull();
  });
});

describe("SeparatorBuilder", () => {
  it("produces Separator with divider and large spacing", () => {
    const s = new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacing.Large).build();
    expect(s).toEqual({ type: ComponentType.Separator, spacing: 2, divider: true });
  });

  it("defaults spacing to Small when not set", () => {
    const s = new SeparatorBuilder().build();
    expect(s.spacing).toBe(SeparatorSpacing.Small);
  });
});

describe("FileBuilder", () => {
  it("produces a File component with attachment URL and spoiler", () => {
    const f = new FileBuilder().setFile("attachment://report.pdf").setSpoiler(true).setId(5).build();
    expect(f).toEqual({
      type: ComponentType.File,
      file: { url: "attachment://report.pdf" },
      spoiler: true,
      id: 5,
    });
  });
});

describe("MediaGalleryBuilder", () => {
  it("adds items via addItem and addItems", () => {
    const gallery = new MediaGalleryBuilder()
      .addItem("https://example.com/a.png", "Caption A")
      .addItem("https://example.com/b.png", null, true)
      .addItems({ media: { url: "https://example.com/c.png" } })
      .build();

    expect(gallery.type).toBe(ComponentType.MediaGallery);
    expect(gallery.items).toHaveLength(3);
    expect(gallery.items[0]).toMatchObject({ media: { url: "https://example.com/a.png" }, description: "Caption A" });
    expect(gallery.items[1]).toMatchObject({ spoiler: true, description: null });
    expect(gallery.items[2]).toMatchObject({ media: { url: "https://example.com/c.png" } });
  });

  it("rejects empty or oversized galleries (functional helper)", () => {
    expect(() => new MediaGalleryBuilder().build()).toThrow(/1–10/);
  });
});

describe("SectionBuilder", () => {
  it("builds section from builder instances", () => {
    const td = new TextDisplayBuilder().setContent("Title");
    const thumb = new ThumbnailBuilder().setMedia("https://example.com/img.png");
    const s = new SectionBuilder()
      .addTextDisplayComponents(td)
      .setAccessory(thumb)
      .build();

    expect(s.type).toBe(ComponentType.Section);
    expect(s.components).toHaveLength(1);
    expect(s.components[0]).toMatchObject({ type: ComponentType.TextDisplay, content: "Title" });
    expect(s.accessory).toMatchObject({ type: ComponentType.Thumbnail });
  });

  it("accepts pre-built component objects", () => {
    const td = textDisplay({ content: "Text" });
    const thumb = thumbnail({ url: "https://x.com/a.png" });
    const s = new SectionBuilder()
      .addTextDisplayComponents(td)
      .setAccessory(thumb)
      .build();
    expect(s.components[0]).toEqual(td);
    expect(s.accessory).toEqual(thumb);
  });

  it("throws when no texts or no accessory", () => {
    expect(() =>
      new SectionBuilder()
        .setAccessory(thumbnail({ url: "https://x.com/a.png" }))
        .build(),
    ).toThrow(/1–3/);
    expect(() =>
      new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("x"))
        .build(),
    ).toThrow(/accessory/);
  });

  it("rejects more than 3 text displays", () => {
    const b = new SectionBuilder().setAccessory(thumbnail({ url: "https://x.com/a.png" }));
    for (let i = 0; i < 4; i++) {
      b.addTextDisplayComponents(new TextDisplayBuilder().setContent(`line ${i}`));
    }
    expect(() => b.build()).toThrow(/1–3/);
  });
});

describe("ContainerBuilder", () => {
  it("builds an empty-free container with accent color and spoiler", () => {
    const c = new ContainerBuilder()
      .setAccentColor(0x5865f2)
      .setSpoiler(false)
      .addTextDisplayComponents(new TextDisplayBuilder().setContent("Hello"))
      .build();

    expect(c).toMatchObject({
      type: ComponentType.Container,
      accent_color: 0x5865f2,
      spoiler: false,
    });
    expect(c.components).toHaveLength(1);
    expect(c.components[0]).toMatchObject({ type: ComponentType.TextDisplay, content: "Hello" });
  });

  it("accepts hex accent colors and round-trips ContainerView", () => {
    const built = new ContainerBuilder()
      .setAccentColor("#5865f2")
      .setSpoiler(true)
      .addTextDisplayComponents(new TextDisplayBuilder().setContent("Hi"));
    const view = built.toView();
    expect(view.accentColor).toBe(0x5865f2);
    expect(view.hexAccentColor).toBe("#5865f2");
    expect(view.spoiler).toBe(true);
    expect(view.childCount).toBe(1);
    expect(view.equals(built)).toBe(true);
    expect(ContainerView.from(view.toJSON()).toBuilder().toJSON()).toEqual(built.toJSON());
  });

  it("toReply sets IS_COMPONENTS_V2", () => {
    const payload = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent("x"))
      .toReply({ ephemeral: true });
    expect(payload.flags).toBe(MessageFlags.IsComponentsV2);
    expect(payload.ephemeral).toBe(true);
  });

  it("chains all add* methods with builder and pre-built objects", () => {
    const gallery = new MediaGalleryBuilder().addItem("https://x.com/a.png").build();
    const fileComp = new FileBuilder().setFile("attachment://f.pdf").build();
    const sep = new SeparatorBuilder().setDivider(true).build();
    const sect = new SectionBuilder()
      .addTextDisplayComponents(textDisplay({ content: "Section text" }))
      .setAccessory(thumbnail({ url: "https://x.com/t.png" }))
      .build();
    const row = buttonRow(button({ customId: "id:a", label: "Go" }));

    const c = new ContainerBuilder()
      .addTextDisplayComponents(textDisplay({ content: "Top" }))
      .addSeparatorComponents(sep)
      .addSectionComponents(sect)
      .addMediaGalleryComponents(gallery)
      .addFileComponents(fileComp)
      .addActionRowComponents(row)
      .build();

    expect(c.components).toHaveLength(6);
    expect(c.components[0]).toMatchObject({ type: ComponentType.TextDisplay });
    expect(c.components[1]).toMatchObject({ type: ComponentType.Separator });
    expect(c.components[2]).toMatchObject({ type: ComponentType.Section });
    expect(c.components[3]).toMatchObject({ type: ComponentType.MediaGallery });
    expect(c.components[4]).toMatchObject({ type: ComponentType.File });
    expect(c.components[5]).toMatchObject({ type: ComponentType.ActionRow });
  });

  it("accepts builder instances in all add* methods", () => {
    const c = new ContainerBuilder()
      .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
      .addMediaGalleryComponents(new MediaGalleryBuilder().addItem("https://x.com/a.png"))
      .addFileComponents(new FileBuilder().setFile("attachment://x.pdf"))
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(new TextDisplayBuilder().setContent("x"))
          .setAccessory(new ThumbnailBuilder().setMedia("https://x.com/t.png")),
      )
      .build();

    expect(c.components).toHaveLength(4);
  });

  it("toJSON() is an alias for build()", () => {
    const b = new ContainerBuilder().addTextDisplayComponents(textDisplay({ content: "x" }));
    expect(b.toJSON()).toEqual(b.build());
  });

  it("sets accent_color null to remove", () => {
    const c = new ContainerBuilder()
      .setAccentColor(null)
      .addTextDisplayComponents(textDisplay({ content: "x" }))
      .build();
    expect(c.accent_color).toBeNull();
  });
});

describe("premiumButton", () => {
  it("produces a Premium button with sku_id and style 6", () => {
    const btn = premiumButton({ skuId: "123456789" });
    expect(btn).toEqual({
      type: ComponentType.Button,
      style: ButtonStyle.Premium,
      sku_id: "123456789",
    });
    expect(btn.style).toBe(6);
  });

  it("accepts disabled and id options", () => {
    const btn = premiumButton({ skuId: "abc", disabled: true, id: 99 });
    expect(btn.disabled).toBe(true);
    expect(btn.id).toBe(99);
  });

  it("has no custom_id or label", () => {
    const btn = premiumButton({ skuId: "x" });
    expect((btn as any).custom_id).toBeUndefined();
    expect((btn as any).label).toBeUndefined();
  });
});
