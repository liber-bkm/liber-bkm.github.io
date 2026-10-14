---
title: Android app
description: Standalone and remote modes, deep links, and phone behavior.
---

The same app compiled for Android; the shared GUI flows ([Adding](/app/adding/) through [Library settings](/app/library-settings/)) apply here, with the phone differences below. For building and installing, see [Install on Android](/install/android/).

On device the app uses private storage (config plus `library/` side by side in the app sandbox), forces the builtin archiver, and refuses git snapshots. Two modes:

- **Standalone**: your library lives on the phone, fully offline.
- **Remote mode**: set a server URL plus token in Settings to talk to a LAN `liber-serve` instead of the local library. See [Pairing](/app/pairing/) and [Self-hosting](/config/self-hosting/).

Phone behavior: drawer navigation with notch-safe insets; the system back button closes overlays first, then returns to the library, then exits the app; `liber://add?url=...` links open the add dialog with the URL prefilled; archived copies open in the system browser from the archive tab; attachments upload through the webview picker and exports download as blobs. Every API feature ships its remote branch, so all shipped features work here.
