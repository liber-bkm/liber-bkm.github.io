---
title: Storage layout
description: How bookmark files are organized on disk.
---

Under the base dir (plus the active profile):

```text
html/            rendered bookmark pages
markdown/        notes copies
archive/         offline snapshots
attachments/     attached files (unique names)
.liber/store.db  SQLite index plus sync oplog
.liber/tantivy/  regenerable search index, excluded from sync
.liber/favicons/ cached per-host site icons
unindexed/       quarantine for review, never deleted by automation
site/            static export output, regenerable
```

Bookmark files are named `<uuid>-<slug>`, recorded per row, never globbed. The full UUID prefixes every file so names never collide across devices without coordination. Slugs come from the title at creation and never change on edit. Every filename and folder part passes the Windows reserved-name screen (`con`, `aux`, `com1`, trailing dots) on all platforms.

## Reindex

`reindex` repairs the collection: adopts orphan HTML by reading its own `liber:` meta tags, relinks sibling markdown and archives by shared basename, quarantines unreferenced attachments and conflict-named files to `unindexed/`, keeps missing-HTML rows pending unless `--prune`, and rebuilds the search index. Short-id gaps close only with `--compact-ids` (with `--prune`):

```sh
liber reindex --prune --compact-ids
```

The Settings reindex button and the API endpoint take the same prune and compact options. Storage internals: [Storage and reindexing](/dev/storage/). Directory overrides: [Configuration overview](/config/overview/).
