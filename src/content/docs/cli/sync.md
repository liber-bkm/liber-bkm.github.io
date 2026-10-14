---
title: Syncing across devices
description: Folder sync plus bundle exchange, HTTP push and pull, and git snapshots.
---

Sync has no GUI: it stays CLI plus API only. Devices share the base dir over any folder sync (Syncthing, Nextcloud, Drive, plain rsync) plus explicit bundle exchange. Merging is by UUID: newer `updated_at` wins scalars, tags and attachments union, tombstones lose to newer edits, and replay is idempotent, so bundles can be exchanged freely in both directions. Short numeric ids stay local: every import heals gaps and collisions into dense `1..N` in creation order, so converged devices agree on the mapping.

## Bundle exchange

```sh
liber sync export /tmp/bundle.json   # on device A, transfer the file
liber sync import /tmp/bundle.json   # on device B, merges with UUID semantics
```

## HTTP transport

Against a running `liber-serve`, push or pull directly with derived-bearer auth (`--token` or `LIBER_AUTH_TOKEN`; an empty token sends no header, and a 401 answers with the token hint):

```sh
liber sync push <url> --since <cursor>
liber sync pull <url> --since <cursor>
```

`--since` filters by oplog sequence for incremental moves; per-peer cursors remain a later slice, so whole bundles are the norm.

## Snapshots and pruning

```sh
liber sync commit --message "checkpoint"   # git snapshot of the base dir (never inits a repo)
liber sync commit --push                   # snapshot plus push
liber sync prune           # drop oplog entries older than N days (default 90)
```

A clean tree reports nothing-to-commit in the body rather than an error.

Anything automation cannot place safely lands in `unindexed/` for review. It is never deleted by automation; data loss is treated as the unforgivable bug class. The server side (snapshots over the API, commit endpoint) is covered in [Self-hosting](/config/self-hosting/); the merge mechanics are in [Sync internals](/dev/sync/).

Next: [Backup and restore](/cli/backup-restore/).
