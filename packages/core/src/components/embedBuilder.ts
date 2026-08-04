import type { ReplyPayload } from "../context/reply.js";
import { hexColor, type ColorInput, resolveColor } from "./color.js";

export interface EmbedFooterData {
  text: string;
  iconUrl?: string;
  proxyIconUrl?: string;
}

export interface EmbedAssetData {
  url: string;
  proxyUrl?: string;
  height?: number;
  width?: number;
}

export interface EmbedProviderData {
  name?: string;
  url?: string;
}

export interface EmbedAuthorData {
  name: string;
  url?: string;
  iconUrl?: string;
  proxyIconUrl?: string;
}

export interface EmbedFieldData {
  name: string;
  value: string;
  inline?: boolean;
}

/** Wire-format (snake_case) Discord embed JSON. */
export interface EmbedJSON {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  image?: {
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  };
  thumbnail?: {
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  };
  video?: {
    url?: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  };
  provider?: {
    name?: string;
    url?: string;
  };
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
}

/** @deprecated Use {@link EmbedJSON} */
export type DiscordEmbedJSON = EmbedJSON;
/** @deprecated Use footer on {@link EmbedJSON} */
export type DiscordEmbedFooter = NonNullable<EmbedJSON["footer"]>;
/** @deprecated Use image on {@link EmbedJSON} */
export type DiscordEmbedImage = NonNullable<EmbedJSON["image"]>;
/** @deprecated Use thumbnail on {@link EmbedJSON} */
export type DiscordEmbedThumbnail = NonNullable<EmbedJSON["thumbnail"]>;
/** @deprecated Use video on {@link EmbedJSON} */
export type DiscordEmbedVideo = NonNullable<EmbedJSON["video"]>;
/** @deprecated Use provider on {@link EmbedJSON} */
export type DiscordEmbedProvider = NonNullable<EmbedJSON["provider"]>;
/** @deprecated Use author on {@link EmbedJSON} */
export type DiscordEmbedAuthor = NonNullable<EmbedJSON["author"]>;
/** @deprecated Use {@link EmbedFieldData} */
export type DiscordEmbedField = EmbedFieldData;

function cloneEmbedJSON(data: EmbedJSON): EmbedJSON {
  return {
    ...data,
    fields: data.fields ? data.fields.map((f) => ({ ...f })) : [],
    ...(data.footer ? { footer: { ...data.footer } } : {}),
    ...(data.image ? { image: { ...data.image } } : {}),
    ...(data.thumbnail ? { thumbnail: { ...data.thumbnail } } : {}),
    ...(data.video ? { video: { ...data.video } } : {}),
    ...(data.provider ? { provider: { ...data.provider } } : {}),
    ...(data.author ? { author: { ...data.author } } : {}),
  };
}

function embedLength(data: EmbedJSON): number {
  let n = (data.title?.length ?? 0) + (data.description?.length ?? 0);
  n += data.footer?.text.length ?? 0;
  n += data.author?.name.length ?? 0;
  for (const f of data.fields ?? []) {
    n += f.name.length + f.value.length;
  }
  return n;
}

function assetFromApi(
  asset: { url: string; proxy_url?: string; height?: number; width?: number } | undefined,
): EmbedAssetData | null {
  if (!asset) return null;
  const out: EmbedAssetData = { url: asset.url };
  if (asset.proxy_url !== undefined) out.proxyUrl = asset.proxy_url;
  if (asset.height !== undefined) out.height = asset.height;
  if (asset.width !== undefined) out.width = asset.width;
  return out;
}

/**
 * Fluent builder for classic Discord embeds (message `embeds` array).
 * Pair with {@link EmbedView} for readonly inspection of received payloads.
 */
export class EmbedBuilder {
  private data: EmbedJSON;

  constructor(data: EmbedJSON = {}) {
    this.data = cloneEmbedJSON(data);
  }

  static from(source: EmbedJSON | EmbedView | EmbedBuilder): EmbedBuilder {
    if (source instanceof EmbedBuilder) return new EmbedBuilder(source.toJSON());
    if (source instanceof EmbedView) return new EmbedBuilder(source.toJSON());
    return new EmbedBuilder(source);
  }

  get length(): number {
    return embedLength(this.data);
  }

  setTitle(title: string | null): this {
    if (title === null) delete this.data.title;
    else this.data.title = title;
    return this;
  }

  setDescription(description: string | null): this {
    if (description === null) delete this.data.description;
    else this.data.description = description;
    return this;
  }

  setUrl(url: string | null): this {
    if (url === null) delete this.data.url;
    else this.data.url = url;
    return this;
  }

  setColor(color: ColorInput | null): this {
    if (color === null) {
      delete this.data.color;
      return this;
    }
    this.data.color = resolveColor(color);
    return this;
  }

  setTimestamp(timestamp: Date | number | string | boolean | null = true): this {
    if (timestamp === null || timestamp === false) {
      delete this.data.timestamp;
      return this;
    }
    if (timestamp === true) {
      this.data.timestamp = new Date().toISOString();
      return this;
    }
    if (timestamp instanceof Date) {
      this.data.timestamp = timestamp.toISOString();
      return this;
    }
    if (typeof timestamp === "number") {
      this.data.timestamp = new Date(timestamp).toISOString();
      return this;
    }
    this.data.timestamp = new Date(timestamp).toISOString();
    return this;
  }

  setFooter(footer: { text: string; iconUrl?: string } | null): this {
    if (!footer) {
      delete this.data.footer;
      return this;
    }
    this.data.footer = {
      text: footer.text,
      ...(footer.iconUrl ? { icon_url: footer.iconUrl } : {}),
    };
    return this;
  }

  setAuthor(author: { name: string; iconUrl?: string; url?: string } | null): this {
    if (!author) {
      delete this.data.author;
      return this;
    }
    this.data.author = {
      name: author.name,
      ...(author.iconUrl ? { icon_url: author.iconUrl } : {}),
      ...(author.url ? { url: author.url } : {}),
    };
    return this;
  }

  setThumbnail(url: string | null): this {
    if (!url) {
      delete this.data.thumbnail;
      return this;
    }
    this.data.thumbnail = { url };
    return this;
  }

  setImage(url: string | null): this {
    if (!url) {
      delete this.data.image;
      return this;
    }
    this.data.image = { url };
    return this;
  }

  addField(field: EmbedFieldData): this;
  addField(name: string, value: string, inline?: boolean): this;
  addField(nameOrField: string | EmbedFieldData, value?: string, inline?: boolean): this {
    if (!this.data.fields) this.data.fields = [];
    if (typeof nameOrField === "object") {
      this.data.fields.push({ ...nameOrField });
    } else {
      const field: EmbedFieldData = { name: nameOrField, value: value ?? "" };
      if (inline !== undefined) field.inline = inline;
      this.data.fields.push(field);
    }
    return this;
  }

  addFields(...fields: EmbedFieldData[] | [EmbedFieldData[]]): this {
    if (!this.data.fields) this.data.fields = [];
    const fieldsToAdd = Array.isArray(fields[0]) ? fields[0] : (fields as EmbedFieldData[]);
    for (const f of fieldsToAdd) {
      this.data.fields.push({ ...f });
    }
    return this;
  }

  spliceFields(index: number, deleteCount: number, ...fields: EmbedFieldData[]): this {
    if (!this.data.fields) this.data.fields = [];
    this.data.fields.splice(index, deleteCount, ...fields);
    return this;
  }

  setFields(...fields: EmbedFieldData[] | [EmbedFieldData[]]): this {
    const fieldsToSet = Array.isArray(fields[0]) ? fields[0] : (fields as EmbedFieldData[]);
    this.data.fields = fieldsToSet.map((f) => ({ ...f }));
    return this;
  }

  equals(other: EmbedView | EmbedJSON | EmbedBuilder): boolean {
    return this.toView().equals(other);
  }

  toView(): EmbedView {
    return new EmbedView(this.toJSON());
  }

  /** Reply payload with a single embed (classic messages — not Components V2). */
  toReply(extras: Omit<ReplyPayload, "embeds"> = {}): ReplyPayload {
    return { ...extras, embeds: [this.toJSON()] };
  }

  toJSON(): EmbedJSON {
    const json = cloneEmbedJSON(this.data);
    if (!json.fields?.length) delete json.fields;
    return json;
  }
}

/**
 * Readonly view over classic Discord embed JSON (received or built).
 * Prefer {@link EmbedBuilder} when composing outbound embeds.
 */
export class EmbedView {
  private readonly data: EmbedJSON;

  constructor(data: EmbedJSON = {}) {
    this.data = cloneEmbedJSON(data);
  }

  static from(source: EmbedJSON | EmbedView | EmbedBuilder): EmbedView {
    if (source instanceof EmbedView) return new EmbedView(source.toJSON());
    if (source instanceof EmbedBuilder) return source.toView();
    return new EmbedView(source);
  }

  get title(): string | null {
    return this.data.title ?? null;
  }

  get description(): string | null {
    return this.data.description ?? null;
  }

  get url(): string | null {
    return this.data.url ?? null;
  }

  get color(): number | null {
    return this.data.color ?? null;
  }

  get hexColor(): string | null {
    return hexColor(this.data.color);
  }

  get timestamp(): string | null {
    return this.data.timestamp ?? null;
  }

  get footer(): EmbedFooterData | null {
    const f = this.data.footer;
    if (!f) return null;
    const out: EmbedFooterData = { text: f.text };
    if (f.icon_url !== undefined) out.iconUrl = f.icon_url;
    if (f.proxy_icon_url !== undefined) out.proxyIconUrl = f.proxy_icon_url;
    return out;
  }

  get image(): EmbedAssetData | null {
    return assetFromApi(this.data.image);
  }

  get thumbnail(): EmbedAssetData | null {
    return assetFromApi(this.data.thumbnail);
  }

  get video(): EmbedAssetData | null {
    const v = this.data.video;
    if (!v) return null;
    const out: EmbedAssetData = { url: v.url ?? "" };
    if (v.proxy_url !== undefined) out.proxyUrl = v.proxy_url;
    if (v.height !== undefined) out.height = v.height;
    if (v.width !== undefined) out.width = v.width;
    return out;
  }

  get provider(): EmbedProviderData | null {
    const p = this.data.provider;
    if (!p) return null;
    return { ...p };
  }

  get author(): EmbedAuthorData | null {
    const a = this.data.author;
    if (!a) return null;
    const out: EmbedAuthorData = { name: a.name };
    if (a.url !== undefined) out.url = a.url;
    if (a.icon_url !== undefined) out.iconUrl = a.icon_url;
    if (a.proxy_icon_url !== undefined) out.proxyIconUrl = a.proxy_icon_url;
    return out;
  }

  get fields(): readonly EmbedFieldData[] {
    return (this.data.fields ?? []).map((f) => ({ ...f }));
  }

  /** Accumulated character length (title + description + fields + footer + author). */
  get length(): number {
    return embedLength(this.data);
  }

  equals(other: EmbedView | EmbedJSON | EmbedBuilder): boolean {
    const a = this.toJSON();
    const b = EmbedView.from(other).toJSON();
    return JSON.stringify(a) === JSON.stringify(b);
  }

  toJSON(): EmbedJSON {
    const json = cloneEmbedJSON(this.data);
    if (!json.fields?.length) delete json.fields;
    return json;
  }

  /** Mutable builder seeded from this view. */
  toBuilder(): EmbedBuilder {
    return EmbedBuilder.from(this);
  }
}

/** Shorthand factory — `embed().setTitle("Hi")`. */
export function embed(data?: EmbedJSON): EmbedBuilder {
  return new EmbedBuilder(data);
}
