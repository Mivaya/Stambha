import type { RestPort } from "@stambha/core";
import type { ApiUser } from "./resources.js";

/** Discord soundboard sound (snake_case API shape). */
export interface ApiSoundboardSound {
  name: string;
  sound_id: string;
  volume: number;
  emoji_id?: string | null;
  emoji_name?: string | null;
  guild_id?: string | null;
  available: boolean;
  user?: ApiUser;
}

/** `GET /soundboard-default-sounds` */
export async function listDefaultSoundboardSounds(rest: RestPort): Promise<ApiSoundboardSound[]> {
  try {
    const result = await rest.request<ApiSoundboardSound[]>({
      method: "GET",
      route: "/soundboard-default-sounds",
    });
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

/**
 * `GET /guilds/{guild.id}/soundboard-sounds`
 * Discord returns `{ items: [...] }`.
 */
export async function listGuildSoundboardSounds(
  rest: RestPort,
  guildId: string,
): Promise<ApiSoundboardSound[]> {
  try {
    const result = await rest.request<{ items?: ApiSoundboardSound[] } | ApiSoundboardSound[]>({
      method: "GET",
      route: `/guilds/${guildId}/soundboard-sounds`,
    });
    if (Array.isArray(result)) return result;
    return Array.isArray(result?.items) ? result.items : [];
  } catch {
    return [];
  }
}

/** `GET /guilds/{guild.id}/soundboard-sounds/{sound.id}` */
export async function fetchGuildSoundboardSound(
  rest: RestPort,
  guildId: string,
  soundId: string,
): Promise<ApiSoundboardSound | null> {
  try {
    return await rest.request<ApiSoundboardSound>({
      method: "GET",
      route: `/guilds/${guildId}/soundboard-sounds/${soundId}`,
    });
  } catch {
    return null;
  }
}

/**
 * Play a soundboard sound in a voice channel the bot is connected to
 * (`POST /channels/{channel.id}/send-soundboard-sound`).
 */
export async function sendSoundboardSound(
  rest: RestPort,
  channelId: string,
  options: { soundId: string; sourceGuildId?: string },
): Promise<boolean> {
  try {
    const body: Record<string, string> = { sound_id: options.soundId };
    if (options.sourceGuildId !== undefined) body.source_guild_id = options.sourceGuildId;
    await rest.request({
      method: "POST",
      route: `/channels/${channelId}/send-soundboard-sound`,
      body,
    });
    return true;
  } catch {
    return false;
  }
}
