---
title: Attachments
description: Attach local files to bookmarks and manage them.
---

Attachments are any files associated with a bookmark: a PDF paper, a screenshot, a downloaded dataset, an extra snapshot of the page. They are stored alongside the collection and travel with the bookmark when it is edited, moved, or deleted.

Files are **copied** into `<base_dir>/attachments/` (moving or deleting the original afterwards changes nothing), named `<id>-<slug>.<ext>`, and tracked on the bookmark's index entry.

```sh
liber <url> -at paper.pdf        # attach at creation (repeatable)
liber -e <id> -at paper.pdf      # attach to an existing bookmark
liber -e <id> -dt paper.pdf      # detach by name or number (deletes the saved copy)
liber -i                         # interactive creation ends with an attachments menu
liber -e <id>                    # interactive edit opens the same menu
liber -s                         # pick a bookmark -> attachmen(t)s: open / add / rm
```

Interactive menu (same everywhere):

```text
attachments:
  1) notes.pdf
  2) paper.pdf
open <#> | add <path> | rm <#|name> | enter = done
```

Notes:

- Attaching the same filename twice keeps both copies (`0007-report-2.pdf`).
- `att` / `attN` badges in `-l`, `-s`, and the web UI show the count; the fzf preview lists files.
- Deleting a bookmark deletes its attachments. `liber -r` quarantines orphans to `<base_dir>/unindexed/attachments/` and renames on id compaction.
- Attachment contents are not searched; `--deep` covers archives only. Opening uses the OS handler.
