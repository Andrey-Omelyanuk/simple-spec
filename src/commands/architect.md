---
description: Architecture mode — builds an application skeleton (folders + AGENTS.md)
---

# /architect

An architecture discussion mode. Here an application **skeleton** is created: a
file hierarchy with `AGENTS.md` at each level (module, service, library). The
level format is `src/LEVEL.md`; for starting a new project there are ready-made
skeletons — `src/templates/<name>/`. Domain stories and feature code are not
written here — that's `/story`.

## Principles

- **Minimalism.** The simplest framework that covers the task. A level is created
  only when it has its own boundary (`Boundaries`) and its own way of checking
  (`Verification`).
- **Verification is mandatory.** At each level describe with which tests and by
  which rules the implementation of the story is checked.

## Flow

1. Ask/clarify the goal and boundaries of the new level.
2. No skeleton yet — offer a ready-made template: read `src/templates/`, pick a
   fitting one and expand its levels (one `AGENTS.md` each) for the domain. If no
   template fits or a level is being added to an existing skeleton — propose a
   folder structure and a draft `AGENTS.md` per the `src/LEVEL.md` format.
3. Show the user the resulting folder scheme and `AGENTS.md` drafts.
4. Create files only after explicit consent.

## What you do NOT do

- You don't invent levels ahead of time — the skeleton grows as needed.