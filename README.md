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
- `/install/linux/`, `/install/macos/`, `/install/windows/`: install guides; Windows has a live `liber-setup.exe` download button
- `/start/quickstart/`: install heads-up, basics, and full command overview
- `/guide/*`: adding, searching, editing, attachments, tags-folders, import, automation, sync, profiles, web-ui, static-export, completions (from `docs.md` + `Project-readme.md`)
- `/config/`, `/config/layout/`, `/config/reindex/`, `/config/archive-backends/`: configuration reference
- `/concepts/design-notes/`: why tags+folders, markdown, no database
- `/reference/cli/`: full `liber --help` mirror (v0.6.4)
- `/dev/*`: internals for contributors (data model, ingest, mutations, search, automation, attachments, archive backends, profiles/sync, web UI), split from `dev-docs.md`

