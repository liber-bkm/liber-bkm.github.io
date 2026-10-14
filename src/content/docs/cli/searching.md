---
title: Searching and opening
description: Scoped field:value search, deep search, open, pick, and history from the command line.
---

## Search syntax

Terms accept `field:value` prefixes (`title:`, `url:`, `tag:`, `folder:`, `desc:`, with `tags:` and `description:` synonyms), combined with free words; every term must match. Quote multi-word values (`tag:"rust web"`). A bare word searches all fields. There is no `content:` prefix by design: saved page content is searched only for bare words under deep search.

Restrict bare words with `--in` on the CLI, the `scope` API parameter, or the Library field selector (names or letters `n,u,t,d,f`). Prefixes always win for their own term. The same syntax works in `list`, `open`, the `pick` and web search boxes, and desktop and mobile search.

```sh
liber list tag:rust web        # tag rust plus the free word "web"
liber list --in title,url riscv
liber list --sort visited      # newest (default), oldest, visited, title; a query ranks by relevance
```

Results list newest first by default and relevance ranked when a query is given (`--sort` overrides). `[md]` and `[arch]` markers show notes and archives.

## Deep search

`list --deep` also searches saved page content and notes, with match fragments. Extraction strips page chrome (nav, aside, footer) and keeps substantial text blocks; notes index by body only, frontmatter excluded.

## Saved search presets

Name a `query plus scope plus sort` shortcut once, replay it anywhere (CLI, API, sidebar, Settings):

```sh
liber searches add daily --query "tag:rust" --scope title,desc --sort newest
liber searches list
liber searches run daily     # lists through the normal search path
liber searches delete daily
```

Adds upsert case-insensitively; names cap at 64 chars; scope and sort validate against the same parsers as `list`. Presets are device-local UI state stored in the config file, never synced.

## Open

```sh
liber open 3            # by short id
liber open a1b2c3d4     # by UUID prefix
liber open rust riscv   # falls back to search on miss: one match opens, several offer a pick
```

Opening records history with open counts; `liber history` lists recently opened bookmarks.

## Pick

`pick [query]` is the fuzzy terminal picker with preview: filter live, navigate with the keyboard, then open, view the archived copy or notes, or edit. With no terminal it falls back to a numbered prompt accepting numbers or UUID prefixes, and single matches skip interaction. When piped, it prints the URL for scripts. See [CLI reference](/reference/cli/) for the full flag list.

In the apps: the Library search and the `Ctrl+K` command palette cover the same ground. See [Finding in the apps](/app/finding/).

Next: [Editing and deleting](/cli/editing/).
