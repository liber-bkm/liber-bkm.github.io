---
title: Addressing and short IDs
description: Spec grammar, ranges, alias assignment, and healing.
---

Identity is by UUID; the CLI takes comma separated specs plus digit-only dash ranges (`1-3,5`, expanded in `parse_id_spec` before resolving, at most 1000 ids per range, reversed ranges rejected). Only all-digit both-sides tokens expand, so UUID prefixes like `a1-b2` fall through untouched. Ranges resolve through the normal per-id path, so a gap fails strict with the missing id named in `NotFound`. `is_query_spec` treats hex plus comma plus dash plus space as id shaped; anything else is a search query, and a failed resolve also falls back to search. All hex strings like `beef` therefore try resolve first and degrade to query on miss.

Short numeric ids are per-device display aliases, not identity: a `short_id` column assigned monotonically at creation (persisted counter), resolved first in specs, shown as `[3]` everywhere with full UUIDs behind `--uuid`, the drawer header, and API payloads. Sync matches rows by UUID and never treats the incoming number as authority for existing rows (new UUIDs adopt the incoming number only when free, else take the next counter value), so no file renames and no flap. Reindex backfills nulls in creation order.

Every sync import that applies at least one entry backfills nulls and compacts gaps into dense `1..N` in `(created_at, uuid)` order (reported as `short_ids_assigned` plus `short_ids_compacted` in the merge report), writing no oplog entry, so converged devices independently reach the same mapping; peers never adopt a rename and stale payloads cannot reopen gaps. Local-only deletes keep their gaps until the next sync or a manual `reindex --prune --compact-ids` (API `compact_ids`, settings checkbox).
