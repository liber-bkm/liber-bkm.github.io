---
title: Importing and exporting
description: Browser import, Netscape export, and static site export from the command line.
---

## Import

```sh
liber import bookmarks.html                # Netscape import, duplicates skipped
liber import bookmarks.html --archive      # also archive each page (slow)
liber import bookmarks.html --markdown     # also write notes copies
```

Archive failures are reported as warnings, not errors, and the API, desktop app, and web settings form all carry the same `archive` flag. Anything automation cannot place safely lands in `unindexed/` for review instead of being dropped.

## Netscape export

```sh
liber export --bookmarks backup.html
```

Writes the collection as a re-importable Netscape bookmark file.

## Static site export

```sh
liber export --site ./site-dir
```

Writes one browsable `index.html` with relative links for hosting or offline use. The `site/` output is regenerable and excluded from backups and sync.

In the apps: import and export live in Settings with the same archive option. See [Library settings](/app/library-settings/).

Next: [Automation](/cli/automation/).
