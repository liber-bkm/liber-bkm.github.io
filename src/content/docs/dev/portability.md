---
title: Portability and performance
description: Tested targets, budgets, and the 10k fixture.
---

Linux is the only tested target. Windows, macOS, Android must keep compiling and are provided via flake shells, but are not verified on device. Concretely: PathBuf everywhere, slug sanitizer covers Windows reserved names and trailing dots on all platforms, case insensitive collision check even on Linux, rustls not openssl for TLS, bundled SQLite, regenerable tantivy index never synced, UTF-8 with encoding_rs fallback for Netscape import, `\n` on export.

## Performance budgets

Paged reads filter, sort, and paginate in SQL with tag side-table indexes; only relevance ranking and full scans hydrate whole collections. The 10k perf fixture pins the budgets, with search average under 100ms as the reference. Import and sync replay suppress per-row indexing and reindex the touched set once at the end, so the 10k import stays fast. SQLite maintenance (vacuum mode, WAL, cache sizing) is tracked as a measurement-gated future box; no work is scheduled. The web Library renders through a window virtualizer with the fetch cap at the API maximum of 500; SQL pagination underneath is unchanged.
