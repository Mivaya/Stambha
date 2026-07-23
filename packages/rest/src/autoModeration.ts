import type { RestPort } from "@stambha/core";

/** Auto Moderation trigger types. */
export const AutoModTriggerType = {
  Keyword: 1,
  Spam: 3,
  KeywordPreset: 4,
  MentionSpam: 5,
  MemberProfile: 6,
} as const;

/** Auto Moderation event types. */
export const AutoModEventType = {
  MessageSend: 1,
  MemberUpdate: 2,
} as const;

/** Auto Moderation action types. */
export const AutoModActionType = {
  BlockMessage: 1,
  SendAlertMessage: 2,
  Timeout: 3,
  BlockMemberInteraction: 4,
} as const;

/** Keyword preset types for {@link AutoModTriggerType.KeywordPreset}. */
export const AutoModKeywordPreset = {
  Profanity: 1,
  SexualContent: 2,
  Slurs: 3,
} as const;

export interface AutoModTriggerMetadata {
  keyword_filter?: string[];
  regex_patterns?: string[];
  presets?: number[];
  allow_list?: string[];
  mention_total_limit?: number;
  mention_raid_protection_enabled?: boolean;
}

export interface AutoModActionMetadata {
  channel_id?: string;
  duration_seconds?: number;
  custom_message?: string;
}

export interface AutoModAction {
  type: number;
  metadata?: AutoModActionMetadata;
}

/** Discord auto moderation rule (snake_case API shape). */
export interface ApiAutoModerationRule {
  id: string;
  guild_id: string;
  name: string;
  creator_id: string;
  event_type: number;
  trigger_type: number;
  trigger_metadata: AutoModTriggerMetadata;
  actions: AutoModAction[];
  enabled: boolean;
  exempt_roles: string[];
  exempt_channels: string[];
}

/** CamelCase options for {@link createAutoModerationRule}. */
export interface CreateAutoModerationRuleOptions {
  name: string;
  eventType: number;
  triggerType: number;
  actions: readonly AutoModAction[];
  triggerMetadata?: AutoModTriggerMetadata;
  enabled?: boolean;
  exemptRoles?: readonly string[];
  exemptChannels?: readonly string[];
}

export interface ModifyAutoModerationRuleOptions {
  name?: string;
  eventType?: number;
  triggerMetadata?: AutoModTriggerMetadata;
  actions?: readonly AutoModAction[];
  enabled?: boolean;
  exemptRoles?: readonly string[];
  exemptChannels?: readonly string[];
}

function toCreateBody(options: CreateAutoModerationRuleOptions): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: options.name,
    event_type: options.eventType,
    trigger_type: options.triggerType,
    actions: [...options.actions],
  };
  if (options.triggerMetadata !== undefined) body.trigger_metadata = options.triggerMetadata;
  if (options.enabled !== undefined) body.enabled = options.enabled;
  if (options.exemptRoles !== undefined) body.exempt_roles = [...options.exemptRoles];
  if (options.exemptChannels !== undefined) body.exempt_channels = [...options.exemptChannels];
  return body;
}

function toModifyBody(options: ModifyAutoModerationRuleOptions): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (options.name !== undefined) body.name = options.name;
  if (options.eventType !== undefined) body.event_type = options.eventType;
  if (options.triggerMetadata !== undefined) body.trigger_metadata = options.triggerMetadata;
  if (options.actions !== undefined) body.actions = [...options.actions];
  if (options.enabled !== undefined) body.enabled = options.enabled;
  if (options.exemptRoles !== undefined) body.exempt_roles = [...options.exemptRoles];
  if (options.exemptChannels !== undefined) body.exempt_channels = [...options.exemptChannels];
  return body;
}

/** Block-message action helper. */
export function autoModBlockMessage(customMessage?: string): AutoModAction {
  if (customMessage === undefined) return { type: AutoModActionType.BlockMessage };
  return {
    type: AutoModActionType.BlockMessage,
    metadata: { custom_message: customMessage },
  };
}

/** Alert-channel action helper. */
export function autoModAlert(channelId: string): AutoModAction {
  return {
    type: AutoModActionType.SendAlertMessage,
    metadata: { channel_id: channelId },
  };
}

/** Timeout action helper (`durationSeconds`, max 4 weeks). */
export function autoModTimeout(durationSeconds: number): AutoModAction {
  return {
    type: AutoModActionType.Timeout,
    metadata: { duration_seconds: durationSeconds },
  };
}

/** `GET /guilds/{guild.id}/auto-moderation/rules` */
export async function listAutoModerationRules(
  rest: RestPort,
  guildId: string,
): Promise<ApiAutoModerationRule[]> {
  try {
    const result = await rest.request<ApiAutoModerationRule[]>({
      method: "GET",
      route: `/guilds/${guildId}/auto-moderation/rules`,
    });
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

/** `GET /guilds/{guild.id}/auto-moderation/rules/{rule.id}` */
export async function fetchAutoModerationRule(
  rest: RestPort,
  guildId: string,
  ruleId: string,
): Promise<ApiAutoModerationRule | null> {
  try {
    return await rest.request<ApiAutoModerationRule>({
      method: "GET",
      route: `/guilds/${guildId}/auto-moderation/rules/${ruleId}`,
    });
  } catch {
    return null;
  }
}

/** `POST /guilds/{guild.id}/auto-moderation/rules` */
export async function createAutoModerationRule(
  rest: RestPort,
  guildId: string,
  options: CreateAutoModerationRuleOptions,
): Promise<ApiAutoModerationRule> {
  return rest.request<ApiAutoModerationRule>({
    method: "POST",
    route: `/guilds/${guildId}/auto-moderation/rules`,
    body: toCreateBody(options),
  });
}

/** `PATCH /guilds/{guild.id}/auto-moderation/rules/{rule.id}` */
export async function modifyAutoModerationRule(
  rest: RestPort,
  guildId: string,
  ruleId: string,
  options: ModifyAutoModerationRuleOptions,
): Promise<ApiAutoModerationRule> {
  return rest.request<ApiAutoModerationRule>({
    method: "PATCH",
    route: `/guilds/${guildId}/auto-moderation/rules/${ruleId}`,
    body: toModifyBody(options),
  });
}

/** `DELETE /guilds/{guild.id}/auto-moderation/rules/{rule.id}` */
export async function deleteAutoModerationRule(
  rest: RestPort,
  guildId: string,
  ruleId: string,
): Promise<boolean> {
  try {
    await rest.request({
      method: "DELETE",
      route: `/guilds/${guildId}/auto-moderation/rules/${ruleId}`,
    });
    return true;
  } catch {
    return false;
  }
}
