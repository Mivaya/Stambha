# Components & embeds

Stambha helpers for Discord **message UI**: classic buttons/selects/modals, **classic embeds**, and **Components V2** layouts — plus `registerPersistentSignals()` for long-lived `stambha:` UIs.

This page is the mental model. Read the [glossary](#glossary) first if names feel overlapping.

## Which path should I use?

| Goal | Use | Flag / payload |
|------|-----|----------------|
| Buttons / selects under normal message text | [Classic components](#classic-components-buttons--selects--modals) | `content` + `components` (action rows) |
| Title / fields / footer “card” (old embed look) | [Classic embeds](#classic-embeds) | `embeds: [...]` — **no** V2 flag |
| Discord’s new layout system (Containers, Text Display, …) | [Components V2](#components-v2) | `componentsV2(...)` / `replyV2` → `IS_COMPONENTS_V2` |

**Do not mix** classic `content` / `embeds` with Components V2 on the same message. With the V2 flag, Discord ignores top-level `content` and `embeds` — put text in `textDisplay` (top-level or inside a container).

```text
Message reply
├── Classic path
│   ├── content?
│   ├── embeds?          ← EmbedBuilder / EmbedView
│   └── components?      ← action rows (buttons / selects)
│
└── Components V2 path   ← componentsV2() / replyV2 / ContainerBuilder.toReply()
    └── components[]     ← up to 40 top-level pieces
        ├── Text Display
        ├── Container ─── children (Text Display, Separator, Section, Media, Action Row, File)
        ├── Separator
        ├── Section
        ├── Media gallery
        ├── Action Row
        └── File
```

There is **no** `containerV2` API. **Container** is one component type. **Components V2** is the message mode.

## Glossary

| Name | What it is | What it is not |
|------|------------|----------------|
| **Components V2** | Discord message mode (`IS_COMPONENTS_V2`) | Not a single class; not “everything inside Container” |
| **`componentsV2(...)`** | Stambha helper that sets the V2 flag + `components` array | Not a Container wrapper |
| **`replyV2(...)`** | Shortcut on command context for a simple V2 reply | Not an embed |
| **Container** (type 17) | Boxed group with optional accent / spoiler; holds **children** | Not the V2 mode itself |
| **`ContainerBuilder`** | Fluent writer for a Container | Not required for every V2 message |
| **`ContainerView`** | Readonly reader over Container JSON | Not for building |
| **`EmbedBuilder` / `embed()`** | Classic Discord embed writer | Not valid under the V2 flag |
| **`EmbedView`** | Readonly reader over embed JSON | Not a V2 layout |
| **Builder** | Compose outbound JSON (`set*` / `add*` / `toJSON`) | — |
| **View** | Inspect received or built JSON (`title`, `hexColor`, `equals`, `toBuilder()`) | — |
| **Panel / `PanelBuilder`** | Removed from core | Coming later as embed→container helpers in `@stambha/display` (plugins) |

## Classic components (buttons / selects / modals)

Works with normal messages (`content` / `embeds`). Interactive pieces live in **action rows**.

```ts
import {
  button,
  buttonRow,
  ButtonStyle,
  confirmCancelRow,
  modal,
  selectRow,
  stringSelect,
  textInput,
  TextInputStyle,
} from "@stambha/core";

const signal = client.registries.signals.get("confirm")!;

await ctx.reply({
  content: "Continue?",
  components: [confirmCancelRow(signal)],
});
```

| Helper | Output |
|--------|--------|
| `button` / `linkButton` / `premiumButton` | Button (type 2; premium = style 6) |
| `buttonRow` / `actionRow` | Action row (type 1) |
| `stringSelect` / `selectRow` | String select in a row |
| `confirmCancelRow(signal)` | Success + secondary buttons |
| `textInput` / `modal` | Modal layout |

Custom ids should come from `signal.customId(suffix?)` so [`SignalRouter`](/features/signals) can route them.

Entity selects (user / role / channel / mentionable) are tracked separately — not all shipped as fluent builders yet.

## Classic embeds

Use when you want Discord’s **legacy embed** object (`embeds` on the message). This is a different product surface from Components V2 Containers.

```ts
import { EmbedBuilder, EmbedView, embed } from "@stambha/core";

const payload = embed()
  .setTitle("Ping")
  .setDescription("Latency check")
  .setColor("#57f287") // also `0x57f287` or `[87, 242, 135]`
  .addField("Module", "General", true)
  .toReply(); // { embeds: [{ ... }] }

await ctx.reply(payload);

// Readonly inspection (gateway payload, REST body, or builder output)
const view = EmbedView.from(payload.embeds![0]!);
view.hexColor; // "#57f287"
view.length;
view.equals(payload.embeds![0]!);
view.toBuilder().setTitle("Updated");
```

| API | Role |
|-----|------|
| `EmbedBuilder` / `embed()` | Compose classic embeds |
| `EmbedView` | Readonly getters + `equals` / `toBuilder()` |
| `toReply()` | `{ embeds: [...] }` for **non-V2** messages |
| `resolveColor` / `hexColor` | Shared color helpers (`#RRGGBB`, RGB tuple, int) |

Round-trip: **Builder → `toView()` → View → `toBuilder()`**.

## Components V2

### Enable the mode

V2 messages set `MessageFlags.IsComponentsV2` (`1 << 15`). Prefer Stambha helpers so you do not forget the flag:

```ts
import { componentsV2, textDisplay, container, separator } from "@stambha/core";

await ctx.reply(
  componentsV2({
    components: [
      textDisplay({ content: "Hey there mate." }), // top-level — not inside a Container
      container({
        accentColor: 0x5865f2,
        components: [
          textDisplay({ content: "Hello inside the box." }),
          separator(),
        ],
      }),
    ],
  }),
);

// Or: await ctx.replyV2("Quick V2 text"); // auto-wraps in a container
```

### Top-level vs inside a Container

Matches Discord’s Components V2 editor:

| Place | Allowed pieces (Stambha helpers) |
|-------|----------------------------------|
| **Top-level** (`componentsV2({ components })`) | Container, Text Display, Separator, Section, Media gallery, Action Row, File |
| **Inside a Container** | Text Display, Separator, Section, Media gallery, Action Row, File |

A lone Text Display at the top is valid. A Container is optional grouping (accent bar, spoiler, nested children) — not a required parent for every piece.

### Functional helpers vs fluent builders

Both produce the same Discord JSON. Pick either style.

| Functional | Fluent class |
|------------|--------------|
| `textDisplay({ content })` | `new TextDisplayBuilder().setContent(...)` |
| `thumbnail({ url })` | `new ThumbnailBuilder().setMedia(...)` |
| `separator()` | `new SeparatorBuilder()` |
| `section({ text, accessory })` | `new SectionBuilder()` |
| `mediaGallery({ items })` | `new MediaGalleryBuilder()` |
| `file({ url })` | `new FileBuilder()` |
| `container({ components, accentColor })` | `new ContainerBuilder()` |
| `componentsV2({ components })` | `containerBuilder.toReply()` / `V2Builder` |

```ts
import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ContainerView,
  button,
  buttonRow,
  ButtonStyle,
} from "@stambha/core";

const signal = client.registries.signals.get("confirm")!;

const reply = new ContainerBuilder()
  .setAccentColor("#5865f2") // int, #hex, or [r,g,b]
  .setSpoiler(false)
  .addTextDisplayComponents(new TextDisplayBuilder().setContent("# Hello"))
  .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
  .addActionRowComponents(
    buttonRow(
      button({
        customId: signal.customId("yes"),
        label: "OK",
        style: ButtonStyle.Success,
      }),
    ),
  )
  .toReply(); // sets IS_COMPONENTS_V2 for you

await ctx.reply(reply);

const view = ContainerView.from(reply.components![0]!);
view.hexAccentColor; // "#5865f2"
view.childCount;
view.toBuilder().addTextDisplayComponents(/* ... */);
```

| API | Role |
|-----|------|
| `componentsV2` / `replyV2` | Message **mode** (flag + top-level list) |
| `ContainerBuilder` | Compose one **Container** |
| `ContainerView` | Readonly Container (`accentColor`, `spoiler`, `equals`, `toBuilder`) |
| Other `*Builder`s | Compose Text Display, Section, … |

**Signals:** nest `buttonRow` / `selectRow` at top level or inside a container. Interactive children still use `stambha:` custom ids — no special router mode.

Examples: `examples/bot` — `!panel` / `/panel` (and related V2 demos).

## Builders vs Views (why both?)

| | **Builder** | **View** |
|--|-------------|----------|
| Mutability | Fluent setters | Readonly getters |
| Typical use | Outbound replies you compose | Inspect API / gateway JSON, tests, logging |
| Bridge | `toView()` | `toBuilder()` |
| Classic | `EmbedBuilder` | `EmbedView` |
| V2 container | `ContainerBuilder` | `ContainerView` |

Views do **not** replace Components V2. They sit on top of the same JSON builders already produce.

## Not in `@stambha/core` (yet)

| Feature | Where it will live |
|---------|-------------------|
| Embed → Container migration (old `panel()` DX) | `@stambha/display` (plugins) — see roadmap **DISPLAY-migrate** |
| `EmbedManager` / `ContainerManager` templates | `@stambha/display` — **DISPLAY-managers** |
| Full entity select builders | Core roadmap **SELECTS** |
| AttachmentBuilder, formatters | Roadmap **ATTACH** / **FORMAT** |

## Persistent signals

Session ids (pagination, sequences) die on restart. **Persistent** UIs use stable ids like `stambha:colors` and re-register the same signal pieces on every boot.

```ts
import { registerPersistentSignals } from "@stambha/core";

registerPersistentSignals(client, (registry) => [
  new ColorMenuSignal(registry),
]);
```

- Skips names already loaded (safe after `loadPieces`).
- File-based pieces under `src/signals/` are already persistent when you call `loadPieces` on startup.
- Prefer `registerPersistentSignals` when wiring UIs in bootstrap instead of (or in addition to) folders.

Select handlers read `ctx.values` (from the interaction payload).

## See also

- [Signals](/features/signals) — routing and `SignalContext`
- [Pagination](/extensions/pagination) — Components V2 pages via `@stambha/pagination`
- [Getting started](/guide/getting-started) — first bot
- [Examples bot](https://github.com/Mivaya/Stambha/tree/main/examples/bot) — `!confirm`, `!menu`, `!panel`
