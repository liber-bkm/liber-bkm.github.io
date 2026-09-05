---
title: Design notes
description: Why liber works the way it does.
---

## Why tags and folders both

Tags classify, folders scope. A project folder keeps bookmarks navigable outside liber, while tags like `study` or `important` cut across folders, avoiding tag clutter and keeping the collection browsable as plain files.

## Markdown copy

Markdown is for personal notes and per-bookmark description, not page conversion, since `single-file` covers archiving. Store context you were researching alongside the link.

## Why not a database

Plain Go + flat JSON is enough for a single-user local tool: zero dependencies, readable/diffable/greppable collection, trivial git backup, no CGO. Id compaction via staged renames removed the one technical reason a database might have helped.
