---
title: "Mutations: taxonomy, history, batch"
description: Rename-is-merge, open tracking, and the id-spec batch machinery.
---

## Tag and folder hygiene

There's no separate "merge" command for `--tags`/`--folders`. Renaming *onto* a name that already exists **is** how merging is expressed: if a bookmark already has both the old and new tag, the rename just drops the old one (via `dedupe`) rather than creating a duplicate. Same idea for folders. Renaming `work` into an already-populated `personal` just combines them, since a folder is nothing but a shared string on each bookmark, not a distinct object with its own identity to merge.

Folder rename/delete affects subfolders too (`folderMatchesOrIsChild` and `renameFolderPrefix` in `taxonomy.go` handle the prefix matching) and physically moves files via the same `syncBookmarkFiles` helper `edit.go` uses for a single bookmark's folder change. Tag rename/delete calls `syncBookmarkFiles(cfg, b, false)` (folder unchanged) purely to get the html/markdown content rewritten in place to reflect the new tag text.

`--folders delete <f>` is implemented as `runFoldersRename(f, "")`, renaming to the root. There's no dedicated delete code path.

## History

`LastOpenedAt` and `OpenCount` on `Bookmark` are updated only by the `(o)` action in the search picker's action menu (`search.go`), meaning actually visiting the live URL. Opening a saved markdown copy `(m)` or archive `(a)` is deliberately not tracked as a "visit". It's a different kind of interaction (reviewing your own saved copy, not browsing).

## Batch operations

`-e` and `-d` both accept a single id or a spec (`idspec.go`): a comma-separated list of ids and/or `lo-hi` ranges, e.g. `1-5`, `2,5,3`, `1-4,7-9`. Reversed ranges (`5-2`) are swapped rather than rejected; duplicates from overlapping ranges or repeats are deduped; the result is sorted ascending for predictable display order (input order doesn't otherwise matter, since deleting or editing one id has no effect on any other).

**Shell-splitting gotcha**: `liber -d 1-4, 7-9` (unquoted, with a space after the comma) gets split by the shell into two argv entries, `"1-4,"` and `"7-9"`, *before* liber ever sees them. `consumeIDSpec` handles this by concatenating consecutive non-flag arguments (stopping at the first token starting with `-`) rather than only ever looking at a single argv slot, so the comma that's already attached to the first token joins cleanly with the second, reconstructing `"1-4,7-9"`. This was a deliberate defensive choice rather than requiring the user to quote the spec.

`-d` shows one aggregate confirmation for a multi-id batch (listing every title about to be deleted) rather than confirming per item; a single id keeps the original single-line confirmation unchanged. `-e` with flags (`-t`/`-f`/`-md`/`-a`) applies them to every matched bookmark silently, with no per-item prompts; `-e` with no flags at all runs the normal interactive edit once per matched bookmark in turn, printing a `n of N` header between them. Ids that don't exist in the store are collected and reported once at the end rather than aborting the rest of the batch.
