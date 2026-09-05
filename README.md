# liber-docs

Minimal Astro + Starlight docs site for `liber`. Deploys to https://liber-bkm.github.io via GitHub Pages.

## Dev (NixOS, no root)

```sh
nix develop   # provides node 22 + pnpm, keeps caches inside repo
pnpm i
pnpm dev      # http://127.0.0.1:4321
pnpm build    # static output in dist/
pnpm preview  # serve dist/ at http://127.0.0.1:4321
```

## Pages

- `/`: short description + Download (Linux → `/install/linux/`, macOS → `/install/macos/`, Windows → `/install/windows/`) + GitHub link
- `/install/linux/`, `/install/macos/`, `/install/windows/`: from `docs.md`; Windows download button is an intentionally empty `href` placeholder
- `/start/quickstart/`: install heads-up, basics, and full command overview
- `/guide/*`: adding, searching, editing, attachments, tags-folders, import, automation, sync, profiles, web-ui, static-export, completions (split from `docs.md` + `docs2.md`)
- `/config/`, `/config/layout/`, `/config/reindex/`: configuration reference
- `/concepts/design-notes/`: why tags+folders, markdown, no database
- `/reference/cli/`: full `liber --help` mirror (v0.6.4)

## Deploy

Push the contents of this folder to the repo root of `liber-bkm.github.io`.
`.github/workflows/deploy.yml` builds with pnpm (Node 22) and deploys on
every push to `main`. One manual step in the repo settings: Settings →
Pages → Build and deployment → Source: **GitHub Actions**.
