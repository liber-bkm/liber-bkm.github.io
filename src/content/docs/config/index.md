---
title: Configuration
description: config.json location, fields, and resolved paths.
---

On first run liber writes:

```sh
$XDG_CONFIG_HOME/liber/config.json    # usually ~/.config/liber/config.json
```

```json
{
  "base_dir": "/home/you/Bookmarks",
  "singlefile_cmd": "single-file"
  // "singlefile_browser_path": "firefox"
  // "monolith_cmd": "monolith"
  // "archive_backend": "single-file" or "monolith" or "native" or "auto"
  // "monolith_use_browser": false,
  // "monolith_browser_path": "firefox"
}
```

| Field | Meaning |
| ----- | ------- |
| `base_dir` | Root of the collection. |
| `html_dir` / `markdown_dir` / `archive_dir` / `attachment_dir` | Override subdirs individually (default `<base_dir>/html` etc.). Absolute, not profile-scoped. |
| `singlefile_cmd` | Executable for `-a` archiving (default `single-file`). |
| `singlefile_browser_path` | Browser passed as `--browser-executable-path` each archive run (e.g. `/usr/bin/brave`). Leave unset to auto-detect. |
| `archive_backend` | Which archiver `-a` uses: `single-file`, `monolith`, `native`, or `auto` (the default). `auto` tries them in that order, skipping whichever binary isn't installed and falling back on failure; an explicit backend is strict and errors instead of falling back. `native` is built in and always available. See [Archive backends](/config/archive-backends/). |
| `monolith_cmd` | The `monolith` executable for the monolith backend (default `monolith`). Needs no browser and fits headless machines; it can't render JavaScript-driven pages on its own. |
| `monolith_use_browser` + `monolith_browser_path` | When `monolith_use_browser` is `true`, liber renders the page with a headless chromium-family browser (`monolith_browser_path`, else `chromium` / `chromium-browser` / `google-chrome` from `PATH`) and pipes the DOM into monolith, archiving even JavaScript-rendered pages without a full single-file setup. |
| `browser_cmd` | Override open command (default `xdg-open` / `open` / Windows handler). |
| `editor_cmd` | Override markdown open command (default `$VISUAL`, then `$EDITOR`, then OS default). |

```sh
liber config    # show active config file and resolved paths
```

:::caution
If archiving silently does nothing, check dependencies and that `singlefile_browser_path` or the `monolith` options are set properly in `config.json`.
:::
