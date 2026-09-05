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
}
```

| Field | Meaning |
| ----- | ------- |
| `base_dir` | Root of the collection. |
| `html_dir` / `markdown_dir` / `archive_dir` / `attachment_dir` | Override subdirs individually (default `<base_dir>/html` etc.). Absolute, not profile-scoped. |
| `singlefile_cmd` | Executable for `-a` archiving (default `single-file`). |
| `singlefile_browser_path` | Browser passed as `--browser-executable-path` each archive run (e.g. `/usr/bin/brave`). Leave unset to auto-detect. |
| `browser_cmd` | Override open command (default `xdg-open` / `open` / Windows handler). |
| `editor_cmd` | Override markdown open command (default `$VISUAL`, then `$EDITOR`, then OS default). |

```sh
liber config    # show active config file and resolved paths
```

:::caution
If archiving silently does nothing, check dependencies and `singlefile_browser_path`.
:::
