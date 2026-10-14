---
title: Picker and interactive add
description: TUI picker, numbered fallback, and the add -i prompt loop.
---

`pick` prints the picked URL for scripting. With a TTY it opens a nucleo plus ratatui TUI (live fuzzy filter, keyboard navigation, preview pane); without one it falls back to a numbered prompt accepting numbers or UUID prefixes. Single matches skip interaction. No external binaries.

`add -i` reuses the same line-prompt helpers (`prompt_line`, `prompt_default`, `confirm`): duplicate pre-check first so prompt answers are never wasted, then title (fetched or flag value as default), description, space-separated tags, and folder, plus a markdown-notes confirm that sets the creation flag (content is edited afterwards), then the normal create plus archive plus flag-attach path, then an attachments menu loop (bare path attaches, `rm <num|name>` detaches, empty finishes). Flag values seed the prompt defaults. Refuses non-TTY instead of blocking on a dead stdin.
