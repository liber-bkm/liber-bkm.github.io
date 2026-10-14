---
title: Pairing
description: Connect a phone or second machine to your server over the LAN.
---

To connect a phone or a second machine to your server without typing addresses:

1. Start the server with pairing output: `liber serve --qr`. It prints a terminal QR code of the LAN URL next to the address lines, and advertises `liber-<device-id>` over mDNS (`_liber._tcp.local.`) for its whole lifetime unless `--no-mdns`.
2. On the same network, list servers: `liber discover` (with `--timeout` to tune the browse window).
3. Scan the QR or open the discovered URL, then log in with your token on the login page. The QR encodes the URL only, never the token, so shoulder-surfing a screen gains nothing.
4. In the mobile app (or desktop remote mode), set the server URL plus token in Settings to switch to remote mode.

Browsers cannot browse mDNS, so there is no web discovery control; the Settings remote fields plus login page are the pairing endpoint. Server setup (addresses, auth, tokens) is in [Self-hosting](/config/self-hosting/); the serve flags are in [Serving](/cli/serving/). The pairing mechanics are detailed in [LAN discovery](/dev/discovery/).
