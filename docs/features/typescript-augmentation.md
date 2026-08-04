# TypeScript augmentation (B9)

Extend Stambha’s public option / container interfaces with **declaration merging** so plugins and bots type-check custom bootstrap fields without forking core.

## What you can augment

| Interface | Module | Typical use |
|-----------|--------|-------------|
| `StambhaClientOptions` | `@stambha/core` | Extra constructor options (`vault`, `db`, feature flags) |
| `CreateStambhaBotOptions` | extends client options | Same as above via `createStambhaBot` |
| `StambhaContainerLike` | `@stambha/core` | Services on `client.container` (`metrics`, `cache`, …) |

Core ships these as **`interface`** exports (not type aliases) so merging works.

## App / plugin `.d.ts`

```ts
// src/types/stambha-augments.d.ts
import type { Vault } from "@stambha/vault";

declare module "@stambha/core" {
  interface StambhaClientOptions {
    vault?: Vault;
  }

  interface StambhaContainerLike {
    metrics?: { inc(name: string): void };
  }
}

export {}; // keep this file a module
```

Ensure the file is included in `tsconfig` (`include` / `typeRoots` / project references).

## Usage

```ts
import { createStambhaBot } from "@stambha/core";
import { createMemoryVault } from "@stambha/vault";

const vault = createMemoryVault(/* … */);

const client = createStambhaBot({
  prefix: "!",
  vault, // typed via augmentation
});

// Attach services on a custom container, or mutate after construct:
(client.container as typeof client.container & { metrics?: { inc(n: string): void } }).metrics = {
  inc() {},
};
```

Prefer putting shared services on **`StambhaContainerLike`** and constructing with `container: myContainer` so pieces read `this.client.container.metrics` with full types.

## Tests in core

`packages/core/src/client/augmentation.test.ts` asserts the merge pattern compiles and runs under Vitest (relative `declare module` paths for the package’s own sources).

## See also

- [Plugins](/features/plugins) — `registerPlugin` / lifecycle
- [Capabilities](/features/capabilities) — authz on the pipeline
- [Project structure](/guide/project-structure)
