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

- `/`: description + preview GIFs + Download (Linux, macOS, Windows, Android) + GitHub link
- `/documentation/`: index of every site page, linked from the homepage Documentation button
- `/install/linux/`, `/install/macos/`, `/install/windows/`, `/install/android/`: install guides
- `/start/quickstart/`: install heads-up, basics, and full command overview
- `/guide/*`: adding, searching, editing, attachments, tags-folders, import/export, automation, sync, profiles, web-ui, static-export, link-health, android, self-hosting, completions (from `docs.md` + `Project-readme.md` + `self-hosting.md` + `android-readme.md`)
- `/config/`, `/config/layout/`, `/config/reindex/`, `/config/archive-backends/`: configuration reference
- `/concepts/design-notes/`: why tags+folders, markdown, no database
- `/reference/cli/`: full `liber --help` mirror (v0.9.2)
- `/dev/*`: internals (data model, merge-conflicts, ingest, mutations, search, automation, attachments, archive backends, profiles/sync, web UI, link health, api, android, web-auth, performance), split from `dev-docs.md` + `android-dev-docs.md`
- `/local/AGENTS.md`: AI assistant handoff (not part of the site, not in sidebar)

## Sources

Single source of truth lives one level up (`../`): `docs.md`,
`Project-readme.md`, `dev-docs.md`, `syncing-guide.md`,
`android-readme.md`, `android-dev-docs.md`, `self-hosting.md`. The app
repo at `/home/nix/Artem/Dev/liber` backs `reference/cli.md`
(`go run . --help`) and behavior questions.
