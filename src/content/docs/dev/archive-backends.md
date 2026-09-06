---
title: Archive backends internals
description: runArchive dispatch, the monolith browser pipe, and the native snapshot engine.
---

`runArchive` (`archive.go`) is the single entry point; `create.go` and `edit.go` call it instead of `runSingleFile` directly, so import and the web UI get everything for free.

Selection: the `archive_backend` config key (`""` or `auto` means the priority chain single-file, then monolith, then native, with skip-on-missing-binary and warn-and-continue on error; an explicit backend is strict, errors only). The chain warns on fallback rather than failing silent, since archiving without the expected backend could silently produce lower-fidelity output otherwise.

The monolith backend has two modes. Plain: `monolith <url> -o <out>`. With `monolith_use_browser` plus `monolith_browser_path` set, it pipes a headless-chromium DOM dump into monolith via `chromium.StdoutPipe` into `monolith.Stdin` (no shell involved, each binary's stderr is captured separately so error attribution is clear). This reproduces the documented monolith recipe for JS-rendered pages. If the path key is unset, the usual names (`chromium`, `chromium-browser`, `google-chrome`) are probed on `PATH`. `-q` is deliberately not passed: monolith's quiet mode suppresses the error output we log on failure.

The `native` backend (`archive_native.go`) is stdlib-only and **static**. Per the design decision this is a snapshot without JavaScript: every `<script>` is stripped and `<noscript>` contents are unwrapped. It fetches the page (caps: 20MB page, 10MB per asset, 50MB total, 45s deadline, 6 parallel asset fetches), extracts URLs with regexes (`src`/`poster` attrs, `<link href>`, `srcset`, `url(...)` in inline CSS), resolves them against the final (post-redirect) page URL, inlines fetched assets as `data:` URIs, and stamps an `<!-- saved by liber (native snapshot) -->` comment. Known limits, by design: Go's RE2 has no backreferences, so attribute-quote matching is best-effort; `url(...)` inside *externally fetched* stylesheets is not rewritten (only URLs found in the page's own HTML); assets that fail to fetch degrade to their original URLs rather than failing the archive. This mirrors monolith's plain-mode fidelity class, and `--deep` deep search works identically on all three backends since the output is always a regular HTML file.
