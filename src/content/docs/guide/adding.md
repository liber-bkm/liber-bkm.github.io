---
title: Adding bookmarks
description: Create bookmarks interactively or in one shot, with markdown, archives, tags, folders, and attachments.
---

```sh
liber <url>                          # basic save
liber <url> -i                       # interactive: prompts for title, tags, subfolder
liber <url> -md                      # also write a markdown copy (personal notes)
liber <url> -a                       # also write a full-page archive (needs single-file)
liber <url> -t tag-a tag-b           # space-separated tags
liber <url> -f folder-name           # subfolder of the base directory
liber <url> -at report.pdf           # attach a local file (repeatable)
liber <url> -i -t news -f articles -md -a  # everything combined
```

## Markdown copies vs archives

- **Markdown** is for your own notes and description per bookmark, not a page conversion. You can add it later with `liber -e <id> -md`.
- **Archive** is a full-page snapshot via `single-file-cli`. You can add it later with `liber -e <id> -a`.
- Each bookmark's HTML, markdown, and archive share the same id-slug basename and point at each other in the index. Adding a missing copy reuses the original basename, never overwrites an existing one.

## Duplicate detection

Adding a URL that normalizes to an existing one (case-insensitive host, default ports stripped, trailing slash and tracking params like `utm_*`, `fbclid`, `gclid` ignored, fragment dropped) warns and asks before adding. `liber --import` skips duplicates silently instead.
