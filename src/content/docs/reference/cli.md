---
title: CLI reference
description: Every liber command and flag, mirrored from liber --help.
---

Source of truth is `liber --help` (reference generated from `liber --help` v0.11.0; when in doubt the binary is the truth). Specs accept short numeric ids, UUID prefixes, comma lists, and dash ranges (`1-3,5`, at most 1000 ids per range). `--uuid` on any command shows full UUIDs instead.

```text
Usage: liber [OPTIONS] [COMMAND]

Commands:
  add            Add one bookmark, or several at once
  list           Search and list
  open           Open in browser, records history
  edit           Update fields, or full terminal editor with no flags
  delete         Delete with confirm
  reindex        Repair the library
  export         Static site or Netscape export
  import         Netscape import
  backup         Self-contained tarball of the library
  restore        Replace library from a backup
  init           First-run setup wizard
  tags           List, rename, delete tags
  folders        List, rename, delete folders
  auto           Automation rules
  history        Recently opened with open counts
  check          Link check
  archive        Archive a page
  attachments    List attachments
  sync           Bundle exchange, HTTP push/pull, snapshots, prune
  status         Library health in the terminal
  searches       Saved search presets
  config         Get, set, list configuration
  pick           Fuzzy TUI picker
  profile        Named base-dir profiles
  serve          Self host API plus web UI
  discover       List liber servers on the LAN
  completion     Shell completions

Options:
  -l, --list    Legacy list shortcut
  -s, --serve   Legacy serve stub
  --uuid        Show full UUIDs
  -h, --help    Print help
  -V, --version Print version
```

## add

```text
Usage: liber add [OPTIONS] <URL>...

Options:
      --title <TITLE>              Title (else fetched from the page, else the URL)
  -t, --tags <TAGS>                Tags
  -f, --folder <FOLDER>            Folder
      --description <DESCRIPTION>  Description
      --markdown                   Also write a markdown notes copy
      --archive                    Also save an archived copy
      --attach <ATTACH>            Attach a local file (repeatable)
  -i, --interactive                Prompt for missing fields (needs a terminal)
```


You can combine different flags such as `liber add --tag <tags> --folder <folder> <url>`. `liber add -i` opens interactive prompt to add url. Single add fetches the page title when `--title` is missing and falls back to the URL on failure. Duplicates print the existing entry and ask before continuing. Bulk add shares `--tags`, `--folder`, `--markdown`, and `--archive` across all URLs and reports `Added X, skipped Y duplicates, failed Z of N`; single-URL flags (`--title`, `--description`, `--attach`, `-i`) are refused in bulk.

## list

```text
Usage: liber list [OPTIONS] [QUERY]

Options:
      --sort <SORT>   newest|oldest|visited|title (default: newest, or relevance with a query)
      --deep          Also search saved page content and notes, with snippets
      --in <FIELDS>   Restrict bare words: title,url,tag,folder,desc (or letters n,u,t,d,f)
```

`[md]` and `[arch]` markers show notes and archives. Query terms accept `field:value` prefixes; see [Searching](/cli/searching/).

## open

```text
Usage: liber open <SPEC>
```

Falls back to search on miss (one match opens, several offer a pick). Records history.

## edit

```text
Usage: liber edit [OPTIONS] <SPEC>

Options:
  -u, --url <URL>                  Change URL (saved files rewritten, filenames kept)
      --title <TITLE>              Set title
      --description <DESCRIPTION>   Set description
  -t, --tags [<TAGS>...]           Set tags
  -f, --folder <FOLDER>            Move to folder
      --markdown                   Add a notes copy if missing
      --attach <ATTACH>            Attach a file (repeatable)
      --detach <DETACH>            Detach by number or name
```

With no flags, opens the full terminal editor (see [Terminal UI](/cli/terminal-ui/)).

## delete

```text
Usage: liber delete [--yes] <SPEC>
```

Asks for confirmation unless `--yes`.

## reindex

```text
Usage: liber reindex [--prune] [--compact-ids]
```

Adopt orphans, relink siblings, sweep conflicts, rebuild search. Missing files stay pending unless `--prune`; `--compact-ids` additionally needs `--prune` and closes short-id gaps to dense `1..N`.

## export

```text
Usage: liber export (--site [DIR] | --bookmarks <FILE>)
```

Static `index.html` with relative links (default dir), or a re-importable Netscape file.

## import

```text
Usage: liber import [--markdown] [--archive] <FILE>
```

Netscape import; duplicates skipped, archive failures reported as warnings.

## backup and restore

```text
Usage: liber backup <FILE>
Usage: liber restore [--force] [--yes] <FILE>
```

Self-contained tarball (content plus index plus manifest; `site/` and search index excluded). Restore refuses a non-empty library without `--force`, confirms unless `--yes`, then reindexes.

## init

```text
Usage: liber init
```

First-run setup wizard (base dir, device id, backend, token). Refuses when already configured, needs a terminal.

## tags and folders

```text
Usage: liber tags (list | rename <A> <B> | delete <TAG>)
Usage: liber folders (list | rename <A> <B> | delete <FOLDER>)
```

Tag rename merges onto existing tags; folder rename moves subtrees; folder delete moves bookmarks to root. Deletes go through the confirm flow.

## auto

```text
Usage: liber auto (add --match X [--folder F] [--tag T...] | list | edit <id> [...] [--reapply] | apply [id] | learn [--min N] [--create] | delete <id>)
```

Rules match `title:`/`host:` prefixes else URL substring, case insensitive. `learn` suggests rules from host clusters (`--create` asks per suggestion). Deleting a rule leaves classified bookmarks untouched.

## history

```text
Usage: liber history
```

Recently opened bookmarks with open counts.

## check

```text
Usage: liber check [OPTIONS] [SPEC]

Options:
      --apply                Bulk update moved URLs plus quarantine dead ones
      --workers <WORKERS>    Parallel requests [default: 12]
      --stale <DURATION>     Skip bookmarks checked within DURATION (720h, 7d, repeats; bare digits mean hours)
      --stale-hours <HOURS>  Deprecated alias for --stale
```

TTY apply prompts per item with retitle and delete options. `--apply` updates moved URLs (skipping targets already bookmarked), refetches titles, and quarantines dead ones; confirm-gated deletes ask first.

## archive

```text
Usage: liber archive [--backend builtin|browser|single-file|monolith|auto] <SPEC>
```

Explicit backends are strict; `auto` chains with warnings at each fallback.

## attachments

```text
Usage: liber attachments <SPEC>
```

List attachments with numbers.

## sync

```text
Usage: liber sync (export <FILE> [--since N] | import <FILE> | commit [--message T] [--push] | prune [--days N] | push <URL> [--token T] [--since C] | pull <URL> [--token T] [--since C])
```

Bundle exchange between devices, git snapshots (never inits a repo), HTTP push/pull against `liber-serve`, oplog prune (default 90 days). `--since` filters by oplog sequence; a clean tree reports nothing-to-commit in the body.

## status

```text
Usage: liber status
```

Prints the same library health the Settings page shows: device and active profile, bookmark, oplog, quarantine, and short-id gap counts, plus hints (review quarantine, close id gaps with reindex, or a clean bill of health). Takes no flags.

## searches

```text
Usage: liber searches ([list] | add <NAME> [--query Q] [--scope FIELDS] [--sort MODE] [--deep] | delete <NAME> | run <NAME>)
```

Saved search presets. `run` lists through the normal search path. Adds upsert case-insensitively; names cap at 64 chars; scope and sort validate against the same parsers as `list`. `--deep` stores the Deep toggle with the preset; `run` and the sidebar apply it like any other filter. See [Searching](/cli/searching/).

## config

```text
Usage: liber config (get <KEY> | set <KEY> <VALUE> | list)
```

See [Configuration overview](/config/overview/) for keys. `list` prints the whole config as JSON.

## pick

```text
Usage: liber pick [QUERY]
```

Fuzzy TUI picker with preview, then a menu (open, archived copy, notes, edit). Prints the URL when piped. Falls back to a numbered prompt without a TTY.

## profile

```text
Usage: liber profile (list | switch <NAME> | delete <NAME>)
```

Named base-dir profiles sharing one config. Delete untracks only, files stay.

## serve and discover

```text
Usage: liber serve [--addr 127.0.0.1:8080] [--auth-token TOKEN] [--static-dir DIR] [--qr] [--no-mdns]
Usage: liber discover [--timeout 5]
```

Serve prints localhost and LAN URLs. `--qr` prints a pairing code, mDNS advertises unless `--no-mdns`.

## completion

```text
Usage: liber completion <SHELL>
```

Shells: bash, zsh, fish, powershell, elvish.
