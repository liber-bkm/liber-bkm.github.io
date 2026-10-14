---
title: Sync internals
description: Oplog merge, artifact ops, snapshots, pick endpoint, and converge.
---

Sync ports the old journal plus merge semantics onto the `oplog` table. Bookmark upserts, deletes, and rule put/del append one row keyed `<utc-ts>-<device>-<rand>`, replayed in time order. Newer `updated_at` wins scalars, tags and attachments union, tombstones lose to newer edits, 90 day prune. Not logged, hence never synced as upserts: history bumps and check stamps (skipped by design). Transport stays git snapshot (never init a repo). Missing HTML stays pending by default, dropped only with `--prune` into `unindexed/`. Conflict named files sweep to `unindexed/` for manual review.

## Artifact oplog

References, not bytes. Binaries ride folder sync like all other content; the oplog carries `attach {uuid, name, path}`, `notes_save {uuid, body}` (full text inline, notes are small and must converge through the bundle itself), `notes_del {uuid}`, `archive_add {uuid, path}`, and `archive_del {uuid}`. Detach needs no op: it funnels through `update_bookmark`, whose full upsert already carries the trimmed attachment list. Replay resolves the bookmark by UUID first, so tombstoned rows skip instead of resurrecting; missing files adopt optimistically for attach and archive (metadata converges now, bytes follow via folder sync), while `notes_save` applies only when the entry beats the local `updated_at`. Unparseable upsert payloads count as skipped instead of failing the whole import. Unknown ops stay ignored for forward compatibility.

## Snapshot serving

`POST /api/v2/sync/commit {push?}` runs the same `git_snapshot` as `liber sync commit` on the live-config profile dir with a server-stamped `liber sync: <utc>` message (the CLI keeps its own `--message` default). The endpoint always answers HTTP 200 with `{output, error?}` and runs git in `spawn_blocking` since `Command` blocks. Tauri `sync_commit` returns the same shape as a sync command (no lock held across await, the snapshot is local and fast). The Settings snapshot button posts through the `useRemote()` branch, so remote mode commits the server library. The `git_snapshot` nothing-to-commit probe reads combined stdout plus stderr: newer git reports it on stdout and a stderr-only check misread empty repos as failures.

## Scripting pick

`GET /api/v2/pick?q=` answers `text/plain`: 400 on a missing query, 404 on no match, a single URL line on one match, else up to 30 `[id] title` plus URL rows. Row ids reuse the display alias (`short_id`, falling back to the 8-char UUID prefix like the TUI), so every row resolves through the normal id path. There is no Tauri pick command: scripting has no use-case on device.

## Converge and transport

Converge runs on UUIDs, so the numeric reassign class is gone: same uuid merges fields, same URL under another uuid folds tags, tombstones compare against row `updated_at`. Exchange is a JSON bundle (`sync export` plus `sync import`); replay is idempotent per originator key and re-logs applied changes for gossip to third devices. `sync push <url>` plus `sync pull <url>` run the same bundle through HTTP against the existing `sync/export` plus `sync/import` endpoints (no new server routes): push exports locally and posts, pull fetches and replays with the same auto-heal. Auth reuses the derived bearer (`HMAC(token, "liber-bearer-v1")`, same bytes the server checks), from `--token` or `LIBER_AUTH_TOKEN`; an empty token sends no header, and a 401 answers with the token hint instead of a bare status. Per-peer cursors stay a later slice, so push/pull move whole (or `--since` filtered, by oplog sequence for incremental moves) bundles every time. `sync commit` takes `--message` for the snapshot text (the server stamps its own `liber sync: <utc>` message instead). Two invariants found the hard way: `update_bookmark` stamps the row and the payload from one clock read so the log never carries a stale timestamp, and the originator marks its own entries applied at write time.
