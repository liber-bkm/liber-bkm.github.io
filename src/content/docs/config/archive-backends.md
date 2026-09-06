---
title: Archive backends
description: How liber -a snapshots pages with single-file, monolith, or the built-in native backend.
---

`liber -a` archives a page through one of three backends, selected by `"archive_backend"` in `config.json`:

| Backend | What it does | Needs |
| ------- | ------------ | ----- |
| `single-file` | Renders the page in a headless browser and bundles everything | `single-file-cli` plus a browser |
| `monolith` | Fetches the page and inlines assets as data URIs, no browser | `monolith` binary |
| `native` | Built-in static snapshot: fetches the page, inlines images, styles, and snippets as data URIs, **scripts are stripped** | nothing |

With `"archive_backend": "auto"` (the default), liber tries them in that order, skipping any whose binary is missing and falling through on failure. The built-in `native` backend always exists, so archiving never dead-ends. Setting an explicit backend makes it strict: an error instead of a silent fallback.

## Configuration per backend

Minimal `config.json` for each backend:

```json
{
  "archive_backend": "single-file",
  "singlefile_cmd": "single-file",
  "singlefile_browser_path": "/usr/bin/brave"
}
```

`singlefile_browser_path` is only needed when `single-file` can't find your browser on its own. Leave it unset to auto-detect.

```json
{
  "archive_backend": "monolith",
  "monolith_cmd": "monolith"
}
```

`monolith_cmd` is only needed when the binary isn't on your `PATH` under that name.

```json
{
  "archive_backend": "native"
}
```

`native` needs no keys at all and works out of the box, which makes it the practical default for headless servers.

`monolith` vs `native`: monolith is more complete (fonts, caching hints, edge-case handling) while `native` is dependency-free and fully static. No JavaScript is kept at all (`<script>` elements are removed, `<noscript>` fallbacks are unwrapped), so `native` fits housekeeping content like guides and docs on headless servers.

## Rendering JavaScript pages with monolith

Monolith can also render JavaScript pages via a headless chromium pipe:

```json
{
  "archive_backend": "monolith",
  "monolith_use_browser": true,
  "monolith_browser_path": "/usr/bin/chromium"
}
```

This runs the equivalent of:

```sh
chromium --headless --window-size=1920,1080 \
         --run-all-compositor-stages-before-draw --virtual-time-budget=9000 \
         --incognito --dump-dom <url> | monolith - -I -b <url> -o <out>
```

If `monolith_use_browser` is true and `monolith_browser_path` is unset, `chromium`, `chromium-browser`, and `google-chrome` are tried from `PATH`.

Config keys for this: `archive_backend` (default `auto`), `monolith_cmd`, `monolith_use_browser`, `monolith_browser_path`. See [Configuration](/config/) for the full field table.
