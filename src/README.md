# Simple Spec

A command set for an AI agent (opencode, Claude Code, Cursor). Understanding of a
task is captured as a **story**, the story is implemented as **code**, and the
spec of what was built lives in test names. A loop of two commands: `/story` →
`/do`.

## Model

[story] → [code]

- **Story** — a file in `stories/`: the user's voice (what is needed and why) and
  its distillation (behavior items). It is an **append-only log of intentions**,
  like a changelog: old entries are not rewritten to match new code. A story, not
  a **spec**: an entry does not assert a crisp requirement — the user's intention
  may be imprecise or wrong, truth lives in the code and tests, not in the entry.
- **Code** — the implementation and the source of truth. Test names in the user's
  language mirror the story's behavior items — that is the spec of what was done.

The arrow `→` is a projection: the story's behavior items become test names. It
outlives the aging of the entry: the log stays a record of a past intention, test
names keep saying what is done.

The second pillar of the model is the **level**: an `AGENTS.md` in every
meaningful folder of the hierarchy. The entry says *what* the user should see; the
level says *how it is verified* (the `Verification` section) and which rules
cannot be derived from code (`Non-Obvious Rules`). Without a level you cannot tell
whether a feature is implemented.

## Story loop

```
main ──●──────────────────────────────────●── merge: the user's decision
        \                                  /
         ●── story ────●── code + tests ──●
       /story         /do
```

`/story` — discuss with the user what is needed and why, then record the outcome
of the discussion in `stories/` as one file. `/do <story-name>` — implementation:
code and tests for the story's behavior items; `<story-name>` is a file from
`stories/`. Flow details live in the `story.md` and `do.md` commands.

Trivia goes outside the loop — you don't open a story for a typo.

`/architect` — outside the loop: an application skeleton, i.e. a file hierarchy
with `AGENTS.md` at every level (or a ready-made template from `src/templates/`).

## Why this way

A permanent spec kept next to the code forever will sooner or later stop being
updated — then both lie, and you have to trust the code. Simple Spec does not let
such a spec appear — and does not throw the intention away. Intention and
understanding of the task live in the story (`stories/`); decisions that cannot be
derived from code live in "why" comments (the most valuable one is the rejected
alternative) and in the level's `Non-Obvious Rules`; cancellation of previous
behavior lives in the commit message that removed the test.

What it is not: not a task tracker, not a wrapper over GitHub (the loop knows only
git: PRs and reviews are project rules), not architecture documentation (its home
is the level's `AGENTS.md`), not a BDD framework — which test kinds to use is
decided by the level.

## What goes where

- `src/commands/story.md` — the story: the command and the format of entries in
  `stories/`.
- `src/commands/do.md` — the command that implements a story.
- `src/commands/architect.md` — the command that builds the skeleton.
- `src/LEVEL.md` — the level format (`AGENTS.md` in the project): boundaries,
  patterns, `Verification`.
- `src/templates/` — ready-made architecture skeletons for `/architect`
  (e.g. `web-app/`).

## Installation

`install.sh` installs the commands and the kit (`LEVEL.md`) — into a project or
globally for the user:

```
./install.sh <path-to-project> [service-folder] [-l language]   # default en
./install.sh --global [opencode|claude|cursor] [-l language]     # global for the user
```

The language of the texts is the `-l` flag (default `en`; Russian — `-l ru`); the
`.installed` manifest remembers it, so a re-run without the flag keeps the
installed language. The kit travels next to the commands; references inside the
commands are rewritten to its path. A re-run updates the kit, removes commands
that no longer exist in the method, and does not touch the project's `stories/`.
Details are in the header of `install.sh`.