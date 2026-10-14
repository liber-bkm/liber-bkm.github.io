---
title: Profiles
description: Fully independent bookmark collections under one config.
---

Profiles are separate libraries under one config, one active at a time (for example work and personal). The tracked list lives in the config; `default` means the base dir itself and is never tracked.

```sh
liber profile list
liber profile switch work     # validates the name, creates the dir, appends to the tracked list
liber profile switch default  # back to the non-profile layout
liber profile delete work     # untracks only; files stay, switching back re-adopts them
```

Deleting a profile refuses the active one and never deletes files. Switching through the API or desktop app updates the running daemon too, so no restart is needed. In the apps, profiles switch in Settings with the same semantics; see [Library settings](/app/library-settings/).

Switching directories takes effect immediately with no file moves, so move your files first and run `reindex` after. Profile internals: [Settings and profiles](/dev/settings-profiles/).
