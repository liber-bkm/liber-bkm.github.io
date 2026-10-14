---
title: Windows packaging
description: GUI subsystem, NSIS PATH hooks, and verification.
---

## No console window

`crates/liber-tauri/src/main.rs` starts with `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]` (the upstream Tauri template default). Release builds link as GUI applications, so no blank terminal follows the app, however it is launched (raw exe, NSIS setup, MSI). Debug builds (`cargo run`, `tauri dev`) keep the console for logs. Linux, macOS, and Android builds are unaffected: the attribute only changes Windows linking.

## Automatic PATH via NSIS hooks

Tauri installers have no built-in "add to PATH" option, so the NSIS installer runs a hooks file instead of a forked template:

- Hooks: `crates/liber-tauri/windows/path-hooks.nsh`, wired as `bundle.windows.nsis.installerHooks` in `tauri.conf.json`.
- Install (`NSIS_HOOK_POSTINSTALL`): appends `$INSTDIR` to the **user** `Path` (HKCU, no admin escalation), once (exact-match check first), then broadcasts `WM_WININICHANGE` so open terminals pick it up. This makes `liber` and `liber-serve` callable without full paths.
- Uninstall (`NSIS_HOOK_POSTUNINSTALL`): removes exactly that entry in all three positions (`;$INSTDIR`, `$INSTDIR;`, bare) and broadcasts again. Other entries are never touched.

Deliberate limits: HKCU only (a per-machine install still writes the installing user's PATH, acceptable and documented); exact-match only (entries with different casing or trailing slashes are left alone); MSI builds do not run NSIS hooks, so the `.msi` still needs manual `setx` until MSI gets equivalent handling.

## Bundle overlays

Desktop bundles ship every binary: a Windows overlay maps `bundle.resources` into `$INSTDIR` (already on user PATH via the NSIS hook), a Linux overlay maps `deb.files`/`rpm.files` into `/usr/bin` (plain `resources` would land off-PATH in `/usr/lib`; `externalBin` is the fallback if exec bits misbehave), macOS stays app-only with the CLI tarball as the terminal story. A full custom NSIS template fork is rejected; hooks survive Tauri upgrades unless the four hook names change. Release assets use stable versionless names renamed at stage time before hashing, so `latest/download` links never rot; `.sig` sidecars rename in lockstep once the updater lands them.

## Verification checklist (needs a Windows box or VM)

1. Build: `tauri build --bundles nsis` succeeds (template or hook breakage fails here, including on CI).
2. Install the `-setup.exe`, open a *new* terminal: `where liber` resolves inside the install dir; `liber --help` runs.
3. Reinstall over it: `Path` contains the entry exactly once.
4. Uninstall: the entry is gone, everything else in user `Path` intact; `liber` no longer resolves.

## Upgrade caveat

The hooks ride the upstream `installer.nsi` (`NSIS_HOOK_*` points). A major Tauri upgrade could rename them; the symptom is a CI Windows build failure naming the missing macro, and the fix is to diff `crates/liber-tauri/windows/path-hooks.nsh` against the new upstream template. The pinned template source for this repo state: Tauri v2.12 `crates/tauri-bundler/src/bundle/windows/nsis/installer.nsi`.
