---
title: Attachments internals
description: Record shape, flat storage, naming, reindex handling, and web upload flow.
---

Attachments are user-supplied local files (PDFs, extra snapshots, etc.) copied into the collection and recorded on the bookmark as `Attachment{Name, File}`. `Name` is the original filename shown in menus and used for `-dt` matching; `File` is the path relative to `cfg.attachmentsDir()` (`<base_dir>/attachments`, override `attachment_dir`). This keeps the data-model invariant intact: every file liber touches is named explicitly on its own bookmark's record, nothing is ever found by pattern.

Unlike html/markdown/archive, attachment files are stored **flat** (no folder subpath), so a folder move or `--folders rename` never touches them. Their names are `%04d-<slug>.<ext>` (id-prefixed like the other kinds, purely so the id-compaction pass in `reindex.go` can rename them), with `uniqueAttachmentRel` appending `-2`, `-3`, and so on, on collision; it checks both the bookmark's own entries **and** the filesystem, so re-attaching the same file twice keeps both copies distinctly named.

CLI surfaces, all reusing `attachFile`/`detachAttachment`/`attachmentsMenu` in `attach.go`: `-at <path>` (repeatable) on create/edit, `-dt <n|name>` on edit, the post-create `-i` menu, the interactive-edit menu, and the search action menu's `attachmen(t)s` entry (the same `attachmentsMenu` everywhere; opening dispatches through `openURL` to the OS handler, like archives). Rendering: `[att]`/`[attN]` badges in `badgeSuffix` (shared by `-l` and the plain picker) and in fzf's badge column, plus attachment paths in the fzf `__preview` output.

Reindex: kept bookmarks get stale attachment refs pruned (same treatment as md/archive refs); dropped bookmarks' surviving attachments are quarantined to `unindexed/attachments/<rel>`; id compaction renames them through the same two-phase stage/commit as the other file kinds, via the `attIdx` field on `pendingMove` (`-1` means a regular html/markdown/archive move).

Deep search deliberately does **not** read attachment content. Archives are the only content that gets scanned (many attachments won't be text at all, and real PDF text extraction, for example, would need a dependency this project doesn't take).

Web UI: add/edit forms are `multipart/form-data` (`parseWebForm`), uploads go through the same `attachReader` the CLI uses; attachments are removed via `delatt` checkboxes **inside the edit form** rather than their own POST, because `handleEditSave` always overwrites the bookmark's fields from the form. A bare "delete this attachment" POST would silently wipe title/tags that weren't submitted. `/attachment/<id>/<n>` serves files read-only, no lock, same as `/archive/`.
