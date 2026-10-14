---
title: Link check internals
description: Classification, stale durations, apply flow, and the DNS decision.
---

HEAD first with manual redirects, dead means 404/410 only, 301/308 always report moved with a resolved target, cross-host redirects are uncertain, 405/501 falls back to GET. Scans run on a thread pool with a worker cap shared by every frontend: CLI `--workers` (default 12), the API `RunBody.workers`, and Tauri `check_run` all feed the same cap, and the check center exposes it as an optional count field (empty means the default). Stamps write check time plus status with no oplog entry, same as history.

## No third-party DNS fallback, deliberately

The old Go design wrapped its HTTP transport so DNS errors retried via 8.8.8.8 plus 1.1.1.1 over plaintext UDP, applied to link check, title fetch, and the archiver. Rust does not port this: reqwest blocking offers no dynamic DNS hook (only static overrides), so a correct port would need resolve-then-retry with client rebuilds across all three fetch paths; DNS failures already classify as `uncertain`, which needs explicit user action and never auto-deletes or quarantines, so the failure mode is safe; and hardcoded Google/Cloudflare servers would leak every checked hostname off-device, against the local-first model. The system resolver (user and VPN DNS) is the only resolver.

## Stale durations and apply

Stale durations use one core parser (`parse_stale_duration`): units `ms/s/m/h/d/w` case insensitive, repeats allowed (`1d12h`), bare digits mean hours (so old `--stale-hours N` maps to `Nh`). CLI `--stale` wins and conflicts with the deprecated `--stale-hours` alias; the API takes `stale` with `stale_hours` as deprecated fallback; Tauri mirrors both. Apply widens everywhere: per-update `retitle` refetches the title from the new URL (blocking, so `spawn_blocking` on the server, before the write lock in Tauri) and writes it only when non-empty and changed; `delete[]` is confirm-gated everywhere (API/Tauri answer `{confirm_required, count, hint}` until `confirm: true`, the web per-row button uses `window.confirm`, the CLI asks per item). Deletes go through `delete_bookmark_with_files`, so tombstones and the quarantine-never-delete rule hold. Missing ids resolve to `skipped`, never a batch-wide 404. CLI `--apply` on a TTY walks prompts (moved: update default-yes plus retitle confirm; dead/uncertain: delete/quarantine/skip); piped runs stay bulk.
