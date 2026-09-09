# create-stambha

Official project scaffolder for [Stambha](https://github.com/mivaya/Stambha) bots.

## Usage

```bash
npm create stambha@latest
pnpm create stambha my-bot
pnpm create stambha my-bot --template minimal
```

### Templates

| Template | Use case |
|----------|----------|
| `minimal` | MockBridge smoke — no Discord token |
| `basic` | Native gateway + REST, loader, prefix + slash (`pnpm demo` without token) |

Interactive prompts ask for project name and template when stdin is a TTY. Pass `--yes` to skip prompts (defaults: current directory name, `basic` template).

## Monorepo

Built from `packages/create-stambha`. Published to npm as **`create-stambha`** (fixed version with core `@stambha/*` packages).

```bash
pnpm --filter create-stambha build
pnpm --filter create-stambha test
node packages/create-stambha/dist/index.js --help
```
