---
description: Implementation mode — implements the story with code and tests
argument-hint: <story-name>
---

# /do

You implement the story: `$ARGUMENTS`

The story format is in `src/commands/story.md`.

## Flow

1. **Take the story.** A name was passed — the file `stories/YYYY-MM-DD-<name>.md`;
   if the file doesn't exist, ask which story and don't guess: the freshest entry
   in `stories/` is not necessarily the one needed. No name — take the story from
   the `/story` that ran in this session; if there was none — say that `/do`
   doesn't work without a story and offer `/story`.
2. **Read the levels** — the `AGENTS.md` of the affected folders, from there
   `Verification`. If a level has no `AGENTS.md` — stop and offer `/architect`:
   without `Verification` there is nothing to check against, the story won't close.
3. **Take a branch.** No branch yet — create one from main: the branch name is the
   story name without the date (`shop` for `stories/2026-08-24-shop.md`), the story
   file is the first commit. A branch exists — switch to it and continue where the
   previous call stopped — by the branch's commits and test names: `/do` can be
   called any number of times.
4. **Implement the `## Behavior` items** that don't have a test yet:
   - the test name mirrors the wording of the item;
   - a decision that cannot be derived from the code is a "why" comment next to
     the code or in the level's `Non-Obvious Rules`;
   - behavior absent from the story (an edge case) — append an item to the story
     on your branch (before the merge) and only then write the test;
   - an item cancels behavior covered by a test of a past story — rephrase or
     remove that test in a separate commit; in the message name what was cancelled
     and why;
   - a new level is needed — an `AGENTS.md` per the `src/LEVEL.md` template, on
     the same branch.
5. **Prove it**: run the level's tests and show the output — a diff without a run
   is not a result. Write out the projection: one line per item,
   `item → test name`; name an item without a test directly, with the reason.
6. **Commit and push.** You commit in meaningful steps, code only on a green run:
   a red test is not a commit but unfinished work. You push the branch to
   `origin`; if there is no `origin`, it stays local — that is not an error. The
   command ends with a branch and the projection.

## What you do NOT do

- You don't merge the branch — that's the user's decision.
- You don't delete or rewrite story items — only append; a dispute with the story
  goes back to the chat.