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

/** Sapphire-style cooldown: seconds delay (limit 1) or full options bag. */
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
   * Names of {@link Gate} pieces in `client.registries.gates` (Sapphire preconditions).
   * Only listed gates run — registry gates are not applied to every command unless {@link GateOptions.global}.
   * Alias: {@link CommandOptions.preconditions}.
   */
  gateNames?: readonly string[];
  /**
   * Sapphire-style alias for {@link CommandOptions.gateNames}.
   * When both are set, values are concatenated (`gateNames` first).
   */
  preconditions?: readonly string[];
  /**
   * Declarative cooldown (B1). Requires `@stambha/gates` to be imported so the
   * declarative gate resolver is registered. Number = seconds delay, limit 1.
   */
  cooldown?: CommandCooldownOption;
  /**
   * Declarative channel restriction (B1). `'guild'` → guild-only; `'dm'` → DMs only;
   * or one/more channel types. Requires `@stambha/gates`.
   */
  runIn?: CommandRunInOption;
  /** When true, require an NSFW channel (B1). Requires `@stambha/gates`. */
  nsfw?: boolean;
  /** Member permission bitfield / flags (B1). Requires `@stambha/gates`. */
  userPermissions?: bigint | number | readonly bigint[] | readonly number[];
  /** Bot permission bitfield / flags (B1). Requires `@stambha/gates`. */
  clientPermissions?: bigint | number | readonly bigint[] | readonly number[];
  /** Prefix aliases (e.g. `p` for `ping`). */
  aliases?: readonly string[];
  /** Help / grouping (Sapphire-style). */
  category?: string;
  subCategory?: string;
  /**
   * Longer help text for `help <command>` (B3). Falls back to {@link description} when omitted.
   */
  detailedDescription?: string;
  /**
   * When true, omit from help listings (B3). Command remains runnable if invoked by name.
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
  dmPermission?: boolean;
}

/** User-facing command piece (Sapphire/Klasa: `commands/` folder). */
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
  }

  abstract execute(ctx: CommandContext): Promise<Outcome<unknown>>;

  /** Optional slash autocomplete handler for this command. */
  autocomplete?(_ctx: AutocompleteContext): Promise<void>;

  supports(kind: CommandKind): boolean {
    return this.kinds.includes(kind);
  }

  protected success(): Outcome<void> {
    return ok(undefined);
  }
}
