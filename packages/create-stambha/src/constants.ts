/** Monorepo release line embedded in generated bot package.json files. */
export const STAMBHA_VERSION = "^1.3.1";

export const TEMPLATES = ["minimal", "basic"] as const;
export type TemplateName = (typeof TEMPLATES)[number];

export function isTemplateName(value: string): value is TemplateName {
  return (TEMPLATES as readonly string[]).includes(value);
}
