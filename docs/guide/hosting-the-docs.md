# Hosting the documentation site

> **Contributor-only.** This page is excluded from the public VitePress build (`srcExclude` in `.vitepress/config.ts`). Read it on GitHub or in the repo; it is not published to GitHub Pages.

This repo ships a [VitePress](https://vitepress.dev/) site in `/docs`.

## Run locally

From the repo root:

```bash
pnpm install
pnpm docs:dev      # http://localhost:5173/Stambha/
pnpm docs:build
pnpm docs:preview
```

## Deploy to GitHub Pages

Workflow: [`.github/workflows/docs.yml`](../../.github/workflows/docs.yml) · maintainer notes: [`.github/PUBLISHING.md`](../../.github/PUBLISHING.md)

| Trigger | What deploys |
|---------|----------------|
| **Published** GitHub Release (core tag) | Docs built from release tag |
| **`workflow_dispatch`** | Manual redeploy from selected ref |
| **`repository_dispatch`** (`docs-redeploy`) | Stambha-plugins CI after a plugin release |

**Pushes to `main` under `docs/**` do not auto-deploy.** Merge doc fixes to `main`, then either wait for the next core release or run the Docs workflow manually.

Site URL (project Pages): `https://mivaya.github.io/Stambha/`

Default VitePress `base` is `/Stambha/`. For a custom domain (`docs.stambha.dev`):

1. Point DNS (CNAME) at GitHub Pages.
2. Add `docs/public/CNAME` with the hostname.
3. Build with `STAMBHA_DOCS_BASE=/` so asset URLs are root-relative.

Until DNS is live, keep the GitHub Pages project base so `/Stambha/` links do not break.

## Versioned documentation

The site uses [vitepress-versioning-plugin](https://vvp.imb11.dev/) with a navbar **Version** dropdown.

| URL | Content |
|-----|---------|
| `/Stambha/` | Latest (root `package.json` version at build time, or **Next** when that version is already archived) |
| `/Stambha/1.3.0/` | Frozen snapshot in `docs/versions/1.3.0/` |

**At each core npm release**, archive the docs that match the shipped version:

```bash
pnpm docs:archive 1.3.0 f325f54   # use the release merge SHA, not a later docs-only commit
```

Review `docs/.vitepress/sidebars/versioned/<semver>.json` if the sidebar changed. Commit archives with the release PR — do not edit old version folders after ship.

Script details: [`docs/scripts/README.md`](../scripts/README.md)

## Internal & contributor docs

Excluded from the public site build (`srcExclude` in `.vitepress/config.ts`):

- `/docs/decisions/` — architecture decisions (ADR)
- `/docs/guide/hosting-the-docs.md` — this file
- `/docs/scripts/` — archive tooling

Program board: [GitHub Project #2](https://github.com/orgs/Mivaya/projects/2) · source `scripts/kanban/catalog.mjs`

Keep secrets and private URLs out of all docs folders.

## Future improvements

- Custom domain cutover (`STAMBHA_DOCS_BASE=/` + `docs/public/CNAME`)
- Link checker CI (reduce reliance on `ignoreDeadLinks`)
- Combined Guide + API search index if local search becomes insufficient
