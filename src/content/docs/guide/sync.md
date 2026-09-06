---
title: Sync
description: Commit (and optionally push) your collection with git or jj.
---

Since the whole collection is flat files and JSON, liber uses git (or jj) for syncing and history. There is no server or account: `liber --sync` commits the current state of your collection in place, and `-p` pushes it wherever your repo already points.

```sh
liber --sync        # commit if base_dir is inside a git/jj repo
liber --sync -p     # commit, then push
```

- liber searches upward from `base_dir` (up to 40 levels) for `.git` or `.jj`, so a `base_dir` nested in a larger repo (e.g. dotfiles) still works.
- It never initializes a repo. If none is found it tells you and stops.
- Scope is minimal: one commit, optionally one push. No branch or remote management. Flat files + JSON already sync cleanly; `--sync` just saves the manual commands.
