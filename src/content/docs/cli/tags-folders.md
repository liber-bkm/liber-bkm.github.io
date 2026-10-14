---
title: Tags and folders
description: Listing, rename-is-merge, deletes, and subfolder behavior from the command line.
---

Tags are free-form labels, folders are a tree. Both can be set at creation (`-t`, `--folder`) and changed later, and automation rules can set both.

```sh
liber tags list
liber tags rename old-name new-name     # merges onto new-name if it already exists
liber tags delete stale-tag             # removes it from every bookmark that has it
liber folders list
liber folders rename tech tech/old      # moves the subtree; files relocate on disk
liber folders delete obsolete           # moves its bookmarks back to the root
```

Rename semantics are deliberate: renaming a tag onto an existing tag merges the two, and renaming a folder moves its whole subtree (including files on disk). Deleting a rule or taxonomy entry never touches already-classified bookmarks.

In the apps: tags and folders pages use the same merge semantics, plus bulk set-tags and move-folder actions over multi-select. See [Organizing in the apps](/app/organizing/).

Next: [Importing and exporting](/cli/import-export/).
