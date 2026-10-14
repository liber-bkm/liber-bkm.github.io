---
title: Terminal UI
description: The fuzzy picker, the full-screen editor, and interactive add.
---

Two full-screen interfaces ship in the CLI, both closed with `Esc` (`Ctrl-C` anywhere bails out).

## Picker

`pick [query]` type-to-fuzzy-filters the list; `Up`/`Down` move, `Enter` confirms, `Esc` cancels. A preview pane shows title, URL, description, tags, and folder. Confirming opens the action menu: open in browser, open archived copy, open notes, or edit. Without a terminal it degrades to a numbered list accepting numbers or UUID prefixes. One match skips interaction; piped output prints the bare URL for scripts.

```sh
liber pick rust            # filter by "rust", act on the choice
liber pick rust | xargs -I{} echo {}   # piped: prints the URL
```

## Full-screen editor

`edit` with no flags opens a ten-row form: title, URL, description, tags, folder, markdown toggle, archive toggle, archive backend cycle (`auto`, `builtin`, `browser`, `single-file`, `monolith`), attach path, detach selector. `Tab` moves between rows, `Space` toggles, `a`/`d` flip the artifact toggles, `Ctrl-S` saves, `Esc` discards. Changing the URL re-checks the duplicate guard; folder moves relocate files on disk.

## Interactive add

`add -i` runs a prompt loop: duplicate pre-check first (so answers are never wasted), then title (fetched page title as default), description, space-separated tags, folder, a markdown-notes confirm, then the normal create plus archive plus attach path, then an attachments menu loop (bare path attaches, `rm <num|name>` detaches, empty finishes). Flag values seed the prompt defaults. It refuses to run without a terminal instead of blocking on dead stdin. Single-URL flags (`--title`, `--description`, `--attach`, `-i`) are refused in bulk adds.

Direct flag edits are covered in [Editing](/cli/editing/); one-shot creation in [Adding](/cli/adding/).

Next: [Searching and opening](/cli/searching/).
