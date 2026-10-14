---
title: Developer docs
description: Internals, invariants, and gotchas for anyone reading or changing liber source.
---

Code stays uncommented; explanation lives here. User facing docs are in the [CLI guide](/cli/adding/) and [Reference](/reference/cli/).

Three principles explain most design decisions in the codebase:

1. **Recorded paths, never pattern matching.** Every file liber touches is named explicitly on its own bookmark's store row. Nothing ever finds files by glob or filename pattern. This single invariant is what makes reindexing, renames, and quarantine safe.
2. **UUID identity, numeric display.** Sync-safe UUIDs are the merge key everywhere; short numeric ids are per-device display aliases only. The numeric reassign class from the old Go design is gone.
3. **Explicit beats convention.** A user's direct choice (a flag, an import folder, an absolute dir override) always wins over automation or defaults. Several mechanisms below are just this precedent applied consistently.

## Map

| Page | Covers |
| ---- | ------ |
| [Building from source](/dev/building/) | Nix flavors, plain Linux, desktop, Android, verification commands |
| [Architecture](/dev/architecture/) | Crates, frontend stack, contributor workflow || [Storage and reindexing](/dev/storage/) | SQLite store, filenames, reindex repair, backup format, title fetch |
| [Search internals](/dev/search/) | Scoped parser, tantivy index, readability, snippets, favicons |
| [Sync internals](/dev/sync/) | Oplog merge, artifact ops, snapshots, pick endpoint, converge |
| [Addressing and short IDs](/dev/addressing/) | Spec grammar, ranges, alias assignment and healing |
| [Automation internals](/dev/automation/) | Matching, the applied-rules ledger, reapply, learn |
| [Archiver internals](/dev/archiver/) | Builtin snapshot engine, backend chain, external wrappers |
| [Link check internals](/dev/check/) | Classification, stale durations, apply flow, DNS decision |
| [Picker and interactive add](/dev/picker/) | TUI picker, numbered fallback, `add -i` prompt loop |
| [Server and Tauri split](/dev/server-tauri/) | Core, server, IPC, offline desktop, CSP, mobile entry |
| [Settings and profiles](/dev/settings-profiles/) | Allowlist, maintenance status, tracked profiles, capability matrix, virtualization |
| [Auth internals](/dev/auth/) | Token model, cookies, derived bearers |
| [LAN discovery](/dev/discovery/) | QR pairing plus mDNS mechanics |
| [Android internals](/dev/android/) | Private storage, remote mode, deep links, build notes |
| [Windows packaging](/dev/windows/) | GUI subsystem, NSIS PATH hooks, verification |
| [Portability and performance](/dev/portability/) | Tested targets, budgets, 10k fixture |
