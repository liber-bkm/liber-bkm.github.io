---
title: Self-hosting
description: Server setup, auth model, TLS, and remote mode configuration.
---

One server copy with phones and desktops as thin clients:

```sh
liber serve --addr 127.0.0.1:8080
liber-serve --addr 0.0.0.0:8080 --auth-token <token>   # server only, for machines that only self-host
```

`liber-serve` is the same server without CLI baggage; flags are `--addr`, `--auth-token`, `--static-dir`, `--qr`, `--no-mdns`. Serving order is always explicit `--static-dir`, then the embedded bundle, then an API-only notice. Dev builds stay API-only unless `--static-dir` points at a built UI. Token source: `--auth-token` flag or `LIBER_AUTH_TOKEN`; empty means open. The serve flags are covered in [Serving](/cli/serving/); connecting phones is walked through in [Pairing](/app/pairing/).

## Auth model

One token model everywhere: `--auth-token` or `LIBER_AUTH_TOKEN`; empty means open. Browsers get an HMAC signed cookie after the login form (POSTs additionally check Origin/Referer against Host, so a foreign page cannot drive your browser session). API clients send `Authorization: Bearer` with the *derived* bearer `HMAC-SHA256(token, "liber-bearer-v1")` in hex (constant-time compare); the web UI and Android remote mode derive it for you, and `sync push/pull` derive it from `--token` or `LIBER_AUTH_TOKEN`. A 401 answers with the token hint instead of a bare status. `auth_token` is CLI and env only and can never be set over the API: a bearer that could mint itself is no auth at all. Auth internals: [Auth internals](/dev/auth/).

## API and remote mode

The JSON API lives under `/api/v2` (bookmarks, tags, folders, rules, check, bulk, history, settings, sync, library, reindex, profiles, searches, pick) with a checked-in `openapi.json` contract. The bookmark list takes `q/sort/tag/folder/page/per_page/scope/deep`. Adds answer 201, or 409 `{error: duplicate, existing, hint}` with `confirm_dup: true` retrying to 200. Deletes, bulk deletes, tag deletes, check-apply deletes, and restores answer `{confirm_required: true, ...}` until confirmed. `POST /api/v2/sync/commit {push?}` snapshots the library directory with git (always HTTP 200, errors carried in the body), and `GET /api/v2/pick?q=` serves scripts as plain text (400 on missing query, 404 on no match). See the [API reference](/reference/api/).

The mobile and desktop apps in remote mode talk to this server instead of a local library: set the server URL plus token in Settings.

## Bring your own TLS

There is no in-app TLS by design; expose the server through a tunnel or reverse proxy (Caddy, nginx, Tailscale Serve, Cloudflare Tunnel) and point the apps at the `https://` URL. Remote mode and the bookmarklet work unchanged over any base URL.

## LAN checklist

Bind `0.0.0.0` (loopback is unreachable off-box), open the port in the host firewall, confirm `discover` or the QR URL from the client, then save server URL plus token in the client Settings (remote mode) or log in through the browser.
