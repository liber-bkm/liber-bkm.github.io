---
title: Static site export
description: Generate a browsable static index of the collection.
---

```sh
liber --export-site            # writes <base_dir>/site/index.html
liber --export-site /tmp/site  # or any directory
```

Generates one `index.html` grouped by folder, each entry linking to its HTML file with badges for markdown, archive, and attachments. Links are relative (`../html/...`), so it works off disk or on any static host next to the collection.

Regenerable output, not data: rerun after changes, delete freely. Nothing under `site/` is managed or reindexed. Use `--serve` for a live app, `--export-site` for something to drop on a static host with no process running.
