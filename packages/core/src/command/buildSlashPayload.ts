import type { Command } from "../registries/Command.js";
import {
  integrationTypesToApi,
  interactionContextsToApi,
  type IntegrationTypeName,
  type InteractionContextName,
} from "../context/installContext.js";
import {
  type ApplicationCommandJSON,
  type ApplicationCommandOptionJSON,
  type SlashOptionDefinition,
  SlashOptionType,
  type SubcommandDefinition,
  type SubcommandGroupDefinition,
} from "./slashTypes.js";

function optionToJson(opt: SlashOptionDefinition): ApplicationCommandOptionJSON {
  const json: ApplicationCommandOptionJSON = {
    name: opt.name.slice(0, 32),
    description: opt.description.slice(0, 100) || opt.name,
    type: opt.type,
  };
  if (opt.required !== undefined) json.required = opt.required;
  if (opt.autocomplete !== undefined) json.autocomplete = opt.autocomplete;
  if (opt.choices !== undefined) json.choices = opt.choices;
  if (opt.minValue !== undefined) json.min_value = opt.minValue;
  if (opt.maxValue !== undefined) json.max_value = opt.maxValue;
  return json;
}

function subcommandToJson(sub: SubcommandDefinition): ApplicationCommandOptionJSON {
  const json: ApplicationCommandOptionJSON = {
    name: sub.name.slice(0, 32),
    description: sub.description.slice(0, 100) || sub.name,
    type: SlashOptionType.Subcommand,
  };
  if (sub.options?.length) {
    json.options = sub.options.map(optionToJson);
  }
  return json;
}

function groupToJson(group: SubcommandGroupDefinition): ApplicationCommandOptionJSON {
  return {
    name: group.name.slice(0, 32),
    description: group.description.slice(0, 100) || group.name,
    type: SlashOptionType.SubcommandGroup,
    options: group.subcommands.map(subcommandToJson),
  };
}

interface RootAccumulator {
  name: string;
  description: string;
  defaultMemberPermissions?: bigint;
  dmPermission?: boolean;
  integrationTypes?: readonly IntegrationTypeName[];
  contexts?: readonly InteractionContextName[];
  topLevelOptions: SlashOptionDefinition[];
  subcommands: Map<string, SubcommandDefinition>;
  groups: Map<string, SubcommandGroupDefinition>;
}

function getOrCreateRoot(
  roots: Map<string, RootAccumulator>,
  name: string,
  description: string,
): RootAccumulator {
  let root = roots.get(name);
  if (!root) {
    root = {
      name,
      description,
      topLevelOptions: [],
      subcommands: new Map(),
      groups: new Map(),
    };
    roots.set(name, root);
  }
  return root;
}

function rootToJson(root: RootAccumulator): ApplicationCommandJSON {
  const options: ApplicationCommandOptionJSON[] = [];

  for (const opt of root.topLevelOptions) {
    options.push(optionToJson(opt));
  }
  for (const group of root.groups.values()) {
    options.push(groupToJson(group));
  }
  for (const sub of root.subcommands.values()) {
    options.push(subcommandToJson(sub));
  }

  const json: ApplicationCommandJSON = {
    name: root.name.slice(0, 32),
    description: root.description.slice(0, 100) || root.name,
    type: 1,
  };

  if (options.length > 0) json.options = options;

  if (root.defaultMemberPermissions !== undefined) {
    json.default_member_permissions = root.defaultMemberPermissions.toString();
  }
  if (root.dmPermission !== undefined) json.dm_permission = root.dmPermission;
  if (root.integrationTypes !== undefined && root.integrationTypes.length > 0) {
    json.integration_types = integrationTypesToApi(root.integrationTypes);
  }
  if (root.contexts !== undefined && root.contexts.length > 0) {
    json.contexts = interactionContextsToApi(root.contexts);
  }

  return json;
}

function applyCommandInstallOptions(root: RootAccumulator, command: Command): void {
  if (command.defaultMemberPermissions !== undefined) {
    root.defaultMemberPermissions = command.defaultMemberPermissions;
  }
  if (command.dmPermission !== undefined) root.dmPermission = command.dmPermission;
  if (command.integrationTypes !== undefined) root.integrationTypes = command.integrationTypes;
  if (command.contexts !== undefined) root.contexts = command.contexts;
}

/** Build Discord application command payloads from registered {@link Command} pieces. */
export function buildApplicationCommands(commands: Iterable<Command>): ApplicationCommandJSON[] {
  const roots = new Map<string, RootAccumulator>();

  for (const command of commands) {
    if (!command.enabled || !command.kinds.includes("slash")) continue;

    if (command.subcommands.length > 0 || command.subcommandGroups.length > 0) {
      const root = getOrCreateRoot(
        roots,
        command.name,
        command.slashRootDescription ?? command.description ?? command.name,
      );
      applyCommandInstallOptions(root, command);

      for (const sub of command.subcommands) {
        root.subcommands.set(sub.name, sub);
      }
      for (const group of command.subcommandGroups) {
        root.groups.set(group.name, group);
      }
      for (const opt of command.slashOptions) {
        root.topLevelOptions.push(opt);
      }
      continue;
    }

    if (command.slashRoot) {
      const rootName = command.slashRoot;
      const root = getOrCreateRoot(roots, rootName, command.slashRootDescription ?? rootName);
      applyCommandInstallOptions(root, command);

      const subName = command.slashSubcommand ?? command.name;
      const sub: SubcommandDefinition = {
        name: subName,
        description: command.description.slice(0, 100) || subName,
      };
      if (command.slashOptions.length > 0) sub.options = [...command.slashOptions];

      if (command.slashGroup) {
        let group = root.groups.get(command.slashGroup);
        if (!group) {
          group = {
            name: command.slashGroup,
            description: command.slashGroupDescription ?? command.slashGroup,
            subcommands: [],
          };
          root.groups.set(command.slashGroup, group);
        }
        group.subcommands = group.subcommands.filter((s) => s.name !== subName);
        group.subcommands.push(sub);
      } else {
        root.subcommands.set(subName, sub);
      }
      continue;
    }

    const root = getOrCreateRoot(roots, command.name, command.description ?? command.name);
    applyCommandInstallOptions(root, command);
    for (const opt of command.slashOptions) {
      root.topLevelOptions.push(opt);
    }
  }

  return [...roots.values()].map(rootToJson).sort((a, b) => a.name.localeCompare(b.name));
}

/** Compare desired vs existing command names for deploy diffs. */
export function diffApplicationCommands(
  existing: readonly { name: string }[],
  desired: readonly ApplicationCommandJSON[],
): { added: string[]; removed: string[]; updated: string[] } {
  const existingNames = new Set(existing.map((c) => c.name));
  const desiredNames = new Set(desired.map((c) => c.name));

  const added = desired.filter((c) => !existingNames.has(c.name)).map((c) => c.name);
  const removed = existing.filter((c) => !desiredNames.has(c.name)).map((c) => c.name);
  const updated = desired.filter((c) => existingNames.has(c.name)).map((c) => c.name);

  return { added, removed, updated };
}
