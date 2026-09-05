---
title: Reindexing
description: Clean up externally deleted files and close id gaps.
---

```sh
liber -r
```

Two passes, in order. Safe to run any time: it never deletes user data outright, only moves or renames.

**1. Clean up entries deleted outside liber.** Each bookmark records its own HTML/markdown/archive/attachment paths (no glob matching). If a recorded HTML file is gone, the index entry is dropped, but surviving markdown/archive/attachments are **moved** to `<base_dir>/unindexed/markdown/...`, `<base_dir>/unindexed/archive/...`, `<base_dir>/unindexed/attachments/...`, preserving relative paths. Bookmarks whose HTML still exists only get dangling references cleared.

**2. Renumber to close id gaps.** Deleting 3 from 1–4 leaves 1, 2, 4; `-r` compacts to 1, 2, 3 in existing order (not a re-sort), physically renaming `0004-...` → `0003-...`. Renames stage to temporary names first, then commit, so nothing collides mid-run.
