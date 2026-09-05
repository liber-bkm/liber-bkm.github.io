---
title: Web UI
description: Browse, add, and edit bookmarks in the browser.
---

```sh
liber --serve
liber --serve --addr 127.0.0.1:8181
```

Starts a local UI at `http://127.0.0.1:8080` for search, add, edit, and delete. It reflects the active profile and picks up CLI profile switches on the next request, so no restart is needed. Past 500 results, `?page=N` pagination appears; page links preserve the active scope/deep query.

:::caution
Binds to loopback by default and has no authentication, so anyone who can reach it can read and modify the collection. Binding elsewhere prints a warning.
:::

## Bookmarklet

Add this as a browser toolbar bookmark URL (adjust port if you used `--addr`) to file the current page quickly:

```js
javascript:location.href='http://127.0.0.1:8080/?prefill='+encodeURIComponent(location.href)
```

## Extras

- **Theme toggle**: top-right button switches Gruvbox light/dark, persisted in `localStorage`; OS `prefers-color-scheme` wins with no stored choice.
- **Filter chips**: tags/folders in results are clickable (root `/` excluded) and jump to a scoped search.
- **Attachments**: upload on add/edit forms (`attach files`, multi-select), open by name, remove via `remove` checkboxes on edit.
