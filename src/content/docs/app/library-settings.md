---
title: Library settings
description: Profiles, import/export, backup/restore, reindex, and snapshots in Settings.
---

Settings on every graphical frontend (web settings page, desktop settings, Android settings) cover library maintenance without the terminal. A library status section leads: device plus profile, counts, health hints pointing at the quarantine folder and at prune plus compact reindex, and the last sync snapshot output.

- **Archive backends**: select the backend and point at external binaries. See [Archive backends](/config/archive-backends/).
- **Reindex**: repair the library with prune and compact options, plus a settings checkbox for id compaction. See [Storage layout](/config/storage/).
- **Import/export**: Netscape import with the archive option (failures as warnings), Netscape export, static site export. See [Importing](/cli/import-export/).
- **Profiles**: switch the active profile or untrack one; switching needs no restart. See [Profiles](/config/profiles/).
- **Sync snapshots**: snapshot button with push flag over the commit endpoint. Bundle exchange itself stays CLI. See [Sync](/cli/sync/).
- **Backup and restore**: download button plus armed restore with a size note. See [Backup and restore](/config/backup-restore/).
- **Site icons**: refresh missing icons or re-fetch cached ones (icons cache with day-long headers; reload the library view after).
- **Remote fields** (mobile and desktop): server URL plus token for remote mode. See [Pairing](/app/pairing/).

`GET settings` also reports `maintenance_status` (bookmark, oplog, quarantine, and short-id gap counts). `auth_token` is never shown or set here; it stays CLI and env only.
