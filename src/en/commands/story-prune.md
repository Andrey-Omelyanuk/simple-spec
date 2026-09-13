---
description: Prune mode — finds and removes stale stories from stories/
argument-hint: [threshold-days]
---

# /story-prune

Entries in `stories/` are a log of intentions. Some go stale: their behavior has
left the code. You remove them so the live log doesn't trip over dead intentions.
Deletion happens only on confirmation — the intention stays in git.

## What is stale

An entry `stories/YYYY-MM-DD-<name>.md` is stale when all three hold:

- **No projection** — no `## Behavior` item is mirrored by a test name: the
  behavior has left the code. Match by meaning — it's the projection read
  backwards.
- **Superseded** — a newer entry in `stories/` has taken its place or cancelled
  its behavior.
- **Rested** — the date in the filename is older than the threshold (default 30
  days; `$ARGUMENTS` is your threshold).

**Live** — at least one item still projects to a test: the behavior is in the
code, the entry says why. You don't touch it. **Abandoned** — no projection and
nobody superseded it: the decision is the user's.

## Flow

1. Collect `stories/YYYY-MM-DD-*.md`.
2. Read every entry in full and the code map: the `AGENTS.md` of the affected
   folders and the test names.
3. Split the entries into three piles and show them: for a stale entry — the
   evidence (which tests covered its items, which commit removed them, which
   entry superseded it); for an abandoned one — show and ask.
4. Delete only what is confirmed: `git rm`, one commit per entry; the message
   names what was removed and what superseded it.

## What you do NOT do

- You don't delete live entries and don't decide for the user about abandoned ones.
- You don't edit code, tests, or story items.