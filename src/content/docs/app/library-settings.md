---
title: Library settings
description: Profiles, import/export, backup/restore, reindex, and snapshots in Settings.
---

Settings on every graphical frontend (web settings page, desktop settings, Android settings) cover library maintenance without the terminal. A library status section leads: device plus profile, counts, health hints pointing at the quarantine folder and at prune plus compact reindex, and the last sync snapshot output.

- **Archive backends**: select the backend and point at external binaries. See [Archive backends](/config/archive-backends/).
- **Reindex**: repair the library with prune and compact options, plus a settings checkbox for id compaction. See [Storage layout](/config/storage/).
- **Import/export**: Netscape import with the archive option (failures as warnings), Netscape export, static site export. See [Importing](/cli/import-export/).
- **Profiles**: switch the active profile or untrack one; switching needs no restart. See [Profiles](/config/profiles/).
- **Sync snapshots**: snapshot button with push flag over the commit endpoint.
- **Sync exchange**: **Export bundle** downloads the pending changes as a file; carry it to the other device and **Import bundle** there to merge them in, with a notice reporting inserted, merged, deduped, deleted, and skipped counts. Replaying is idempotent, so importing the same file twice is safe. In remote mode the exchange runs against the server library instead of the local one. Direct device-to-server push and pull stay on the command line. See [Sync](/cli/sync/).
- **Backup and restore**: download button plus armed restore with a size note. See [Backup and restore](/config/backup-restore/).
- **Site icons**: refresh missing icons or re-fetch cached ones (icons cache with day-long headers; reload the library view after).
- **Appearance**: two layouts, Comfortable and Compact. Compact tightens the spacing of cards, table rows, and settings sections so more fits on small screens; text sizes stay the same for readability. Comfortable renders exactly as before and is the default. The choice lives on the device only, like the theme.
- **Remote fields** (mobile and desktop): server URL plus token for remote mode. See [Pairing](/app/pairing/).

`GET settings` also reports `maintenance_status` (bookmark, oplog, quarantine, and short-id gap counts) plus `version` (the daemon release). `auth_token` is never shown or set here; it stays CLI and env only.

Settings ends with an **About** section showing the app version and the frontend version side by side. Matching versions mean client and server agree; a flagged mismatch in remote mode means the server runs a different release than the app. The **Help** row links the documentation site.
