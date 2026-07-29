import type { ReplyPayload } from "../context/reply.js";
import {
  ComponentType,
  type ContainerChild,
  type ContainerComponent,
  type FileComponent,
  type MediaGalleryComponent,
  type MediaGalleryItem,
  type MessageComponentV2,
  MessageFlags,
  type SectionAccessory,
  type SectionComponent,
  type SeparatorComponent,
  SeparatorSpacing,
  type SeparatorSpacingId,
  type TextDisplayComponent,
  type ThumbnailComponent,
  type UnfurledMediaItem,
} from "./types.js";

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

export interface FileComponentOptions {
  /** Must use `attachment://filename` for uploaded files. */
  url: string;
  spoiler?: boolean;
  id?: number;
}

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

function media(url: string): UnfurledMediaItem {
  return { url };
}

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
export function fileComponent(options: FileComponentOptions): FileComponent {
  const component: FileComponent = {
    type: ComponentType.File,
    file: media(options.url),
  };
  if (options.spoiler !== undefined) component.spoiler = options.spoiler;
  if (options.id !== undefined) component.id = options.id;
  return component;
}

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
    this.currentContainer!.components.push({
      type: ComponentType.TextDisplay,
      content,
    });
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
