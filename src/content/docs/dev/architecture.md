---
title: Architecture
description: Crates, frontend stack, and the contributor workflow.
---

Four thin crates over one domain core, plus the web UI:

- `liber-core`: all logic first (store, search, sync, archive, check, automation, taxonomy, import/export, backup, discovery, favicons). No frontend code may duplicate it.
- `liber-cli` (`liber`): clap commands plus ratatui TUI, thin over core. `serve` reuses the server crate.
- `liber-server` (`liber-serve`): axum JSON API under `/api/v2` plus the embedded/static web UI host. Per-resource contract tests plus a checked-in `openapi.json` drift test pin the API.
- `liber-tauri`: desktop and Android app calling core directly over IPC, with per-function REST fallback so remote mode reuses every feature.
- `frontend/`: Vite plus React plus TypeScript plus Tailwind plus TanStack. `tauri.ts` picks IPC or REST at runtime per function.

Maintainer internals live in the project `local/developer-docs.md` (remapped across this Developer section), the capability tracker in `local/PARITY.md`, and the history of record in `local/changelog.md`. The server/IPC split is detailed in [Server and Tauri split](/dev/server-tauri/).

## Contributing

One slice at a time: core function first in `liber-core`, then CLI/server/UI adapters, then tests, then the verify gates (`cargo test --workspace`, clippy with `-D warnings`, `cargo fmt --check`, frontend build plus tests), then in the same change the PARITY checkbox, changelog entry, and README plus developer-docs updates for user-visible changes. Keep all four ends consistent (CLI/TUI, web UI, Tauri desktop IPC, Android app). No em dashes in docs or code strings. Data loss is the unforgivable bug class: quarantine, never delete user data. Auth follows the token model exactly. Never commit unless asked; the maintainer commits manually.
