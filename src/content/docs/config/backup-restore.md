---
title: Backup and restore
description: Tarball format, restore safety, and per-frontend paths.
---

A backup is a `.tar.gz` holding `html/`, `markdown/`, `archive/`, `attachments/`, and the SQLite store plus a `manifest.json` (format version, device, time). `site/` and the search index are excluded as regenerable, and config is excluded so device identity and secrets stay local.

Restore validates the manifest and rejects absolute plus `..` entry paths before unpacking, refuses a non-empty library without `--force`, confirms unless `--yes`, then runs a full reindex to adopt files and rebuild search. Files the backup lacks stay on disk for reindex to adopt or quarantine, so restore never orphans content. No restart is needed afterward on any frontend: every handler opens the store per request from live config.

## Per frontend

```sh
liber backup library.tar.gz
liber restore library.tar.gz --force --yes   # --force with confirm, --yes skips it
```

Backup and restore are also in Settings on every frontend: a download button plus an armed restore with a size note (256 MiB cap over the API), and a Tauri IPC pair on desktop. CLI flow: [Backup and restore](/cli/backup-restore/). App settings: [Library settings](/app/library-settings/). Format internals: [Storage and reindexing](/dev/storage/).
