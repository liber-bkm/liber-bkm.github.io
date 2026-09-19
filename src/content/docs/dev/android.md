---
title: Android internals
description: Wrapper architecture, build, storage, option semantics, and distribution.
---

Maintainer internals for the Android wrapper. User-facing install and usage live in [Install on Android](/install/android/) and the [Android guide](/guide/android/); cross-track contracts and the Go side live in the other [Developer](/dev/) pages.

## Architecture

Thin native wrapper around the liber Go binary. All bookmark logic stays in Go; Android contributes lifecycle, private storage, and link handling. No gomobile, no UI rewrite.

- `MainActivity.kt`: owns the Go server lifecycle (starts `libliber.so --serve` on a runtime-picked loopback port, stops it with the app), the WebView (legacy view), the file-chooser bridge, the share-sheet receiver, downloads, the sync-folder tree UI, and the standalone/remote mode dialog with token flow. `Prefs.kt` holds the shared-preference keys (`mode`, `server_url`, `server_token`, `sync_tree`, `ui_mode`); all live in the MainActivity activity-local preferences file, which `UiActivity` reaches via `getSharedPreferences("MainActivity", ...)`.
- Launch routing: `ui_mode` defaults to native. In native mode `MainActivity` waits for the loopback port on a background thread, then launches `UiActivity` and finishes; shares arrive as `EXTRA_SHARE` (URLs prefill add, text pre-narrows search, consumed once). The legacy WebView is one setting away in native settings (restarts into `MainActivity`) and back via the ⋮ menu's Native UI entry.
- `ui/UiActivity.kt`: native Compose client with a tiny back stack (no navigation library), `api/LiberApi.kt` (HMAC bearer derivation matching the server, `ignoreUnknownKeys` parsing), `ui/Theme.kt` (gruvbox light/dark schemes, shared `LiberTopBar`/`CountChip`/`ErrorBlock` chrome). Saved content renders in a framework `WebView` with JavaScript and network loads blocked; attachments and the Netscape export open through a `FileProvider` (`res/xml/file_paths.xml`, cache only). See [Native theme](#native-theme) below for palette and icon rules (`material-icons-core` only; `Folder`/`Label` live in the extended set and stay out).
- Launcher icon generated from `Assets/liber-logo/` into `mipmap-*` densities plus `anydpi-v26` adaptive XML (navy `#2F4048` background sampled from the art); regenerate from source if the logo changes, never hand-edit densities.

## Quick start (personal debug APK)

With nix (primary tool source; in distrobox, prefix host nix calls with `distrobox-host-exec`):

```sh
nix develop .#android-fhs   # FHS chroot: same toolchain plus a standard
                            # /lib64 loader, so Gradle-fetched Google binaries
                            # (aapt2, d8, apksigner) run unmodified.
                            # Exiting the inner bash ends the session.
sh android/scripts/build-go-lib.sh
cd android && ./gradlew assembleDebug --no-daemon
adb install app/build/outputs/apk/debug/app-debug.apk
```

Without nix: install Temurin JDK 17, Gradle 8.x, and the SDK (`platform-tools`, `platforms;android-35`, `build-tools;35.0.0`; accept licenses via `yes | sdkmanager --licenses`), export `ANDROID_HOME`, then run the same three commands. Enable USB debugging on the phone and accept the host key so `adb devices` lists it. The APK is unsigned debug, fine for personal use, not for stores.

Troubleshooting: if Gradle demands an SDK component (e.g. offers to install build-tools), do not install it ad hoc. The nix SDK is read-only by design, so the fix is always version pins: `platformVersions`/`buildToolsVersions` in `flake.nix` must match `compileSdk`/`buildToolsVersion` in `android/app/build.gradle` and the AGP line must support that API level (AGP 8.7+ for 35).

## Layout

- `settings.gradle`, `build.gradle`, `gradle.properties`: Gradle project, Android Gradle Plugin 8.7.3.
- `app/build.gradle`: `bkm.liber`, minSdk 26, targetSdk/compileSdk 35. `versionName`/`versionCode` come from `-PliberVersionName`/`-PliberVersionCode` (CI passes the release tag and `major*10000 + minor*100 + patch`); the checked-in fallbacks are debug-build only. Bump the fallbacks when liber releases.
- `app/src/main/jniLibs/<abi>/libliber.so`: Go binary, built by `scripts/build-go-lib.sh`, never committed (gitignored).
- `app/src/main/`: manifest (INTERNET only), `MainActivity.kt`, `UiActivity.kt`, `api/`, `ui/`, layout, strings, `res/xml/` (`network_security_config`, `file_paths`).

## Build

Prereqs: JDK 17, Android SDK with platform-35 and build-tools. Gradle itself comes from the committed wrapper (`./gradlew`, pinned to 8.10.2), so no system Gradle is needed. With nix (primary tool source): `nix develop .#android` provides Go, JDK 17, Gradle, and the SDK with `ANDROID_HOME`/`ANDROID_SDK_ROOT` preset (fast shell for Go builds and scripts). Gradle assembly itself must run inside `nix develop .#android-fhs`, which adds a standard /lib64 loader contract so raw Google binaries run unmodified.

```sh
# 1. From the repo root, build the Go binary for arm64:
sh android/scripts/build-go-lib.sh
#    or reproducibly via nix: nix build .#liber-android-arm64
#    then copy result/bin/liber to
#    android/app/src/main/jniLibs/arm64-v8a/libliber.so

# 2. Assemble the debug APK:
cd android && ./gradlew assembleDebug
# APK: app/build/outputs/apk/debug/app-debug.apk
```

Verify the APK actually contains compiled code before installing (a missing Kotlin plugin once shipped a codeless APK that crashed on launch with `ClassNotFoundException`):

```sh
unzip -l app/build/outputs/apk/debug/app-debug.apk | grep classes
# expect a multi-megabyte classes.dex; bytes means something is wrong
```

Install with `adb install`, or transfer the APK to the device and open it. First launch creates `<app-files>/bookmarks` (`LIBER_BASE_DIR`) and `<app-files>/liber-config.json` (`LIBER_CONFIG`).

XML well-formedness (`AndroidManifest.xml`, `res/xml/*.xml`) is covered by a successful assemble; the FHS shell has python3 for a direct parse check when needed.

## ABIs

`arm64-v8a` builds with plain Go, no NDK. `x86_64` (emulators, Chromebooks) and 32-bit ABIs need an NDK clang as external linker; see the commented recipe in `scripts/build-go-lib.sh`. Only ship ABIs you built.

## Behavior notes

- Server binds `127.0.0.1` on a runtime-picked free port and stops with the app. Nothing runs in the background. Lifetime rule: `MainActivity` owns the Go process and its `onDestroy` stops it, so native mode keeps `MainActivity` alive underneath `UiActivity` (never finished) and the native root-back backgrounds the task instead of popping. Finishing `MainActivity` while native is on top kills the server out from under it: every later request fails to connect with nothing in logcat.
- Links to 127.0.0.1 stay in the WebView; external links open the system browser (history tracking still applies, since taps go through `/open/`).
- Back button walks WebView history. Rotation does not restart the server (`configChanges` in the manifest).
- Server output goes to logcat under the `LiberApp` tag.
- Storage is app-private. Sync story: export/share from the app, or point a sync client at an app-exposed folder later; scoped storage makes arbitrary shared folders painful, so this is deliberately not attempted in v1.

## Android option semantics

- Config lives at app-private `filesDir/liber-config.json` (`LIBER_CONFIG`), collection at `filesDir/bookmarks` (`LIBER_BASE_DIR`). The file is not directly editable: manage everything through the settings page, which shows the effective path.
- Archiving is native-snapshot only. The backend selector still lists the other backends, but an empty backend resolves to native on Android and the settings page says so; `single-file` and `monolith` have no on-device binaries to call.
- `browser_cmd` is irrelevant inside the WebView (links are handled natively).
- `device_id` is per install. Each phone gets its own on first write.

## Go-side mobile support

The codebase is stdlib-only with no CGO, so `GOOS=android GOARCH=arm64 go build` produces a working binary with no NDK involvement. Mobile support rests on three small pieces rather than a port:

- `LIBER_CONFIG` and `LIBER_BASE_DIR` env overrides (`config.go`) point the binary at wrapper-managed paths where `HOME` may be unset; `defaultConfig` falls back to the working directory when no home exists.
- `handleSettingsSave` only overwrites keys present in the POST, so a partial form can never wipe unrelated config.
- `openURL` (`archive.go`) has an `android` branch firing an `ACTION_VIEW` intent via `am start`; `BrowserCmd` still overrides it.
- The web UI is the mobile UI: `layoutTmpl` sets a viewport meta tag and `pageCSS` carries a single `@media (max-width: 600px)` block (single-column settings grid, full-width inputs, larger checkboxes and row actions, compacted header buttons), plus sticky search and `overflow-wrap` guards. `web_mobile_test.go` pins the viewport tag and breakpoint presence. Missing fzf degrades to the plain prompt, which is the correct no-TTY behavior on-device.
- Go's resolver reads a localhost stub that answers nothing in the app's network namespace, so every outbound fetch (titles, native archives, link checks) fails at DNS on-device. `dns.go` wraps each HTTP client's dialer: on `*net.DNSError` only, it re-resolves through 8.8.8.8/1.1.1.1 and dials the returned IP with the original hostname preserved for TLS SNI. `dns_fallback: off` disables it for strict setups; the fallback fires only after system DNS already failed and carries lookups, never page content.

## Native theme

`android/app/src/main/java/bkm/liber/ui/Theme.kt` holds the whole look: hand-built Material3 light/dark schemes from the gruvbox palette (`LiberTheme`, follows the system setting, no dynamic color so the identity is identical on every OS version) plus shared chrome (`LiberTopBar`, `CountChip`, `ErrorBlock`) that every screen reuses. Screens use only `MaterialTheme.colorScheme` roles, never hardcoded colors, so both schemes stay consistent for free. Icon allowlist: `material-icons-core` only (first-party Compose, versioned by the BOM). `Folder`/`Label` live in the extended set, which stays out to avoid shipping thousands of unused icons with minification off; the screens use `List`/`Home`/`Warning` instead. No behavior lives in the theme layer.

The native list auto-loads the collection on entry (empty query returns everything, like `/`), with multi-toggle scope chips (Title/URL/Tags/Notes/Folder, all on by default which matches the server's empty-scope behavior), a Deep toggle, and a sort dropdown over the same relevance/newest/oldest/visited/title modes as `--sort`. Detail has a confirm-gated delete that pops back to the auto-reloading list.

## Distribution

F-Droid first (source-based review, matching audience), Play Store second. Play notes: keep permissions at INTERNET only, no foreground service while the server lives and dies with the activity, verify 16KB-page-clean native output for Android 15+ targets, and expect new personal accounts to need 14 days of closed testing before production access.

## Release CI

`.github/workflows/release.yml` builds `liber-android-debug.apk` on every release and uploads it next to the desktop binaries (included in `SHA256SUMS.txt`). A manual `workflow_dispatch` run exercises the same path without uploading anything. A signed `liber-android.apk` is built and uploaded only when these repository secrets exist:

- `ANDROID_KEYSTORE_BASE64`: release keystore, base64-encoded
- `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`

The Gradle build reads them from `LIBER_KEYSTORE_*` env vars and skips signing cleanly when absent, so forks without secrets still get the debug APK. Generate the keystore once with `keytool -genkey -v -keystore liber-release.keystore -alias liber -keyalg RSA -keysize 2048 -validity 10000`, back it up somewhere safe, and never commit it: losing the key means a new app identity on every store.
