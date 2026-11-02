/** Discord message component type ids (API). */
export const ComponentType = {
  ActionRow: 1,
  Button: 2,
  StringSelect: 3,
  TextInput: 4,
  UserSelect: 5,
  RoleSelect: 6,
  MentionableSelect: 7,
  ChannelSelect: 8,
  Section: 9,
  TextDisplay: 10,
  Thumbnail: 11,
  MediaGallery: 12,
  File: 13,
  Separator: 14,
  Container: 17,
  /** Modal layout wrapper (label + description + child). */
  Label: 18,
  /** Modal file upload (must be inside a Label). */
  FileUpload: 19,
  /** Modal single-choice radio group (must be inside a Label). */
  RadioGroup: 21,
  /** Modal multi-select checkbox group (must be inside a Label). */
  CheckboxGroup: 22,
  /** Modal single checkbox (must be inside a Label). */
  Checkbox: 23,
} as const;

export type ComponentTypeId = (typeof ComponentType)[keyof typeof ComponentType];

/** Discord message flags used with component replies. */
export const MessageFlags = {
  Ephemeral: 1 << 6,
  /** Enables Components V2 layout (Containers, Sections, Text Display, …). */
  IsComponentsV2: 1 << 15,
} as const;

export type MessageFlag = (typeof MessageFlags)[keyof typeof MessageFlags];

/**
 * Discord channel flags (bitfield on channel objects).
 * @see https://docs.discord.com/developers/change-log — Channel Obfuscation
 */
export const ChannelFlags = {
  /**
   * Channel metadata is obfuscated because the bot lacks `VIEW_CHANNEL`
   * (`1 << 17`). Name is typically `"___hidden___"`.
   */
  Obfuscated: 1 << 17,
} as const;

export type ChannelFlag = (typeof ChannelFlags)[keyof typeof ChannelFlags];

/** True when a channel payload carries {@link ChannelFlags.Obfuscated}. */
export function isChannelObfuscated(channel: {
  flags?: number | null;
  name?: string | null;
}): boolean {
  const flags = channel.flags ?? 0;
  if ((flags & ChannelFlags.Obfuscated) === ChannelFlags.Obfuscated) return true;
  return channel.name === "___hidden___";
}

/** Separator padding sizes (API). */
export const SeparatorSpacing = {
  Small: 1,
  Large: 2,
} as const;

export type SeparatorSpacingId = (typeof SeparatorSpacing)[keyof typeof SeparatorSpacing];

/** Discord button styles (API). */
export const ButtonStyle = {
  Primary: 1,
  Secondary: 2,
  Success: 3,
  Danger: 4,
  Link: 5,
  /** Renders a premium/SKU purchase button. Requires `sku_id`, no `custom_id` or `label`. */
  Premium: 6,
} as const;

export type ButtonStyleId = (typeof ButtonStyle)[keyof typeof ButtonStyle];

/** Discord text input styles (API). */
export const TextInputStyle = {
  Short: 1,
  Paragraph: 2,
} as const;

export type TextInputStyleId = (typeof TextInputStyle)[keyof typeof TextInputStyle];

export interface ComponentEmoji {
  name?: string;
  id?: string;
  animated?: boolean;
}

/** Media URL or `attachment://filename` reference. */
export interface UnfurledMediaItem {
  url: string;
}

export interface ButtonComponent {
  type: typeof ComponentType.Button;
  style: ButtonStyleId;
  label?: string;
  custom_id?: string;
  url?: string;
  /** Required for Premium buttons (`style: 6`). Must not be set for other styles. */
  sku_id?: string;
  disabled?: boolean;
  emoji?: ComponentEmoji;
  id?: number;
}

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
  emoji?: ComponentEmoji;
  default?: boolean;
}

export interface StringSelectComponent {
  type: typeof ComponentType.StringSelect;
  custom_id: string;
  options: SelectOption[];
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
  id?: number;
}

/** Default value entry for entity selects (`default_values`). */
export interface SelectDefaultValue {
  id: string;
  type: "user" | "role" | "channel";
}

/**
 * Discord channel type integers for {@link ChannelSelectComponent.channel_types}.
 * @see https://discord.com/developers/docs/resources/channel#channel-object-channel-types
 */
export const ChannelSelectChannelType = {
  GuildText: 0,
  Dm: 1,
  GuildVoice: 2,
  GroupDm: 3,
  GuildCategory: 4,
  GuildAnnouncement: 5,
  AnnouncementThread: 10,
  PublicThread: 11,
  PrivateThread: 12,
  GuildStageVoice: 13,
  GuildDirectory: 14,
  GuildForum: 15,
  GuildMedia: 16,
} as const;

export type ChannelSelectChannelTypeId =
  (typeof ChannelSelectChannelType)[keyof typeof ChannelSelectChannelType];

/** Shared fields for user / role / mentionable / channel selects. */
export interface EntitySelectBase {
  custom_id: string;
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
  default_values?: SelectDefaultValue[];
  id?: number;
}

export interface UserSelectComponent extends EntitySelectBase {
  type: typeof ComponentType.UserSelect;
}

export interface RoleSelectComponent extends EntitySelectBase {
  type: typeof ComponentType.RoleSelect;
}

export interface MentionableSelectComponent extends EntitySelectBase {
  type: typeof ComponentType.MentionableSelect;
}

export interface ChannelSelectComponent extends EntitySelectBase {
  type: typeof ComponentType.ChannelSelect;
  channel_types?: ChannelSelectChannelTypeId[];
}

export type EntitySelectComponent =
  | UserSelectComponent
  | RoleSelectComponent
  | MentionableSelectComponent
  | ChannelSelectComponent;

export interface TextInputComponent {
  type: typeof ComponentType.TextInput;
  custom_id: string;
  style: TextInputStyleId;
  /** Required in classic action-row modals; omit when wrapped in a {@link LabelComponent}. */
  label?: string;
  min_length?: number;
  max_length?: number;
  required?: boolean;
  value?: string;
  placeholder?: string;
  id?: number;
}

export type ActionRowChild =
  | ButtonComponent
  | StringSelectComponent
  | EntitySelectComponent
  | TextInputComponent;

export interface ActionRowComponent {
  type: typeof ComponentType.ActionRow;
  components: ActionRowChild[];
  id?: number;
}

export interface FileUploadComponent {
  type: typeof ComponentType.FileUpload;
  custom_id: string;
  min_values?: number;
  max_values?: number;
  required?: boolean;
  /** Extensions (`.pdf`) or categories (`image`, `video`, `audio`); max 10. */
  file_types?: string[];
  id?: number;
}

export interface RadioGroupOption {
  value: string;
  label: string;
  description?: string;
  default?: boolean;
}

export interface RadioGroupComponent {
  type: typeof ComponentType.RadioGroup;
  custom_id: string;
  options: RadioGroupOption[];
  required?: boolean;
  id?: number;
}

export interface CheckboxGroupOption {
  value: string;
  label: string;
  description?: string;
  default?: boolean;
}

export interface CheckboxGroupComponent {
  type: typeof ComponentType.CheckboxGroup;
  custom_id: string;
  options: CheckboxGroupOption[];
  min_values?: number;
  max_values?: number;
  required?: boolean;
  id?: number;
}

export interface CheckboxComponent {
  type: typeof ComponentType.Checkbox;
  custom_id: string;
  default?: boolean;
  id?: number;
}

/** Interactive child of a modal {@link LabelComponent}. */
export type LabelChildComponent =
  | TextInputComponent
  | StringSelectComponent
  | UserSelectComponent
  | RoleSelectComponent
  | MentionableSelectComponent
  | ChannelSelectComponent
  | FileUploadComponent
  | RadioGroupComponent
  | CheckboxGroupComponent
  | CheckboxComponent;

export interface LabelComponent {
  type: typeof ComponentType.Label;
  label: string;
  description?: string;
  component: LabelChildComponent;
  id?: number;
}

/** Top-level modal rows: classic action rows or Label wrappers. */
export type ModalTopLevelComponent = ActionRowComponent | LabelComponent;

/** Modal payload for interaction responses (`type: 9` callback data). */
export interface ModalComponent {
  custom_id: string;
  title: string;
  components: ModalTopLevelComponent[];
}

export interface TextDisplayComponent {
  type: typeof ComponentType.TextDisplay;
  content: string;
  id?: number;
}

export interface ThumbnailComponent {
  type: typeof ComponentType.Thumbnail;
  media: UnfurledMediaItem;
  description?: string | null;
  spoiler?: boolean;
  id?: number;
}

export type SectionAccessory = ButtonComponent | ThumbnailComponent;

export interface SectionComponent {
  type: typeof ComponentType.Section;
  components: TextDisplayComponent[];
  accessory: SectionAccessory;
  id?: number;
}

export interface MediaGalleryItem {
  media: UnfurledMediaItem;
  description?: string | null;
  spoiler?: boolean;
}

export interface MediaGalleryComponent {
  type: typeof ComponentType.MediaGallery;
  items: MediaGalleryItem[];
  id?: number;
}

export interface FileComponent {
  type: typeof ComponentType.File;
  file: UnfurledMediaItem;
  spoiler?: boolean;
  id?: number;
}

export interface SeparatorComponent {
  type: typeof ComponentType.Separator;
  divider?: boolean;
  spacing?: SeparatorSpacingId;
  id?: number;
}

export type ContainerChild =
  | ActionRowComponent
  | TextDisplayComponent
  | SectionComponent
  | MediaGalleryComponent
  | SeparatorComponent
  | FileComponent;

export interface ContainerComponent {
  type: typeof ComponentType.Container;
  components: ContainerChild[];
  accent_color?: number | null;
  spoiler?: boolean;
  id?: number;
}

/** Top-level Components V2 message children (plus legacy action rows). */
export type MessageComponentV2 =
  | ActionRowComponent
  | TextDisplayComponent
  | SectionComponent
  | MediaGalleryComponent
  | SeparatorComponent
  | FileComponent
  | ContainerComponent;
