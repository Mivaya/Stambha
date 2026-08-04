import type { ReplyPayload } from "../context/reply.js";
import { type ColorInput, hexColor, resolveColor } from "./color.js";
import {
  ComponentType,
  type ActionRowComponent,
  type ContainerChild,
  type ContainerComponent,
  type FileComponent,
  type MediaGalleryComponent,
  type MediaGalleryItem,
  MessageFlags,
  type SectionAccessory,
  type SectionComponent,
  type SeparatorComponent,
  SeparatorSpacing,
  type SeparatorSpacingId,
  type TextDisplayComponent,
  type ThumbnailComponent,
  type UnfurledMediaItem,
  type MessageComponentV2,
} from "./types.js";

// ─── Functional Options ──────────────────────────────────────────────────────

export interface TextDisplayOptions {
  content: string;
  id?: number;
}

export interface ThumbnailOptions {
  url: string;
  description?: string | null;
  spoiler?: boolean;
  id?: number;
}

export interface SectionOptions {
  /** One to three text displays (left column). */
  text: TextDisplayComponent | readonly TextDisplayComponent[];
  accessory: SectionAccessory;
  id?: number;
}

export interface MediaGalleryOptions {
  items: readonly MediaGalleryItem[];
  id?: number;
}

export interface FileOptions {
  /** Must use `attachment://filename` for uploaded files. */
  url: string;
  spoiler?: boolean;
  id?: number;
}

/** @deprecated Use {@link FileOptions} */
export type FileComponentOptions = FileOptions;

export interface SeparatorOptions {
  divider?: boolean;
  spacing?: SeparatorSpacingId;
  id?: number;
}

export interface ContainerOptions {
  components: readonly ContainerChild[];
  /** Accent bar color as RGB integer (`0xRRGGBB`). */
  accentColor?: number | null;
  spoiler?: boolean;
  id?: number;
}

export interface ComponentsV2Options {
  components: readonly MessageComponentV2[];
  /** Also set ephemeral (64) — OR'd with {@link MessageFlags.IsComponentsV2}. */
  ephemeral?: boolean;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function media(url: string): UnfurledMediaItem {
  return { url };
}

// ─── Functional builders (quick/shorthand) ────────────────────────────────────

/** Markdown text block (Components V2). */
export function textDisplay(options: TextDisplayOptions): TextDisplayComponent {
  const component: TextDisplayComponent = {
    type: ComponentType.TextDisplay,
    content: options.content,
  };
  if (options.id !== undefined) component.id = options.id;
  return component;
}

/** Small image accessory for {@link section}. */
export function thumbnail(options: ThumbnailOptions): ThumbnailComponent {
  const component: ThumbnailComponent = {
    type: ComponentType.Thumbnail,
    media: media(options.url),
  };
  if (options.description !== undefined) component.description = options.description;
  if (options.spoiler !== undefined) component.spoiler = options.spoiler;
  if (options.id !== undefined) component.id = options.id;
  return component;
}

/** Text column + button or thumbnail accessory. */
export function section(options: SectionOptions): SectionComponent {
  const texts = Array.isArray(options.text) ? [...options.text] : [options.text];
  if (texts.length < 1 || texts.length > 3) {
    throw new Error("section requires 1–3 textDisplay children.");
  }
  if (
    options.accessory.type !== ComponentType.Button &&
    options.accessory.type !== ComponentType.Thumbnail
  ) {
    throw new Error("section accessory must be a button or thumbnail.");
  }
  const component: SectionComponent = {
    type: ComponentType.Section,
    components: texts,
    accessory: options.accessory,
  };
  if (options.id !== undefined) component.id = options.id;
  return component;
}

/** Image / media grid (1–10 items). */
export function mediaGallery(options: MediaGalleryOptions): MediaGalleryComponent {
  if (options.items.length < 1 || options.items.length > 10) {
    throw new Error("mediaGallery requires 1–10 items.");
  }
  const component: MediaGalleryComponent = {
    type: ComponentType.MediaGallery,
    items: options.items.map((item) => ({
      media: { ...item.media },
      ...(item.description !== undefined ? { description: item.description } : {}),
      ...(item.spoiler !== undefined ? { spoiler: item.spoiler } : {}),
    })),
  };
  if (options.id !== undefined) component.id = options.id;
  return component;
}

/** Display an uploaded attachment (`attachment://…`). */
export function file(options: FileOptions): FileComponent {
  const component: FileComponent = {
    type: ComponentType.File,
    file: media(options.url),
  };
  if (options.spoiler !== undefined) component.spoiler = options.spoiler;
  if (options.id !== undefined) component.id = options.id;
  return component;
}

/**
 * @deprecated Use {@link file} instead.
 * Kept for backward compatibility.
 */
export const fileComponent = file;

/** Vertical padding / divider between V2 components. */
export function separator(options: SeparatorOptions = {}): SeparatorComponent {
  const component: SeparatorComponent = {
    type: ComponentType.Separator,
    spacing: options.spacing ?? SeparatorSpacing.Small,
  };
  if (options.divider !== undefined) component.divider = options.divider;
  if (options.id !== undefined) component.id = options.id;
  return component;
}

/** Visual group with optional accent color; may nest action rows (Signals). */
export function container(options: ContainerOptions): ContainerComponent {
  if (options.components.length < 1) {
    throw new Error("container requires at least one child component.");
  }
  if (options.components.length > 10) {
    throw new Error("container supports at most 10 child components.");
  }
  const component: ContainerComponent = {
    type: ComponentType.Container,
    components: [...options.components],
  };
  if (options.accentColor !== undefined) component.accent_color = options.accentColor;
  if (options.spoiler !== undefined) component.spoiler = options.spoiler;
  if (options.id !== undefined) component.id = options.id;
  return component;
}

/**
 * Build a {@link ReplyPayload} with `IS_COMPONENTS_V2` set.
 * Do not send top-level `content` / `embeds` with this flag — use {@link textDisplay} instead.
 * Buttons / selects inside still use `signal.customId()` for SignalRouter.
 */
export function componentsV2(
  contentOrOptions: string | ComponentsV2Options,
  extraOptions?: { accentColor?: number; ephemeral?: boolean },
): ReplyPayload {
  if (typeof contentOrOptions === "string") {
    const accentColor = extraOptions?.accentColor ?? 0x5865f2;
    const comp = container({
      accentColor,
      components: [textDisplay({ content: contentOrOptions })],
    });
    const payload: ReplyPayload = {
      components: [comp],
      flags: MessageFlags.IsComponentsV2,
    };
    if (extraOptions?.ephemeral) payload.ephemeral = true;
    return payload;
  }

  if (contentOrOptions.components.length < 1 || contentOrOptions.components.length > 40) {
    throw new Error("componentsV2 requires 1–40 top-level components.");
  }
  const payload: ReplyPayload = {
    components: [...contentOrOptions.components],
    flags: MessageFlags.IsComponentsV2,
  };
  if (contentOrOptions.ephemeral) payload.ephemeral = true;
  return payload;
}

// ─── Fluent Builder Classes (Discord API types, Stambha ergonomics) ───────────
// Official component type names; fluent API is Stambha-owned (not a discord.js port).

/**
 * Fluent builder for a **Text Display** component (type 10).
 * Renders markdown text inside a Components V2 message.
 *
 * @example
 * ```ts
 * new TextDisplayBuilder().setContent('Hello **world**').build()
 * ```
 */
export class TextDisplayBuilder {
  private _content = "";
  private _id?: number;

  /** Set the markdown content. */
  public setContent(content: string): this {
    this._content = content;
    return this;
  }

  /** Set the optional 32-bit component id. */
  public setId(id: number): this {
    this._id = id;
    return this;
  }

  public build(): TextDisplayComponent {
    return textDisplay({ content: this._content, ...(this._id !== undefined && { id: this._id }) });
  }

  public toJSON(): TextDisplayComponent {
    return this.build();
  }
}

/**
 * Fluent builder for a **Thumbnail** component (type 11).
 * Used as an `accessory` inside a {@link SectionBuilder}.
 *
 * @example
 * ```ts
 * new ThumbnailBuilder().setMedia('https://example.com/img.png').setDescription('Alt').build()
 * ```
 */
export class ThumbnailBuilder {
  private _url = "";
  private _description?: string | null;
  private _spoiler?: boolean;
  private _id?: number;

  /** Set the image URL (or `attachment://filename`). */
  public setMedia(url: string): this {
    this._url = url;
    return this;
  }

  /** Set alt text / caption. Pass `null` to explicitly clear. */
  public setDescription(description: string | null): this {
    this._description = description;
    return this;
  }

  /** Mark the thumbnail as a spoiler (blurred until clicked). */
  public setSpoiler(spoiler: boolean): this {
    this._spoiler = spoiler;
    return this;
  }

  public setId(id: number): this {
    this._id = id;
    return this;
  }

  public build(): ThumbnailComponent {
    return thumbnail({
      url: this._url,
      ...(this._description !== undefined && { description: this._description }),
      ...(this._spoiler !== undefined && { spoiler: this._spoiler }),
      ...(this._id !== undefined && { id: this._id }),
    });
  }

  public toJSON(): ThumbnailComponent {
    return this.build();
  }
}

/**
 * Fluent builder for a **Separator** component (type 14).
 * Adds vertical padding (and an optional visible divider line) between V2 components.
 *
 * @example
 * ```ts
 * new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacing.Large).build()
 * ```
 */
export class SeparatorBuilder {
  private _divider?: boolean;
  private _spacing?: SeparatorSpacingId;
  private _id?: number;

  /** Show (or hide) the visible horizontal divider line. */
  public setDivider(divider: boolean): this {
    this._divider = divider;
    return this;
  }

  /** Set the vertical spacing. `SeparatorSpacing.Small` (1) or `SeparatorSpacing.Large` (2). */
  public setSpacing(spacing: SeparatorSpacingId): this {
    this._spacing = spacing;
    return this;
  }

  public setId(id: number): this {
    this._id = id;
    return this;
  }

  public build(): SeparatorComponent {
    return separator({
      ...(this._divider !== undefined && { divider: this._divider }),
      ...(this._spacing !== undefined && { spacing: this._spacing }),
      ...(this._id !== undefined && { id: this._id }),
    });
  }

  public toJSON(): SeparatorComponent {
    return this.build();
  }
}

/**
 * Fluent builder for a **File** component (type 13).
 * Displays an uploaded attachment inline.
 *
 * @example
 * ```ts
 * new FileBuilder().setFile('attachment://report.pdf').setSpoiler(false).build()
 * ```
 */
export class FileBuilder {
  private _url = "";
  private _spoiler?: boolean;
  private _id?: number;

  /** Set the file URL. Must use `attachment://filename` for uploaded files. */
  public setFile(url: string): this {
    this._url = url;
    return this;
  }

  /** Blur the file attachment until the user clicks. */
  public setSpoiler(spoiler: boolean): this {
    this._spoiler = spoiler;
    return this;
  }

  public setId(id: number): this {
    this._id = id;
    return this;
  }

  public build(): FileComponent {
    return file({
      url: this._url,
      ...(this._spoiler !== undefined && { spoiler: this._spoiler }),
      ...(this._id !== undefined && { id: this._id }),
    });
  }

  public toJSON(): FileComponent {
    return this.build();
  }
}

/**
 * Fluent builder for a **Media Gallery** component (type 12).
 * Displays a grid of images / videos (1–10 items).
 *
 * @example
 * ```ts
 * new MediaGalleryBuilder()
 *   .addItem('https://example.com/a.png', 'Caption')
 *   .addItem('https://example.com/b.png')
 *   .build()
 * ```
 */
export class MediaGalleryBuilder {
  private _items: MediaGalleryItem[] = [];
  private _id?: number;

  /**
   * Add a single media item.
   * @param url      Image / video URL (or `attachment://filename`).
   * @param description  Optional alt text / caption.
   * @param spoiler  Whether the item is blurred as a spoiler.
   */
  public addItem(url: string, description?: string | null, spoiler?: boolean): this {
    const item: MediaGalleryItem = { media: { url } };
    if (description !== undefined) item.description = description;
    if (spoiler !== undefined) item.spoiler = spoiler;
    this._items.push(item);
    return this;
  }

  /** Add one or more pre-built {@link MediaGalleryItem} objects. */
  public addItems(...items: MediaGalleryItem[]): this {
    this._items.push(...items);
    return this;
  }

  public setId(id: number): this {
    this._id = id;
    return this;
  }

  public build(): MediaGalleryComponent {
    return mediaGallery({
      items: this._items,
      ...(this._id !== undefined && { id: this._id }),
    });
  }

  public toJSON(): MediaGalleryComponent {
    return this.build();
  }
}

/**
 * Fluent builder for a **Section** component (type 9).
 * Displays 1–3 text displays on the left and a button or thumbnail accessory on the right.
 *
 * @example
 * ```ts
 * new SectionBuilder()
 *   .addTextDisplayComponents(new TextDisplayBuilder().setContent('Title').build())
 *   .setAccessory(new ThumbnailBuilder().setMedia('https://...').build())
 *   .build()
 * ```
 */
export class SectionBuilder {
  private _texts: TextDisplayComponent[] = [];
  private _accessory?: SectionAccessory;
  private _id?: number;

  /**
   * Add one or more text display components to the section (max 3 total).
   * Accepts pre-built components or {@link TextDisplayBuilder} instances.
   */
  public addTextDisplayComponents(...components: (TextDisplayComponent | TextDisplayBuilder)[]): this {
    for (const c of components) {
      const built = c instanceof TextDisplayBuilder ? c.build() : c;
      this._texts.push(built);
    }
    return this;
  }

  /**
   * Set the section's right-side accessory.
   * Must be a {@link ThumbnailComponent} or {@link ButtonComponent}.
   * Accepts pre-built components or {@link ThumbnailBuilder} instances.
   */
  public setAccessory(accessory: SectionAccessory | ThumbnailBuilder): this {
    this._accessory = accessory instanceof ThumbnailBuilder ? accessory.build() : accessory;
    return this;
  }

  public setId(id: number): this {
    this._id = id;
    return this;
  }

  public build(): SectionComponent {
    if (this._texts.length < 1 || this._texts.length > 3) {
      throw new Error("SectionBuilder requires 1–3 text display components.");
    }
    if (!this._accessory) {
      throw new Error("SectionBuilder requires an accessory (thumbnail or button).");
    }
    return section({
      text: this._texts,
      accessory: this._accessory,
      ...(this._id !== undefined && { id: this._id }),
    });
  }

  public toJSON(): SectionComponent {
    return this.build();
  }
}

/**
 * Fluent builder for a **Container** component (type 17).
 * Primary layout block in Components V2 — optional accent bar and spoiler.
 *
 * @example
 * ```ts
 * new ContainerBuilder()
 *   .setAccentColor("#5865f2")
 *   .addTextDisplayComponents(new TextDisplayBuilder().setContent("Hello!"))
 *   .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
 *   .toView()
 * ```
 */
export class ContainerBuilder {
  private _components: ContainerChild[] = [];
  private _accentColor?: number | null;
  private _spoiler?: boolean;
  private _id?: number;

  static from(source: ContainerComponent | ContainerView | ContainerBuilder): ContainerBuilder {
    if (source instanceof ContainerBuilder) {
      return ContainerBuilder.from(source.toJSON());
    }
    if (source instanceof ContainerView) {
      return ContainerBuilder.from(source.toJSON());
    }
    const b = new ContainerBuilder();
    b._components = [...source.components];
    if (source.accent_color !== undefined) b._accentColor = source.accent_color;
    if (source.spoiler !== undefined) b._spoiler = source.spoiler;
    if (source.id !== undefined) b._id = source.id;
    return b;
  }

  /** Set the accent bar color. Accepts RGB int, `#RRGGBB`, or `[r,g,b]`. Pass `null` to clear. */
  public setAccentColor(color: ColorInput | null): this {
    this._accentColor = color === null ? null : resolveColor(color);
    return this;
  }

  public clearAccentColor(): this {
    this._accentColor = null;
    return this;
  }

  /** Blur the entire container behind a spoiler overlay. */
  public setSpoiler(spoiler = true): this {
    this._spoiler = spoiler;
    return this;
  }

  public setId(id: number | null): this {
    if (id === null) {
      delete this._id;
      return this;
    }
    this._id = id;
    return this;
  }

  public clearId(): this {
    delete this._id;
    return this;
  }

  /** Add one or more text display components. Accepts pre-built objects or {@link TextDisplayBuilder} instances. */
  public addTextDisplayComponents(...components: (TextDisplayComponent | TextDisplayBuilder)[]): this {
    for (const c of components) {
      this._components.push(c instanceof TextDisplayBuilder ? c.build() : c);
    }
    return this;
  }

  /** Add one or more separator components. Accepts pre-built objects or {@link SeparatorBuilder} instances. */
  public addSeparatorComponents(...components: (SeparatorComponent | SeparatorBuilder)[]): this {
    for (const c of components) {
      this._components.push(c instanceof SeparatorBuilder ? c.build() : c);
    }
    return this;
  }

  /** Add one or more section components. Accepts pre-built objects or {@link SectionBuilder} instances. */
  public addSectionComponents(...components: (SectionComponent | SectionBuilder)[]): this {
    for (const c of components) {
      this._components.push(c instanceof SectionBuilder ? c.build() : c);
    }
    return this;
  }

  /** Add one or more media gallery components. Accepts pre-built objects or {@link MediaGalleryBuilder} instances. */
  public addMediaGalleryComponents(...components: (MediaGalleryComponent | MediaGalleryBuilder)[]): this {
    for (const c of components) {
      this._components.push(c instanceof MediaGalleryBuilder ? c.build() : c);
    }
    return this;
  }

  /** Add one or more file components. Accepts pre-built objects or {@link FileBuilder} instances. */
  public addFileComponents(...components: (FileComponent | FileBuilder)[]): this {
    for (const c of components) {
      this._components.push(c instanceof FileBuilder ? c.build() : c);
    }
    return this;
  }

  /** Add one or more action row components (for buttons/selects inside a container). */
  public addActionRowComponents(...components: ActionRowComponent[]): this {
    this._components.push(...components);
    return this;
  }

  /** Remove, replace, or insert children (Array.splice semantics). */
  public spliceComponents(index: number, deleteCount: number, ...components: ContainerChild[]): this {
    this._components.splice(index, deleteCount, ...components);
    return this;
  }

  public equals(other: ContainerComponent | ContainerView | ContainerBuilder): boolean {
    return this.toView().equals(other);
  }

  public toView(): ContainerView {
    return new ContainerView(this.toJSON());
  }

  /** Components V2 reply with this container as the sole top-level component. */
  public toReply(extras: { ephemeral?: boolean } = {}): ReplyPayload {
    return componentsV2({
      components: [this.build()],
      ...(extras.ephemeral ? { ephemeral: true } : {}),
    });
  }

  public build(): ContainerComponent {
    return container({
      components: this._components,
      ...(this._accentColor !== undefined && { accentColor: this._accentColor }),
      ...(this._spoiler !== undefined && { spoiler: this._spoiler }),
      ...(this._id !== undefined && { id: this._id }),
    });
  }

  public toJSON(): ContainerComponent {
    return this.build();
  }
}

/**
 * Readonly view over a Components V2 **Container** (type 17).
 * Use {@link ContainerBuilder} to mutate; use this to inspect gateway/REST payloads.
 */
export class ContainerView {
  private readonly data: ContainerComponent;

  constructor(data: ContainerComponent) {
    this.data = {
      ...data,
      components: [...data.components],
    };
  }

  static from(source: ContainerComponent | ContainerView | ContainerBuilder): ContainerView {
    if (source instanceof ContainerView) return new ContainerView(source.toJSON());
    if (source instanceof ContainerBuilder) return source.toView();
    return new ContainerView(source);
  }

  get accentColor(): number | null {
    return this.data.accent_color ?? null;
  }

  get hexAccentColor(): string | null {
    return hexColor(this.data.accent_color);
  }

  get spoiler(): boolean {
    return this.data.spoiler === true;
  }

  get id(): number | null {
    return this.data.id ?? null;
  }

  get components(): readonly ContainerChild[] {
    return this.data.components;
  }

  get childCount(): number {
    return this.data.components.length;
  }

  equals(other: ContainerComponent | ContainerView | ContainerBuilder): boolean {
    return JSON.stringify(this.toJSON()) === JSON.stringify(ContainerView.from(other).toJSON());
  }

  toJSON(): ContainerComponent {
    return {
      ...this.data,
      components: [...this.data.components],
    };
  }

  toBuilder(): ContainerBuilder {
    return ContainerBuilder.from(this);
  }
}

/**
 * Minimal top-level V2 message builder.
 * Opens new containers; text blocks are appended into the current container.
 *
 * For full control prefer {@link ContainerBuilder} directly.
 */
export class V2Builder {
  private containers: ContainerComponent[] = [];
  private currentContainer: ContainerComponent | null = null;
  private isEphemeral = false;

  public setEphemeral(ephemeral = true): this {
    this.isEphemeral = ephemeral;
    return this;
  }

  public container(accentColor?: number): this {
    this.currentContainer = {
      type: ComponentType.Container,
      components: [],
    };
    if (accentColor !== undefined) {
      this.currentContainer.accent_color = accentColor;
    }
    this.containers.push(this.currentContainer);
    return this;
  }

  public text(content: string): this {
    if (!this.currentContainer) {
      this.container();
    }
    const current = this.currentContainer;
    if (current) {
      current.components.push({
        type: ComponentType.TextDisplay,
        content,
      });
    }
    return this;
  }

  public build(): ReplyPayload {
    return componentsV2({
      components: this.containers,
      ephemeral: this.isEphemeral,
    });
  }
}

/** Collect `custom_id` values from nested V2 / action-row trees (tests / debugging). */
export function collectCustomIds(components: readonly unknown[]): string[] {
  const ids: string[] = [];
  const walk = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    if (typeof obj.custom_id === "string") ids.push(obj.custom_id);
    if (Array.isArray(obj.components)) {
      for (const child of obj.components) walk(child);
    }
    if (obj.accessory) walk(obj.accessory);
  };
  for (const c of components) walk(c);
  return ids;
}
