import type { ReplyPayload } from "../context/reply.js";
import type { ContainerChild } from "./types.js";
import {
  componentsV2,
  container,
  section,
  separator,
  textDisplay,
  thumbnail,
} from "./v2Builders.js";

export interface PanelField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface PanelFooter {
  text: string;
  iconUrl?: string;
}

export interface PanelThumbnail {
  url: string;
  description?: string | null;
  spoiler?: boolean;
}

export interface PanelOptions {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  thumbnail?: string | PanelThumbnail;
  fields?: readonly PanelField[];
  footer?: PanelFooter | string;
  timestamp?: boolean | Date | number | string;
  ephemeral?: boolean;
}

function parseUnixSeconds(timestamp: boolean | Date | number | string): number {
  if (timestamp === true) {
    return Math.floor(Date.now() / 1000);
  }
  if (timestamp instanceof Date) {
    return Math.floor(timestamp.getTime() / 1000);
  }
  if (typeof timestamp === "number") {
    return timestamp > 1e11 ? Math.floor(timestamp / 1000) : Math.floor(timestamp);
  }
  if (typeof timestamp === "string") {
    const parsed = Date.parse(timestamp);
    if (!Number.isNaN(parsed)) {
      return Math.floor(parsed / 1000);
    }
  }
  return Math.floor(Date.now() / 1000);
}

/** Construct a Components V2 panel payload backed by Stambha containers. */
export function panel(options: PanelOptions): ReplyPayload {
  const children: ContainerChild[] = [];

  const titleText = options.title
    ? options.url
      ? `[**${options.title}**](${options.url})`
      : `**${options.title}**`
    : undefined;

  let hasHeader = false;

  if (options.thumbnail) {
    const thumbObj: PanelThumbnail =
      typeof options.thumbnail === "string" ? { url: options.thumbnail } : options.thumbnail;

    const thumbComp = thumbnail({
      url: thumbObj.url,
      ...(thumbObj.description !== undefined ? { description: thumbObj.description } : {}),
      ...(thumbObj.spoiler !== undefined ? { spoiler: thumbObj.spoiler } : {}),
    });

    if (titleText) {
      children.push(
        section({
          text: textDisplay({ content: titleText }),
          accessory: thumbComp,
        }),
      );
      hasHeader = true;
    }
  } else if (titleText) {
    children.push(textDisplay({ content: titleText }));
    hasHeader = true;
  }

  if (options.description) {
    children.push(textDisplay({ content: options.description }));
    hasHeader = true;
  }

  const hasFields = options.fields && options.fields.length > 0;
  const hasFooterOrTimestamp = Boolean(options.footer || options.timestamp);

  if (hasHeader && (hasFields || hasFooterOrTimestamp)) {
    children.push(separator({ divider: true }));
  }

  if (hasFields && options.fields) {
    let currentInlineGroup: PanelField[] = [];

    const flushInlineGroup = () => {
      if (currentInlineGroup.length === 0) return;
      if (currentInlineGroup.length === 1) {
        const f = currentInlineGroup[0];
        if (f) {
          children.push(textDisplay({ content: `**${f.name}**\n${f.value}` }));
        }
      } else {
        const formatted = currentInlineGroup
          .map((f) => `**${f.name}**\n${f.value}`)
          .join("\n\n");
        children.push(textDisplay({ content: formatted }));
      }
      currentInlineGroup = [];
    };

    for (const field of options.fields) {
      if (field.inline) {
        currentInlineGroup.push(field);
        if (currentInlineGroup.length === 3) {
          flushInlineGroup();
        }
      } else {
        flushInlineGroup();
        children.push(textDisplay({ content: `**${field.name}**\n${field.value}` }));
      }
    }
    flushInlineGroup();
  }

  if (hasFooterOrTimestamp) {
    const footerText = typeof options.footer === "string" ? options.footer : options.footer?.text;
    const parts: string[] = [];
    if (footerText) parts.push(footerText);
    if (options.timestamp) {
      const sec = parseUnixSeconds(options.timestamp);
      parts.push(`<t:${sec}:R>`);
    }

    if (parts.length > 0) {
      const lastChild = children[children.length - 1];
      const isDividerLast = lastChild?.type === 14;
      if (hasFields && !isDividerLast && children.length > 0) {
        children.push(separator({ divider: true }));
      }
      children.push(textDisplay({ content: `-# ${parts.join(" • ")}` }));
    }
  }

  if (children.length === 0) {
    children.push(textDisplay({ content: " " }));
  }

  const containerComp = container({
    components: children,
    ...(options.color !== undefined ? { accentColor: options.color } : {}),
  });

  return componentsV2({
    components: [containerComp],
    ...(options.ephemeral ? { ephemeral: true } : {}),
  });
}

/** Fluent builder for Components V2 panel payloads. */
export class PanelBuilder {
  private options: PanelOptions = {};

  public setTitle(title: string): this {
    this.options.title = title;
    return this;
  }

  public setDescription(description: string): this {
    this.options.description = description;
    return this;
  }

  public setUrl(url: string): this {
    this.options.url = url;
    return this;
  }

  public setColor(color: number): this {
    this.options.color = color;
    return this;
  }

  public setThumbnail(thumbnail: string | PanelThumbnail): this {
    this.options.thumbnail = thumbnail;
    return this;
  }

  public addField(field: PanelField): this;
  public addField(name: string, value: string, inline?: boolean): this;
  public addField(nameOrField: string | PanelField, value?: string, inline?: boolean): this {
    if (!this.options.fields) this.options.fields = [];
    const fields = [...this.options.fields];
    if (typeof nameOrField === "object") {
      fields.push({ ...nameOrField });
    } else {
      const field: PanelField = { name: nameOrField, value: value ?? "" };
      if (inline !== undefined) field.inline = inline;
      fields.push(field);
    }
    this.options.fields = fields;
    return this;
  }

  public addFields(...fields: PanelField[] | [PanelField[]]): this {
    if (!this.options.fields) this.options.fields = [];
    const fieldsToAdd = Array.isArray(fields[0]) ? fields[0] : (fields as PanelField[]);
    const updated = [...this.options.fields];
    for (const f of fieldsToAdd) {
      updated.push({ ...f });
    }
    this.options.fields = updated;
    return this;
  }

  public setFooter(footer: string | PanelFooter): this {
    this.options.footer = footer;
    return this;
  }

  public setTimestamp(timestamp: boolean | Date | number | string = true): this {
    this.options.timestamp = timestamp;
    return this;
  }

  public setEphemeral(ephemeral = true): this {
    this.options.ephemeral = ephemeral;
    return this;
  }

  public build(): ReplyPayload {
    return panel(this.options);
  }

  public toPayload(): ReplyPayload {
    return this.build();
  }
}
