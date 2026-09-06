---
title: Importing
description: Import browser bookmark exports into liber.
---

liber imports bookmarks from your browser's exported bookmarks file (the Netscape HTML format that Firefox, Chrome, and Safari all produce), bringing folders, tags, and descriptions along with the URLs.

```sh
liber --import <path>            # import Netscape HTML export
liber --import <path> -md -a     # also generate markdown/archives (slow for large files)
```

- Folders in the export become folders in liber (`Parent/Child` for nesting). Firefox per-bookmark `TAGS` and descriptions are picked up.
- Each import creates a normal HTML file, as if via `liber <url>`.
- URLs that normalize to an existing bookmark are skipped silently (no per-item prompt), so re-running on a refreshed export won't duplicate. Entries without `HREF` are skipped. Both counts are reported.
