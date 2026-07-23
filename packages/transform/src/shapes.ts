import type {
  AuthorizingIntegrationOwners,
  CommandContextMeta,
  CommandSlashPath,
  InteractionContextName,
  SlashOption,
} from "@stambha/core";

/** Transport-agnostic user slice. */
export interface StambhaUser {
  readonly id: string;
  readonly bot?: boolean;
  readonly username?: string;
}

/** Transport-agnostic message slice for routing. */
export interface StambhaMessage {
  readonly id: string | null;
  readonly content: string;
  readonly channelId: string | null;
  readonly guildId: string | null;
  readonly author: StambhaUser;
}

export interface StambhaInteractionBase {
  readonly id: string | null;
  readonly token: string | null;
  readonly applicationId?: string | null;
  readonly user: StambhaUser;
  readonly guildId: string | null;
  readonly channelId: string | null;
  readonly meta?: CommandContextMeta;
  /** Discord interaction `context` (guild / bot DM / private channel). */
  readonly interactionContext?: InteractionContextName;
  /** Discord `authorizing_integration_owners` for user/guild installs. */
  readonly authorizingIntegrationOwners?: AuthorizingIntegrationOwners;
  readonly raw: unknown;
}

/** Transport-agnostic slash command interaction. */
export interface StambhaSlashInteraction extends StambhaInteractionBase {
  readonly kind: "slash";
  readonly commandName: string;
  readonly slashPath: CommandSlashPath;
  readonly slashOptions: readonly SlashOption[];
}

export interface StambhaAutocompleteInteraction extends StambhaInteractionBase {
  readonly kind: "autocomplete";
  readonly commandName: string;
  readonly slashPath: CommandSlashPath;
  readonly focusedOption: string;
  readonly userInput: string;
}

export interface StambhaComponentInteraction extends StambhaInteractionBase {
  readonly kind: "component";
  readonly customId: string;
  readonly componentType: "button" | "select";
  /** Select menu values (empty for buttons). */
  readonly values: readonly string[];
}

export interface StambhaModalInteraction extends StambhaInteractionBase {
  readonly kind: "modal";
  readonly customId: string;
}

export type StambhaInteraction =
  | StambhaSlashInteraction
  | StambhaAutocompleteInteraction
  | StambhaComponentInteraction
  | StambhaModalInteraction;
