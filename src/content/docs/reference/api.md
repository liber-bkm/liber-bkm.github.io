---
title: API reference
description: The liber JSON API surface and auth model.
---

JSON API under `/api/v2` (a checked-in `openapi.json` contract in the project pins the shapes). Auth follows one token model: `--auth-token` or `LIBER_AUTH_TOKEN`, empty means open. Browsers use an HMAC signed cookie plus Origin/Referer checks on writes; API clients use `Authorization: Bearer` with the derived bearer token (`HMAC(token, "liber-bearer-v1")` as hex). `/api/*` without credentials returns JSON 401.

## Bookmarks

| Endpoint | Purpose |
| -------- | ------- |
| `GET /api/v2/bookmarks` | List with `q/sort/tag/folder/page/per_page/scope/deep` (`scope` restricts bare words; `q` accepts `field:value` prefixes, deep search adds `snippet`) |
| `POST /api/v2/bookmarks` | Add (201, or 409 `{error: duplicate, existing, hint}` with `confirm_dup: true` retrying to 200); takes `archive_backend` override |
| `GET /api/v2/bookmarks/{id}` | Get one (partial `PUT` updates, confirm-gated `DELETE` answering `{confirm_required: true, ...}` until confirmed) |
| `POST /api/v2/bookmarks/{id}/open` | Open, records history |
| `POST /api/v2/bookmarks/{id}/archive`, `DELETE .../archive` | Add or remove the archived copy |
| `GET /api/v2/bookmarks/{id}/notes`, `PUT ...`, `DELETE ...` | Notes content, save, remove |
| `POST /api/v2/bookmarks/{id}/attachments`, `GET ...`, `DELETE .../attachments/{name}` | Upload, download, remove |
| `GET /api/v2/favicons/{host}` | Cached per-host site icon |
| `POST /api/v2/favicons/refresh` | Refresh missing (or re-fetch cached) icons across the library |
| `POST /api/v2/bulk` | Multi-select delete (confirmed), set tags, move folder |
| `GET /api/v2/pick?q=` | Plain-text scripting endpoint: 400 on missing query, 404 on no match, single URL line on one match, else up to 30 `[id] title` rows |

## Taxonomy, rules, check

| Endpoint | Purpose |
| -------- | ------- |
| `GET /api/v2/tags`, `POST /api/v2/tags/rename`, `POST /api/v2/tags/delete` | Tag management (rename merges) |
| `GET /api/v2/folders`, `POST /api/v2/folders/rename`, `POST /api/v2/folders/delete` | Folder management (rename moves subtrees) |
| `GET /api/v2/rules`, `POST /api/v2/rules` | List and add rules |
| `PUT /api/v2/rules/{id}`, `DELETE ...` | Edit and delete rules |
| `POST /api/v2/rules/apply`, `GET+POST /api/v2/rules/learn` | Reapply rules, learn suggestions |
| `POST /api/v2/check/run`, `POST /api/v2/check/apply` | Run a check; apply takes `stale`, per-update `retitle`, confirm-gated `delete` |

## Library, sync, settings

| Endpoint | Purpose |
| -------- | ------- |
| `POST /api/v2/library/import` | Netscape import with `archive` flag, failures as warnings |
| `GET /api/v2/library/export-bookmarks` | Netscape export download |
| `POST /api/v2/library/export-site` | Static site export |
| `GET /api/v2/library/backup` | Tarball download |
| `POST /api/v2/library/restore` | Confirm-gated restore (256 MiB cap), reindexes after |
| `POST /api/v2/sync/export`, `POST /api/v2/sync/import` | Bundle exchange for HTTP push/pull |
| `POST /api/v2/sync/commit {push?}` | Git snapshot, always HTTP 200 with `{output, error?}` body |
| `POST /api/v2/sync/prune` | Drop old oplog entries |
| `POST /api/v2/reindex` | Repair with prune and compact options |
| `GET /api/v2/history` | Recently opened with open counts |
| `GET /api/v2/profiles`, `POST /api/v2/profiles/switch`, `POST /api/v2/profiles/delete` | Profile list, switch, delete |
| `GET /api/v2/settings`, `PUT /api/v2/settings` | Settings plus `maintenance_status` (`auth_token` never returned or set here) |
| `GET+POST /api/v2/searches`, `POST /api/v2/searches/delete` | Saved search presets (device-local, never synced) |

`GET /login` and `POST /login` serve the token login page, `GET /logout` clears it. See [Self-hosting](/config/self-hosting/) for serving and [Auth internals](/dev/auth/) for the token mechanics.
