---
title: Building from source
description: Nix flavors, plain Linux, desktop, Android, and verification.
---

With Nix (primary path, from the checkout; prefix with `nix develop --command` or enter the shell once):

- `nix build .#default`: release CLI plus server with UI embedded. Builds the frontend offline from the lockfile, then the release `liber` plus `liber-serve` binaries with the UI embedded. Output lands in `result/bin/`. Scoped to CLI plus server: the Tauri GUI binary is excluded via `cargoBuildFlags`, and tests via `cargoTestFlags`, so system webkit is never required.
- `cargo build -p liber-cli`: fast dev build, API-only. Serves API-only; `/` explains how to add the UI.
- Web UI dev: `cd frontend && pnpm install && pnpm build` once, then either `EMBED_UI=1 cargo build` to bake it in, or point any build at it with `liber serve --static-dir ./frontend/dist`. For UI iteration prefer `pnpm dev` (proxies `/api` to a local `liber serve`).
- Release with UI: build the frontend as above, then `EMBED_UI=1 cargo build --release -p liber-cli`. Without `EMBED_UI=1` the build stays API-only even in release mode, by design, so stale `dist` output never ships silently.
- Desktop: `nix build .#liber-desktop` installs the app natively (binary plus `.desktop` entry and icons, webkit wrapped); `nix run .#liber-desktop` launches it. For debugging, run the frontend-local Tauri CLI `dev` from `crates/liber-tauri` (needs a display), or `cargo build -p liber-tauri` plus the binary directly. Every app binary serves the embedded frontend bundle, never the Vite dev server: after changing UI code, run `pnpm build` in `frontend/` and rebuild the binary (touch a Rust file if nothing else changed, since `generate_context!` embedding refreshes only when the crate recompiles). The raw `tauri build` produces `.deb` and `.rpm` (plus AppImage targets where configured). A display is needed for running, not for building.
- All-in-one: `nix build .#release-bundle` packs `liber`, `liber-serve`, and `liber-tauri` with `SHA256SUMS` and install notes. The desktop binary inside is the unwrapped ELF (the `.desktop` install stays with `.#liber-desktop`); outside Nix it needs system webkit.

If `nix build .#default` fails with `ERR_PNPM_NO_OFFLINE_TARBALL`, the `pnpmDeps.hash` in `flake.nix` is stale (frontend deps changed since it was pinned). Fix: set the hash to `""`, rebuild, copy the `got: sha256-...` value from the mismatch error back into the flake.

New files must be `git add`ed before any `nix build` (untracked files are invisible to the sandbox). Frontend dependency changes additionally need the `pnpmDeps.hash` refresh above.

## Without Nix

Install stable Rust via rustup (the repo's `rust-toolchain.toml` selects it, plus rustfmt/clippy components) and Node 22 with pnpm (`corepack enable` ships pnpm with Node 22, or install it standalone). Only `liber` plus `liber-serve` need nothing else: SQLite is bundled (rusqlite) and TLS uses rustls. The desktop app additionally needs the webkit system stack (Ubuntu/Debian, Fedora, and Arch package lists are in the project README; Arch is verified end to end, including desktop bundles and Android). Then the component commands are identical to the Nix path above.

## Android

Built via the `.#android-fhs` shell (rustup, JDK 17, Gradle, SDK 36 plus 37.0, NDK 29, licenses pre-accepted); full commands in [Install on Android](/install/android/).

## Versioning and releases

Versions are manual and triple-checked: workspace `Cargo.toml`, `tauri.conf.json`, and the `vX.Y.Z` tag must all agree, enforced by CI (`liber --version` flows from Cargo automatically). Use `dist/bump-version.sh X.Y.Z [--code N]` to bump Cargo, tauri.conf, package.json, and versionCode together. Android `versionCode` is a separate manual integer, copied over the generated properties at release build time with `versionName` stamped from the tag. The flake `version` suffixes the Cargo version with the git rev, so Nix artifacts stay tied to commits without affecting runtime version strings. Arch ships `liber-bin` and `liber` packages from `dist/arch/`; `bump-pkgbuild.sh <version>` refreshes both. Every `vX.Y.Z` tag builds all platforms in CI with `SHA256SUMS`: Linux x86_64 plus ARM64 (tarball plus `.deb` plus `.rpm` plus AppImage), Windows setup exe plus portable zip, macOS desktop `.dmg` plus CLI tarball, signed Android APK plus AAB. See [Windows packaging](/dev/windows/) for the bundle overlay mechanics.

## Verification

```sh
cargo test --workspace
cargo clippy --workspace --all-targets -- -D warnings
cargo fmt --check
cd frontend && pnpm install && pnpm build && pnpm test
```
