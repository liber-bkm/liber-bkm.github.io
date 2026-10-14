---
title: Adding bookmarks
description: One-shot and interactive add from the command line.
---

## One-shot add

```sh
liber add https://example.com -t reading --folder tech
```

Useful flags: `--title` (else the title is fetched from the page, falling back to the URL on any failure; empty titles are never stored), `-t` tags, `--folder`, `--description`, `--markdown` (save a markdown notes copy), `--archive` (save an archived copy), and repeatable `--attach <file>` (copy a local file in at creation).

## Interactive add

`add -i` prompts for missing fields in a loop: title (fetched or flag value as default), description, space-separated tags, folder, a markdown-notes confirm, a duplicate pre-check, and an attachments menu (bare path attaches, `rm <num|name>` detaches, empty finishes). Flag values seed the prompt defaults. It needs a terminal and refuses non-TTY input instead of blocking on a dead stdin.

## Duplicate guard

Adding an existing URL returns the existing entry instead of a second copy. The API answers 409 with the existing entry (`confirm_dup` accepts idempotently); the web UI add dialog shows the same choice. See [Adding in the apps](/app/adding/).

## Several URLs at once

`add` takes several URLs at once: shared `--tags`, `--folder`, `--markdown`, and `--archive` apply to all, and the report reads `Added X, skipped Y duplicates, failed Z of N`. Single-URL flags (`--title`, `--description`, `--attach`, `-i`) are refused in bulk. Duplicates report as skipped, never prompt.

## Archive at creation

`--archive` snapshots the page through the configured `archive_backend`. See [Archive backends](/config/archive-backends/).

In the apps: adding works through the add dialog with the same options. See [Adding in the apps](/app/adding/).

Next: [Searching and opening](/cli/searching/).
