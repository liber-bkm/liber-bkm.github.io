---
title: Search internals
description: Scoped parser, tantivy index, readability, snippets, and favicons.
---

The tantivy index lives at `<base>/.liber/tantivy/`, regenerable, excluded from sync. Fields: title, description, url, tags, folder, content (extracted archive and markdown text). Sort modes: relevance, newest, oldest, visited, title. `resolve_sort_mode` picks the default: an explicit sort always wins, an empty or missing query lists newest first, and a query ranks by relevance. All list surfaces (CLI, API, Tauri) share it, and the web Library preselects newest. If the index is missing or corrupt, reads fall back to SQLite LIKE and `liber reindex` rebuilds it.

## Scoped parser

Scoping lives in one core parser (`parse_query_terms`): whitespace split with double-quote grouping, `field:value` prefixes (`title`, `url`, `tag` plus `tags`, `folder`, `desc` plus `description`, all case insensitive), unknown or empty prefixes kept as literal text. Terms combine with AND; bare words match all five metadata fields. A default field set restricts bare words only, prefixes always win: CLI `--in` and the API/Tauri `scope` parameter share `parse_field_list` (names or letters `n,u,t,d,f`). The same terms drive all three match paths: per-term SQL LIKE conditions (ANDed, so pagination totals stay exact), `bookmark_matches_query` for in-memory lists (picker, open fallback), and `scoped_tantivy_query` for deep search (scoped terms become `field:"text"` clauses, restricted bare words become OR groups). Relevance ranks on free words, falling back to all term texts when every term is scoped. There is no `content:` prefix by design: saved content is searched only for bare words under `--deep`.

## Readable text and snippets

Readable text (`extract_readable_text`) strips chrome (`nav`, `aside`, `footer`, and friends) and keeps `p`/`li`/quote/heading blocks of 20 plus chars, falling back to the full dump only when no block survives; it feeds the index `content` instead of the raw archive dump. The marker trick needs two lol_html passes because `prepend` plus `on_end_tag` in one handler truncates the stream. Notes index by body only: the `---` frontmatter never enters the index (it used to pollute relevance and snippets with uuid/date lines).

Snippets come from the tantivy `SnippetGenerator` on the content field (200 chars, `<b>` highlights, HTML-escaped fragments safe to inject), surfaced as the optional `snippet` field on list payloads over every frontend plus a Deep toggle in the Library. Cards clamp to two lines and table rows to one; clicking a snippet toggles the clamp in place (`stopPropagation`, so the detail drawer stays closed) with the virtualizer re-measuring the row. Match source labels (archive versus notes) plus indexed-content age are explicitly deferred: the index merges both texts into one `content` field and bookmarks carry no archive timestamp, so either needs index schema work first. The content field is `TEXT | STORED`; older indexes auto-migrate (schema mismatch wipes and recreates, then the next reindex refills, since the index is regenerable by design).

## Incremental indexing

Every write path reindexes incrementally: create, edit, delete, notes, and archive operations reindex one document right after the write, deletes drop the term. Index failures never fail the write (`let _ =`, reindex stays the repair path). Bulk paths batch instead: import and sync replay suppress per-row indexing through `Store::set_auto_index` and reindex the touched set once at the end, so the 10k import stays fast. Shared `index_content` assembly keeps single and bulk paths identical. Attach and detach skip indexing: no indexed field covers attachments.

## Tantivy notes

The `uuid` field is `STRING | STORED`: untokenized so deletes by exact term work (`delete_term` needs an indexed field, `STORED` alone is invisible to it) while staying out of full text results. The query parser only searches the content fields, never `uuid`.

## Favicons

Favicons live beside content at `.liber/favicons/<host>.<ext>`, one per host, fetched lazily on first serve (link-rel-icon parse, then `/favicon.ico`, raster magic only so SVG never lands, 64KB cap) and cached afterwards; misses leave no file behind, which also keeps offline use safe, and the UI falls back to a letter tile. The endpoint answers with a day of cache headers; Tauri renders through blob URLs. One shared `Favicon` component serves both views with `sm` (table, 20px before the title) and `md` (card, 36px) variants with `loading="lazy"` for the virtual list. Library-wide refresh (`Store::distinct_hosts` plus `refresh_library_icons`, `POST /api/v2/favicons/refresh`, Tauri `refresh_favicons`, Settings Site icons section) walks every bookmark host once: cached hosts count as skipped unless the re-fetch box is checked, failures are listed per host instead of failing the batch, and network work runs in `spawn_blocking` like every other blocking fetch path. Fresh icons appear after a library reload (day cache headers).

## Saved searches

Saved searches live in `Config.saved_searches`, not the database: presets are device-local UI state like view preferences, so they travel with the config file and never enter the oplog. One core validator (non-empty 64-char name, scope through `parse_field_list`, sort through `parse_sort_mode`) serves the CLI (`liber searches` list/add/delete/run, run reuses the list path), the API (`GET plus POST /api/v2/searches`, `POST .../delete` with live-config write-through like profiles), and Tauri IPC; adds upsert case-insensitively and the list stays name-sorted. The sidebar section applies a preset by pushing `{q, scope, sort, nonce}` into the Library, which syncs its local search state on nonce change; the save button prompts for a name and posts the debounced query.

## Bulk capture

Bulk capture loops the normal single add on purpose, no bulk endpoint: `liber add` takes several URLs (single-URL flags like `--title`/`--description`/`--attach`/`-i` are refused in bulk) and the web dialog pastes one-per-line with shared tags/folder/archive, each URL going through title fetch, duplicate guard, and archive with a per-URL added/duplicate/failed report. Duplicates skip without prompting, matching import semantics; the single-add confirm flow is untouched. Per-request overhead is irrelevant next to title fetch and archiving, so a batch endpoint would only add contract.
