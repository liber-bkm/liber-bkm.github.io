---
title: Web UI
description: Browse, add, and edit bookmarks in the browser.
---

Liber provides a simple yet efficient and powerful web UI that allows you to add, edit, archive, and search bookmarks. It also has complete configuration options available so you can configure liber accordingly without needing the CLI. It automatically detects dependencies and suggests paths while also allowing overriding with your own settings.

```sh
liber --serve
liber --serve --addr 127.0.0.1:8181
```

Starts a local UI at `http://127.0.0.1:8080` for search, add, edit, and delete. It reflects the active profile and picks up CLI profile switches on the next request, so no restart is needed. Past 500 results, `?page=N` pagination appears; page links preserve the active scope/deep query.

:::caution
Binds to loopback by default and has no authentication, so anyone who can reach it can read and modify the collection. Binding elsewhere prints a warning.
:::

## Settings page

`liber --serve`, then click the gear button (top right) or open `/settings` directly. The page covers:

- **Tools.** For each external command (`singlefile_cmd`, `singlefile_browser_path`, `monolith_cmd`, `monolith_browser_path`, `browser_cmd`, `editor_cmd`) the page shows what liber detected on your machine and the current configured value. Leave a box empty to use the default; type a custom path to override it.
- **Directories.** `base_dir`, `html_dir`, `markdown_dir`, `archive_dir`, `attachment_dir`, each with its effective resolved path shown. Changing `base_dir` points liber at a different collection; nothing is moved.
- **Archiving.** `archive_backend` as a dropdown and the `monolith_use_browser` checkbox. See [Archive backends](/config/archive-backends/).
- **Automation rules.** Add, edit, delete, and re-run, equivalent to `liber --auto`. The add form backfills matching existing bookmarks, the edit form has a `reapply` checkbox matching `--reapply` on the CLI, and rules edited here behave identically because web and CLI share the same helper functions.

All changes write to `config.json` (or the rules in `index.json`) immediately; the settings page and any other open web tabs pick them up on their next request, no restart needed. The same page shows which file it wrote at the top. A maintenance section on the same page runs the `liber -r` commands (merge, all, prune, compact, prune journal) with checkboxes and shows the report.

## Bookmarklet

Add this as a browser toolbar bookmark URL (adjust port if you used `--addr`) to file the current page quickly:

```js
javascript:location.href='http://127.0.0.1:8080/?prefill='+encodeURIComponent(location.href)
```

## Extras

- **Theme toggle**: top-right button switches Gruvbox light/dark, persisted in `localStorage`; OS `prefers-color-scheme` wins with no stored choice.
- **Filter chips**: tags/folders in results are clickable (root `/` excluded) and jump to a scoped search.
- **Attachments**: upload on add/edit forms (`attach files`, multi-select), open by name, remove via `remove` checkboxes on edit. A single attachment links straight to the file; several link to the edit page.
- **Live filter**: the box above the results narrows the shown rows as you type, client side only, within whatever search or page you are on.
- **Sort**: the dropdown next to search orders by relevance (title match first), newest, oldest, visited, or title. Paging keeps the sort.
- **Edit URL**: the edit page has a URL field (same rewrite as `-e -u`, empty is rejected). Tag and folder fields suggest existing values.
- **Markdown view**: notes render as formatted HTML (headings, lists, code, links) instead of plain text.
- **Card view**: each result links its saved card (`/card/<id>`), the same page the search picker's `(c)` action opens.
- **Tags and folders page**: the `#` button opens counts with rename forms (applied directly, merging onto existing names) and guarded deletes, plus suggested automation rules with one-click create.
