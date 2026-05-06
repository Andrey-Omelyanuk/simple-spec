# Specify

`/specify` forms and refines `spec.md` across the dev units tree. It is the only mode allowed to write into `spec.md`. Launched from the root, it propagates down the tree; each level adds only its own details.

A spec describes **behavior** — what the system does, what its boundaries are, what invariants hold. Technologies, frameworks, and implementation choices do not belong here; they live in `agent.md`.

## Format

`spec.md` is plain Markdown. Group requirements under headings, one observable statement per bullet.

```markdown
# [Dev unit name]

## [Section]
- The system does X.
- The system does Y [← <story-slug>].
```

If requirements outgrow a single file, `spec.md` becomes a `spec/` folder at the same level — the split is purely cosmetic, the level does not change.

### Linking to user stories

Requirements derived from a user story carry the story's slug right after the rule:

- `- The name can be changed; statistics are preserved [← rename-me]`

Multiple sources are listed comma-separated:

- `- The session is restored on a new device [← remember-me, rename-me]`

If an entire section is derived from one story, place the label on the heading and do not repeat it on each bullet:

```markdown
## Renaming a player [← rename-me]
- The name can be changed at any time.
- Statistics are preserved.
```

Requirements that do not come from a story (refactoring, dependency updates, infrastructure rules) go without a label.

There is no reverse `story → spec` link. The story stays minimal and writable by any adult; the mapping "which specs cover this story" is recovered via `grep` or `/audit`.

## What goes into spec, what does not

**Goes in:**
- Observable behavior — what a user, neighbor unit, or external system can see.
- Boundaries — what is in scope and what is explicitly out.
- Invariants and constraints — "a match has exactly two sides", "works without internet".
- Extension points known in advance — only where flexibility is already understood.

**Does not go in:**
- Technologies, libraries, frameworks — those are `agent.md`.
- Implementation steps or task ordering — those are `todo.md` (see `/plan`).
- User-language wishes without observable behavior — those stay as user stories.
- Copies of parent or sibling requirements — synchronization is by process, not by file.

A spec is **self-sufficient at its level**. A child spec must be readable without opening the parent's. Cross-unit knowledge enters via `agent.md` "must know" links, not by inlining other units' rules.

## Process

`/specify` always starts at the root. Mid-tree invocation is forbidden — coordination across the tree is the parent's job.

### Adding behavior from a user story

1. Read the new story (or stories) from `user-story/index.md`. `glossary.md` is part of the read-context.
2. Update the root `spec.md` if the behavior belongs there. Add the `[← <slug>]` label.
3. For each child decide whether the story concerns it. Simple rule: if the story uses concepts that appear in the child's `spec.md` or in the "mine" section of its `agent.md` — propagate. On doubt — propagate. Do not propagate only on explicit certainty "does not concern".
4. Recursively, each child agent runs the same procedure on its own spec, with the parent's clarifications.
5. If a child sees a conflict with its current spec — it returns the conflict upward. The parent decides whether to adapt the parent spec, rework the contract, or drop the requirement.

### Adding behavior without a story

Refactoring, dependency updates, and pure infrastructure rules may enter through `/specify` without a story. They follow the same descent but without `[← ...]` labels.

### Deleting a requirement

When a requirement is removed at one level, `/specify` cascades through children and removes related parts. The cascade is best-effort; static cross-file integrity is not verified here — that is `/audit`.

### Deleted user stories

`/specify` does not chase deleted stories. Stale `[← <slug>]` labels and stories not covered by any spec are caught by `/audit`, which adds cleanup tasks to `todo.md`.

## Interactive rules

At every level the session is a dialog, not a silent rewrite. The agent must ask, not guess, in the following situations.

- **Lift up or keep here?** When a piece of behavior could live at the parent or at the current level — propose explicitly, do not decide silently.
- **Same or new?** When a candidate requirement looks like a variation of an existing one — ask before adding, to avoid quiet duplicates.
- **Sibling concern?** When behavior touches a sibling unit — it does not belong here; lift it to the common parent (cycles between siblings are forbidden, common knowledge is shared via the parent).
- **Ambiguous wording?** When a story can be read in more than one way — ask the author before encoding one of the readings as a rule.

The default everywhere is "minimally sufficient now + explicit extension points for known future requirements". Flexibility goes only where it is already understood.

## Boundaries with other modes

`/specify` only writes `spec.md` (or files under `spec/`). It does not touch:
- `architecture.md` and `agent.md` — those belong to `/architect`.
- `todo.md` — belongs to `/plan` and `/audit`.
- Source code — belongs to `/do-it`.

After a session each touched unit has an updated `spec.md` and, where applicable, new `[← <slug>]` labels. The next step is usually `/plan` on the affected units.

## Examples

### Lifting a requirement to the parent

A story `pause-match` lands at the root. The root proposes:

> "Pause must work both in the UI and on the server. Lift the rule to the root spec, or keep one copy in `frontend/` and another in `backend/`?"

Default suggestion — lift, because both children would otherwise carry duplicated wording that can drift.

### Story label on a section

```markdown
## Match pause [← pause-match]
- A match can be paused at any moment by either side.
- A paused match does not consume the move timer.
- Resuming requires confirmation from both sides.
```

### Conflict escalation

The root tells `backend/` to add "session restored on a new device". `backend/spec.md` already says "a session is bound to a single device". The child does not silently overwrite — it returns the conflict; the root decides whether to relax the old rule, scope the new one, or reject the story.
