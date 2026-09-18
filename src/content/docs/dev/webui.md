---
title: Web UI and export internals
description: Server-side templates, reuse of CLI machinery, the write lock, pagination, and static export.
---

`liber --serve` (`webui.go`) is `net/http` plus `html/template` only: no router, no JS framework, no external assets. Every page is rendered server-side from Go string-constant templates parsed once at startup (`layoutTmpl`/`searchBodyTmpl`), the same pattern `render.go` already used for the html bookmark template. `html/template` (not `text/template`) is what makes this safe against XSS from bookmark content the tool doesn't control. A fetched page title or a description containing `<script>` gets escaped automatically on render, same guarantee the CLI already relies on for the per-bookmark html files.

**It deliberately reuses the CLI's own search machinery rather than reimplementing it**: `handleSearch` calls the exact same `Store.Search`/`filterDeep`/`SearchFields` that `-s`/`-sl`/`--deep` use, so web search behavior can't drift from CLI behavior. A scope checkbox maps directly to the same `n`/`u`/`t`/`d`/`f` letters as the CLI flags. `handleAdd` likewise reuses `addBookmarkToStore` and `resolveAutoRulesForNew` directly, so a web-added bookmark is indistinguishable from a CLI-added one: same automation handling, same html/markdown/archive file generation.

**Duplicate detection needed a different UI than the CLI's y/n prompt**, since a web request can't block on stdin. `handleAdd` renders the same search page with the add form re-shown, pre-filled with what was submitted, plus a hidden `confirm_dup=1` field and a relabeled submit button ("Yes, add anyway"). Resubmitting that exact form is the confirmation. This mirrors `findDuplicate`'s CLI behavior (default: don't add) without needing sessions, cookies, or JS. **Delete uses the identical pattern**: `POST /delete` without `confirm=1` never deletes anything. It renders a confirmation banner (via `renderDeleteConfirm`) with the id/confirm fields already present as hidden inputs, and only the second, explicit resubmission (with `confirm=1`) actually calls `deleteBookmarkFiles`/`store.Delete`. This is also why delete is a `<form method="post">` per row rather than a plain `<a href>`: a GET link can be prefetched or crawled by the browser itself, which would be disastrous for something destructive; a POST can't be triggered that way.

**Edit reuses the CLI's own edit machinery, not a parallel implementation**: `handleEditSave` calls the exact same `syncBookmarkFiles` (folder moves plus file relocation), `addMarkdownCopy`, and `addArchiveCopy` that `liber -e` uses. A web-edited bookmark's folder move physically relocates its files identically to a CLI edit, and "add markdown/archive if missing" behaves identically too (checkboxes only appear for whichever the bookmark doesn't already have, same "only ever adds, never overwrites" rule as the CLI). `GET /edit/{id}` and `POST /edit/{id}` share one handler (`handleEdit`), branching on `r.Method`. The GET path only reads (`store.Find` plus render), so it needs no lock; the POST path (`handleEditSave`) takes `writeMu` for its whole load-mutate-save sequence, same as add and delete.

**Concurrency is a genuinely new concern here that the CLI never had**: every CLI command is one process handling one request to completion, but `net/http` runs each request in its own goroutine. Without synchronization, two concurrent mutating requests could both load the same store state and the second `Save()` would silently overwrite the first (a classic lost-update race). This applies equally to add, edit, and delete, so all three take `writeMu sync.Mutex` around their entire load-mutate-save sequence. Read-only handlers (`handleSearch`, the GET branch of `handleEdit`, `handleArchive`, `handleMarkdown`) don't need it. This was fixed proactively (identified during design, not caught as a bug afterward) and verified with 5 sequential adds landing as ids 1-5 with no gaps or collisions. True parallel-goroutine stress testing wasn't achievable in the sandbox this was built in (background-process handling was unreliable there), so the guarantee rests on the mutex covering the whole critical section by construction, the standard correct fix for this class of race.

**Profile-awareness required zero extra code**: every handler calls `loadCfgAndStore()`, the same function every CLI command uses, which reads `config.json` fresh per call. The web UI therefore automatically reflects whichever profile is active, and even picks up a profile switch made via the CLI in another terminal on its very next request, without needing a server restart.

**Security default**: binds to `127.0.0.1:8080` unless `--addr` says otherwise; binding to anything else prints a warning, since this server has no authentication at all. Anyone who can reach it can read, add, edit, and delete anything in the collection.

## Static export

`liber --export-site [dir]` (`export_site.go`) writes a single `index.html` (under `<base_dir>/site` by default) listing every bookmark grouped by folder, with links to the html/markdown/archive/attachment files. Links are `filepath.Rel` paths from the output directory to each file, so the export works with any output dir, not just the default. It's a pure, regenerable projection: re-running overwrites, nothing in the export is data. It serves a different need than `--serve` (something to drop onto any static host or open off disk, with no liber process running), and it deliberately does not chase visual parity with the web UI.

## Settings page internals

`/settings` (`settings.go`) writes to `config.json` via `SaveConfig` under `writeMu`, the same mutex as the other mutating handlers. Detection of tools is pure `exec.LookPath` probing plus the chromium-family probe that already existed in `archive.go`; the detected string is informational only, the stored value is whatever the user typed (empty means default). Because every handler calls `loadCfgAndStore()` per request, a saved setting is live immediately, with no restart or session state.

The automation section reuses the same `createRule`/`editRule`/`applyRules` helpers that the `--auto` CLI commands now call (`automation.go`): the entire point of the refactor was to keep web and CLI behavior identical, including the backfill-on-add and reapply semantics. Anything automation-related should change those helpers, not copy logic into the handlers.

`base_dir` is editable here, with a note that it repoints the collection rather than moving anything: changing a dir setting just changes where future requests resolve paths, nothing more.

## Pagination

`paginate` (`webui.go`) is a pure function over an already-computed `[]*Bookmark`. It doesn't know or care whether that list came from a plain search, a scoped search, or `filterDeep`, which is what let pagination apply uniformly to all three without any special-casing in `handleSearch`. `webPageSize = 500` per what was asked: pagination is invisible (no controls rendered at all) for any result set of 500 or fewer, and only kicks in past that.

Page links (`pageURL`) are built by the handler, not the template, since `html/template` has no URL-construction helpers. `handleSearch` reconstructs `/` with the current `q`/`scope`/`deep` plus a new `page` value using `net/url.Values`. This is what makes paging through a scoped or deep search stay scoped/deep on every page, verified directly: a `?q=page&scope=n` search's "next" link carries both params forward unchanged.

**`renderSearchPageWithAddState` and `renderDeleteConfirm` (the views shown when a duplicate-add or a delete needs confirming) always show page 1 of the *entire unfiltered* list**, not whatever page/search the user was previously on. This is a deliberate simplification, not an oversight: it matches behavior `handleAdd` already had before pagination existed (a successful add already redirected to bare `/`, discarding any prior search state), so extending the same simplification to the confirmation views and to delete kept the three mutating paths consistent with each other rather than making add special-cased. Precisely preserving "which page of which search you were on" through a confirm-then-resubmit round trip would need the current query state threaded through as hidden form fields on every row's edit/delete controls; given these are transient, one-off confirmation screens rather than primary navigation, that precision wasn't worth the added form-field plumbing on every single result row.

## Markdown rendering, datalists, and card view

`renderMarkdownHTML` (`render.go`) is a small block/inline renderer for the notes format `writeMarkdownBookmark` produces: it strips the leading frontmatter block, then handles fenced code, headings, quotes, lists, and paragraphs, with bold/italic/code/links inline. Input is HTML-escaped first (including inside code fences), so the XSS guarantee matches the old `<pre>` view. `handleEditSave` validates the URL on the raw form value because `normalizeURL("")` returns `"https://"`, which would pass an emptiness check placed after normalizing. Tag/folder `<datalist>` options come from `Store.allTags`/`allFolders` per request, so they follow the active profile like everything else.

`/card/<id>` (`handleCard`) serves the saved card read-only, mirroring `handleArchive`. The two read-only additions since (card view, datalists) needed no lock and no schema change.

## Taxonomy page

`/tags` (`taxonomy_web.go`) reuses the extracted `renameTag`/`deleteTag`/`renameFolder` cores plus `tagCounts`/`folderCounts`, so CLI and web share behavior including merge-onto-rename and subfolder handling. Renames POST directly (CLI-identical); deletes carry the JS confirm used by rule delete. All four POSTs take `writeMu` and redirect with flash counts. Root (`/`) renders with forms that fail cleanly through the cores' own validation. Learn suggestions (`learnRows` over `suggestRules`, exported fields only since templates cannot read unexported ones) render above the lists and create through the shared `createRule`, hiding entirely once covered. The page also exposes the learn threshold tuning plus create-all action, and each automation rule carries its own apply button next to delete.

## History, open, and pick

`/history` renders the same ordered list as `liber --history`. `/open/<id>` records the visit through the same tracking write as `open.go` and the search `(o)` action, so `visited` sort stays consistent between web and CLI. `/pick?q=...` returns a matching URL as plain text and mirrors `pick.go` semantics (single match prints, prompts go elsewhere, no match is an error). All three are read only apart from the history write on open, so they need no lock beyond that single tracked update.

## Library and sync handlers

Import, static export, repo sync, and link health reuse the CLI cores rather than duplicating logic. The import handler accepts a file upload and runs the same Netscape parse plus silent duplicate skip as `--import`. The export handler runs the same projection as `--export-site` with the same default output directory. The sync handler runs the same commit plus optional push as `--sync`. The `/check` handler runs the same moved, dead, and uncertain classification as `check.go` with per item update, delete, and quarantine actions. Mutating POSTs take `writeMu`; read only views do not.

## Profiles page

`/profiles` (`profile.go` cores) lists, switches, creates, and deletes profiles the same way `liber --profile` does. Switching only changes `ActiveProfile` in `config.json`; it never touches bookmark data. Delete refuses the active profile and never deletes on-disk data, matching the CLI guard.

## Bulk actions

Bulk delete, bulk tag set, and bulk folder move reuse `deleteBookmarkFiles`, the tag core, and `syncBookmarkFiles` respectively, so file moves and rewrites behave exactly like their single bookmark CLI equivalents. Bulk delete carries the same two step confirm pattern as single delete (`confirm=1` on resubmission). All bulk POSTs take `writeMu` around the full load, mutate, and save sequence.
