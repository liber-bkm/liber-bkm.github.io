---
title: Tags and folders
description: List, rename, merge, and delete tags and folders.
---

```sh
liber --tags                     # list tags with counts
liber --folders                  # list folders with counts
liber --tags rename <a> <b>      # rename; merges into <b> if it already exists
liber --tags delete <tag>        # remove tag everywhere
liber --folders rename <a> <b>   # same, for folders (subfolders follow)
liber --folders delete <folder>  # move its bookmarks back to the root
```

There is no separate merge command: renaming **onto** an existing name *is* the merge. If a bookmark already has both tags, the old one is dropped instead of duplicated. Folder renames physically move files, like editing a single bookmark's folder; tag renames rewrite HTML/markdown content in place so it stays consistent.

`--folders delete <f>` is implemented as renaming to root. Subfolders (`work/urgent`) follow their parent on rename and delete.
