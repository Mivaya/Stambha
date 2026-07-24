# Pagination

**Components V2 paginated messages** with prev / next / dismiss — without hand-rolling collectors.

Ships as [`@stambha/pagination`](https://github.com/Mivaya/Stambha-plugins/tree/main/packages/pagination) from **[Stambha-plugins](https://github.com/Mivaya/Stambha-plugins)** (independent semver). Built on core [Signals](/features/signals), [Components V2](/features/components#components-v2), and `stambha:` custom ids.

Current line: **1.1.0** · peer `@stambha/core@^1.2.2` (needs Components V2 builders).

## When to use it

| Use pagination when… | Prefer something else when… |
|----------------------|-----------------------------|
| Help / changelog / multi-section copy | You need free-form button menus (write a Signal) |
| Locked controls for the invoker | You need multi-user collaborative UI |
| Session TTL and wrap-at-end | You need Sequences (multi-step wizards) |

## Install

```bash
pnpm add @stambha/pagination@^1.1.0 @stambha/core@^1.2.2
```

Requires **Node.js 20+**.

## Quick start

Register the signal once (loader discovers pieces under `src/signals/`):

```ts
// src/signals/PaginationSignal.ts
export { PaginationSignal } from "@stambha/pagination";
```

Or register manually: `client.registries.signals.register(new PaginationSignal(…))`.

Create pages from a command:

```ts
import { Command, type CommandContext, ok, type Registry } from "@stambha/core";
import { createPaginator } from "@stambha/pagination";

export class HelpPagesCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "pages",
      description: "Show multi-page help (Components V2)",
      kinds: ["slash", "prefix"],
    });
  }

  async execute(ctx: CommandContext) {
    const paginator = await createPaginator({
      userId: ctx.userId,
      accentColor: 0x5865f2,
      pages: [
        { content: "# Page 1\n\nGetting started" },
        { content: "# Page 2\n\nCommands" },
        { content: "# Page 3\n\nDeployment" },
      ],
    });

    await ctx.reply(paginator.message());
    return ok(undefined);
  }
}
```

Keep `attachStambhaClient(hub, client, { signals: true })` (default) so button clicks reach `PaginationSignal`.

## How it works

1. `createPaginator` resolves pages, stores an in-memory session, and returns a `Paginator`.
2. `paginator.message()` builds a Components V2 `ReplyPayload` (`IS_COMPONENTS_V2` + Container + Text Display + three buttons).
3. Clicks hit `PaginationSignal` via custom ids:

```text
stambha:pagination:prev:<sessionId>
stambha:pagination:next:<sessionId>
stambha:pagination:dismiss:<sessionId>
```

4. The signal updates the session index (or dismisses), then prefers Discord **UPDATE_MESSAGE** (interaction callback type 7) when `client.restPort` is set; otherwise it falls back to `SignalContext.reply`.

Sessions expire after `timeoutMs`. Expired or invalid controls reply with an ephemeral error. When `userId` is set, other users get an ephemeral denial.

## Options (`PaginatorOptions`)

| Option | Default | Notes |
|--------|---------|--------|
| `pages` | required | `Page[]` or `() => Page[] \| Promise<Page[]>` (resolved once at create) |
| `variant` | `"v2"` | `"classic"` keeps content/embeds + Action Row |
| `accentColor` | unset | V2 container accent (`0xRRGGBB`) |
| `showPageCount` | `true` | Append `Page i / n` under the body |
| `userId` | unset | Lock controls to this Discord user id |
| `timeoutMs` | `300000` | Session TTL (5 minutes); refreshed on interaction |
| `wrap` | `false` | Cycle at ends; when false, prev/next are disabled at ends |
| `labels` | see below | Button labels |
| `startAt` | `0` | Initial zero-based page index (clamped) |

Empty `pages` throws: `@stambha/pagination: pages must be a non-empty array`.

### Page shape

```ts
interface Page {
  content?: string;              // markdown → Text Display (V2)
  displays?: readonly string[];  // extra Text Displays (V2)
  embeds?: readonly unknown[];   // V2: converted to markdown; classic: raw embeds
}
```

Components (buttons) are owned by the package — do not put your own `components` on the page.

### Labels (`PaginatorLabels`)

| Key | Default |
|-----|---------|
| `prev` | `"Prev"` |
| `next` | `"Next"` |
| `dismiss` | `"Dismiss"` |

## `Paginator` return value

| Member | Description |
|--------|-------------|
| `sessionId` | Opaque session id embedded in custom ids |
| `index` | Current zero-based page (live getter) |
| `pageCount` | Total pages |
| `message()` | `ReplyPayload` for the current page + buttons |

## Signal behavior

| Action | Effect |
|--------|--------|
| `prev` / `next` | Move index (wrap or clamp); update message; touch TTL |
| `dismiss` | Delete session; update message **without** buttons |

Signal name constant: `PAGINATION_SIGNAL_NAME` (`"pagination"`). Types: button only.

## Classic embeds

If you must keep Discord embeds (no V2 flag):

```ts
await createPaginator({
  variant: "classic",
  pages: [{ embeds: [{ title: "Page 1", description: "…" }] }],
});
```

## Exports

| Export | Purpose |
|--------|---------|
| `createPaginator` | Create session + initial `ReplyPayload` helper |
| `PaginationSignal` | Handles prev / next / dismiss clicks |
| `Page`, `Paginator`, `PaginatorOptions`, `PaginatorLabels`, `PaginatorVariant` | Types |
| `paginationCustomId`, `paginationSuffix`, `parsePaginationSuffix` | Custom-id helpers |
| `PAGINATION_SIGNAL_NAME` | Signal name (`"pagination"`) |
| `buildPagePayload`, `buildDismissPayload` | V2 builders |
| `buildClassicPagePayload`, `buildClassicDismissPayload` | Classic builders |
| `getSession`, `clearSessions`, `sessionCount` | Session store (tests / advanced) |

## Related

- [Components](/features/components) — V2 builders used by this package
- [Signals](/features/signals) — how `stambha:` routing works
- [Extensions](/extensions/) — other official add-ons
- [Getting started](/guide/getting-started) — native bootstrap
