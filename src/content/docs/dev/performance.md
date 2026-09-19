---
title: Performance budgets
description: Pinned scaling behavior and the fix order when budgets fail.
---

`perf_test.go` pins scaling behavior with a deterministic 10k-bookmark fixture (`genBenchmarkStore`, fixed seed): `BenchmarkLoad10k`, `BenchmarkSave10k`, `BenchmarkSearch10k`, plus `TestPerfBudgets`, which fails if load or save exceeds 2s or average search exceeds 100ms at 10k. Measured baseline on an i7-7700HQ: load 28ms (3.4MB JSON), save 24ms, search 4ms average, orders of magnitude inside budget, which is why the JSON index needs no replacement. If budgets ever fail, fix in this order: debounce web history writes, pre-fold search strings at load, bound deep search per query, then in-memory trigram index; SQLite only as a rebuildable local cache over flat files, never as the synced artifact.
