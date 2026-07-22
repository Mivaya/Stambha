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
} as const;

export type ComponentTypeId = (typeof ComponentType)[keyof typeof ComponentType];

/** Discord button styles (API). */
export const ButtonStyle = {
  Primary: 1,
  Secondary: 2,
  Success: 3,
  Danger: 4,
  Link: 5,
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

export interface ButtonComponent {
  type: typeof ComponentType.Button;
  style: ButtonStyleId;
  label?: string;
  custom_id?: string;
  url?: string;
  disabled?: boolean;
  emoji?: ComponentEmoji;
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
}

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
}

export type ActionRowChild = ButtonComponent | StringSelectComponent | TextInputComponent;

export interface ActionRowComponent {
  type: typeof ComponentType.ActionRow;
  components: ActionRowChild[];
}

/** Modal payload for interaction responses (`type: 9` callback data). */
export interface ModalComponent {
  custom_id: string;
  title: string;
  components: ActionRowComponent[];
}
