import type {
  Command,
  CommandCooldownOption,
  CommandRunInOption,
  GateLike,
} from "@stambha/core";
import {
  registerDeclarativeGatesResolver,
  type ChannelType,
} from "@stambha/core";
import { cooldownGate } from "./cooldownGate.js";
import { nsfwGate } from "./nsfwGate.js";
import { permissionsGate } from "./permissionsGate.js";
import { dmOnlyGate, guildOnlyGate, RunIn, runInGate, type RunInOption } from "./runInGate.js";

function toBigintFlags(
  input: bigint | number | readonly bigint[] | readonly number[] | undefined,
): bigint | undefined {
  if (input === undefined) return undefined;
  if (typeof input === "bigint") return input;
  if (typeof input === "number") return BigInt(input);
  let result = 0n;
  for (const flag of input) {
    result |= typeof flag === "bigint" ? flag : BigInt(flag);
  }
  return result;
}

function cooldownFromOption(option: CommandCooldownOption): GateLike {
  if (typeof option === "number") {
    return cooldownGate({ limit: 1, delay: Math.max(0, option) * 1000 });
  }
  const delayMs =
    option.delayMs ?? (option.delay !== undefined ? Math.max(0, option.delay) * 1000 : 0);
  return cooldownGate({
    limit: option.limit ?? 1,
    delay: delayMs,
    ...(option.scope !== undefined ? { scope: option.scope } : {}),
  });
}

function runInFromOption(option: CommandRunInOption): GateLike {
  if (option === "guild") return guildOnlyGate();
  if (option === "dm") return dmOnlyGate();
  if (typeof option === "string") {
    return runInGate(option as ChannelType);
  }
  const allowed = option.map((entry) =>
    entry === "guild_any" ? RunIn.GuildAny : (entry as RunInOption),
  );
  return runInGate(...allowed);
}

/**
 * Build gates from declarative {@link Command} options (B1).
 * Order: cooldown → runIn → nsfw → permissions.
 */
export function resolveCommandGates(command: Command): GateLike[] {
  const gates: GateLike[] = [];

  if (command.cooldown !== undefined) {
    gates.push(cooldownFromOption(command.cooldown));
  }
  if (command.runIn !== undefined) {
    gates.push(runInFromOption(command.runIn));
  }
  if (command.nsfw) {
    gates.push(nsfwGate());
  }

  const user = toBigintFlags(command.userPermissions);
  const client = toBigintFlags(command.clientPermissions);
  if (user !== undefined || client !== undefined) {
    gates.push(
      permissionsGate({
        ...(user !== undefined ? { user } : {}),
        ...(client !== undefined ? { client } : {}),
      }),
    );
  }

  return gates;
}

/** Wire declarative Command options into {@link commandGatesForRun} (idempotent). */
export function enableDeclarativeCommandGates(): void {
  registerDeclarativeGatesResolver(resolveCommandGates);
}

// Enable on package import so `import "@stambha/gates"` / gate helpers activate B1.
enableDeclarativeCommandGates();
