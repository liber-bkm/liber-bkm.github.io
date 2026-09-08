---
title: Profiles and sync internals
description: The effectiveBaseDir mechanism and upward repo discovery.
---

Every path liber writes to comes from `Config.effectiveBaseDir()` (`config.go`), not `Config.BaseDir` directly:

```go
func (c Config) effectiveBaseDir() string {
    base := expandTilde(c.BaseDir)
    if c.ActiveProfile != "" {
        return filepath.Join(base, c.ActiveProfile)
    }
    return base
}
```

`htmlDir()`, `markdownDir()`, `archiveDir()`, and `indexPath()` all derive from this (unless individually overridden by `html_dir`/`markdown_dir`/`archive_dir` in config; those absolute overrides are deliberately NOT profile-scoped, same "explicit wins" precedent as everywhere else). This one function is the entire mechanism: every other file in the codebase that computes a path already goes through these methods, so profile isolation required no changes anywhere except the four places that used to read `cfg.BaseDir` directly (`reindex.go`'s unindexed-quarantine and staging roots, `sync.go`'s repo-root search). Those were switched to `effectiveBaseDir()` too, so quarantine, staging, and sync are all correctly profile-scoped as well.

`ActiveProfile == ""` means "no profile": the original, pre-profiles flat layout (`base_dir/html`, `base_dir/markdown`, etc. directly). This is deliberate: existing users who never touch `--profile` see zero change in behavior or file layout. `ActiveProfile`/`Profiles` live in `config.json` (global settings), not in any profile's own `index.json`. Switching profiles never touches bookmark data, only which `index.json` subsequent commands read.

Each profile's `index.json` is completely independent: its own id sequence (`NextID`), its own automation rules (`NextAutoRuleID`/`AutoRules`), tags, folders, everything. There is currently no mechanism to move a bookmark between profiles or to search across more than one at a time; "aware that others exist" is satisfied by `--profile` listing all tracked profiles and marking the active one, not by any cross-profile data operation.

`--profile <name>` creating a profile is genuinely just "add `name` to `Config.Profiles` if not already there, set `ActiveProfile = name`". The actual directory is never created eagerly; it comes into existence the first time something is written there, the same lazy `os.MkdirAll`-on-write pattern every other directory in this codebase already uses. `--profile delete` only removes the name from `Config.Profiles`. It never touches the folder or its `index.json`, and refuses to delete the currently active profile (to avoid `ActiveProfile` silently pointing at an untracked name). Re-running `--profile <name>` for a previously-deleted-from-tracking name picks its existing data back up rather than starting fresh. `runProfileSwitch` checks the filesystem (not just the tracked list) to decide whether to report "created" or "switched", which was a real wording bug caught during testing: the first version always said "Created" when a name wasn't in `Config.Profiles`, even when its folder (and data) already existed on disk from before a `--profile delete`.

## Sync

`liber --sync` walks upward from `base_dir` (`sync.go`'s `findRepoRoot`, up to 40 levels) looking for a `.jj` or `.git` directory, so it works whether `base_dir` itself is the repo root or just a subdirectory of a larger repo (e.g. a dotfiles checkout). It never initializes a repo itself. If it doesn't find one, it says so and stops, since silently creating a VCS repo would be a surprising thing for a bookmark tool to do.

Scope is deliberately minimal: one commit, optionally one push (`-p`), nothing that manages branches, jj bookmarks, or remotes. Since everything liber writes is flat files and JSON, git/jj sync was already going to work without any special support from liber. `--sync` just saves the two-or-three manual commands.

**Testing status**: the git path is well-exercised (init, first commit, git's "nothing to commit" no-op detection, push failure surfacing git's real error, and a nested-repo `base_dir` all verified). The jj path (`jj commit`, `jj git push`) is implemented against jj's documented CLI but has not been run against a real jj repo, since jj wasn't available in the environment this was built in. Sanity-check it before relying on it.

Note: jj's own concept also called "bookmarks" (its branch-like refs) is entirely unrelated to liber's bookmarks. It's a naming coincidence worth knowing about if the two are ever scripted together.

## Changing keys without JSON

`liber config set` (`config.go`) allowlists 13 keys and validates `archive_backend` and `monolith_use_browser` before `SaveConfig`; anything else errors without writing. Empty values are rejected (clear a key by editing the JSON).
