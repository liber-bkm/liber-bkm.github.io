---
title: "Ingest: dedupe and import"
description: URL normalization keys and the regex-driven Netscape bookmark parser.
---

## Duplicate detection

`dedupe.go`'s `normalizeForDedupe` builds a comparison key by:

- lowercasing scheme and host (case-insensitive per the URL spec; this is the *only* case-folding done, since path and remaining query **values** are left exactly as given because those can be genuinely case-sensitive on the server)
- stripping the default port for the scheme (`:80` for http, `:443` for https)
- stripping a trailing slash from the path
- stripping known tracking query parameters (`utm_*`, `fbclid`, `gclid`, `mc_cid`, `mc_eid`, `igshid`, `ref`) and dropping the fragment entirely

This only ever collapses URLs that are genuinely the same resource, never ones that merely look similar. The deliberate asymmetry (case-fold scheme/host but never path/query) is what keeps false positives out.

`liber <url>` warns and asks before adding a detected duplicate (default: no). `liber --import` skips duplicates silently instead, since prompting per item during a bulk import of potentially hundreds of bookmarks isn't practical.

## Import format

The Netscape Bookmark File Format (what Firefox, Chrome, and Safari all export to) isn't real HTML. Browsers emit it as a fixed, predictable sequence of a handful of tags. `import.go`'s `netscapeTagRe` scans for exactly these, in the order they appear:

```text
<DT><H3 ...>Folder Name</H3>   -- names the NEXT <DL><p> that opens
<DL><p>                        -- enters that folder (or root, if no <H3> preceded it)
<DT><A HREF="..." TAGS="a,b">Title</A>
<DD>Optional description line  -- Firefox-only, follows its <A>
</DL>                          -- leaves the current folder
```

A small regex-driven scan is enough for this fixed format. Pulling in a full HTML parser would be overkill and, being an external dependency, against the project's zero-dependency design. `parseNetscapeBookmarks` tracks the `<H3>`/`<DL>` nesting with a simple stack to compute each link's folder path (joined with `/`, e.g. `Work/Reference`).
