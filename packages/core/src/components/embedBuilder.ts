export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface DiscordEmbedImage {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface DiscordEmbedThumbnail {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface DiscordEmbedVideo {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface DiscordEmbedProvider {
  name?: string;
  url?: string;
}

export interface DiscordEmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbedJSON {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: DiscordEmbedFooter;
  image?: DiscordEmbedImage;
  thumbnail?: DiscordEmbedThumbnail;
  video?: DiscordEmbedVideo;
  provider?: DiscordEmbedProvider;
  author?: DiscordEmbedAuthor;
  fields?: DiscordEmbedField[];
}

export class EmbedBuilder {
  private data: DiscordEmbedJSON;

  constructor(data: DiscordEmbedJSON = {}) {
    this.data = {
      ...data,
      fields: data.fields ? [...data.fields] : [],
    };
  }

  public setTitle(title: string): this {
    this.data.title = title;
    return this;
  }

  public setDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  public setUrl(url: string): this {
    this.data.url = url;
    return this;
  }

  public setColor(color: number): this {
    this.data.color = color;
    return this;
  }

  public setTimestamp(timestamp: Date | number | string | boolean | null = true): this {
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
    if (typeof timestamp === "string") {
      this.data.timestamp = new Date(timestamp).toISOString();
      return this;
    }
    return this;
  }

  public setFooter(footer: { text: string; iconUrl?: string } | null): this {
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

  public setAuthor(author: { name: string; iconUrl?: string; url?: string } | null): this {
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

  public setThumbnail(url: string | null): this {
    if (!url) {
      delete this.data.thumbnail;
      return this;
    }
    this.data.thumbnail = { url };
    return this;
  }

  public setImage(url: string | null): this {
    if (!url) {
      delete this.data.image;
      return this;
    }
    this.data.image = { url };
    return this;
  }

  public addField(field: DiscordEmbedField): this;
  public addField(name: string, value: string, inline?: boolean): this;
  public addField(nameOrField: string | DiscordEmbedField, value?: string, inline?: boolean): this {
    if (!this.data.fields) this.data.fields = [];
    if (typeof nameOrField === "object") {
      this.data.fields.push({ ...nameOrField });
    } else {
      const field: DiscordEmbedField = { name: nameOrField, value: value ?? "" };
      if (inline !== undefined) field.inline = inline;
      this.data.fields.push(field);
    }
    return this;
  }

  public addFields(...fields: DiscordEmbedField[] | [DiscordEmbedField[]]): this {
    if (!this.data.fields) this.data.fields = [];
    const fieldsToAdd = Array.isArray(fields[0]) ? fields[0] : (fields as DiscordEmbedField[]);
    for (const f of fieldsToAdd) {
      this.data.fields.push({ ...f });
    }
    return this;
  }

  public spliceFields(index: number, deleteCount: number, ...fields: DiscordEmbedField[]): this {
    if (!this.data.fields) this.data.fields = [];
    this.data.fields.splice(index, deleteCount, ...fields);
    return this;
  }

  public setFields(...fields: DiscordEmbedField[] | [DiscordEmbedField[]]): this {
    const fieldsToSet = Array.isArray(fields[0]) ? fields[0] : (fields as DiscordEmbedField[]);
    this.data.fields = fieldsToSet.map((f) => ({ ...f }));
    return this;
  }

  public toJSON(): DiscordEmbedJSON {
    return {
      ...this.data,
      ...(this.data.fields && this.data.fields.length > 0 ? { fields: [...this.data.fields] } : {}),
    };
  }
}
