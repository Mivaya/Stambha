import type {
  SlashOptionDefinition,
  SubcommandDefinition,
  SubcommandGroupDefinition,
} from "../command/slashTypes.js";
import type { AutocompleteContext } from "../context/autocomplete.js";
import type { ChannelType } from "../context/meta.js";
import type { CommandContext, CommandKind } from "../context/types.js";
import { type Outcome, ok } from "../outcome/Outcome.js";
import type { Registry } from "../pieces/Registry.js";
import { Unit, type UnitOptions } from "../pieces/Unit.js";
import type { GateLike } from "./Gate.js";

/** Cooldown: seconds delay (limit 1) or full options bag. */
export type CommandCooldownOption =
  | number
  | {
      /** Window length in seconds (when `delayMs` omitted). */
      delay?: number;
      /** Window length in milliseconds. */
      delayMs?: number;
      /** Max invocations per window (default 1). */
      limit?: number;
      scope?: "user" | "guild" | "global" | "userGuild";
    };

/** Where a command may run — `'guild'` / `'dm'` shortcuts or channel-type list. */
export type CommandRunInOption = "guild" | "dm" | ChannelType | readonly (ChannelType | "guild_any")[];

export interface CommandOptions extends UnitOptions {
  description?: string;
  kinds?: CommandKind[];
  /** Inline gates (factory helpers, ad-hoc checks). Applied after declarative options. */
  gates?: GateLike[];
  /**
   * Names of {@link Gate} pieces in `client.registries.gates`.
   * Only listed gates run — registry gates are not applied to every command unless {@link GateOptions.global}.
   * Alias: {@link CommandOptions.preconditions}.
   */
  gateNames?: readonly string[];
  /**
   * Alias for {@link CommandOptions.gateNames}.
   * When both are set, values are concatenated (`gateNames` first).
   */
  preconditions?: readonly string[];
  /**
   * Declarative cooldown. Requires `@stambha/gates` to be imported so the
   * declarative gate resolver is registered. Number = seconds delay, limit 1.
   */
  cooldown?: CommandCooldownOption;
  /**
   * Declarative channel restriction. `'guild'` → guild-only; `'dm'` → DMs only;
   * or one/more channel types. Requires `@stambha/gates`.
   */
  runIn?: CommandRunInOption;
  /** When true, require an NSFW channel. Requires `@stambha/gates`. */
  nsfw?: boolean;
  /** Member permission bitfield / flags. Requires `@stambha/gates`. */
  userPermissions?: bigint | number | readonly bigint[] | readonly number[];
  /** Bot permission bitfield / flags. Requires `@stambha/gates`. */
  clientPermissions?: bigint | number | readonly bigint[] | readonly number[];
  /** Prefix aliases (e.g. `p` for `ping`). */
  aliases?: readonly string[];
  /** Help / grouping category. */
  category?: string;
  subCategory?: string;
  /**
   * Longer help text for `help <command>`. Falls back to {@link description} when omitted.
   */
  detailedDescription?: string;
  /**
   * When true, omit from help listings. Command remains runnable if invoked by name.
   */
  hidden?: boolean;
  /** Top-level slash options (when not using subcommands). */
  slashOptions?: readonly SlashOptionDefinition[];
  /** Inline subcommands on this root command. */
  subcommands?: readonly SubcommandDefinition[];
  subcommandGroups?: readonly SubcommandGroupDefinition[];
  /** Leaf subcommand: slash root name (merged deploy). */
  slashRoot?: string;
  slashRootDescription?: string;
  slashGroup?: string;
  slashGroupDescription?: string;
  slashSubcommand?: string;
  defaultMemberPermissions?: bigint;
  /**
   * Whether the command appears in DMs (legacy Discord field).
   * Prefer {@link CommandOptions.contexts} for user-installable apps.
   */
  dmPermission?: boolean;
  /**
   * Installation contexts this command supports: `guild` and/or `user`.
   * Maps to Discord `integration_types` on deploy.
   */
  integrationTypes?: readonly import("../context/installContext.js").IntegrationTypeName[];
  /**
   * Interaction surfaces where this command can be used:
   * `guild` | `bot_dm` | `private_channel`.
   * Maps to Discord `contexts` on deploy. `private_channel` requires `user` in {@link CommandOptions.integrationTypes}.
   */
  contexts?: readonly import("../context/installContext.js").InteractionContextName[];
}

/** User-facing command piece (`commands/` folder). */
export abstract class Command extends Unit<CommandOptions> {
  readonly description: string;
  readonly kinds: CommandKind[];
  readonly gates: GateLike[];
  readonly gateNames: readonly string[];
  readonly cooldown?: CommandCooldownOption;
  readonly runIn?: CommandRunInOption;
  readonly nsfw: boolean;
  readonly userPermissions?: bigint | number | readonly bigint[] | readonly number[];
  readonly clientPermissions?: bigint | number | readonly bigint[] | readonly number[];
  readonly aliases: readonly string[];
  readonly category: string;
  readonly subCategory: string;
  readonly detailedDescription: string;
  readonly hidden: boolean;
  readonly slashOptions: readonly SlashOptionDefinition[];
  readonly subcommands: readonly SubcommandDefinition[];
  readonly subcommandGroups: readonly SubcommandGroupDefinition[];
  readonly slashRoot?: string;
  readonly slashRootDescription?: string;
  readonly slashGroup?: string;
  readonly slashGroupDescription?: string;
  readonly slashSubcommand?: string;
  readonly defaultMemberPermissions?: bigint;
  readonly dmPermission?: boolean;
  readonly integrationTypes?: readonly import("../context/installContext.js").IntegrationTypeName[];
  readonly contexts?: readonly import("../context/installContext.js").InteractionContextName[];

  constructor(registry: Registry<Command>, options: CommandOptions) {
    super(registry, options);
    this.description = options.description ?? "";
    this.kinds = options.kinds ?? ["slash"];
    this.gates = options.gates ?? [];
    const names = [...(options.gateNames ?? []), ...(options.preconditions ?? [])];
    this.gateNames = names;
    if (options.cooldown !== undefined) this.cooldown = options.cooldown;
    if (options.runIn !== undefined) this.runIn = options.runIn;
    this.nsfw = options.nsfw === true;
    if (options.userPermissions !== undefined) this.userPermissions = options.userPermissions;
    if (options.clientPermissions !== undefined) {
      this.clientPermissions = options.clientPermissions;
    }
    this.aliases = options.aliases ?? [];
    this.category = options.category ?? "General";
    this.subCategory = options.subCategory ?? "";
    this.detailedDescription = options.detailedDescription ?? "";
    this.hidden = options.hidden === true;
    this.slashOptions = options.slashOptions ?? [];
    this.subcommands = options.subcommands ?? [];
    this.subcommandGroups = options.subcommandGroups ?? [];
    if (options.slashRoot !== undefined) this.slashRoot = options.slashRoot;
    if (options.slashRootDescription !== undefined) {
      this.slashRootDescription = options.slashRootDescription;
    }
    if (options.slashGroup !== undefined) this.slashGroup = options.slashGroup;
    if (options.slashGroupDescription !== undefined) {
      this.slashGroupDescription = options.slashGroupDescription;
    }
    if (options.slashSubcommand !== undefined) this.slashSubcommand = options.slashSubcommand;
    if (options.defaultMemberPermissions !== undefined) {
      this.defaultMemberPermissions = options.defaultMemberPermissions;
    }
    if (options.dmPermission !== undefined) this.dmPermission = options.dmPermission;
    if (options.integrationTypes !== undefined) {
      this.integrationTypes = options.integrationTypes;
    }
    if (options.contexts !== undefined) this.contexts = options.contexts;
  }

  abstract execute(ctx: CommandContext): Promise<Outcome<unknown>>;

  /**
   * Called when {@link execute} returns `err()` or throws.
   * Default logs via `client.container.logger`. Override to customize or no-op.
   */
  async onCommandError(error: unknown, _ctx: CommandContext): Promise<void> {
    const message = error instanceof Error ? error.message : String(error);
    this.client.container.logger.error(`Command "${this.name}" failed: ${message}`, error);
  }

  /** Optional slash autocomplete handler for this command. */
  autocomplete?(_ctx: AutocompleteContext): Promise<void>;

  supports(kind: CommandKind): boolean {
    return this.kinds.includes(kind);
  }

  protected success(): Outcome<void> {
    return ok(undefined);
  }
}
