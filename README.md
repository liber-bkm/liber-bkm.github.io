# liber-docs

Astro + Starlight docs site for `liber` (Rust rewrite). Deploys to https://liber-bkm.github.io via GitHub Pages. Default Starlight theme, no custom theme CSS.

## Dev (NixOS, no root)

```sh
nix develop   # provides node 22 + pnpm, keeps caches inside repo
pnpm i
pnpm dev      # http://127.0.0.1:4321
pnpm build    # static output in dist/
pnpm preview  # serve dist/ at http://127.0.0.1:4321
```

## Pages

- `/`: hero with logo image + heading-less demo previews + Features cards + Download (direct per-platform links) + GitHub link. Nav logo, hero image, and favicon derive from `../assets/logo.svg`.
- `/documentation/`: index of every site page, linked from the homepage Documentation button
- `/install/linux/`, `/install/macos/`, `/install/windows/`, `/install/android/`: install guides
- `/start/quickstart/`: install heads-up, capture loop, search syntax, full command overview
- `/cli/*`: CLI guide (adding, searching, terminal-ui, editing, attachments, tags-folders, import-export, automation, link-health, completions, sync, backup-restore, serving)
- `/app/*`: App guide (web-ui, desktop, android, adding, finding, organizing, check-center, library-settings, pairing)
- `/config/*`: Configuration guide (overview, archive-backends, storage, profiles, self-hosting, backup-restore, troubleshooting)
- `/reference/cli/`: CLI reference mirrored from the prebuilt `liber --help` plus the project command table
- `/reference/api/`: `/api/v2` surface plus auth model (checked against `openapi.json`)
- `/reference/changelog/`: change history, recent first
- `/dev/*`: internals remapped from `developer-docs.md` (index map, architecture, building, storage, search, sync, addressing, automation, archiver, check, picker, server-tauri, settings-profiles, auth, discovery, android, windows, portability)
- `/local/AGENTS.md`: AI assistant handoff (not part of the site, not in sidebar)

## Sources

Single source of truth lives one level up (`../`): `developer-docs.md` (maintainer internals, updated in place) plus standalone notes added during the project (`attachments-tab-about.md`, `check-workers-save-as.md`, `cli-status-deep-preset.md`, `empty-library-checklist.md`, `sync-exchange-apps.md`). New CLI/API surface is verified read-only against the Rust project at `project-liber/` (never build it).
