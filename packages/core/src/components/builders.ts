import {
  type ActionRowChild,
  type ActionRowComponent,
  type ButtonComponent,
  ButtonStyle,
  type ButtonStyleId,
  type ChannelSelectChannelTypeId,
  type ChannelSelectComponent,
  type ComponentEmoji,
  ComponentType,
  type MentionableSelectComponent,
  type ModalComponent,
  type RoleSelectComponent,
  type SelectDefaultValue,
  type SelectOption,
  type StringSelectComponent,
  type TextInputComponent,
  TextInputStyle,
  type TextInputStyleId,
  type UserSelectComponent,
} from "./types.js";

export interface ButtonOptions {
  /** Discord `custom_id` — use `signal.customId(suffix)` for routable ids. */
  customId: string;
  label: string;
  style?: ButtonStyleId;
  disabled?: boolean;
  emoji?: ComponentEmoji;
}

export interface LinkButtonOptions {
  url: string;
  label: string;
  disabled?: boolean;
  emoji?: ComponentEmoji;
}

export interface StringSelectOptions {
  customId: string;
  options: readonly SelectOption[];
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
}

/** Shared options for Discord entity selects (user / role / mentionable / channel). */
export interface EntitySelectOptions {
  customId: string;
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
  /** Pre-selected entities (`default_values`). */
  defaultValues?: readonly SelectDefaultValue[];
  /** Optional 32-bit component id. */
  id?: number;
}

export interface ChannelSelectOptions extends EntitySelectOptions {
  /** Restrict selectable channel types (Discord channel type integers). */
  channelTypes?: readonly ChannelSelectChannelTypeId[];
}

export interface TextInputOptions {
  customId: string;
  label: string;
  style?: TextInputStyleId;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  value?: string;
  placeholder?: string;
}

export interface ModalOptions {
  customId: string;
  title: string;
  /** Action rows of text inputs (1–5 rows). */
  components: readonly ActionRowComponent[];
}

/** Build a non-link button (API shape). */
export function button(options: ButtonOptions): ButtonComponent {
  const component: ButtonComponent = {
    type: ComponentType.Button,
    style: options.style ?? ButtonStyle.Primary,
    label: options.label,
    custom_id: options.customId,
  };
  if (options.disabled !== undefined) component.disabled = options.disabled;
  if (options.emoji) component.emoji = options.emoji;
  return component;
}

/** Build a link button (no custom id). */
export function linkButton(options: LinkButtonOptions): ButtonComponent {
  const component: ButtonComponent = {
    type: ComponentType.Button,
    style: ButtonStyle.Link,
    label: options.label,
    url: options.url,
  };
  if (options.disabled !== undefined) component.disabled = options.disabled;
  if (options.emoji) component.emoji = options.emoji;
  return component;
}

/** Build a string select menu (place inside {@link actionRow} / {@link selectRow}). */
export function stringSelect(options: StringSelectOptions): StringSelectComponent {
  if (options.options.length < 1 || options.options.length > 25) {
    throw new Error("stringSelect requires 1–25 options.");
  }
  const component: StringSelectComponent = {
    type: ComponentType.StringSelect,
    custom_id: options.customId,
    options: options.options.map((o) => ({ ...o })),
  };
  if (options.placeholder !== undefined) component.placeholder = options.placeholder;
  if (options.minValues !== undefined) component.min_values = options.minValues;
  if (options.maxValues !== undefined) component.max_values = options.maxValues;
  if (options.disabled !== undefined) component.disabled = options.disabled;
  return component;
}

function applyEntitySelectBase(
  component: {
    custom_id: string;
    placeholder?: string;
    min_values?: number;
    max_values?: number;
    disabled?: boolean;
    default_values?: SelectDefaultValue[];
    id?: number;
  },
  options: EntitySelectOptions,
): void {
  if (options.placeholder !== undefined) component.placeholder = options.placeholder;
  if (options.minValues !== undefined) component.min_values = options.minValues;
  if (options.maxValues !== undefined) component.max_values = options.maxValues;
  if (options.disabled !== undefined) component.disabled = options.disabled;
  if (options.defaultValues !== undefined) {
    component.default_values = options.defaultValues.map((v) => ({ ...v }));
  }
  if (options.id !== undefined) component.id = options.id;
}

/** User select menu (type 5) — Discord populates options from the guild. */
export function userSelect(options: EntitySelectOptions): UserSelectComponent {
  const component: UserSelectComponent = {
    type: ComponentType.UserSelect,
    custom_id: options.customId,
  };
  applyEntitySelectBase(component, options);
  return component;
}

/** Role select menu (type 6). */
export function roleSelect(options: EntitySelectOptions): RoleSelectComponent {
  const component: RoleSelectComponent = {
    type: ComponentType.RoleSelect,
    custom_id: options.customId,
  };
  applyEntitySelectBase(component, options);
  return component;
}

/** Mentionable select (users + roles, type 7). */
export function mentionableSelect(options: EntitySelectOptions): MentionableSelectComponent {
  const component: MentionableSelectComponent = {
    type: ComponentType.MentionableSelect,
    custom_id: options.customId,
  };
  applyEntitySelectBase(component, options);
  return component;
}

/** Channel select menu (type 8). */
export function channelSelect(options: ChannelSelectOptions): ChannelSelectComponent {
  const component: ChannelSelectComponent = {
    type: ComponentType.ChannelSelect,
    custom_id: options.customId,
  };
  applyEntitySelectBase(component, options);
  if (options.channelTypes !== undefined) {
    component.channel_types = [...options.channelTypes];
  }
  return component;
}

/** Build a modal text input. */
export function textInput(options: TextInputOptions): TextInputComponent {
  const component: TextInputComponent = {
    type: ComponentType.TextInput,
    custom_id: options.customId,
    style: options.style ?? TextInputStyle.Short,
    label: options.label,
  };
  if (options.minLength !== undefined) component.min_length = options.minLength;
  if (options.maxLength !== undefined) component.max_length = options.maxLength;
  if (options.required !== undefined) component.required = options.required;
  if (options.value !== undefined) component.value = options.value;
  if (options.placeholder !== undefined) component.placeholder = options.placeholder;
  return component;
}

/** Wrap child components in an action row (type 1). */
export function actionRow(...components: ActionRowChild[]): ActionRowComponent {
  if (components.length < 1 || components.length > 5) {
    throw new Error("actionRow requires 1–5 child components.");
  }
  const selectTypes = new Set<number>([
    ComponentType.StringSelect,
    ComponentType.UserSelect,
    ComponentType.RoleSelect,
    ComponentType.MentionableSelect,
    ComponentType.ChannelSelect,
  ]);
  const hasSelect = components.some((c) => selectTypes.has(c.type));
  if (hasSelect && components.length !== 1) {
    throw new Error("A select menu must be alone in its action row.");
  }
  const hasText = components.some((c) => c.type === ComponentType.TextInput);
  if (hasText && components.length !== 1) {
    throw new Error("A text input must be alone in its action row.");
  }
  return { type: ComponentType.ActionRow, components: [...components] };
}

/** Convenience: action row of buttons (max 5). */
export function buttonRow(...buttons: ButtonComponent[]): ActionRowComponent {
  if (buttons.some((b) => b.type !== ComponentType.Button)) {
    throw new Error("buttonRow only accepts button components.");
  }
  return actionRow(...buttons);
}

/** Convenience: action row with a single select (string or entity). */
export function selectRow(
  select: StringSelectComponent | UserSelectComponent | RoleSelectComponent | MentionableSelectComponent | ChannelSelectComponent,
): ActionRowComponent {
  return actionRow(select);
}

/** Confirm / cancel button row wired to a signal’s custom ids. */
export function confirmCancelRow(
  signal: { customId(suffix?: string): string },
  labels: { confirm?: string; cancel?: string } = {},
): ActionRowComponent {
  return buttonRow(
    button({
      customId: signal.customId("yes"),
      label: labels.confirm ?? "Confirm",
      style: ButtonStyle.Success,
    }),
    button({
      customId: signal.customId("no"),
      label: labels.cancel ?? "Cancel",
      style: ButtonStyle.Secondary,
    }),
  );
}

/** Modal layout for interaction responses. */
export function modal(options: ModalOptions): ModalComponent {
  if (options.components.length < 1 || options.components.length > 5) {
    throw new Error("modal requires 1–5 action rows.");
  }
  return {
    custom_id: options.customId,
    title: options.title,
    components: [...options.components],
  };
}

/** Options for a Premium button (ButtonStyle.Premium = 6). */
export interface PremiumButtonOptions {
  /** The SKU id to link. Required for Premium buttons. */
  skuId: string;
  disabled?: boolean;
  /** Optional 32-bit component id for cross-message deduplication. */
  id?: number;
}

/**
 * Build a Premium/SKU purchase button (style 6).
 * Premium buttons have no `custom_id` or `label` — Discord renders them with the SKU name.
 * They do not fire interaction callbacks; they open the SKU purchase flow directly.
 *
 * @example
 * ```ts
 * premiumButton({ skuId: process.env.PREMIUM_SKU_ID! })
 * ```
 */
export function premiumButton(options: PremiumButtonOptions): ButtonComponent {
  const component: ButtonComponent = {
    type: ComponentType.Button,
    style: ButtonStyle.Premium,
    sku_id: options.skuId,
  };
  if (options.disabled !== undefined) component.disabled = options.disabled;
  if (options.id !== undefined) component.id = options.id;
  return component;
}
