---
title: Searching and opening
description: Interactive search, field scoping, deep archive search, listing, opening, and history.
---

```sh
liber -s                       # search everything (fzf live preview if installed)
liber -sn / -su / -st / -sd / -sf   # scope to title / url / tags / description / folder
liber -sdf                     # scopes combine freely (folder + description here)
liber -sl                      # force the plain prompt even with fzf installed
liber -s --deep                # also full-text search inside archived pages
liber -l                       # list all bookmarks with ids
liber -o 3                     # open bookmark 3
liber -o 1,3-8                 # open several (same range/list syntax as -e/-d)
liber --history                # recently opened, most recent first
```

Picking a bookmark in `liber -s` opens an open / edit / delete menu.

## fzf vs plain prompt

- With `fzf` installed, `-s` shows a live preview (title, URL, tags, folder, badges). Without it (or with `-sl`), you get a plain numbered prompt.
- Known asymmetry: default fzf search covers title/url/tags/folder, while the plain prompt's default also covers description. Scope explicitly with `-sn/-su/-st/-sd/-sf` when it matters.

## Deep search

`--deep` adds archive content as an extra match surface on top of whatever scope is active: it never narrows, only widens. You are prompted once for a literal query, then browse the matches in fzf or the plain picker.

## History

Only visiting the live URL counts as an open (`-o` or the search menu's `(o)` action). Opening your own saved markdown copy or archive is not tracked.
