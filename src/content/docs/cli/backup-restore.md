---
title: Backup and restore
description: Self-contained tarballs of the library from the command line.
---

```sh
liber backup library.tar.gz
liber restore library.tar.gz            # refuses a non-empty library without --force
liber restore library.tar.gz --force --yes
```

A backup is a `.tar.gz` holding `html/`, `markdown/`, `archive/`, `attachments/`, and the SQLite store plus a `manifest.json` (format version, device, time). `site/` and the search index are excluded as regenerable, and config is excluded so device identity and secrets stay local.

Restore validates the manifest and rejects absolute plus `..` entry paths before unpacking, confirms unless `--yes`, merges over existing trees, then runs a full reindex to adopt files and rebuild search. Files the backup lacks stay on disk for reindex to adopt or quarantine, so restore never orphans content. No restart is needed afterward on any frontend. See [Backup and restore](/config/backup-restore/) for the format details.

In the apps: backup and restore are also in Settings on every frontend. See [Library settings](/app/library-settings/).

Next: [Serving the library](/cli/serving/).
