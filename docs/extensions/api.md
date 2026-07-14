# HTTP API

HTTP endpoint for your bot so external services (admin SPA, ops tools) can talk to the bot process — with optional **Discord OAuth**, server-side sessions, guild helpers, and **Vault guild settings**.

Ships as [`@stambha/api`](https://github.com/Mivaya/Stambha-plugins/tree/main/packages/api) from **[Stambha-plugins](https://github.com/Mivaya/Stambha-plugins)**. Optional wiring through core [`@stambha/plugins`](/features/plugins) and [`@stambha/vault`](/features/vault).

Peers: `@stambha/core@^1.2.0`, optional `@stambha/plugins@^1.2.0`, optional `@stambha/vault@^1.2.0`.

This package does **not** ship a hosted UI. Bring your own frontend.

## When to use it

| Use the HTTP API when… | Prefer something else when… |
|------------------------|-----------------------------|
| You own the admin SPA / panel | You only need Discord slash/prefix UX |
| You want `/health` + custom JSON routes | You need a prebuilt dashboard product (not shipped) |
| You want Discord login + Vault settings for operators | Running the API on every gateway shard |
| Split-tier: API on the bot worker | Metrics scrape only — see [Metrics](/extensions/metrics) |

## Install

```bash
pnpm add @stambha/api @stambha/core @stambha/plugins
# for guild settings routes:
pnpm add @stambha/vault
```

Requires **Node.js 20+**. Register a Discord application with a redirect URI that matches `auth.redirectUri`.

## Quick start

### Standalone server (no auth)

```ts
import { createApiServer } from "@stambha/api";

const server = createApiServer({
  prefix: "/api",
  origin: "https://panel.example.com",
  listenOptions: { port: 4000, host: "0.0.0.0" },
  routes: [
    {
      method: "GET",
      path: "/hello",
      run: async (_req, res) => {
        res.json({ hello: "stambha" });
      },
    },
  ],
});

const handle = await server.listen();
console.log(`API listening on ${handle.url}`);
```

Always available under `prefix`:

| Method | Path | Body |
|--------|------|------|
| `GET` | `/health` | `{ ok: true, … }` — tier / worker role when a client is attached |
| `GET` | `/version` | `{ name, version }` |

### Dashboard auth + guild settings (plugin)

```ts
import { createStambhaBot } from "@stambha/core";
import { attachPlugins } from "@stambha/plugins";
import { createApiPlugin } from "@stambha/api";

const client = createStambhaBot({ /* restPort, … */ });
// vault from @stambha/vault — optional but enables settings routes

const api = createApiPlugin({
  listenOptions: { port: 4000 },
  origin: "https://panel.example.com",
  auth: {
    clientId: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    redirectUri: "https://bot.example.com/api/auth/callback",
    // cookie: { secure: false } // only for local http://
  },
  vault, // optional
  restPort: client.restPort,
});

await attachPlugins(client, { plugins: [api.plugin] });
await client.start();
// server listens on postStart when auth/listen rules allow
```

When `auth` is set, **`credentials` defaults to `true`** — you must pass an explicit `origin` (not `*`).

## Auth & built-in dashboard routes

Enabled only when `auth` is configured. Paths are under `prefix`.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/auth/login` | — | Redirect to Discord (PKCE + state). Optional `?redirect=` after login |
| `GET` | `/auth/callback` | — | Code exchange → session cookie; optional safe redirect |
| `POST` | `/auth/callback` | — | Same exchange; JSON `{ user, csrfToken }` |
| `POST` | `/auth/logout` | session + CSRF | Revoke token, delete session, clear cookie |
| `GET` | `/auth/me` | session | `{ user, csrfToken }` |
| `GET` | `/guilds` | session | Manageable guilds ∩ bot presence |
| `GET` | `/guilds/[guildId]/channels` | session + guild access | Channel list via bot REST |
| `GET` | `/guilds/[guildId]/roles` | session + guild access | Role list via bot REST |
| `GET` | `/guilds/[guildId]/settings` | session + guild access | Vault guild settings (**requires `vault`**) |
| `PATCH` | `/guilds/[guildId]/settings` | session + guild access + CSRF | Patch + save Vault settings |
| `GET` | `/guilds/[guildId]/settings/schema` | session + guild access | Blueprint `fields` + `defaults` for forms |

### Sessions & CSRF

- Sessions are **server-side** (opaque HttpOnly cookie; default name `stambha_session`). Access/refresh tokens stay in the store — not in the browser.
- Default cookie: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, max-age 7d (or Discord token lifetime when longer).
- For local HTTP, set `auth.cookie.secure: false`.
- Mutating requests with a session must send **`X-CSRF-Token`** matching `/auth/me` (or the callback JSON). Safe methods and OAuth callback/login skip CSRF.
- Default session / OAuth-state stores are in-memory (`MemorySessionStore`, `MemoryOAuthStateStore`). Multi-replica bots need a shared `SessionStore` / `OAuthStateStore`.

### Guild access

`GET /guilds` returns OAuth guilds where the user is **owner** or has the required permission (default **Manage Guild** `0x20`), plus `botPresent` when `restPort` can see the guild.

Channels, roles, and settings call `assertGuildAccess` (session + manageable + bot in guild). Missing REST → **503**.

### Auth options (`auth`)

| Option | Default | Notes |
|--------|---------|--------|
| `clientId` / `clientSecret` | required | Discord application credentials |
| `redirectUri` | required | Absolute `http(s)` URI registered with Discord |
| `scopes` | `identify guilds` | OAuth scopes |
| `pkce` | `true` | PKCE on authorize |
| `cookie` | see above | Name, Secure, SameSite, domain, maxAge, … |
| `sessionStore` / `stateStore` | memory | Swap for Redis / shared store |

Related top-level options:

| Option | Default | Notes |
|--------|---------|--------|
| `vault` | unset | Duck-typed Vault; enables settings routes |
| `guildSettingsLedger` | `"guild"` | Ledger name for settings |
| `authorization.requiredPermission` | Manage Guild | Bit flag; owners always pass |
| `restPort` | `client.restPort` | Bot REST for guild/channel/role checks |

## Server options

Shared by `createApiServer` / `createApiPlugin` (`ApiServerOptions`). Plugin omits `client` (injected) and adds `automaticallyListen`.

| Option | Default | Notes |
|--------|---------|--------|
| `prefix` | `""` | Path prefix; slashes normalized |
| `origin` | `"*"` | CORS; **must be concrete when auth / credentials** |
| `credentials` | `false` (`true` if `auth`) | `Access-Control-Allow-Credentials` |
| `maximumBodyLength` | `1_048_576` | Max JSON body bytes |
| `listenOptions.port` | `4000` | |
| `listenOptions.host` | `"127.0.0.1"` | |
| `trustProxy` | `false` | Honor `X-Forwarded-*` |
| `routes` / `middlewares` | `[]` | Extra after built-ins |
| `automaticallyListen` | `true` | Plugin: skip auto `listen` in `postStart` |
| `listenWhen` | always true | Return `false` to skip bind for this process |
| `rejectGatewayListen` | `true` | Prefer bot entrypoint isolation (see tier split) |

Env: **`STAMBHA_API_LISTEN=0`** skips binding in any process.

## Adding custom routes

Paths are relative to `prefix`. Dynamic segments use `[param]` (e.g. `/guilds/[id]`).

```ts
import type { RouteDefinition } from "@stambha/api";

const route: RouteDefinition = {
  method: "GET",
  path: "/hello",
  name: "hello",
  run: async (req, res) => {
    res.json({ ok: true, path: req.path, userId: req.session?.userId });
  },
};
```

| Field | Notes |
|-------|--------|
| `method` | `GET` \| `POST` \| `PUT` \| `PATCH` \| `DELETE` \| `OPTIONS` \| `HEAD` |
| `path` | Relative to `prefix`; `[id]` for params |
| `run` | `(req, res) => void \| Promise<void>` |
| `name` | Optional debug label |

### Request (`ApiRequest`)

| Field | Description |
|-------|-------------|
| `raw`, `method`, `path`, `url` | Incoming request (`url` is a `URL`) |
| `params` | Matched `[param]` values |
| `query`, `headers`, `body` | Query map, headers, parsed JSON |
| `requestId` | `X-Request-Id` |
| `session` | `ApiSession \| null` when auth is enabled |
| `auth` | `AuthRuntime \| null` |

### Response (`ApiResponse`)

| Method | Description |
|--------|-------------|
| `status` / `header` | Chainable |
| `json` / `text` / `end` | Body helpers |
| `redirect(url, status?)` | OAuth / post-login redirects |
| `setCookie` / `clearCookie` | Session cookie helpers |
| `writableEnded`, `raw` | Status / Node response |

### Examples

**GET list**

```ts
{
  method: "GET",
  path: "/status",
  run: async (req, res) => {
    res.json({ ok: true, requestId: req.requestId });
  },
}
```

**POST with CSRF (when session cookie is present)**

```ts
{
  method: "POST",
  path: "/admin/ping",
  run: async (req, res) => {
    // Frontend: fetch("/api/admin/ping", {
    //   method: "POST",
    //   credentials: "include",
    //   headers: { "X-CSRF-Token": csrfFromAuthMe },
    // })
    res.json({ pong: true, userId: req.session?.userId });
  },
}
```

Unknown routes → **404**. Unhandled throws → **500** `{ error, requestId }`. Set `STAMBHA_API_DEBUG=1` to log errors.

## Middleware

Built-ins (order by `position`):

| Middleware | When | Role |
|------------|------|------|
| Request id | always | Echo / generate `X-Request-Id` |
| CORS | always | Apply `origin` / `credentials` |
| Body | always | Stream + parse JSON with byte limit |
| Rate limit | `auth` | In-memory limiter on paths containing `/auth` (default 40) |
| Session | `auth` | Load session from cookie into `req.session` |
| CSRF | `auth` | Require `X-CSRF-Token` on mutating session requests |
| Require auth | `auth` | **401** on `/guilds…` without session |

Custom middleware:

```ts
{
  name: "audit",
  position: 100,
  run: async (req, res, next) => {
    await next();
  },
}
```

After listen: `server.routes.register(…)` / `server.middlewares.register(…)`.

## Security defaults

| Topic | Behavior |
|-------|----------|
| CORS | `origin: "*"` forbidden with auth or credentials |
| Sessions | Opaque id cookie; Discord tokens server-side only |
| CSRF | Required for cookie-auth mutating routes |
| Body | Byte-limited JSON stream (`BodyTooLargeError` when exceeded) |
| Auth rate limit | In-memory limiter on `/auth` |

Put TLS behind a reverse proxy. Set `trustProxy: true` when the proxy forwards `X-Forwarded-*`.

## Tier split & listen control

| Worker | Run `@stambha/api`? |
|--------|---------------------|
| Gateway processes | **No** — duplicate listeners / wrong role |
| REST worker | Optional — REST-only panels; no Vault |
| Bot / command worker | **Yes (recommended)** — client, Vault, `restPort` |

Attach the plugin **only** in the bot (or monolith) entrypoint — not “listen on shard 0” inside every gateway process.

```ts
const api = createApiPlugin({
  automaticallyListen: false,
  listenWhen: () => process.env.WORKER === "bot",
  auth: { /* … */ },
  vault,
});
await attachPlugins(client, { plugins: [api.plugin] });
await client.start();
await api.getHandle()?.server.listen();
```

Multi-replica API processes need a load balancer **or** a single binder, plus a **shared** `SessionStore`.

See [Tier split](/deployment/tier-split).

## Exports

| Export | Purpose |
|--------|---------|
| `createApiServer` / `createApiPlugin` | Host + plugin lifecycle |
| `createDashboardPlugin` / `createDashboardServer` | Aliases (`createDashboardServer` deprecated) |
| `MemorySessionStore` / `MemoryOAuthStateStore` | Default stores |
| `createAuthRoutes` / `createGuildRoutes` / `createSettingsRoutes` | Built-in route factories |
| `createSessionMiddleware`, `createCsrfMiddleware`, `createRequireAuthMiddleware`, `createRateLimitMiddleware` | Auth middleware |
| `buildAuthorizeUrl`, `exchangeAuthorizationCode`, `fetchOAuthUser`, `fetchOAuthGuilds`, `guildIsManageable`, … | Discord OAuth helpers |
| `Router`, `RouteStore`, `MiddlewareStore` | Extension points |
| `shouldListen`, `createAuthRuntime` | Deploy / auth wiring |
| Types | `ApiServerOptions`, `ApiAuthOptions`, `ApiSession`, `SessionStore`, `VaultLike`, `RouteDefinition`, … |

## Related

- [Plugins & container](/features/plugins) — `attachPlugins` / lifecycle
- [Vault](/features/vault) — settings ledgers exposed via `/guilds/…/settings`
- [Extensions](/extensions/) — other official add-ons
- [Metrics](/extensions/metrics) — separate Prometheus scrape port
- [Tier split](/deployment/tier-split) — where to mount the API
