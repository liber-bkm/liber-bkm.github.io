---
title: Auth internals
description: Token model, browser cookies, and derived bearers.
---

`--auth-token` / `LIBER_AUTH_TOKEN`, empty means open. Browsers use an HMAC signed cookie plus Origin/Referer checks on POSTs, API clients use `Authorization: Bearer` with constant time compare. Pages redirect to login, `/api/*` returns JSON 401. No sessions, no per form tokens.

Two deliberate divergences from the old design: adding an existing URL returns 409 with the existing entry, and `confirm_dup` is idempotent (200 with the existing entry) instead of creating a true second copy, since the store enforces URL uniqueness. Axum 0.7 route params use `:id` syntax; `{id}` registers as a literal segment and 404s (found the hard way, pinned by tests).
