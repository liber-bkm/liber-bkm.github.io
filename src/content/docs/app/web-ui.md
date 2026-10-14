---
title: Web UI
description: Library, detail drawer, bulk actions, rules, check center, and settings in the browser.
---

`liber serve` prints a localhost and LAN address; open it in a browser. Release and Nix builds serve the UI embedded with zero flags; dev builds serve API-only unless given `--static-dir` (see [Building from source](/dev/building/)).

- **Library** with instant search (`field:value` prefixes plus field selector, Deep toggle with match snippets), site icons, sort, card and table views with windowed rendering for large libraries, dark mode, and a phone layout with drawer navigation. A fresh library greets you with a short checklist instead of an empty page: add your first bookmark (opens the add dialog), import or settings (browser import, profiles, archive backend picker), and a tip pointing at the bookmarklet. It shows only when the library is truly empty with no search or filters active, so it never interrupts triage.
- **Detail drawer** with inline edit, two-step delete, attachments, and history.
- **Add dialog** with live duplicate detection ("add anyway" or open existing) plus optional notes, archived copy, and attachments at creation.
- **Bulk bar**: multi-select delete (confirmed), set tags, move folder.
- **Tags and folders** management with merge semantics.
- **Rules** with learn suggestions, **check center** with run plus per-row apply.
- **History page**, **settings** (archive backends, reindex, import/export with archive option, profiles, sync snapshots, backup and restore).
- **Command palette** (`Ctrl+K`): fuzzy search plus navigation and actions.
- **Token login page**; 401s redirect with `next` preserved.
- **Detail content tabs**: notes editor, archive viewer (inline or new tab), attachment upload.

View preferences that differ per device (archive inline versus new tab, theme, density) live in `localStorage` under `liber-*` keys, never on the server.

Task flows: [Adding](/app/adding/), [Finding](/app/finding/), [Organizing](/app/organizing/), [Check center](/app/check-center/), [Library settings](/app/library-settings/). The [Desktop app](/app/desktop/) runs this same UI offline over IPC.

CLI equivalent: every action here has a command. See [CLI guide](/cli/adding/).
