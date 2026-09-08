---
title: CLI reference
description: Complete liber command and flag reference (v0.7.1).
---

Source of truth is `liber --help` / bare `liber`. This page mirrors it for search and copy-paste.

```text
liber - a small CLI bookmark manager

Usage:
  liber <url>                    save a bookmark
  liber <url> -i                 save interactively (prompts for description, tags, folder)
  liber <url> -md                also write a markdown copy
  liber <url> -a                 also write a full-page archive; backend is chosen by
                                   config archive_backend: auto (default) tries single-file,
                                   then monolith, then the built-in static snapshot
  liber <url> -md -a             both markdown and archive
  liber <url> -t tag-a tag-b     attach tags at creation time
  liber <url> -f subfold         save into a subfolder of the base directory
  liber <url> -at report.pdf     attach a file (repeatable; copied into the collection)
  liber -s                       search/browse bookmarks, open or edit them
  liber -sn / -su / -st / -sd / -sf
                                  same, but restricted to one field: title / url / tags /
                                  description / folder (combine freely, e.g. -sdf = folder+description)
  liber -sl                      force the plain prompt (skip fzf even if installed)
  liber -sld                     legacy prompt restricted to descriptions (mix -l with any of n/u/t/d/f)
  liber -s --deep                also full-text search inside archived pages (asks for a query
                                    first, then browses matches; combine with -sn/-sd/etc as usual)
  liber -sl --deep               same, forced to the plain prompt
  liber -s --sort <mode>         order results: newest, oldest, visited, or title
                                    (default orders by relevance: title match first)
  liber -l                       list all bookmarks with their ids
  liber -e <id>                  edit a bookmark interactively (also offers to add a
                                  markdown copy or archive if either is missing)
  liber -e <id> -t tag-a tag-b   set a bookmark's tags directly
  liber -e <id> -f subfold       move a bookmark to a different folder
  liber -e <id> -u <url>         change a bookmark's URL (the saved html/material
                                   is rewritten; filenames stay as they are)
  liber -e <id> -md              add a markdown copy if it doesn't have one yet
  liber -e <id> -a               add an archive if it doesn't have one yet
  liber -e <id> -at file.pdf     attach a file (repeatable)
  liber -e <id> -dt notes.pdf    detach an attachment by number or name (its saved
                                   copy is deleted; interactive edit lists the numbers)
  liber -e <ids> ...             <id> can also be a range/list: 1-3, 2,5,3, or 1-4,7-9 --
                                  applies the same flags (or interactive edit) to each
  liber -d <id>                  delete a bookmark (asks for confirmation)
  liber -d <id> -y               delete without confirmation
  liber -d <ids>                 <id> can also be a range/list, same as -e (one combined
                                   confirmation listing everything that will be deleted)
   liber -o <id>                  open a bookmark in the browser without the search menu
                                    (accepts ranges like -e/-d; counts as an open for
                                    --history, same as the search menu's (o) action)
   liber -o <query>               same, but looks the bookmark up by search text
                                    (one match opens directly, several offer a pick)
   liber pick <query>             print a matching bookmark's URL to stdout, for pipes
  liber -r                       reindex: drop entries whose files were deleted
                                  outside liber (quarantining any surviving
                                  markdown/archive copy into <base_dir>/unindexed/),
                                  and renumber remaining ids to close gaps
  liber -r --merge               merges the bookmarks incase of syncing using external tool
                                 or manually copy pasting bookmarks, no data is lost, ids are reindexed
                                 and duplicate urls are detected and prompted action 
  liber --import <path>          import a browser bookmark export (Netscape HTML format)
  liber --import <path> -md -a   same, also generating markdown/archives for each (slow)
  liber --tags                   list all tags with counts
  liber --tags rename <a> <b>    rename a tag everywhere (renaming onto an existing
                                  tag merges into it -- no separate merge command)
  liber --tags delete <tag>      remove a tag from every bookmark that has it
  liber --folders                list all folders with counts
  liber --folders rename <a> <b> rename a folder (and its subfolders) everywhere;
                                  physically moves each bookmark's files
  liber --folders delete <f>     move a folder's bookmarks back to the root
   liber --history                list bookmarks by most recently opened (via -s's (o) action)
   liber --check [ids]            check link health: report dead/moved/uncertain,
                                    then prompt per item (update, delete, quarantine, skip)
   liber --check --workers N      same, with N parallel requests (default 12)
   liber --check --stale 720h     same, skipping bookmarks checked within the duration
  liber --auto add --match <str> --folder <f> --tag <t1 t2>
                                   auto-classify new bookmarks whose url contains <str> (folder
                                   and/or tags; also applied once, immediately, to matching
                                   existing bookmarks -- a later manual move/edit always sticks)
                                   <str> may be prefixed: "host:example.com" matches only the
                                   host, "title:docs" only the title; bare is url as before
  liber --auto                   list automations and how many bookmarks each has classified
  liber --auto edit <id> [--match x] [--folder y] [--tag t1 t2] [--reapply]
                                  change a rule; --reapply re-syncs bookmarks it already
                                  classified (skipping any since manually moved/retagged)
  liber --auto delete <id>       remove a rule (bookmarks it already classified are untouched)
   liber --auto apply [<id>]      re-run one rule, or all of them, against existing bookmarks
   liber --auto learn             suggest host rules from folder clusters
                                    (default: hosts with 3+ bookmarks in one folder)
   liber --auto learn --min N --create
                                    tune the threshold, or create all without asking
  liber --sync                   commit the collection, if <base_dir> is inside a jj or git repo
  liber --sync -p                same, then push
  liber --profile                list profiles (base_dir subfolders that isolate a whole
                                  collection: bookmarks, tags, folders, automations, everything),
                                  marking the active one
  liber --profile <name>         switch to <name>, creating it first if it's new
  liber --profile default        switch back to using <base_dir> directly (no profile)
  liber --profile delete <name>  stop tracking a profile (its folder and data are untouched)
  liber config                   show the active config file and its path
  liber config set <key> <val>   set one config key (validated before writing)
  liber -v                       print the version
  liber --serve                  local web UI at http://127.0.0.1:8080 -- search (with the
                                   same scoping/deep options as -s), plus add, edit, delete,
                                   and a settings/gear page (tools, dirs, backends, rules)
  liber --serve --addr <host:port>
                                   use a different address (non-loopback prints a warning:
                                   it exposes read/add/edit/delete access, no login)
  liber --export-site [dir]      write a static, browsable index.html of the whole
                                   collection (default <base_dir>/site); links point at
                                   your existing html/markdown/archive/attachment files
  liber completion bash|zsh|fish print the completion script for your shell

Flags may be combined, e.g.:
  liber https://example.com -i -t news reading -f articles -md -a

liber -s uses fzf for picking if it's installed on PATH (title/url/tags/folder
on the left, a markdown/archive/attachment presence badge, and a full detail
preview -- including description -- on the right), otherwise falls back to a
plain numbered prompt. Use -sl to force the plain prompt regardless of whether
fzf is installed. Either can be narrowed to specific fields with the n/u/t/d/f
letters shown above.

Attachments are local files copied into <base_dir>/attachments (any type: PDFs,
extra snapshots, downloads); "-i" prompts for them, the search menu's
attachmen(t)s action opens/manages them, and badge "att"/"attN" shows the count.

Adding a bookmark whose URL normalizes to one you already have (ignoring
trailing slashes, tracking params, and default ports) asks before adding a
duplicate; liber --import skips likely duplicates automatically instead.

Config lives at $XDG_CONFIG_HOME/liber/config.json (created on first run).
```

Search behavior notes from `--help`:

- `liber -s` uses fzf if on `PATH` (title/url/tags/folder plus badges plus detail preview), else a plain numbered prompt; `-sl` forces plain.
- Attachments live in `<base_dir>/attachments`; badges `att`/`attN` show counts.
- URL dedupe ignores trailing slashes, tracking params, and default ports: add prompts, `--import` skips silently.
- Config: `$XDG_CONFIG_HOME/liber/config.json` (created on first run).
