---
title: Merge conflict handling
description: liber -r --merge to handle conflicts in syncing.
---

`liber -r --merge` folds sync-tool conflict copies of the index into one before running the two passes above. The index directory (`.liber/`) is scanned for files matching `*conflict*` or `*conflicted*` (Syncthing `sync-conflict`, Nextcloud/Dropbox conflicted copies). Plain `liber -r` only lists them and exits. `--merge` folds them in:

- Same id, same normalized URL: fields merge (newer `UpdatedAt` wins scalars, tags and attachments union).
- Same id, different URL: the incoming entry gets a fresh id; its recorded paths already carry the new prefix (via `reprefixBookmarkFiles`), and `renameCollisionFiles` moves the on-disk files from the old `%04d-` prefix to the new one using the same two-phase staging as id compaction.
- Different id, same normalized URL: duplicate. Tags union into the richer entry, loser's files move to `unindexed/`.
- Automation rules union by match text; unparseable copies are reported and skipped, never fatal.

Consumed copies move to `.liber/resolved/` (never deleted). `NextID` becomes max(all ids)+1; automation rules union by match string with reassigned ids.

