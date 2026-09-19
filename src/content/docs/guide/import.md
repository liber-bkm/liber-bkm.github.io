---
title: Importing and exporting
description: Import browser bookmark exports into liber, and write portable exports back out.
---

liber imports bookmarks from your browser's exported bookmarks file (the Netscape HTML format that Firefox, Chrome, and Safari all produce), bringing folders, tags, and descriptions along with the URLs.

```sh
liber --import <path>            # import Netscape HTML export
liber --import <path> -md -a     # also generate markdown/archives (slow for large files)
```

- Folders in the export become folders in liber (`Parent/Child` for nesting). Firefox per-bookmark `TAGS` and descriptions are picked up.
- Each import creates a normal HTML file, as if via `liber <url>`.
- URLs that normalize to an existing bookmark are skipped silently (no per-item prompt), so re-running on a refreshed export won't duplicate. Entries without `HREF` are skipped. Both counts are reported.

## Exporting

```sh
liber --export-bookmarks <path>   # write the collection as a re-importable export
```

Writes the whole collection as a browser bookmark export in the same Netscape HTML format `--import` reads: folders become nested folders, tags become `TAGS`, descriptions become `<DD>` notes. Re-importing an export restores every URL, title, tag, folder, and the first line of each description; bookmark ids are reassigned, so an export preserves content, not identity. The same file is one click away in the web UI (settings, Library section) and is the recommended portable backup: download it, and a fresh liber anywhere (including a reinstalled Android app) restores everything through `--import` or the web upload.
