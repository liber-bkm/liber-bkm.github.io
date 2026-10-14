---
title: Attachments
description: Manage bookmark files from the command line.
---

Attach any local files to a bookmark: reports, PDFs, images, datasets. Files are copied into the collection under `attachments/` with unique names, so the originals can move or disappear.

```sh
liber add https://example.com --attach report.pdf --attach data.csv
liber attachments 3            # list attachments with numbers
liber edit 3 --attach new.pdf
liber edit 3 --detach report.pdf   # by number or name; deletes the saved copy
```

Attachments ride along with sync as path references (binaries travel over folder sync; the merge bundle carries the metadata), and the API and desktop app upload and download through the same endpoints. Unreferenced attachment files are quarantined to `unindexed/` by reindex, never deleted blindly.

In the apps: every bookmark has an **Attachments** tab (next to Archive) listing each file (select a name to open it), with upload and remove; the edit form manages files too, under Artifacts and Files. See [Finding in the apps](/app/finding/).

Next: [Tags and folders](/cli/tags-folders/).
