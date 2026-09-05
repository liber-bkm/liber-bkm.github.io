---
title: Editing and deleting
description: Edit bookmarks, change URLs, backfill markdown/archives, and batch operations.
---

```sh
liber -e <id>                  # edit interactively (also offers missing markdown/archive)
liber -e <id> -t tag-a tag-b   # set tags directly
liber -e <id> -f subfold       # move to another folder (files move on disk)
liber -e <id> -u <new-url>     # change URL (saved copies rewritten, filenames kept)
liber -e <id> -md              # add markdown copy if missing
liber -e <id> -a               # add archive if missing
liber -d <id>                  # delete (asks for confirmation)
liber -d <id> -y               # delete without confirmation
```

## Batch operations

`<id>` accepts ranges and lists: `1-3`, `2,5,3`, `1-4,7-9`. Reversed ranges are swapped, duplicates deduped, results sorted ascending.

- `liber -e 1-3 -md` adds markdown copies to 1–3 silently.
- `liber -e` with no flags edits each match interactively in turn (`n of N` header).
- `liber -d 1-4,7-9` shows one aggregate confirmation listing every title. Unknown ids are reported once at the end without aborting the batch.

:::tip
Quote the spec if your shell splits on spaces (`liber -d "1-4, 7-9"`): liber also reassembles `1-4, 7-9` defensively.
:::
