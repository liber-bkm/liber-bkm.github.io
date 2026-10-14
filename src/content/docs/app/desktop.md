---
title: Desktop app
description: The offline Tauri app and its install paths. Canonical reference for shared GUI behavior.
---

The Tauri desktop app calls the same core directly over IPC, no localhost hop, so it works fully offline: every screen, rule, check, note, archive, and attachment action, with files opened in the system browser. It runs the same UI as [Web UI](/app/web-ui/), so the task-flow pages ([Adding](/app/adding/), [Finding](/app/finding/), [Organizing](/app/organizing/), [Check center](/app/check-center/), [Library settings](/app/library-settings/)) apply here as written; only the differences below are desktop-specific.

Install natively with `nix build .#liber-desktop` (binary plus `.desktop` entry and icons; `nix run .#liber-desktop` launches it) or through its own bundle pipeline (`tauri build`) to `.deb`, `.rpm`, or AppImage. The `.deb`, `.rpm`, and AppImage targets via `tauri build` are the packaged-release path; see [Install on Linux](/install/linux/) and [Install on Windows](/install/windows/).

Every app binary serves the embedded frontend bundle, never the Vite dev server: after changing UI code, run `pnpm build` in `frontend/` and rebuild the binary. For pure UI iteration prefer `pnpm dev` in a desktop browser against `liber serve` instead of relaunching the app.

Desktop-specific behavior: archived copies render via inline viewer (the server-only "Open directly" link is hidden); attachment and bookmark-file downloads go through blob object URLs instead of server download links; the system back button walks a view stack; release builds show no console window on Windows. Remote mode (server URL plus token in settings) talks to a LAN server instead of the local library; see [Pairing](/app/pairing/). Sync has no UI and stays CLI plus API only; see [Sync](/cli/sync/).
