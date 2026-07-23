import type { RestPort } from "@stambha/core";
import type { ApiUser } from "./resources.js";

/** Discord scheduled-event entity types. */
export const ScheduledEventEntityType = {
  StageInstance: 1,
  Voice: 2,
  External: 3,
} as const;

/** Discord scheduled-event status values. */
export const ScheduledEventStatus = {
  Scheduled: 1,
  Active: 2,
  Completed: 3,
  Canceled: 4,
} as const;

/** Only `GUILD_ONLY` (2) is valid today. */
export const ScheduledEventPrivacyLevel = {
  GuildOnly: 2,
} as const;

export interface ScheduledEventEntityMetadata {
  location?: string;
}

/** Discord guild scheduled event (snake_case API shape). */
export interface ApiGuildScheduledEvent {
  id: string;
  guild_id: string;
  channel_id?: string | null;
  creator_id?: string | null;
  name: string;
  description?: string | null;
  scheduled_start_time: string;
  scheduled_end_time?: string | null;
  privacy_level: number;
  status: number;
  entity_type: number;
  entity_id?: string | null;
  entity_metadata?: ScheduledEventEntityMetadata | null;
  creator?: ApiUser;
  user_count?: number;
  image?: string | null;
}

export interface ApiGuildScheduledEventUser {
  guild_scheduled_event_id: string;
  user: ApiUser;
  member?: unknown;
}

/** CamelCase options for {@link createGuildScheduledEvent}. */
export interface CreateScheduledEventOptions {
  name: string;
  /** ISO8601 start time. */
  scheduledStartTime: string;
  entityType: number;
  /** Defaults to {@link ScheduledEventPrivacyLevel.GuildOnly}. */
  privacyLevel?: number;
  channelId?: string | null;
  scheduledEndTime?: string;
  description?: string;
  /** Required for {@link ScheduledEventEntityType.External}. */
  location?: string;
  image?: string;
}

export interface ModifyScheduledEventOptions {
  name?: string;
  channelId?: string | null;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  description?: string | null;
  entityType?: number;
  privacyLevel?: number;
  status?: number;
  location?: string | null;
  image?: string;
}

function toCreateBody(options: CreateScheduledEventOptions): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: options.name,
    scheduled_start_time: options.scheduledStartTime,
    entity_type: options.entityType,
    privacy_level: options.privacyLevel ?? ScheduledEventPrivacyLevel.GuildOnly,
  };
  if (options.channelId !== undefined) body.channel_id = options.channelId;
  if (options.scheduledEndTime !== undefined) body.scheduled_end_time = options.scheduledEndTime;
  if (options.description !== undefined) body.description = options.description;
  if (options.location !== undefined) body.entity_metadata = { location: options.location };
  if (options.image !== undefined) body.image = options.image;
  return body;
}

function toModifyBody(options: ModifyScheduledEventOptions): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (options.name !== undefined) body.name = options.name;
  if (options.channelId !== undefined) body.channel_id = options.channelId;
  if (options.scheduledStartTime !== undefined) {
    body.scheduled_start_time = options.scheduledStartTime;
  }
  if (options.scheduledEndTime !== undefined) body.scheduled_end_time = options.scheduledEndTime;
  if (options.description !== undefined) body.description = options.description;
  if (options.entityType !== undefined) body.entity_type = options.entityType;
  if (options.privacyLevel !== undefined) body.privacy_level = options.privacyLevel;
  if (options.status !== undefined) body.status = options.status;
  if (options.location !== undefined) {
    body.entity_metadata = options.location === null ? null : { location: options.location };
  }
  if (options.image !== undefined) body.image = options.image;
  return body;
}

/** `GET /guilds/{guild.id}/scheduled-events` */
export async function listGuildScheduledEvents(
  rest: RestPort,
  guildId: string,
  options: { withUserCount?: boolean } = {},
): Promise<ApiGuildScheduledEvent[]> {
  try {
    const query =
      options.withUserCount !== undefined
        ? { with_user_count: String(options.withUserCount) }
        : undefined;
    const result = await rest.request<ApiGuildScheduledEvent[]>({
      method: "GET",
      route: `/guilds/${guildId}/scheduled-events`,
      ...(query ? { query } : {}),
    });
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

/** `GET /guilds/{guild.id}/scheduled-events/{event.id}` */
export async function fetchGuildScheduledEvent(
  rest: RestPort,
  guildId: string,
  eventId: string,
  options: { withUserCount?: boolean } = {},
): Promise<ApiGuildScheduledEvent | null> {
  try {
    const query =
      options.withUserCount !== undefined
        ? { with_user_count: String(options.withUserCount) }
        : undefined;
    return await rest.request<ApiGuildScheduledEvent>({
      method: "GET",
      route: `/guilds/${guildId}/scheduled-events/${eventId}`,
      ...(query ? { query } : {}),
    });
  } catch {
    return null;
  }
}

/** `POST /guilds/{guild.id}/scheduled-events` */
export async function createGuildScheduledEvent(
  rest: RestPort,
  guildId: string,
  options: CreateScheduledEventOptions,
): Promise<ApiGuildScheduledEvent> {
  return rest.request<ApiGuildScheduledEvent>({
    method: "POST",
    route: `/guilds/${guildId}/scheduled-events`,
    body: toCreateBody(options),
  });
}

/** `PATCH /guilds/{guild.id}/scheduled-events/{event.id}` */
export async function modifyGuildScheduledEvent(
  rest: RestPort,
  guildId: string,
  eventId: string,
  options: ModifyScheduledEventOptions,
): Promise<ApiGuildScheduledEvent> {
  return rest.request<ApiGuildScheduledEvent>({
    method: "PATCH",
    route: `/guilds/${guildId}/scheduled-events/${eventId}`,
    body: toModifyBody(options),
  });
}

/** Start a scheduled event (`status` → ACTIVE). */
export async function startGuildScheduledEvent(
  rest: RestPort,
  guildId: string,
  eventId: string,
): Promise<ApiGuildScheduledEvent> {
  return modifyGuildScheduledEvent(rest, guildId, eventId, {
    status: ScheduledEventStatus.Active,
  });
}

/** End an active event (`status` → COMPLETED). */
export async function completeGuildScheduledEvent(
  rest: RestPort,
  guildId: string,
  eventId: string,
): Promise<ApiGuildScheduledEvent> {
  return modifyGuildScheduledEvent(rest, guildId, eventId, {
    status: ScheduledEventStatus.Completed,
  });
}

/** Cancel a scheduled event (`status` → CANCELED). */
export async function cancelGuildScheduledEvent(
  rest: RestPort,
  guildId: string,
  eventId: string,
): Promise<ApiGuildScheduledEvent> {
  return modifyGuildScheduledEvent(rest, guildId, eventId, {
    status: ScheduledEventStatus.Canceled,
  });
}

/** `DELETE /guilds/{guild.id}/scheduled-events/{event.id}` */
export async function deleteGuildScheduledEvent(
  rest: RestPort,
  guildId: string,
  eventId: string,
): Promise<boolean> {
  try {
    await rest.request({
      method: "DELETE",
      route: `/guilds/${guildId}/scheduled-events/${eventId}`,
    });
    return true;
  } catch {
    return false;
  }
}

/** `GET /guilds/{guild.id}/scheduled-events/{event.id}/users` */
export async function listGuildScheduledEventUsers(
  rest: RestPort,
  guildId: string,
  eventId: string,
  query: {
    limit?: number;
    withMember?: boolean;
    before?: string;
    after?: string;
  } = {},
): Promise<ApiGuildScheduledEventUser[]> {
  try {
    const q: Record<string, string> = {};
    if (query.limit !== undefined) q.limit = String(query.limit);
    if (query.withMember !== undefined) q.with_member = String(query.withMember);
    if (query.before) q.before = query.before;
    if (query.after) q.after = query.after;
    const result = await rest.request<ApiGuildScheduledEventUser[]>({
      method: "GET",
      route: `/guilds/${guildId}/scheduled-events/${eventId}/users`,
      ...(Object.keys(q).length > 0 ? { query: q } : {}),
    });
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}
