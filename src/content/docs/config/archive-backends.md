---
title: Archive backends
description: Backend chain, browser pipe, external wrappers, and their setup.
---

Archiving defaults to the builtin snapshot (monolith-class static embed, scripts stripped, no external processes). `auto` chains browser pipe (when a browser resolves), single-file, monolith, then builtin, warning at each fallback. Explicit backends are strict:

```sh
liber archive 3 --backend builtin
liber add https://example.com --archive   # uses archive_backend from config
```

The browser pipe dumps the live DOM via `--dump-dom` and runs it through the same embed pass; a failing browser falls back to static with a warning. Archives are inert snapshots: stylesheets, fonts, images, and media embedded, scripts stripped, so archives can never phone home or run code. Caps: 20MB page, 10MB per asset, 50MB total, 45s, 6 workers. Text extraction feeds deep search; see [Searching](/cli/searching/).

## External dependencies

External backends need their binaries. The Nix dev shell and both Nix packages (`packages.default`, `packages.liber-desktop`) put `single-file` and `monolith` on `PATH`, so they work with zero setup there. On plain Linux install them yourself (`npm i -g single-file-cli`, `cargo install monolith`, or distro packages) or point `singlefile_cmd` / `monolith_cmd` at your binaries. Browsers resolve via `browser_path` or Chromium on `PATH` (Chromium only; Firefox flags are unsupported).

The API add and import shapes also take an explicit `archive_backend`, so callers (including the web settings form) can force `builtin` deterministically. On Android the builtin archiver is forced; browser and external binaries cannot exist there.

Archive internals: [Archiver internals](/dev/archiver/). Key reference: [Configuration overview](/config/overview/).
