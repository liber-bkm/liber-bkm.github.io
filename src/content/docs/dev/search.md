---
title: Search internals
description: Flag grammar, the fzf integration protocol, and deep search control flow.
---

## Search scoping

`main.go`'s `parseSearchFlag` recognizes `-s`, `-sl`, and combinations:

```text
-s               search everything (fzf if available)
-sl              same, but force the plain prompt
-s[nutdf]+       restrict to specific field(s): n=title, u=url, t=tags, d=description, f=folder
-sl[nutdf]+      same restriction, forced to the plain prompt
```

Letters combine freely and in any order (`-sdf` and `-sfd` are equivalent). `SearchFields` (in `store.go`) is the shared representation threaded through both the plain-prompt path (`Store.Search`, plain substring matching per selected field) and the fzf path (`withNthFor`, see below).

## fzf integration

`liber -s` uses fzf when it's available. This section covers the mechanics.

### Field layout

`fzf.go` feeds fzf tab-delimited lines with a fixed 7-field layout:

```text
1: id (always hidden -- lookup key only)
2: title      3: url         4: tags
5: folder     6: description 7: badges (always visible)
```

Field 1 (id) is never displayed; it exists purely so the preview callback and post-selection parsing can identify a bookmark exactly, without guessing from displayed text.

### `--with-nth` ties display and match scope together

fzf's `--with-nth` controls **both** what's displayed **and** what's fuzzy-matched. Restricting to a field also restricts search to it, which is exactly what field-scoped search (`-sn`/`-sd`/`-st`/`-sf`/`-su`) relies on (`withNthFor` in `fzf.go` computes the field-index list per scope).

The flip side: this is also why the **default**, unrestricted `-s` scope (title/url/tags/folder, `--with-nth=2,3,4,5`) doesn't include description, even though the plain-prompt fallback's default *does* search description. Including description in the default fzf scope would force it into the visible columns too (there's no way with `--with-nth` alone to match on a field without displaying it), so the two search paths have a small, known asymmetry here. Field 7 (badges) is always appended to whatever `--with-nth` value is computed, since it's presence-at-a-glance info, not something you'd want to search by.

### The `--delimiter` gotcha

**`--delimiter` needs the regex escape `\t` (backslash, t, two characters), not a literal tab byte**, when combined with `--nth`/`--with-nth`. Passing a literal tab silently breaks all matching (fzf just returns no results, no error). This was confirmed directly against a real fzf binary: a literal-tab delimiter matched nothing, and the same command with `--delimiter='\t'` worked immediately. `fzf.go` builds the flag as `"--delimiter=\\t"` (a literal `\` followed by `t` in the resulting argument string) for exactly this reason.

### Preview callback

The right-hand preview pane is rendered by fzf shelling back into the liber binary itself: `--preview '<path-to-liber> __preview {1}'`, where `{1}` is fzf's placeholder for the raw (never display-transformed) first field, the hidden id. `main.go` routes the internal `__preview <id>` subcommand to `preview.go`'s `runPreview`, which re-reads the index and prints a labeled Title/URL/Tags/Folder/Description block. `selfPath()` uses `os.Executable()` to get an exact path to the running binary rather than assuming `liber` is on `PATH`.

This pattern (shell back into your own binary for a preview) is how most non-trivial fzf integrations handle rendering something fzf itself can't compute. A typical example is git log pickers doing `--preview 'git show {1}'`.

### fzf's stdout is always the raw line

Regardless of `--with-nth`, fzf's stdout on selection is the full original input line, not the display-transformed version. `pickWithFzf` relies on this: it always splits the returned line on tab and reads field 0 (the id), even when `--with-nth` was hiding most of the other fields from view.

### Exit code handling

fzf exit codes: `0` means picked something, `1` means no match, `130` means interrupted (Esc/Ctrl-C). `1` and `130` are both treated as "user cancelled, not an error". Anything else (fzf's own `2`, which covers things like no controlling terminal) is treated as a genuine failure and returned to the caller, which falls back to the plain prompt with a visible message rather than silently doing nothing. This was a real bug caught during testing: a no-TTY environment produced exit 2, which an earlier version of this code was lumping in with "cancelled", making `-s` silently do nothing.

## Deep search

`liber -s --deep` and `liber -sl --deep` add archive content as a second match surface, on top of whatever field scope (`-sn`/`-sd`/etc, or the default) is already active. A bookmark matches if its scoped metadata matches **or** its archive content does; `--deep` never narrows what field scoping already restricts, it only adds an extra way to match.

`extractArchiveText` (`deepsearch.go`) is a best-effort, dependency-free HTML-to-text pass: strip `<script>`/`<style>` blocks first (their content is markup/code, not page text), then strip every remaining tag, then HTML-unescape what's left. This isn't a real text extractor. Inline `style="..."` attributes, SVG contents, and similar are simply removed along with their enclosing tag, which is a feature here as much as a limitation: single-file archives typically inline images as base64 data URIs inside tag attributes (e.g. `<img src="data:...">`), and stripping the whole tag conveniently discards that bulk along with the markup, rather than searching in it. Reads are capped at `maxArchiveScanBytes` (5MB) per file as a defensive limit against pathologically large archives. A bookmark with a huge archive is only partially scanned past that point.

**Why deep search needed its own control flow, not just a flag threaded into the existing one:** the existing fzf path relies on fzf itself doing live, interactive fuzzy-filtering as the user types inside the picker. There's no upfront "query" on liber's side ever. Deep search is the opposite: matching archive content requires a concrete literal string to grep for *before* any list can be shown at all. The fix is `promptDeepQuery`, called once by both `runSearch` and `runSearchLegacy` when `deep` is set, producing a fixed candidate list that's then handed to either `runSearchFzfList` (fzf over a static list, no live requery) or `runPlainListLoop` (the plain picker over the same static list). The non-deep path's `runSearchFzf`/`runSearchPrompt` instead keep re-fetching `store.All()` or re-prompting on every loop iteration, since there's no expensive upfront computation to avoid repeating there.

This split also fixed a real bug caught during testing: an earlier version threaded a `deep` bool straight into the original `runSearchFzf`, which prompted for the deep query *inside* the fzf-attempt function. When fzf then failed at runtime (e.g. no controlling terminal) and control fell through to the plain-prompt fallback, that fallback had no memory of the already-typed query and asked for it again, so the user had to type the same (potentially expensive) query twice. Separating "compute the candidate list once" from "which UI browses it" fixed this: the query is now asked exactly once per invocation, before either UI is attempted.

## Open by name and pick

`liber -o` (`open.go`, `main.go`) tries `parseIDSpec` first; when the spec contains anything outside `[0-9, -space]` it is treated as a search query instead (`isQuerySpec`, multi-word argv joined with spaces). One match opens directly through the shared `markOpened` helper (same history write as ids); several go to fzf or a capped (30) plain prompt. `liber pick` (`pick.go`) is the scriptable twin: single match prints the URL to stdout, prompts and progress go to stderr, and no match exits non-zero with stdout untouched.

Both share `searchTargets`/`capShown`/`pickFzfTarget` (`query.go`); only the prompt UI differs (stdout vs stderr), which is why the prompts stay separate.

## Ranking and sort

`Store.Search` takes a `SortMode` (`store.go`): default relevance scores title-prefix 0, title-substring 1, other matched fields 2, ties by ID. Explicit modes (`ParseSortMode`) order by `CreatedAt`, `LastOpenedAt` (nil sorts last), or lowercased title. `filterDeep` shares `orderResults`, archive-only matches scoring like other fields. The fzf path is intentionally unsorted (fzf re-scores input itself); `--sort` mainly affects the plain prompt, web UI, `-o`, and `pick`. CLI threads the mode from `--sort`, web from the `sort` param (invalid values fall back to relevance).
