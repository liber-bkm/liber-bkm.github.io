---
title: Link health
description: Scan for moved, dead, and uncertain links from the command line.
---

The checker goes HEAD first with manual redirect handling and falls back to GET where needed. Dead means 404 or 410 only; 301 and 308 always report moved with a resolved target; cross-host redirects are uncertain. DNS uses the system resolver only (no third-party fallback); DNS failures classify as uncertain, which needs explicit user action and never auto-deletes or quarantines.

```sh
liber check                    # check everything
liber check 1-20               # check a spec only
liber check --workers 8        # parallel requests (default 12)
liber check --stale 7d         # skip bookmarks checked within the duration (720h, 7d, repeats like 1d12h; bare digits mean hours)
liber check --apply            # bulk update moved URLs plus quarantine dead ones
```

On a TTY, `--apply` walks per-item prompts (moved: update default-yes plus retitle confirm, refetching the title from the new URL; dead or uncertain: delete, quarantine, or skip); piped runs stay bulk. Updates skip targets already bookmarked; deletes are confirm-gated. Missing ids skip instead of failing the batch. Check stamps write check time plus status with no sync entry, same as history bumps.

Archive backends used for re-archiving moved pages are configured in [Archive backends](/config/archive-backends/).

In the apps: the check center mirrors this with run plus per-row apply buttons. See [Check center](/app/check-center/).

Next: [Shell completions](/cli/completions/).
