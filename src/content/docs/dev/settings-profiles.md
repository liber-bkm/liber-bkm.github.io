---
title: Settings and profiles
description: Setting allowlist, maintenance status, tracked profiles, and the frontend matrix.
---

One allowlist for every writer: `config::API_SETTABLE` plus `validate_setting_value` plus `apply_setting` in core, called by the CLI (`config set`, with `auth_token` as the one CLI-only extra), the API `PUT settings`, and Tauri `set_setting`. Dir keys accept non-empty paths (`~` expands at read time); an unset dir means the profile default, and unsetting goes through the config file since the API rejects empties. Changing a directory switches it live with no file moves, so the UI warns to move files first and `reindex` after; `Store::open` lazily creates an empty library in a fresh dir. `auth_token` is CLI and env only, never returned or set over the API: a bearer that could mint itself is no auth at all. `GET settings` adds `maintenance_status` (`Store::maintenance_status`: bookmark, oplog, quarantine, and short-id gap counts from single `COUNT` queries), the read model for the future `sync status`.

## Profiles

Separate libraries under one config, one active at a time. The tracked list lives in `Config.profiles`; `default` means the base dir itself and is never tracked. `switch_profile` validates (no slashes, `.`/`..`), appends to the tracked list, and creates the dir; `delete_profile` removes the name from the list only and refuses the active profile, so the folder stays on disk and switching back re-adopts it. Switching through the API or Tauri IPC updates the daemon's live config (`RwLock` on the server, `Mutex` in Tauri) as well as the config file, so subsequent calls serve the new profile without a restart; the Tauri app also stores its config path at setup so saves work on Android private storage too.

## Frontend capability matrix

Every artifact action runs through one core function, whichever frontend triggers it. Short ids are display aliases everywhere; full UUIDs appear with `--uuid` on the CLI, in the detail drawer header, and always in API payloads and logs.

| Action | Core | CLI flags | CLI TUI | Web UI | API |
|---|---|---|---|---|---|
| Edit fields | `apply_edit` | `edit` flags | edit form | edit form | `PUT bookmarks/:id` |
| Markdown add/remove | `MarkdownAction` | `--markdown` (add) | toggle | start/remove controls | `PUT`/`DELETE notes` |
| Archive add/remove | `ArchiveAction` | `archive` cmd, `--archive` | toggle plus backend cycle | archive section plus backend select | `POST`/`DELETE archive` |
| Attach/detach | `attach` fns | `--attach/--detach`, `attachments` | prompt flows | upload plus per-file remove | `POST`/`DELETE attachments` |
| Open | `record_open` | `open`, pick menu | pick menu | open button | `POST open` |
| Delete | `delete_bookmark_with_files` | `delete --yes` | n/a (command exists) | two-step confirm | confirm-gated `DELETE` |

New frontends implement against this table: same core functions, same endpoint shapes. Tauri covers every row over IPC via `frontend/src/tauri.ts` (same shapes as the API column, file downloads via blob URLs, archive viewing via `srcDoc`), so the Web UI column doubles as the Tauri column.

## UI preferences and layout

View preferences that differ per device (archive inline versus new tab, theme, density) live in `localStorage` under `liber-*` keys, never on the server. Below the `md` breakpoint the sidebar becomes a hamburger slide-over rendering the same sidebar fragment (nav, filters, theme toggle), so the two can never drift; landscape and wider keep the static sidebar. The viewport uses `viewport-fit=cover` and every top-anchored surface pads with safe-area insets via `max(base, inset)` so desktop spacing is unchanged.

## Library virtualization

Cards and table rows render through `@tanstack/react-virtual` (`useWindowVirtualizer`, so the page keeps its normal scroll): the grid chunks into lane rows from a breakpoint hook (1/2/3 matching `sm:`/`lg:`), rows measure themselves with `measureElement` plus estimates, overscan covers fast scrolls. Selection, bulk bar, drawer, and overlays key off bookmark ids, never rendered rows, so they are unaffected. The fetch cap rose from 100 to 500 (the API maximum) to feed the window; SQL pagination underneath is unchanged. Table rows render the small favicon variant before the title; the 20px icon fits the `py-2` row height so `estimateSize: 56` was kept. jsdom has no layout, so the UI test asserts wiring rather than window counts.

## Settings status section

Settings leads with a Library status section built from the existing `GET settings` payload (`maintenance_status` plus device and profile): count badges with amber tones on quarantine and short-id gaps, plain language hints pointing at the quarantine folder and at prune plus compact reindex, and the last `sync/commit` output persisted in `localStorage` under `liber-last-snapshot` so it survives reload. No new endpoint; both daemons already returned the same shape.

## Dialog autocomplete

Add and edit dialogs autocomplete taxonomy from the cached tag/folder count queries (shared keys, so the sidebar already warmed them): folders ride a native `datalist` since the value is single, tags show tap-to-append chips matching the current space-or-comma separated token and skipping names already typed. No new endpoint; the bulk bar keeps free text by design.

## Capture bookmarklet

Capture without an extension rides a bookmarklet opener, not a POST: a `javascript:` URL cannot send an authenticated cross-origin POST (no CORS layer by design, cookie POSTs 403 off-origin), so it opens `/?add=<url>&title=&tags=&folder=` in a liber tab and the app prefills the add dialog through the normal same-origin save path with duplicate handling. Login preserves the full query in `next`, and the query is stripped with `replaceState` after opening so refresh stays clean. A native browser extension (MV3 popup with tags/folder plus library redirect) is explicitly deferred; the bookmarklet is the supported capture path.
