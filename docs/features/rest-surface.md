# Modern REST surface

High-level helpers in [`@stambha/rest`](https://github.com/Mivaya/Stambha/tree/main/packages/rest) for Discord resources that already have camelCase [gateway hub](/deployment/gateway) events — polls, scheduled events, Auto Moderation, and soundboard.

Prefer these over hand-written `rest.request({ route: … })` calls.

## Polls

Shipped with poll create/end REST helpers — see [Polls](/features/polls).

```ts
import { createPoll, endPoll } from "@stambha/rest";

await ctx.reply({ poll: createPoll({ question: "Ship?", answers: ["Yes", "No"] }) });
await endPoll(rest, channelId, messageId);
```

## Scheduled events

```ts
import {
  createGuildScheduledEvent,
  listGuildScheduledEvents,
  startGuildScheduledEvent,
  cancelGuildScheduledEvent,
  ScheduledEventEntityType,
} from "@stambha/rest";

const events = await listGuildScheduledEvents(rest, guildId, { withUserCount: true });

const event = await createGuildScheduledEvent(rest, guildId, {
  name: "Community call",
  scheduledStartTime: new Date(Date.now() + 86_400_000).toISOString(),
  entityType: ScheduledEventEntityType.Voice,
  channelId: voiceChannelId,
});

await startGuildScheduledEvent(rest, guildId, event.id);
// or cancelGuildScheduledEvent / completeGuildScheduledEvent / deleteGuildScheduledEvent
```

| Helper | Route |
|--------|-------|
| `listGuildScheduledEvents` | `GET …/scheduled-events` |
| `fetchGuildScheduledEvent` | `GET …/scheduled-events/{id}` |
| `createGuildScheduledEvent` | `POST …/scheduled-events` |
| `modifyGuildScheduledEvent` | `PATCH …/scheduled-events/{id}` |
| `start` / `complete` / `cancelGuildScheduledEvent` | status helpers |
| `deleteGuildScheduledEvent` | `DELETE …/scheduled-events/{id}` |
| `listGuildScheduledEventUsers` | `GET …/users` |

Constants: `ScheduledEventEntityType`, `ScheduledEventStatus`, `ScheduledEventPrivacyLevel`.

Hub listeners: `guildScheduledEventCreate` / `Update` / `Delete` / `UserAdd` / `UserRemove`.

## Auto Moderation

```ts
import {
  createAutoModerationRule,
  listAutoModerationRules,
  autoModBlockMessage,
  autoModAlert,
  AutoModEventType,
  AutoModTriggerType,
} from "@stambha/rest";

const rule = await createAutoModerationRule(rest, guildId, {
  name: "Block scam keywords",
  eventType: AutoModEventType.MessageSend,
  triggerType: AutoModTriggerType.Keyword,
  triggerMetadata: { keyword_filter: ["*free nitro*"] },
  actions: [autoModBlockMessage("No scam links."), autoModAlert(modLogChannelId)],
  enabled: true,
});

const rules = await listAutoModerationRules(rest, guildId);
```

| Helper | Notes |
|--------|--------|
| `list` / `fetch` / `create` / `modify` / `deleteAutoModerationRule` | Full CRUD |
| `autoModBlockMessage` / `autoModAlert` / `autoModTimeout` | Action builders |

Constants: `AutoModTriggerType`, `AutoModEventType`, `AutoModActionType`, `AutoModKeywordPreset`.

Hub listeners: `autoModerationRuleCreate` / `Update` / `Delete`, `autoModerationActionExecution`.

Requires `MANAGE_GUILD` (and `MODERATE_MEMBERS` for timeout actions).

## Soundboard

```ts
import {
  listDefaultSoundboardSounds,
  listGuildSoundboardSounds,
  sendSoundboardSound,
} from "@stambha/rest";

const defaults = await listDefaultSoundboardSounds(rest);
const guildSounds = await listGuildSoundboardSounds(rest, guildId);

// Bot must be connected to the voice channel:
await sendSoundboardSound(rest, voiceChannelId, {
  soundId: defaults[0]!.sound_id,
});
```

| Helper | Route |
|--------|-------|
| `listDefaultSoundboardSounds` | `GET /soundboard-default-sounds` |
| `listGuildSoundboardSounds` | `GET /guilds/{id}/soundboard-sounds` |
| `fetchGuildSoundboardSound` | `GET …/soundboard-sounds/{id}` |
| `sendSoundboardSound` | `POST /channels/{id}/send-soundboard-sound` |

Hub listeners: `guildSoundboardSoundCreate` / `Update` / `Delete`, `voiceChannelEffectSend`.

## Permissions

Discord’s computed permission endpoints (Oct 2026). Channel endpoints apply implicit masking by default — pass `{ implicit: false }` to skip.

```ts
import {
  fetchChannelMemberPermissions,
  fetchGuildMemberPermissions,
  fetchGuildRolePermissions,
  parseAppPermissions,
} from "@stambha/rest";

const guildPerms = await fetchGuildMemberPermissions(rest, guildId, userId);
const channelPerms = await fetchChannelMemberPermissions(rest, channelId, userId, {
  implicit: false,
});

// Interaction payloads expose the bot’s channel permissions as `app_permissions`:
const botBits = parseAppPermissions(interaction.app_permissions);
```

| Helper | Route |
|--------|-------|
| `fetchGuildMemberPermissions` | `GET /guilds/{id}/members/{id}/permissions` |
| `fetchGuildRolePermissions` | `GET /guilds/{id}/roles/{id}/permissions` |
| `fetchChannelMemberPermissions` | `GET /channels/{id}/members/{id}/permissions` |
| `fetchChannelRolePermissions` | `GET /channels/{id}/roles/{id}/permissions` |

## Role member counts · activity instance · voice messages

```ts
import {
  fetchActivityInstance,
  fetchGuildRoleMemberCounts,
  sendVoiceMessage,
} from "@stambha/rest";
import { AttachmentBuilder } from "@stambha/core";

const counts = await fetchGuildRoleMemberCounts(rest, guildId); // roleId → count
const instance = await fetchActivityInstance(rest, applicationId, instanceId);

await sendVoiceMessage(rest, channelId, {
  data: oggOpusBytes,
  durationSecs: 2.5,
  waveform: base64Waveform,
});

// Or build attachment JSON yourself:
AttachmentBuilder.from({ filename: "clip.ogg" })
  .setVoiceMessage({ durationSecs: 2.5, waveform: base64Waveform })
  .toJSON();
```

Multipart uploads: pass `files: [{ name: "files[0]", filename, data }]` on `RestRequest` (used by `sendVoiceMessage`).

## Related

- [Polls](/features/polls)
- [Components & embeds](/features/components) — `AttachmentBuilder`
- [Native REST](/deployment/native-rest)
- [Gateway hub events](/deployment/gateway)
