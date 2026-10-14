---
title: Storage and reindexing
description: SQLite store, filenames, reindex repair, backup format, and title fetch.
---

## Store

SQLite via rusqlite bundled, one file per profile at `<base>/<profile>/.liber/store.db`. Tables: `bookmarks`, `attachments`, `rules`, `oplog`, `meta(device_id)`. Files on disk keep the plain layout (`html/`, `markdown/`, `archive/`, `attachments/`) but are named `<uuid>-<slug>` instead of numeric prefixes. Stable UUIDs remove the old numeric ID reassign class during sync. Tags are additionally indexed in a `bookmark_tags` side table maintained on every write, with indexes on folder, creation, and open times. Paged reads (list, history, counts) filter, sort, and paginate in SQL; only relevance ranking and full scans (sync, reindex, export) hydrate whole collections. A 10k perf fixture pins the budgets. Writes are atomic (tmp plus rename). History bumps and check stamps skip the oplog, same as the old design skipping the journal.

## Filenames

The full UUID prefixes every bookmark file so names never collide across devices without coordination. Slugs come from title at creation and are never re-slugged on edit. Every filename and folder part passes the Windows reserved name screen (`con`, `aux`, `com1`, trailing dots) on all platforms, even though only Linux is tested here.

## Reindex

`reindex` sweeps conflict-named files first, adopts orphan HTML by reading its own `liber:` meta tags (reusing the recorded UUID when free, quarantining duplicates and unparseable files), relinks sibling markdown and archives by shared basename, quarantines unreferenced attachments (they carry no owner key, so nothing is relinked blindly), and keeps missing-HTML rows pending unless `--prune`. Every run also rebuilds the tantivy index from archives plus notes. Short-id gaps close only with `--compact-ids` (with `--prune`), and null ids backfill in creation order.

## Backup format

Backup is a `.tar.gz` (`tar` plus `flate2`, pure Rust so it builds everywhere) holding `html/`, `markdown/`, `archive/`, `attachments/`, and `.liber/store.db` plus a `manifest.json` (format version, device, time). `site/` and `tantivy/` are excluded as regenerable, config is excluded so device identity and secrets stay local. Restore validates the manifest and rejects absolute plus `..` entry paths before unpacking, refuses a non-empty library without `--force`, confirms unless `--yes`, then runs a full reindex to adopt and rebuild search. Overwriting the database file is orphan-safe: files the backup lacks stay on disk for reindex to adopt or quarantine. No restart is needed afterwards on any frontend: every handler opens the store per request from live config and Tauri opens per IPC call, so no process holds a stale handle; restore serializes on the write lock and reindexes before answering.

## Title fetch

`fetch_title` fetches up to 300KB with a 10s timeout, extracts the first title element, unescapes entities, and collapses whitespace. Both CLI add and API add call it when no title is given, falling back to the URL on any failure. Empty titles are never stored.
