---
title: Profiles
description: Fully independent bookmark collections under one config.
---

```sh
liber --profile                # list profiles, active one marked
liber --profile <name>         # switch to <name>, creating it if new
liber --profile default        # back to the flat layout (no profile)
liber --profile delete <name>  # stop tracking (data on disk untouched)
```

A profile is a subfolder of `base_dir` with its own `html/`, `markdown/`, `archive/`, `attachments/`, index, ids, tags, folders, and automations. No cross-profile search or move, only list and switch.

Untouched if unused: the default flat layout *is* the no-profile state, so existing collections are unaffected. Delete refuses the active profile (switch away first); re-switching to a deleted-but-still-on-disk name picks its data back up.
