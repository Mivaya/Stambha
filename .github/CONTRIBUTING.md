# Contributing to Stambha

Thank you for your interest in contributing! Stambha is a community-driven Discord bot framework and all contributions are welcome.

## Ways to Contribute

- **Bug reports** — open an issue with minimal reproduction, expected vs actual behavior, Node version, and `@stambha/*` package versions
- **Feature requests** — open an issue for non-trivial work so design can be discussed before a large PR
- **Pull requests** — bug fixes, tests, docs, examples, native transport improvements, or core pipeline work
- **Extensions** — cache, metrics, vault drivers, and future plugins belong in [**Stambha-plugins**](https://github.com/Mivaya/Stambha-plugins) (`@stambha/cache`, `@stambha/metrics`, `@stambha/vault-sql`, …)

### Good first contributions

- Test coverage for edge cases in `@stambha/core`
- Documentation fixes and typos
- Example bots or command patterns
- Driver or metrics work in **Stambha-plugins**

## Getting Started

### Prerequisites

- **Node.js 20+** (22.5+ for SQLite in Stambha-plugins `@stambha/vault-sql`)
- **pnpm 9+** (see root `packageManager` field)

### Build & Run

```bash
git clone https://github.com/mivaya/Stambha.git
cd Stambha
pnpm install
pnpm build
pnpm lint
pnpm typecheck
```

Local docs preview:

```bash
pnpm docs:dev
```

### Run Tests

```bash
pnpm test                                          # all packages
pnpm --filter @stambha/core test                   # single package
pnpm --filter @stambha/core test path/to/file.test.ts  # single file (Vitest)
```

Before you start:

1. Read the [README](../README.md) and relevant docs under [`docs/`](../docs/).
2. Search [existing issues](https://github.com/mivaya/Stambha/issues) to avoid duplicate work.
3. For **large features** (new package, breaking API, new transport primitive), open an issue and wait for alignment.

## Branching Model

Stambha uses a **tag-driven release model**. npm and docs are not published on PR merge — only when a maintainer publishes a GitHub Release for a version tag.

| Branch / ref | Purpose | npm / docs published? |
|---|---|---|
| `main` | Integration branch — all PRs merge here | No (CI tests only) |
| `feature/*` | Contributor PR branches | No |
| `v*` tag + **published** GitHub Release | Production release | Yes — `publish-npm.yml` → npm; `docs.yml` → GitHub Pages |

**Do not** bump `package.json` versions in contributor PRs unless a maintainer asks. The core monorepo uses **fixed versioning** — all `@stambha/*` packages share one version. Extensions in Stambha-plugins use **independent** versioning.

## Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Maintainers group these into `CHANGELOG.md` at release time — commits do **not** auto-bump versions.

| Prefix | When to use | Release notes |
|--------|-------------|---------------|
| `feat:` | New user-facing capability | Minor (maintainer groups in CHANGELOG) |
| `fix:` | Bug fix | Patch |
| `perf:` | Performance improvement | Patch |
| `docs:` | Documentation only | None required |
| `test:` | Tests only | None required |
| `chore:` | Build, CI, dependencies | None required |
| `feat!:` or `BREAKING CHANGE:` footer | Incompatible API change | Major (1.0.0+ semver) |

Optional scope: `core`, `rest`, `gateway`, `transform`, `vault`, `loader`, `gates`, `args`, `docs`, `examples`.

Do not include `Co-Authored-By` trailers for AI tools in commit messages. Attribution should be limited to human contributors.

**Examples:**

```
feat(rest): add fetchChannel helper
fix(core): handle empty customId in signal router
docs: clarify tier-split gateway options
feat(vault)!: change default flush interval
```

## Architecture

See [AGENT.md](../AGENT.md) for the package layering, command pipeline, native attach model, and conventions for adding packages or piece types.

`AGENT.md` is the canonical agent instructions file for this repository. If your coding agent expects a different filename, create a local symlink:

```bash
ln -s AGENT.md CLAUDE.md
ln -s AGENT.md GEMINI.md
ln -s AGENT.md COPILOT.md
```

## Adding a New `@stambha/*` Package

1. Create `packages/<name>/` following an existing package layout
2. Integrate via `@stambha/core` types — **no** discord.js or Discordeno imports in core
3. Add Vitest tests and package `README.md`
4. Update public `docs/` if the package is user-facing
5. Maintainer bumps versions and CHANGELOG at release — not in your feature PR

## Adding a New Piece Type

1. Open an issue — the type must fit the command pipeline (see [AGENT.md](../AGENT.md))
2. Add base class + registry in `@stambha/core`
3. Wire `PiecePaths` in `@stambha/loader`
4. Update [project structure](../docs/guide/project-structure.md) and `examples/bot`

## Pull Request Guidelines

1. Branch off `main`: `git checkout -b feature/my-feature`
2. Open a PR targeting `main` on `mivaya/Stambha`
3. CI runs automatically — all checks must pass before merge
4. Keep PRs focused — one feature or fix per PR when possible
5. Fill out the [pull request template](pull_request_template.md) completely
6. Reference related issues in the PR description

**Fork workflow:** add upstream `https://github.com/mivaya/Stambha.git`, rebase onto `main` before review:

```bash
git fetch upstream && git rebase upstream/main && git push --force-with-lease
```

**Same-repo PRs:** [update-pr-branches.yml](./workflows/update-pr-branches.yml) can merge `main` into open PR branches (see [REPOSITORY_SETTINGS.md](./REPOSITORY_SETTINGS.md)).

Merging to `main` does not publish npm packages — that only happens on a published GitHub Release.

## Release Process (maintainers)

Full detail: [PUBLISHING.md](./PUBLISHING.md).

```bash
# 1. Merge feature PRs to main
# 2. Bump all packages + edit CHANGELOG.md
pnpm version:bump 1.0.1
git add -A && git commit -m "chore: release v1.0.1"

# 3. Optional: freeze docs snapshot for version dropdown
pnpm docs:archive 1.0.1 $(git rev-parse HEAD)

# 4. Tag and push
git tag v1.0.1 && git push origin v1.0.1

# 5. Create a published GitHub Release for that tag → npm + docs deploy automatically
```

- **Stable** — normal release → npm dist-tag `latest`
- **Pre-release** — check “pre-release” on GitHub → npm dist-tag `beta`

## Testing Policy for Pull Requests

Stambha accepts pull requests only when test coverage is appropriate for the type of change.

- PRs that introduce new behavior must include tests that validate that behavior
- PRs that fix bugs should include a regression test when the bug can be covered realistically
- PRs that modify runtime logic, pipeline behavior, transport handling, or public API responses are expected to include updated or additional tests (Vitest; `MockBridge` for core)
- PRs that do not change observable behavior (docs, formatting, comments, dependency housekeeping, low-risk refactors) may not require new tests
- Even when no new tests are needed, `pnpm build` and `pnpm test` must pass

If a PR does not include new tests, explain why in the PR description. Valid reasons include: no functional behavior changed, existing tests already cover the change, or the change is not meaningfully testable in isolation.

Maintainers may request additional test coverage before approving.

## Review Process

1. A maintainer reviews for design fit, test coverage, and transport separation (core must stay Discord-library-free)
2. Address feedback with new commits on your branch
3. Once approved, the PR is merged per maintainer preference

Large PRs may be asked to split into smaller reviewable pieces.

## Community Standards

- Be respectful and patient in issues and reviews
- Assume good intent

## Reporting Security Issues

Please do **not** open public issues for security vulnerabilities. Report them privately by contacting the maintainer (see `author` in root `package.json`) or using [GitHub private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability).

## Questions

- **Bugs & features:** [GitHub Issues](https://github.com/mivaya/Stambha/issues)
- **Architecture:** [AGENT.md](../AGENT.md)

Thank you for contributing to Stambha.
