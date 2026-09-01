---
description: Story mode — discuss the intention, reconcile with code and stories, record the outcome in stories/
argument-hint: <what the story is about | name of an existing one>
---

# /story

You discuss the **intention** — what is needed and why — and record in `stories/`
the outcome: the user's voice plus your **distillation**, how you understood the
task. A story is the only entry point for implementation (`/do`). The command's
result is a single story file: no code, no branch, no commit.

What the story is about: `$ARGUMENTS`

If a name or file path from `stories/` was passed — the story is not new: you work
on it, clarify and append; you don't create a new file. If text was passed — a new
story. If nothing was passed — a new story from the conversation.

## Format

A file `stories/YYYY-MM-DD-<name>.md` — one per story. The date is the day the
story was opened (`date +%F`); an existing story keeps its date. The heading
inside is the name in words; the file name is a short latin kebab-case name, which
will become the branch name in `/do`:
`# Vacation request` → `stories/2026-08-24-vacation-request.md`.
You give the name last, when the intention has settled: if the discussion shifted
the phrasing — rename the file together with the heading while the story is not
implemented.

Inside there are exactly three things: name, voice, behavior. No other sections —
what we consciously do not do, you agree on with the closing phrase of the voice.

```
# {Name}

{What is needed and why — in the user's words, the ones the conversation settled
on. One or two paragraphs.}

## Behavior
- {what the user observes when such-and-such happens}
- ...
```

`## Behavior` is mandatory: each of its items becomes a test name. Hence the
requirements for an item:

- **one item — one checkable result**: "and" between two different results means
  two items;
- **an observable result, not a task**: not "add a cancel button", but "a
  cancelled request is no longer visible in the list";
- **condition and result** — when such-and-such happens, what the user sees. An
  item you cannot invent a check for is not an item but a wish.

Example:

```
# Vacation request

An employee asks for leave, a manager answers. Today it's emails: nobody remembers
how many days are left, and requests get lost. We don't pull in a team calendar —
a request knows nothing about other people's dates.

## Behavior
- the author can no longer change a request once it is submitted
- the manager sees only submitted requests in their list
- an approved request deducts days from the employee's balance
- a rejected request deducts no days, and the manager states the reason
- the author withdraws the request while there is no answer; after an answer it
  cannot be withdrawn
```

This is an intention file. An outdated story is not a bug: `stories/` is a log,
what is implemented is not rewritten, a new intention is a new story.

## Flow

1. **Figure out what is needed and why** — in the user's words; no code and no
   code jargon here.
2. **Reconcile thoroughly** — with all stories and with the existing code. You
   read the stories in `stories/` in full, all of them: file names alone don't
   reveal duplication and conflicts — they will surface during implementation.
   For the code, the map is the `AGENTS.md` of the affected levels and the test
   names — that is the spec of what is done; read the story's code, don't skim.
3. **Show what's new.** Split what you heard into three piles and name them for
   the user: what **already exists** — works and is covered by a test; what is
   **new** — it doesn't exist; what **changes** — it exists but works differently,
   and the story cancels the previous behavior. This way the user sees what the
   story is really about. If you found a duplicate of or a conflict with a past
   story — show it and ask what to do.
4. **Ask** until everything is clear. Name the unclear place directly and propose
   a variant rather than throwing an open question into the void.
5. **Distill** the outcome of the discussion into behavior items and **show the
   story** per the format. Into the items go only the new and the changing from
   step 3: "already exists" is covered by a test; works without a test — still an
   item (the spec of what is done is the test names, step 2).
6. Once the user confirms — write the file. The command ends here.

## What you do NOT do

- You don't write code and tests — that's `/do`.