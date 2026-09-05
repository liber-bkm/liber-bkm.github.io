---
title: Directory layout
description: How bookmark files are organized on disk.
---

```text
<base_dir>/
  html/<folder>/0007-my-title.html
  markdown/<folder>/0007-my-title.md
  archive/<folder>/0007-my-title.html
  attachments/0007-paper.pdf
  .liber/index.json
```

- Every file is prefixed with its numeric id, so `-l` / `-s` line up with disk.
- Folder edits move files; other edits rewrite in place. Files are never re-slugged on title/URL change.
- Adding a missing markdown/archive reuses the HTML basename so all three line up, and never overwrites existing copies.
- Attachments are stored flat (no folder subpath), so folder moves never touch them.
