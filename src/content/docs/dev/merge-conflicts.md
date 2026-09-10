---
title: Merge conflict handling
description: How liber -r --merge folds sync conflict copies into one index.
---

`liber -r --merge` folds sync-tool conflict copies of the index into one before the adopt/relink/sweep passes of [reindexing](/dev/data-model/). The index directory (`.liber/`) is scanned with `findMergeCandidates`: default mode matches `*conflict*` (Syncthing `sync-conflict`, Nextcloud/Dropbox conflicted copies); `--merge --all` treats every `.liber/*.json` except `index.json` as a candidate (Drive-style `index (1).json` copies). `*.tmp` files are never candidates. Plain `liber -r` lists candidates and changes nothing. `--merge` folds them in:

- Same id, same normalized URL: fields merge (newer `UpdatedAt` wins scalars, tags and attachments union).
- Same id, different URL: if the incoming URL already exists under another id, it folds into that entry as a duplicate instead of creating a new one. Otherwise the incoming one gets a fresh id; its recorded paths already carry the new prefix (via `reprefixBookmarkFiles`), and `renameCollisionFiles` moves the on-disk files from the old `%04d-` prefix to the new one using the same two-phase staging as id compaction.
- Different id, same normalized URL: duplicate. Tags union into the richer entry, loser's files move to `unindexed/`.
- Automation rules union by match text; unparseable copies are reported and skipped, never fatal.

Base selection: the index with the most bookmarks wins. On equal size the older file wins, except ties within 30 seconds keep the local index and print a clock skew notice, since FAT/exFAT/Android timestamps are coarse and device clocks can disagree.

Consumed copies move to `.liber/resolved/` (never deleted). `NextID` becomes max(all ids)+1; automation rules union by match string with reassigned ids.

After the index copies merge, `replayJournal` replays unapplied `.liber/journal/` files in time order (see [Data model and reindexing](/dev/data-model/) for journal semantics), then the normal adopt/relink/sweep passes run.
