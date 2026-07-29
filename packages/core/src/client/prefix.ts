/** Context passed to {@link PrefixResolver} for per-guild or dynamic prefixes. */
export interface PrefixResolveContext {
  guildId?: string;
  channelId?: string;
  userId: string;
  content: string;
}

export type PrefixResolver = (ctx: PrefixResolveContext) => string | Promise<string>;

/**
 * Prefix resolver that treats `<@botId>` / `<@!botId>` as the command prefix,
 * falling back to {@link textPrefix} (default `"!"`) for classic text prefixes.
 */
export function createMentionPrefixResolver(botUserId: string, textPrefix = "!"): PrefixResolver {
  const mention = `<@${botUserId}>`;
  const nickMention = `<@!${botUserId}>`;

  return ({ content }) => {
    if (content.startsWith(nickMention)) return nickMention;
    if (content.startsWith(mention)) return mention;
    return textPrefix;
  };
}
