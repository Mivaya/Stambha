/**
 * Default permission ladder (higher = more privileged).
 * Commands require `level >= min` via {@link permissionLevelGate}.
 */
export const PermissionLevel = {
  Everyone: 0,
  Moderator: 4,
  Administrator: 6,
  GuildOwner: 9,
  BotOwner: 10,
} as const;

export type PermissionLevelName = keyof typeof PermissionLevel;
export type PermissionLevelValue = (typeof PermissionLevel)[PermissionLevelName];

/** Human-readable labels for the default ladder (docs / admin UX). */
export const DEFAULT_PERMISSION_LEVEL_LADDER: readonly {
  name: PermissionLevelName;
  level: PermissionLevelValue;
  description: string;
}[] = [
  { name: "Everyone", level: PermissionLevel.Everyone, description: "All users" },
  {
    name: "Moderator",
    level: PermissionLevel.Moderator,
    description: "Mod roles or Kick/Ban/ManageMessages bits",
  },
  {
    name: "Administrator",
    level: PermissionLevel.Administrator,
    description: "Admin roles or Administrator/ManageGuild bits",
  },
  {
    name: "GuildOwner",
    level: PermissionLevel.GuildOwner,
    description: "Discord guild owner",
  },
  {
    name: "BotOwner",
    level: PermissionLevel.BotOwner,
    description: "Configured bot owners",
  },
];
