---
title: Serving the library
description: Serve flags, discovery flags, and where the flows continue.
---

Serve the API plus web UI from the command line; the server setup (addresses, auth, remote mode) is configured in [Self-hosting](/config/self-hosting/).

```sh
liber serve --addr 127.0.0.1:8080
liber serve --qr              # print a terminal QR pairing code
liber serve --no-mdns         # opt out of mDNS advertising
liber serve --static-dir ./frontend/dist   # point a dev build at a built UI
liber-serve --addr 0.0.0.0:8080 --auth-token <token>   # server only
liber discover --timeout 10   # list liber servers on the LAN (default 5 seconds)
```

`liber serve` prints localhost and LAN URLs; `--qr` adds the pairing code and mDNS advertises unless `--no-mdns`. The phone-side pairing walkthrough (scan, log in, remote mode) is in [Pairing](/app/pairing/).

Next: [Configuration overview](/config/overview/).
