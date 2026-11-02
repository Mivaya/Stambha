/**
 * Fluent helper for Discord message attachments (multipart upload metadata).
 * Pair with your REST multipart body; this builds the JSON attachment descriptor.
 */

export interface AttachmentJSON {
  id?: string | number;
  filename?: string;
  title?: string;
  description?: string;
  /** Spoiler filename prefix is applied when {@link AttachmentBuilder.setSpoiler} is true. */
  content_type?: string;
  size?: number;
  url?: string;
  proxy_url?: string;
  height?: number | null;
  width?: number | null;
  ephemeral?: boolean;
  duration_secs?: number;
  waveform?: string;
  flags?: number;
}

/** Discord attachment flag: voice message (`1 << 13`). */
export const AttachmentFlags = {
  IsVoiceMessage: 1 << 13,
} as const;

export interface AttachmentBuilderOptions {
  filename: string;
  description?: string;
  title?: string;
  contentType?: string;
  spoiler?: boolean;
  /** Voice message duration in seconds. */
  durationSecs?: number;
  /** Base64 waveform for voice messages. */
  waveform?: string;
  /** Set voice-message flag. */
  voiceMessage?: boolean;
  id?: string | number;
}

export class AttachmentBuilder {
  #filename: string;
  #description?: string;
  #title?: string;
  #contentType?: string;
  #spoiler = false;
  #durationSecs?: number;
  #waveform?: string;
  #voiceMessage = false;
  #id?: string | number;

  constructor(options: AttachmentBuilderOptions) {
    this.#filename = options.filename;
    if (options.description !== undefined) this.#description = options.description;
    if (options.title !== undefined) this.#title = options.title;
    if (options.contentType !== undefined) this.#contentType = options.contentType;
    if (options.spoiler) this.#spoiler = true;
    if (options.durationSecs !== undefined) this.#durationSecs = options.durationSecs;
    if (options.waveform !== undefined) this.#waveform = options.waveform;
    if (options.voiceMessage) this.#voiceMessage = true;
    if (options.id !== undefined) this.#id = options.id;
  }

  static from(options: AttachmentBuilderOptions): AttachmentBuilder {
    return new AttachmentBuilder(options);
  }

  setDescription(description: string): this {
    this.#description = description;
    return this;
  }

  setSpoiler(spoiler = true): this {
    this.#spoiler = spoiler;
    return this;
  }

  setVoiceMessage(options: { durationSecs: number; waveform: string }): this {
    this.#voiceMessage = true;
    this.#durationSecs = options.durationSecs;
    this.#waveform = options.waveform;
    return this;
  }

  /** Discord attachment:// URL for embedding this file in components. */
  get attachmentUrl(): string {
    return `attachment://${this.resolvedFilename}`;
  }

  get resolvedFilename(): string {
    if (!this.#spoiler) return this.#filename;
    return this.#filename.startsWith("SPOILER_") ? this.#filename : `SPOILER_${this.#filename}`;
  }

  toJSON(): AttachmentJSON {
    const json: AttachmentJSON = { filename: this.resolvedFilename };
    if (this.#id !== undefined) json.id = this.#id;
    if (this.#description !== undefined) json.description = this.#description;
    if (this.#title !== undefined) json.title = this.#title;
    if (this.#contentType !== undefined) json.content_type = this.#contentType;
    if (this.#durationSecs !== undefined) json.duration_secs = this.#durationSecs;
    if (this.#waveform !== undefined) json.waveform = this.#waveform;
    if (this.#voiceMessage) json.flags = AttachmentFlags.IsVoiceMessage;
    return json;
  }
}

export function attachment(options: AttachmentBuilderOptions): AttachmentBuilder {
  return new AttachmentBuilder(options);
}
