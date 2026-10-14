---
title: LAN discovery
description: QR pairing plus mDNS mechanics.
---

Pairing is QR plus mDNS under `_liber._tcp.local.`. `serve` advertises `liber-<device-id>` with the device id and API version in TXT records for its whole lifetime (opt out with `--no-mdns`, skipped with a warning when no LAN address exists); `discover` browses with a timeout and prints instance plus URL lines. `serve --qr` prints a terminal QR of the LAN URL next to the address lines. The QR encodes the URL only, never the token: a scanned code opens the login page, where the token still gates entry, so shoulder-surfing a screen gains nothing. Browsers cannot browse mDNS, so there is no web discovery control; the Settings remote fields plus login page are the pairing endpoint.
