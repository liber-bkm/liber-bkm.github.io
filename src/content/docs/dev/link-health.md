---
title: Link health internals
description: Worker pool, hop-by-hop classification, check stamps, and the quarantine path.
---

`liber --check` (`check.go`) scans with a bounded worker pool (default 12, `--workers N`) and a 15s per-request timeout, using its own `http.Client` with redirects disabled so each hop is classified explicitly.

Only 404/410 from the site's own server count as `dead`. 301/308 with a location count as `moved` (relative locations resolved against the request URL). Anything else is `uncertain`: network errors, timeouts, NXDOMAIN (which is deliberately never dead, since a removed record looks identical to an ISP-poisoned one), non-permanent statuses, and redirects that land on a foreign host (the ISP notice page pattern). HEAD is tried first with a browser-like UA, with a GET fallback for servers that reject HEAD. One `store.Save()` covers all confirmed URL updates and deletions at the end.

Every scan stamps `LastCheckedAt`/`LastCheckStatus` on each target (`store.go`, omitempty so old indexes load fine); `--stale D` keeps only never-checked or older targets. A moved-accept offers a title refresh via the existing `fetchTitle`. Dead/uncertain prompts take y/q/N through `promptCheckAction`: delete, quarantine (folder move to `quarantine` via `syncBookmarkFiles`, no-op message if already there), or skip. The summary line counts updated/deleted/quarantined/skipped.
