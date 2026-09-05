---
title: Data model and reindexing
description: Bookmark records, filename rules, orphan cleanup, id compaction, and why there is no database.
---

## Records carry their own paths

Every bookmark's `HTMLFile` (always present), `MarkdownFile`, and `ArchiveFile` are relative paths stored individually on that bookmark's own record. There is no filename-pattern or glob matching anywhere in the codebase to relate one bookmark's files to another's. Every operation that touches a bookmark's files follows its own recorded path. That single invariant is what makes the features below safe: a stray `0002-*.md` can never get paired with, or moved alongside, some other id's `.html`/archive file, because nothing ever goes looking for files by pattern.

Filenames follow `%04d-<slug>` (id plus a slugified title, e.g. `0007-my-title.html`). The basename is fixed at creation time (`create.go`'s `addBookmarkToStore`) and is **never re-slugged** by an edit. Editing only ever moves the *directory* (on a folder change) and never renames the file to match a new title. `edit.go`'s `sharedBase` depends on this: when adding a markdown/archive copy to a bookmark that didn't have one, it derives the shared basename from the existing HTML file rather than re-deriving a slug from the (possibly since-edited) title, so all three file kinds for one bookmark always share the same basename.

## Reindex runs two passes

`liber -r` runs two independent passes, in order.

**1. Orphan cleanup.** For each indexed bookmark, check its recorded HTML path. If it's gone (deleted outside liber, e.g. via `rm` or a file manager), drop the index entry. If its recorded Markdown/Archive file is still there, move it (don't delete it) into `<base_dir>/unindexed/{markdown,archive}/<same relative path>`. This uses the exact path already recorded on that specific bookmark, never a prefix/glob match, which is why the data-model invariant matters here. Bookmarks whose HTML is still present are left alone, except that a Markdown/Archive reference pointing at a file that's *also* gone gets cleared (nothing to move, it's already gone).

**2. Id compaction.** Surviving bookmarks are renumbered to close gaps left by deletions (e.g. ids 1,2,4 become 1,2,3), in their existing order. Since ids are embedded in filenames, this means physically renaming files. The renaming is done in two phases, implemented in `reindex.go`'s `compactIDs`:

1. **Stage**: every affected file (across all bookmarks being renumbered) is moved to a temporary staging name first.
2. **Commit**: only once *everything* has been staged does anything get moved to its final, renumbered name.

Why two phases instead of just renaming in id order: staging first means there's no ordering to reason about. A bookmark moving to id 3 can't collide with another bookmark's file that hasn't been moved off id 3 yet, because nothing lands on a final name until every source file involved in the whole batch has already been moved out of the way. (An ascending-order single-pass rename would actually also be provably safe here, since new ids are always less than or equal to old ids, so processing in ascending order never creates a collision. The staged version doesn't require that argument to hold for correctness, which makes it more robust against future changes to the processing order.)

## Why not a database

Id-renumbering (the thing that might have motivated a real database) is fully solved in plain Go by the staged-rename approach above, so there was never a technical need to take on a CGO or large pure-Go SQL dependency for a single-user local tool. Flat JSON plus files keeps the collection readable, diffable, greppable, and trivially synced with git.
