---
title: Link health
description: Scan bookmarks for moved, dead, and uncertain links with liber check.
---

```sh
liber --check               # scan everything, then prompt per flagged item
liber --check 1-100,200     # limit to an id range (same syntax as -e/-d)
liber --check --workers 20  # parallel requests (default 12, 15s timeout each)
liber --check --stale 720h  # skip bookmarks checked within the duration
```

Each bookmark lands in one bucket:

- `moved`: permanent redirect (301/308). Prompts to update the stored URL (defaults to yes), then offers a title refresh when the new page reports a different title.
- `dead`: 404/410 answered by the site itself. Offers delete, quarantine, or skip.
- `uncertain`: everything else. Timeouts, DNS/TLS failures, refused connections, 403/429/503, redirects to a foreign host (typical ISP notice page), geo or ISP blocks. Listed for review with the same delete/quarantine/skip choice (defaults to skip), never auto touched.

Quarantine moves the bookmark to a `quarantine` folder (files move along, same as any folder change) so it stays searchable but out of the way. Every run records when each bookmark was checked and what it found, which is what `--stale` filters on, and ends with a summary of updated/deleted/quarantined/skipped counts.

Only 404/410 count as dead, so a georestricted or ISP-blocked site can never be misclassified: from one vantage point a block is indistinguishable from other failures, and all of those are uncertain by construction. Checks send a browser-like user agent and fall back from HEAD to GET where needed.
