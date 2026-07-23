import type { CommandSlashPath } from "../command/slashTypes.js";
import type { ArgsText, SlashOption } from "./args.js";
import type {
  AuthorizingIntegrationOwners,
  InteractionContextName,
} from "./installContext.js";
import type { CommandContextMeta } from "./meta.js";
import type { ReplyPayload } from "./reply.js";

export type { ReplyPayload } from "./reply.js";
export { normalizeReplyData } from "./reply.js";

/** How the user invoked a command. */
export type CommandKind = "slash" | "prefix" | "contextMenu" | "message";

/** When an epilogue runs relative to the command pipeline. */
export type EpiloguePhase = "completed" | "denied" | "blocked";

/** Normalized context for command execution (transport-agnostic). */
export interface CommandContext {
  readonly kind: CommandKind;
  readonly commandName: string;
  readonly userId: string;
  readonly guildId: string | null;
  readonly channelId: string | null;
  /** Populated by transport bridges for permission / channel gates. */
  readonly meta?: CommandContextMeta;
  /**
   * Surface where the interaction ran (slash / components).
   * `guild` | `bot_dm` (DM with the bot) | `private_channel` (other DMs / group DMs).
   */
  readonly interactionContext?: InteractionContextName;
  /**
   * Install authorizers for this interaction (`authorizing_integration_owners`).
   * Use to distinguish the installing user from the invoking user on user-installed apps.
   */
  readonly authorizingIntegrationOwners?: AuthorizingIntegrationOwners;
  /** Prefix commands: raw argument string after the command name. */
  readonly argsText?: ArgsText;
  /** Slash commands: normalized option values from the interaction. */
  readonly slashOptions?: readonly SlashOption[];
  /** Slash commands: root / group / subcommand path. */
  readonly slashPath?: CommandSlashPath;
  readonly raw: unknown;
  /** Text or rich payload (content, embeds). Prefix: channel message. Slash: interaction callback. */
  reply(message: string | ReplyPayload): Promise<void>;
  replyEphemeral(message: string | ReplyPayload): Promise<void>;
  /** Slash only — edit the initial deferred interaction response (requires application id on the client). */
  editReply?(payload: ReplyPayload): Promise<void>;
  /** Slash only — acknowledge with a deferred response (type 5) before `editReply`. */
  deferReply?(ephemeral?: boolean): Promise<void>;
}

/** Context for Scout passive watchers. */
export interface ScoutContext {
  readonly trigger: ScoutTrigger;
  readonly userId: string | null;
  readonly guildId: string | null;
  readonly channelId: string | null;
  readonly content: string | null;
  readonly raw: unknown;
  delete(): Promise<void>;
}

export type ScoutTrigger = "message" | "messageUpdate" | "interaction";

/** Context for scheduled Chron tasks. */
export interface ChronContext {
  readonly chron: string;
  readonly client: import("../client/StambhaClient.js").StambhaClient;
  readonly runAt: Date;
}

/** Payload passed to Epilogue hooks after command execution or early exit. */
export interface EpilogueContext {
  readonly commandName: string;
  readonly ctx: CommandContext;
  /** `completed` after execute; `denied` / `blocked` when gates or barriers stop the run. */
  readonly phase: EpiloguePhase;
  readonly outcome: import("../outcome/Outcome.js").Outcome<unknown> | null;
  readonly durationMs: number;
  /** Set when {@link phase} is `denied`. */
  readonly denied?: { message: string; silent: boolean; gate: string };
  /** Set when {@link phase} is `blocked`. */
  readonly blocked?: { reason?: string; silent?: boolean };
}

/** @deprecated Use {@link CommandKind} */
export type DirectiveKind = CommandKind;

/** @deprecated Use {@link CommandContext} */
export type DirectiveContext = CommandContext;
