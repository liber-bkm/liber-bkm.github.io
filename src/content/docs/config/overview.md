---
title: Configuration overview
description: Config file location, settable keys, and environment overrides.
---

## Config file

The config file resolves to `LIBER_CONFIG` when set, else the platform config dir:

| Platform | Config file | Default library base |
|---|---|---|
| Linux | `~/.config/liber-rs/config.json` | `~/.local/share/liber-rs` |
| macOS | `~/Library/Application Support/liber-rs/config.json` | `~/Library/Application Support/liber-rs` data dir |
| Windows | `%APPDATA%\liber-rs\config.json` | `%LOCALAPPDATA%\liber-rs` |
| Android | app private storage `config.json` | app private storage `library/` |

`LIBER_BASE_DIR` overrides the base dir without touching the file. The file is written `0600` (owner only) since it can hold local paths. `liber init` writes the first version: a setup wizard (base dir, device id, backend, token) that refuses when already configured. The web UI settings page, the desktop settings, and `liber config` edit the same keys:

```sh
liber config list   # show all keys and values as JSON
liber config get base_dir
liber config set archive_backend builtin
```

## Settable keys

One shared allowlist covers every writer (`liber config set`, the Settings form, `PUT /api/v2/settings`); unknown keys are rejected. `monolith_browser_path`, `monolith_use_browser`, and `dns_fallback` are Go-only keys with no Rust consumer.

| Key | Meaning | Default |
|---|---|---|
| `base_dir` | Library root (switches live, no file moves). See [Storage layout](/config/storage/). | platform data dir |
| `html_dir`, `markdown_dir`, `archive_dir`, `attachment_dir` | Per-kind overrides (`~` expands); empty means profile default, unsettable over the API. Changing a directory switches it immediately with no file moves, so move your files first, then run `reindex`. | profile defaults |
| `device_id` | Per-device id, shown in status and mDNS TXT. See [Sync](/cli/sync/). | random UUID at first run |
| `archive_backend` | `builtin`, `browser`, `single-file`, `monolith`, `auto`. See [Archive backends](/config/archive-backends/). | `builtin` (`auto` on first run) |
| `browser_cmd` | Command used by `open`. | system opener |
| `browser_path` | Explicit browser for the browser archiver backend (Chromium family auto-detect). | empty |
| `editor_cmd` | Reserved for external editing. | empty |
| `singlefile_cmd`, `singlefile_browser_path`, `monolith_cmd` | External archiver commands. | bundled PATH entries under Nix |
| `auth_token` | CLI and env only, never returned or set over the API: a bearer that could mint itself is no auth at all. Never shown in Settings or API responses. | empty (open) |

`GET /api/v2/settings` also reports `maintenance_status` (bookmark, oplog, quarantine, and short-id gap counts). Dir keys accept non-empty paths with `~` expansion, and unsetting goes through the config file since the API rejects empties.

## Saved searches

Named `query plus scope plus sort` presets live in the config file as device-local UI state, never synced. Manage them with `liber searches`, the API `/api/v2/searches`, or the sidebar section; see [Searching](/cli/searching/).

## Daemon config is live

The server and the Tauri app hold the config behind a lock and write through the lock and the file together, so profile switches and setting saves take effect without a restart (this also covers Android saves). See [Profiles](/config/profiles/).

Related: [Self-hosting](/config/self-hosting/) (server addresses and tokens).
