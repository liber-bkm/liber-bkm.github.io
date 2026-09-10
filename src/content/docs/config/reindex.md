---
title: Reindexing
description: Adopt files, relink copies, pending entries, merge, prune, and compact.
---

```sh
liber -r                       # adopt files, relink copies, keep missing as pending
liber -r --prune               # same, dropping pending entries
liber -r --compact             # same, renumbering ids to close gaps
liber -r --merge               # same, first folding sync conflict copies in
liber -r --merge --all         # same, merging every .liber json candidate
liber -r --prune-journal       # delete applied journal files older than 90 days
```

`liber -r` runs the following steps, in order. Safe to run any time: steps 2 and 3 never delete anything outright, and step 4 only ever renames files, never their content.

**1. Merge sync conflict copies and replay the journal (`--merge` only).** When an external sync tool leaves conflict copies of the index in `.liber/`, plain `liber -r` only lists them and changes nothing. With `--merge` (add `--all` for Drive-style copies without conflict in the name), liber folds them in, then replays `.liber/journal/` files it has not applied yet:

- Same id, same bookmark: fields merge (newer edit wins text, tags and attachments union).
- Same id, different bookmarks (added offline on both sides): the incoming one gets a fresh id and its files are renamed to match.
- Same URL under different ids: duplicates fold into the richer entry; the loser's files move to `unindexed/` instead of being deleted.
- Deletes replay as tombstones: a bookmark edited after the delete survives, otherwise the delete applies.
- Automation rules union by match text; unparseable copies are reported and skipped.

Consumed copies move to `.liber/resolved/` (never deleted), so the next `-r` is clean. See the [syncing guide](/guide/sync/) for the full multi-device story.

**2. Adopt files and relink.** Every bookmark's Markdown/Archive/Attachment paths are recorded individually on that bookmark's own index entry when it is created (and kept in sync whenever you edit it), so liber never matches files across bookmarks by filename pattern. Bookmark files found on disk but missing from the index are adopted as new entries (sync-conflict files excluded); sibling markdown, archive, and attachment files found on disk are relinked to their bookmark.

Because each move follows that one bookmark's own recorded path rather than a glob/prefix match, a stray `0002-*.md` can never get relocated alongside, or confused with, some other id's `.html`/archive file, even if two bookmarks share a folder or similar-looking filenames.

**3. Keep or clean up entries whose files are missing.** If you delete a bookmark's `.html` file yourself (`rm`, a file manager, etc.) instead of through `liber -d` / `liber -s`, the index still points at it and thinks it exists. Plain `liber -r` keeps such entries as pending (safe for partial sync, listed on every run). With `liber -r --prune`, the entry is dropped, but its recorded Markdown/Archive/Attachment files (if they are still there) are **moved, not deleted**, into `<base_dir>/unindexed/markdown/...`, `<base_dir>/unindexed/archive/...`, and `<base_dir>/unindexed/attachments/...`, preserving their original relative path.

**4. Renumber to close id gaps (`--compact` only).** Plain `liber -r` never renumbers, so deleting id 2 of 1,2,3 leaves 1,3. With `liber -r --compact`, the remainder is renumbered to 1, 2, in existing order. It is a gap-closing compaction, not an alphabetical or any other kind of sort. Since ids are embedded in filenames (`0004-...` → `0003-...`), this physically renames each affected bookmark's HTML/markdown/archive/attachment files to match. That rename is done in two passes: every affected file is moved to a temporary staging name first, and only once all of them are staged does anything land on its final numbered name, so a bookmark moving into a lower id slot can never collide with, or get confused with, another bookmark's files, no matter how many ids shift in the same run. Compaction renames files and creates extra sync traffic, so only compact deliberately when syncing across devices.

