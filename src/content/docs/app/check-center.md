---
title: Check center
description: Run link checks and apply fixes through the UI.
---

The check center mirrors the CLI checker: run a scan with staleness options (`7d` style durations) and an optional worker count (how many links check in parallel; empty means the default of 12, higher values finish large libraries faster but hit sites harder), then per-row apply buttons for moved URLs (with retitle confirm), quarantine for dead ones, and confirm-gated deletes. Uncertain entries are left for explicit action, never auto-applied.

Classification (moved, dead, uncertain) and the system-resolver-only DNS behavior are shared with the CLI; see [Link health](/cli/link-health/). The desktop app runs the same check over IPC, fully offline.
