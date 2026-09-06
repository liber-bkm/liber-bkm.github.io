---
title: Developer docs
description: Internals, invariants, and gotchas for anyone reading or changing liber's source.
---

Code comments point here (`see dev-docs.md#topic`) instead of carrying full explanations inline. User-facing behavior lives under [Guide](/guide/adding/) and [Reference](/reference/cli/); this section explains *why the code looks the way it does*.

Three principles explain most design decisions in the codebase:

1. **Recorded paths, never pattern matching.** Every file liber touches is named explicitly on its own bookmark's index record. Nothing ever finds files by glob or filename pattern. This single invariant is what makes reindexing, renames, and quarantine safe.
2. **Zero external dependencies.** Plain Go plus the standard library only. A feature that needs a dependency needs a stronger justification than one solved in stdlib (this ruled out an HTML parser for import and a database for indexing).
3. **Explicit beats convention.** A user's direct choice (`-f`, a browser import's folder, an absolute `*_dir` override) always wins over automation or defaults. Several mechanisms below are just this precedent applied consistently.

## Map

| Page | Covers | Main files |
| ---- | ------ | ---------- |
| [Data model and reindexing](/dev/data-model/) | Records, filenames, orphan cleanup, id compaction, why no database | `store.go`, `create.go`, `edit.go`, `reindex.go` |
| [Ingest: dedupe and import](/dev/ingest/) | URL normalization, Netscape parsing | `dedupe.go`, `import.go` |
| [Mutations: taxonomy, history, batch](/dev/taxonomy/) | Rename-is-merge, open tracking, id specs | `taxonomy.go`, `search.go`, `idspec.go`, `delete.go` |
| [Search internals](/dev/search/) | Flag grammar, fzf protocol, deep search | `main.go`, `store.go`, `fzf.go`, `preview.go`, `deepsearch.go` |
| [Automation internals](/dev/automation/) | Matching, the applied-rules ledger, reapply | `automation.go`, `create.go` |
| [Attachments internals](/dev/attachments/) | Record shape, naming, reindex and web handling | `attach.go`, `reindex.go`, `webui.go` |
| [Archive backends internals](/dev/archive-backends/) | `runArchive` dispatch, monolith pipe, native snapshot engine | `archive.go`, `archive_native.go` |
| [Profiles and sync](/dev/profiles-sync/) | `effectiveBaseDir`, repo discovery | `config.go`, `profile.go`, `sync.go` |
| [Web UI and export](/dev/webui/) | Templates, reuse of CLI machinery, concurrency, pagination, static export | `webui.go`, `render.go`, `export_site.go` |

:::caution
Testing honesty is recorded where it matters: the jj sync path is implemented against jj's documented CLI but was never run against a real jj repo. Sanity-check it before relying on it.
:::
