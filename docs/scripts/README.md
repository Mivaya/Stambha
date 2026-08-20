# Docs scripts

## `generate-api-docs.mjs`

Builds TypeScript API reference markdown under `docs/api/<package>/` from `@stambha/*` sources (TypeDoc + typedoc-plugin-markdown). Updates `docs/.vitepress/sidebars/api.ts`.

```bash
pnpm docs:api          # from repo root
pnpm --filter @stambha/docs api
```

Runs automatically before `docs:build`. `docs:dev` skips generation when `docs/api/core/index.md` already exists (`--if-missing`). Force a refresh with `pnpm docs:api`. Generated package folders are gitignored — CI runs `pnpm build` then docs build on deploy.

## `archive-docs-version.mts`

Snapshots public docs from a git tag into `docs/versions/<semver>/` for the VitePress version switcher.

```bash
pnpm docs:archive 0.2.1
pnpm docs:archive 0.2.1 v0.2.1
```

Also add or update `docs/.vitepress/sidebars/versioned/<semver>.json`. Commit the archive with the **core** release PR — do not edit old version folders after ship.

**Deploy (GitHub Pages):** latest docs redeploy from `docs.yml` on core **release**, manual **workflow_dispatch**, or `repository_dispatch` (`docs-redeploy`) from Stambha-plugins — not on every `docs/**` push to `main`. Plugin/extension pages belong in latest; deep package API can stay on package READMEs.

See [`.github/workflows/docs.yml`](../../.github/workflows/docs.yml) and [`.github/PUBLISHING.md`](../../.github/PUBLISHING.md).
