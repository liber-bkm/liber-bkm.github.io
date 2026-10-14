---
title: Editing and deleting
description: Direct edits, the full terminal editor, id specs, and delete.
---

## Addressing bookmarks

Bookmarks take a spec: short numeric id (`edit 3`), UUID prefix, comma lists, and dash ranges (`edit 1-3,5`, at most 1000 ids per range). Ids are per-device display aliases assigned at creation in `(created_at, uuid)` order; sync merges by UUID and never renames them. Gaps from deletes stay unless compacted; a range hitting a gap fails naming the missing id. `--uuid` shows full UUIDs instead.

## Direct edits

```sh
liber edit 3 --title "New title" --description "..." -t rust web --folder tech
liber edit 3 -u https://new-url.example/   # saved files rewritten, filenames kept, duplicate guard re-checked
liber edit 3 --markdown                    # add a notes copy if missing
liber edit 3 --attach report.pdf           # repeatable; --detach removes by number or name
```

## Full terminal editor

With no flags, `edit` opens the full TUI editor: every field plus toggles for notes and archive artifacts, attach and detach flows, and backend selection for new archives. See [Terminal UI](/cli/terminal-ui/) for the keys.

## Delete

```sh
liber delete 3 --yes   # without --yes, asks for confirmation first
```

Deletes remove the bookmark files and record a tombstone so sync propagates the delete. The web UI uses a two-step confirm, and the API delete is confirm-gated.

## Short-id gaps

`reindex --prune --compact-ids` closes short-id gaps to a dense `1..N` and resets the counter, so references like `[2]` can change meaning. Sync imports also auto-heal gaps and collisions into dense order, so converged devices agree on the mapping.

In the apps: editing happens inline in the detail drawer. See [Finding in the apps](/app/finding/).

Next: [Attachments](/cli/attachments/).
