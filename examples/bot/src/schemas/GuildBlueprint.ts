import { defineBlueprint, field } from "@stambha/vault";
import { permissionLevelsField } from "@stambha/levels";

export const GuildBlueprint = defineBlueprint({
  prefix: field.string().default("!").build(),
  modLogChannel: field.string().nullable().default(null).build(),
  welcomeEnabled: field.boolean().default(true).build(),
  /** Per-member permission level overrides. */
  permissionLevels: permissionLevelsField(),
});
