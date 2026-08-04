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
} as const;

export type ComponentTypeId = (typeof ComponentType)[keyof typeof ComponentType];

/** Discord message flags used with component replies. */
export const MessageFlags = {
  Ephemeral: 1 << 6,
  /** Enables Components V2 layout (Containers, Sections, Text Display, …). */
  IsComponentsV2: 1 << 15,
} as const;

export type MessageFlag = (typeof MessageFlags)[keyof typeof MessageFlags];

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
  label: string;
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

/** Modal payload for interaction responses (`type: 9` callback data). */
export interface ModalComponent {
  custom_id: string;
  title: string;
  components: ActionRowComponent[];
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
