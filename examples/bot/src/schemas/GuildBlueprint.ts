import { defineBlueprint, field } from "@stambha/vault";
import { capabilityClaimsField } from "@stambha/authz";

export const GuildBlueprint = defineBlueprint({
  prefix: field.string().default("!").build(),
  modLogChannel: field.string().nullable().default(null).build(),
  welcomeEnabled: field.boolean().default(true).build(),
  /** Per-member capability grants / denies. */
  capabilityClaims: capabilityClaimsField(),
});
