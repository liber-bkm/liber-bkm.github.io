---
title: Troubleshooting
description: Fixes for the most common failure modes.
---

- **Search acts stale or empty after touching files by hand:** run `liber reindex` (or Settings, Maintenance, Run reindex). It adopts orphans, relinks siblings, sweeps conflicts to `unindexed/`, and rebuilds the search index. Add `--prune` only to drop rows whose files are gone. See [Storage layout](/config/storage/).
- **Login loops or API 401s:** the server token comes from `--auth-token` or `LIBER_AUTH_TOKEN` at serve time; API clients must send the *derived* bearer, not the raw token. Remote mode derives it from the Settings token field; `sync push/pull` take `--token` or the env var. See [Self-hosting](/config/self-hosting/).
- **Port already in use:** pick another `--addr`, e.g. `liber serve --addr 127.0.0.1:8081`, and update the bookmarklet base and remote URL to match.
- **Remote mode cannot reach the server:** bind `0.0.0.0` on the server, open the firewall port, and use the LAN address (not `localhost`) on the client. `liber discover` confirms visibility. See [Pairing](/app/pairing/).
- **No icons after refresh:** icons cache with day-long headers; reload the library view after Settings, Site icons, Refresh icons.
- **Snippet looks stale:** snippets come from the search index, which updates on every write and rebuilds on reindex. Re-archive plus reindex refreshes them.
- **Restore refuses:** it guards non-empty libraries; pass `--force` (CLI) or arm the confirm (web) only when replacement is intended. See [Backup and restore](/config/backup-restore/).
- **Check shows everything uncertain:** DNS failures and cross-host redirects classify uncertain by design and never auto-delete; the system resolver is the only resolver. See [Link health](/cli/link-health/).
