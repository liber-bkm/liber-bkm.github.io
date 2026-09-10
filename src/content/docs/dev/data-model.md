---
title: Data model and reindexing
description: Bookmark records, filename rules, the reindex pipeline, merge, journal, and why there is no database.
---

## Records carry their own paths

Every bookmark's `HTMLFile` (always present), `MarkdownFile`, and `ArchiveFile` are relative paths stored individually on that bookmark's own record. There is no filename-pattern or glob matching anywhere in the codebase to relate one bookmark's files to another's. Every operation that touches a bookmark's files follows its own recorded path. That single invariant is what makes the features below safe: a stray `0002-*.md` can never get paired with, or moved alongside, some other id's `.html`/archive file, because nothing ever goes looking for files by pattern.

Filenames follow `%04d-<slug>` (id plus a slugified title, e.g. `0007-my-title.html`). The basename is fixed at creation time (`create.go`'s `addBookmarkToStore`) and is **never re-slugged** by an edit. Editing only ever moves the *directory* (on a folder change) and never renames the file to match a new title. `edit.go`'s `sharedBase` depends on this: when adding a markdown/archive copy to a bookmark that didn't have one, it derives the shared basename from the existing HTML file rather than re-deriving a slug from the (possibly since-edited) title, so all three file kinds for one bookmark always share the same basename.

## Reindex runs a pipeline

`liber -r` runs in this order: merge (only with `--merge`), adopt orphan files, relink siblings, sweep content conflicts, relink orphan attachments, then handle missing files.

**Missing files stay pending by default.** For each indexed bookmark, check its recorded HTML path. If it is gone (partial sync, or deleted outside liber via `rm` or a file manager), the entry is kept and listed as pending on every run. Nothing is dropped unless `-r --prune` is passed. With `--prune`, the entry is dropped and its recorded Markdown/Archive/Attachment files (if still on disk) are moved, not deleted, into `<base_dir>/unindexed/{markdown,archive,attachments}/<same relative path>`. This uses the exact path already recorded on that specific bookmark, never a prefix/glob match, which is why the data-model invariant matters here. Bookmarks whose HTML is still present are left alone; their Markdown/Archive/Attachment refs are also kept when the file is missing, and empty refs are relinked when a matching sibling file exists on disk (see below).

**Adopt orphans.** HTML files on disk that no index entry references are parsed for URL/title/tags and adopted as new bookmarks, except files with `sync-conflict` or `conflicted` in the name, which are never adopted (see Content conflicts below). Unparseable files and files whose URL duplicates an existing entry move to `unindexed/html/` instead.

**Relink siblings.** For a bookmark whose HTML exists but whose Markdown/Archive ref is empty, `relinkSiblings` checks `<kind>/<folder>/<shared-base>.<ext>` on disk and reattaches it. This covers the case where the file synced but the index update did not.

**Sweep content conflicts.** Files with `sync-conflict` or `conflicted` in the basename under `html/`, `markdown/`, `archive/`, or `attachments/` move to the matching `unindexed/<kind>/` path with the conflict name preserved, and are reported for manual review. Both versions survive; nothing is auto-merged at the file-content level.

**Relink orphan attachments.** Files under `attachments/` that no entry references are matched by `%04d-` prefix: if the id names an existing bookmark the file is appended to its attachments (display name is the part after the prefix). Anything else, including conflict-named files, moves to `unindexed/attachments/`.

**Id compaction (`-r --compact` only).** Plain `-r` never renumbers, so deleting id 2 of 1,2,3 leaves 1,3 and `NextID` stays above the max id. Only `--compact` renumbers survivors to close gaps (e.g. ids 1,2,4 become 1,2,3), in existing order. Since ids are embedded in filenames, this means physically renaming files. Compaction renames files, which creates extra sync traffic, so sync users should only compact deliberately.

The renaming is done in two phases, implemented in `reindex.go`'s `compactIDs`:

1. **Stage**: every affected file (across all bookmarks being renumbered) is moved to a temporary staging name first.
2. **Commit**: only once *everything* has been staged does anything get moved to its final, renumbered name.

Why two phases instead of just renaming in id order: staging first means there's no ordering to reason about. A bookmark moving to id 3 can't collide with another bookmark's file that hasn't been moved off id 3 yet, because nothing lands on a final name until every source file involved in the whole batch has already been moved out of the way. (An ascending-order single-pass rename would actually also be provably safe here, since new ids are always less than or equal to old ids, so processing in ascending order never creates a collision. The staged version doesn't require that argument to hold for correctness, which makes it more robust against future changes to the processing order.)

## Merge conflict handling

`liber -r --merge` folds sync-tool conflict copies of the index into one before the adopt/relink/sweep passes above: `findMergeCandidates` matches `*conflict*` by default (`--merge --all` takes every `.liber/*.json` except `index.json`; `*.tmp` files are never candidates). Same id plus same URL merges fields, same id plus different URL reassigns a fresh id (folding into an existing entry when that URL already lives under another id), same URL under different ids folds duplicates into the richer entry, and automation rules union by match text. The index with the most bookmarks wins as merge base (older wins ties, except sub-30-second ties keep local with a clock skew notice). Consumed copies move to `.liber/resolved/`, never deleted. Full details: [Merge conflict handling](/dev/merge-conflicts/).

## Journal

`.liber/journal/` holds one JSON file per mutation command, so Drive-style last-writer-wins sync cannot collapse two changes into one: filenames carry `<utc-timestamp>-<device>-<rand>.json` and two devices never mint the same name. `saveWithJournal` (journal.go) is the single choke point: every data mutation builds a `JournalEntry` (bookmark snapshots, delete tombstones with id plus URL plus time, rule snapshots, rule tombstones by match) and writes it before `store.Save()`. The originator records the entry id in `Store.AppliedJournal` at write time, so replay skips it later and replay is idempotent. History bumps (`open.go`, search `(o)`) and check-status stamps deliberately skip the journal; only real data changes are recorded.

`replayJournal` runs inside `runReindex` only under `--merge`, after the index-copy merge. It replays unapplied files in filename (time) order with the same semantics as index merging: same id plus same URL merges fields, same id plus different URL first checks the URL table (fold as duplicate) and otherwise reassigns a fresh id. Unlike index merging, reassigned refs are kept when files are missing (`renameCollisionFiles` with `clearMissing=false`), since the file sync may simply be lagging; the pending mechanism covers those. Tombstones delete by id, falling back to normalized URL (covers entries adopted under a new id), unless the bookmark's `UpdatedAt` is newer than the tombstone. Deleted files move to `unindexed/`, never trash. Rule upserts match by `Match` text; rule deletes match by `Match` because ids get reassigned across devices.

Retention is 90 days (`journalRetention`): `pruneOldJournal` deletes only files that are both older than that and already applied locally, via `liber -r --prune-journal`. Unapplied old files are kept and reported. A device offline past retention still converges through `index.json`, except a delete it never saw stays pending.

## Why not a database

Id-renumbering (the thing that might have motivated a real database) is fully solved in plain Go by the staged-rename approach above, so there was never a technical need to take on a CGO or large pure-Go SQL dependency for a single-user local tool. Flat JSON plus files keeps the collection readable, diffable, greppable, and trivially synced with git.
