---
title: Automation internals
description: Rule matching, the applied-rules ledger, reapply, and learn.
---

Rules match `title:` and `host:` prefixes else URL substring, case insensitive. The ledger records rule id plus the folder it set, so manual moves stick: reapply only sets a folder when empty or still equal to the recorded one, and tags always union. Rule actions carry tag lists. Deleting a rule leaves classified bookmarks untouched, ledger entries included. Rules run at creation (so import and sync paths share the same classification), and `auto apply` re-runs them over the library. `auto learn` suggests host rules from folder clusters (`--min N` threshold, `--create` to write them).
