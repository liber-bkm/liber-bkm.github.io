---
title: Adding in the apps
description: Save bookmarks through the add dialog on web, desktop, and mobile.
---

The add dialog is available on every graphical frontend: web UI, desktop app, and Android app. It offers the same options as the command line: title (fetched or typed), tags, folder, description, optional markdown notes, archived copy (with backend select), and attachments at creation. Tag chips autocomplete from your library and the folder rides a dropdown with suggestions.

Duplicate detection runs live as you type: on a match the dialog offers "add anyway" or opening the existing entry instead of creating a second copy. Paste several URLs at once (one per line) for bulk capture with shared tags, folder, and archive: the report lists added, duplicate, and failed per URL. On Android, `liber://add?url=...` links open the dialog with the URL prefilled, so sharing from any app lands here.

Archive and attachment behavior (backends, unique filenames, sync) is shared with the CLI; see [Archive backends](/config/archive-backends/). CLI equivalent: [Adding](/cli/adding/).

## Capture without an extension

A bookmarklet opens the add dialog prefilled with the current page, no extension needed. Create a bookmark with this URL (change the base to match your `serve --addr`, default `http://127.0.0.1:8080`, LAN address included):

```js
javascript:(function(){var B='http://127.0.0.1:8080';open(B+'/?add='+encodeURIComponent(location.href)+'&title='+encodeURIComponent(document.title),'_blank')})()
```

It opens the liber add dialog prefilled with the page URL and title (plus optional `&tags=` and `&folder=`); tags and folder are typed in the dialog. Token-gated servers reuse the login cookie, so log in once first. The query form is shared with the Android deep link, so `/?add=` links work everywhere the UI runs.
