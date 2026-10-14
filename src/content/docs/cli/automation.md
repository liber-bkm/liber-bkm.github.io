---
title: Automation
description: Rules that file bookmarks by URL, host, or title match, plus rule learning.
---

Rules classify new bookmarks automatically by URL substring, `host:` match, or `title:` match (case insensitive), setting a folder and tag lists. A ledger records which rule set which folder, so your manual moves are never overwritten: reapply only sets a folder when it is empty or still equals the recorded one, while tags always union. Deleting a rule leaves classified bookmarks untouched, ledger entries included.

```sh
liber auto add --match example.com --folder tech --tag reading --tag reference
liber auto list
liber auto edit <id> --folder new-dir --reapply   # edit plus re-run this rule
liber auto apply            # re-run all rules over the library
liber auto apply <id>       # re-run one rule
liber auto learn            # suggest host rules from folder clusters (--min N, --create asks per suggestion)
liber auto delete <id>      # confirm flow, classified bookmarks untouched
```

`learn` suggests rules from your existing folder clusters; `--create` writes the suggestions directly.

In the apps: the rules page mirrors all of this with learn suggestions inline. See [Organizing in the apps](/app/organizing/).

Next: [Link health](/cli/link-health/).
