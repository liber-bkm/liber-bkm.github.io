---
title: Automation
description: Rule-based auto-classification of bookmarks by URL, host, or title.
---

Automations are rules that sort bookmarks for you. Each rule watches for a text match in the URL, the host, or the title, and automatically files matching bookmarks into a folder, adds tags, or both. Rules apply to new bookmarks as they are created and can be re-run over bookmarks you already have. You can set up automation rules either using the CLI or the web UI.

## Web UI

Simply run `liber --serve` and navigate to settings in the top right corner, where you can set up automation rules accordingly. See the [settings page](/guide/web-ui/#settings-page).

## CLI


```sh
liber --auto add --match <s> --folder <f> --tag <t1 t2>
liber --auto                                  # list rules + classified counts
liber --auto edit <id> --folder other         # change a rule
liber --auto edit <id> --folder x --reapply   # change AND re-sync matching bookmarks
liber --auto delete <id>                      # remove a rule (bookmarks keep state)
liber --auto apply                            # re-run all rules
liber --auto apply <id>                       # re-run one rule
```

Match targets (case-insensitive substring):

```sh
liber --auto add --match doxy --folder hot                 # URL (default)
liber --auto add --match host:github.com --folder code     # host only, port ignored
liber --auto add --match "title:how to" --tag reference    # title only
```

Guarantees:

- **Explicit choice wins.** `-f` at creation (or a folder from a browser import) always beats a folder rule; tags are additive either way.
- **Decisions are never reopened.** Each rule gets one look per bookmark (tracked ledger). Re-running apply or adding unrelated rules won't move an already-classified bookmark.
- **Manual moves stick.** Once you move a bookmark, automation leaves it alone.
- Editing a rule only affects future bookmarks unless you pass `--reapply`, which advances only bookmarks still sitting where that rule put them.
- Deleting a rule removes the definition only.
