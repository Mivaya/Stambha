/** Planned removal version for discord.js / Discordeno shape adapters. */
export const LEGACY_LIBRARY_ADAPTER_REMOVAL = "1.5.0";

const warned = new Set<string>();

/** Emit a one-time runtime warning when a deprecated library adapter is used. */
export function warnLegacyLibraryAdapter(exportName: string): void {
  if (warned.has(exportName)) return;
  warned.add(exportName);
  console.warn(
    `[@stambha/transform] ${exportName} is deprecated and will be removed in v${LEGACY_LIBRARY_ADAPTER_REMOVAL}. ` +
      "Migrate to native Stambha shapes (StambhaMessage, interactionFromDispatch, metaFromDiscordInteraction).",
  );
}
