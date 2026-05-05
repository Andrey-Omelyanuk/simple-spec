# User Story

A user story is a short story from the user's perspective describing one usage scenario. It is the **main source of truth** and the mandatory entry point for any new system behavior. Stored in `user-story/` at the root of the application.

The format is intentionally minimal: any adult should be able to write one, not only a product manager or analyst.

## Format

```markdown
## [Story title]
**Who:** [user role or situation]
**Wants:** [action or outcome]
**Why:** [what benefit they get]

[Optional: free-form examples — how it happens in real life]
```

The three lines are mandatory. Examples are optional.

## What is forbidden in a story

This is not "allowed but undesirable" — these are hard format boundaries. Everything listed below belongs to other artifacts (`spec.md`, `agent.md`, `todo.md`), not to a story.

- **No technologies.** Not "via REST", not "in React", not "in Postgres". Technologies are the concern of `agent.md`.
- **No vague words.** "Convenient", "fast", "modern", "intuitive" — drop them or rephrase as observable ("works on a phone", "opens without page reload").
- **No acceptance criteria, checklists, or given/when/then.** A story describes a wish, not acceptance. Behavior is detailed during `/specify`.
- **One story = one wish.** If "and also", "and at the same time", "and what if" appears inside — these are several stories, split them.
- **In the user's language, not the developer's.** Not "sends a POST request", but "clicks the «Sign in» button".

If something forbidden is important — it must appear later, in the spec, and not from the story author.

## Grouping

Stories live in `user-story/<epic>/<name>.md` — **a single folder level**, no nesting.

- **An epic is a functional area** in the user's language (`payment`, `reports`, `authentication`), not the developer's (`payment-service`, `auth-api`). Technologies in an epic name are forbidden the same way as in the story itself.
- **A story at the boundary of epics** — placed in one main epic, not duplicated. If unclear which one — ask the human.
- **While there are few stories** (roughly under 10) — everything can stay flat in the root of `user-story/`. Epics are introduced when the structure stops being readable from a flat list, not in advance.
- Grouping by epics **does not have to match the dev units tree**. A story lives at the root of the application and may affect several units; the dev units tree is the write-context for agents, while epics are navigation for humans.

## Index

`user-story/index.md` — a curated table of contents: mirrors the folder structure and sets the order for traversal through `/specify`.

```markdown
# User Stories

## authentication
- [Remember me](authentication/remember-me.md)
- [Rename me](authentication/rename-me.md)

## game
- [Play a match](game/play-match.md)
- [Pause a match](game/pause-match.md)
```

- No metadata — only epic headings and links to stories.
- The order of epics and the order of stories within = the order of `/specify` sessions. Earlier stories must not rely on later ones.
- A file lying in a folder but not in `index.md` — means it has not yet been accepted by the curator, `/specify` does not touch it.

## Glossary

`user-story/glossary.md` — the project's shared language: terms appearing in multiple stories (match, player, move, points). One definition per term, in the user's language, no technologies.

`index.md` and `glossary.md` live at the root of `user-story/` (not inside an epic) and are mixed into the read-context of every `/specify` session — that is enough to keep specs from diverging in terminology and order.

## Examples

### Password reset
**Who:** a registered user who forgot their password
**Wants:** to recover access to the account via email
**Why:** not to lose the data and not to create a new account

Happens after a long break — you log in once every six months and don't remember the password. You want to handle it yourself, not call support.

### Dark theme
**Who:** a user working in the evening
**Wants:** to enable a dark appearance
**Why:** not to strain the eyes when working in the dark

### Report export
**Who:** an accountant
**Wants:** to export a monthly report as a single file
**Why:** to send it to the tax office without assembling it by hand
