---
title: Automation internals
description: Rule matching, the applied-rules ledger, and why editing a rule needed a second mechanism.
---

`--auto` auto-classifies bookmarks by a case-insensitive substring match against the URL (`ruleMatches` in `automation.go`), optionally setting a folder and/or adding tags. The whole feature exists to satisfy one constraint: **automation must never fight a later manual change.**

Match strings support two prefixes: `host:` matches only the URL's host (port stripped, e.g. `host:github.com`), and `title:` matches only the bookmark's title. Because of `title:` rules, `resolveAutoRulesForNew` runs *after* the title has been fetched and `normalizeURL`-ed in both `create.go` and the web add handler (`import.go` already knows the title from the export), and before interactive prompts so that `-i` still pre-fills with rule-produced tags/folders. If a `title:` rule's match depends on the fetched title and the fetch fails (title falls back to the URL), the rule simply doesn't match. Rules match at their own moment of evaluation: a `title:` rule applied at creation time uses the fetched title even if the user's interactive edit later changes it.

## The applied-rules ledger

Every bookmark carries `AppliedRules []AppliedAutoRule`: one entry per rule that has ever been considered for it, recording the rule's id and (if the rule set one) which folder it set. This is the mechanism that makes everything else safe:

- **New bookmarks** (`resolveAutoRulesForNew`, called from both `create.go` and `import.go` before the bookmark is actually written): every currently active rule gets one look. A rule's folder only fills in an *empty* folder, so an explicit `-f` at creation (or a folder already present in a browser import) always wins over automation, matching the same "explicit beats convention" precedent as everywhere else in the tool. Tags are additive regardless.
- **Existing bookmarks** (`applyRulesToExisting`, used by `--auto add`'s automatic backfill and by `--auto apply`): only rules *not already in the ledger* are considered. That's what makes re-running a backfill (or adding a second, unrelated rule) safe to do repeatedly without ever reopening a decision that's already been made. Same empty-folder-only guard as above, which is exactly what makes a manual move stick: once a human (or a rule) has put something in a folder, no other rule will ever move it again through this path.

## Why editing a rule needed a second mechanism

The empty-folder guard above is deliberately conservative: once a bookmark has *any* folder, it's hands-off. That's correct for "don't reopen old decisions", but it means a plain reapply can't actually update a bookmark to a rule's *new* folder value after an edit, since the bookmark's folder is (by definition, if the rule ever applied) no longer empty. This was caught directly during testing: editing a rule's target folder and reapplying reported bookmarks as "reapplied" but silently left their folder unchanged.

The fix is `reapplyRule`, used only by `--auto edit ... --reapply`. It asks a more precise question than "is the folder empty": *does the bookmark's current folder still exactly equal what this same rule set it to last time?* That's exactly what the `Folder` field on each `AppliedAutoRule` ledger entry is for. If yes (nothing has manually touched it since), it's safe to advance the folder to the rule's new value. If no (the folder differs from what this rule recorded, meaning either the user moved it or a different rule claimed it first), reapply leaves it alone, same as a plain apply would. Verified directly: reapplying an edited rule across two bookmarks correctly updated the untouched one and left a manually-moved one exactly where the user put it.

If a rule is edited such that it no longer matches a bookmark it previously classified, `--reapply` drops that bookmark's ledger entry for it entirely (via `removeAppliedRule`). The bookmark's actual folder/tags are left as they are; only the record of "this rule considered this bookmark" is removed, since the rule no longer has anything to say about it.

## Multiple folder rules, and deletion

If two folder rules could both match the same never-yet-classified bookmark, whichever is processed first (rules are processed in ascending id order) claims the folder; the second is still recorded in the ledger (so it won't retry later) even though its folder action didn't take effect. There's no priority/conflict system beyond creation order. This is a deliberate scope cut for an edge case that's unlikely to matter in practice.

`--auto delete` only removes the rule definition. It does not touch any bookmark's current folder/tags or ledger entries. The classification a rule already produced is treated as the bookmark's own state going forward, same as if the user had set it by hand.
