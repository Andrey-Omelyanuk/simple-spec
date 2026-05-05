# Simple Spec — a simple way to develop with AI agents
The system turns chaotic development into a managed pipeline: `Spec` (what is needed) → `Todo` (how we implement it) → `Code` (the result).
This is an attempt to do Spec Driven Development "our own way" — mostly a simplified variant.

## Definitions
- **Dev Unit** — a folder with `spec.md` + `todo.md` + `agent.md`. The minimal unit of an agent's work. Dev Units can be nested inside one another, forming the skeleton of an application.
- **Spec** — the central entity of a Dev Unit, describing the requirements, boundaries, and goals of the artifact. Describes **behavior** ("what the system does"), not technologies.
- **Todo** — a task to be executed by an agent.
- **UserStory** — a short story from the user's perspective in the format "Who / What they want / Why" (+ optionally free-form examples). Stored in the `user-story/` folder at the root of the application. **This is the main source of truth** and a mandatory entry point for any new behavior. The format is intentionally simple so that any adult can write a story, not just a product manager; for details see `commands/user-story.md`. Technical tasks (refactoring, dependency updates) can enter without a story but go through the same pipeline.

## Inventory
Inside one Dev Unit there are always these files:
- `spec.md` — only behavioral requirements. Can be a `spec/` folder if there are too many requirements. **Self-sufficient at its level**: a child spec is not required to read the parent's, synchronization happens through the `/specify` process, not through the file.
- `todo.md` — the local list of implementation tasks for the current `spec.md`. Each task is atomic.
- `agent.md` — describes the agent: role, skills, tools, restrictions, preferences, which model to use. Here also live the **technological defaults** ("prefers JWT for auth", "uses Postgres") — these are the executor's preferences, not system requirements. Also contains:
    - a brief description of the Dev Unit;
    - context in two parts: **"mine"** — what the unit works on and may change; **"must know"** — read-only, including links to others' contracts (e.g., `../backend/spec/api.md`);
    - the order of traversal of child dev units (e.g., backend finishes before we launch frontend);
    - **self-check rules**: which checks the agent runs after a task (tests, linter, browser demo, etc.), how many attempts per task, what to do when attempts are exhausted (by default — escalation to the parent with a description of the attempts).
- `architecture.md` — only at the root of the application. Describes the entire tree of dev units, neighbor dependencies, and traversal order. Stored separately for the `/architect` and `/specify` modes.

## Core principles

**Everything is launched from the root.** Any change to specs enters through the root agent and propagates down the tree. We do not invoke an agent in the middle of the tree directly. Coordination and contract alignment is the parent's job.

**Spec is self-sufficient at every level; synchronization is through process, not through the file.** A child spec does not read the parent's. When the root receives a new story, it:
1. Adapts its own spec, if needed.
2. Decides which children the change concerns, and propagates the story (with local clarifications) recursively.
3. If a child sees a conflict with its own spec — it returns it upward, the parent decides.

When a requirement is **deleted** at the parent, `/specify` cascades through the children and removes the related parts. The integrity of the system across files is not statically verified; for that there is `/audit`.

**Requirements derived from a user story are marked with a link to it.** The format is `[← <story-slug>]` immediately after the rule: for example, `- The name can be changed, statistics are preserved [← rename-me]`. Multiple sources — `[← remember-me, rename-me]`. If an entire section is derived from one story — the label is placed on its heading, not duplicated in the bullets. Requirements not derived from a story (refactoring, dependency updates, purely infrastructural rules) go without a label. There is no reverse `story → spec` link — the story stays minimal and writable by any adult; the search "which specs cover this story" is done via grep or `/audit`.

**Read-context vs write-context.**
- *Write-context* (where a unit may change) — strictly its own subtree. This also defines the dev units tree.
- *Read-context* (from where a unit reads) — any source declared in `agent.md` under the "must know" section. This is how frontend subscribes to the backend's API contract.

**Cycles between siblings are forbidden.** If two units are mutually dependent — the shared knowledge is moved up to their common parent.

**Minimally sufficient now + explicit extension points for known future requirements.** Not "let's make it as flexible as possible" — that is the path to over-engineering. Flexibility is built where it is already understood.

**On uncertainty, the agent asks the human, not guesses.** This is a cross-cutting rule for all modes: if something can only be decided by guessing (priority, choice between two architectures, is this a duplicate or a new task) — it is better to ask a question than to silently choose wrong.

**Two-level quality control.** The agent verifies its own work by the rules from its `agent.md`. The parent agent additionally verifies the child's result — but only against its contract with the child (e.g., "the child said the endpoint is ready — the parent checks that the endpoint responds per the spec"). The parent does not validate the child's internals. At the root, the parent's role is played by the human.

## Modes of operation
- **`/architect`** — discussion of architecture (the tree of dev units). Forms/refines `architecture.md` and the `agent.md` of each dev unit. Uses the top-level `agent.md` as a set of rules. On an empty project starts from the **template of a zero-level `agent.md`** — this resolves bootstrap.
- **`/specify`** — forms/refines `spec.md`. Launched from the root and propagates down the tree; at each level works interactively (suggests: "lift up or keep here?"). Each level only adds its own details. When deriving a requirement from a user story, sets the `[← <story-slug>]` label.
- **`/plan`** — discussion of implementation within a single dev unit. Forms/refines `todo.md`. Uses the agent of the same level. Responsible for **task ordering**: the list is always sorted by dependencies — first tasks without dependencies, then those that depend on them. A new task is inserted not at the end, but at the correct place in the queue.
- **`/user-story`** — generation of user scenarios in `user-story/` in the format "Who / What they want / Why". Watches that no technologies, acceptance criteria, vague wording, or multiple wishes leak into a story — those belong to other artifacts (see `commands/user-story.md`). As a final step suggests moving on to `/specify` to convert new stories into `spec.md` + `todo.md` across the tree.
- **`/do-it`** — execution of tasks from `todo.md`. Each task starts with a clean context (reads only the first task in `todo.md`, the relevant files, and `agent.md`). Takes the **first** task — the order in `todo.md` is already correct (see `/plan`). If during execution it discovers something is missing (an artifact, a contract, a file) — it **stops** with a message, does not skip and does not move on to the next. The task is removed from `todo.md` only after successful completion of the self-checks from `agent.md`. On failure it stays in `todo.md`, the agent appends an "attempt N: what went wrong" block so that the next run does not repeat the same mistake. After attempts are exhausted — escalation to the parent.
- **`/audit`** — reconciliation of the codebase against the spec. Finds discrepancies and **adds** tasks to `todo.md` to address them. Before adding it cross-checks against existing tasks and **does not multiply duplicates**: if a new finding is a variation of an existing task, it is not added. On doubt ("is this the same or new?") — asks the human. This is also where contract desynchronization between siblings is caught (frontend checks that its code matches the current version of the backend api). Also verifies the spec ↔ story link: labels on deleted stories and stories not covered by any spec.
- **`/import`** — migration of existing code into Simple Spec. Analyzes existing files and generates a draft `spec.md` + `todo.md`.

## General rules of agent operation (even if not described in `agent.md`)
- An agent operates only within the context described in `agent.md`.
- Each agent may invoke a sub-agent for a child dev unit and is required to handle its response — including escalating conflicts upward.
- When propagating a story down the tree, the agent decides whether it concerns the child. Simple rule: if the story contains concepts/names that appear in the child's `spec.md` or in the "mine" section of its `agent.md` — propagate. If unclear — propagate (default). Unconditionally do not propagate only when there is explicit certainty "does not concern".
- Parallel traversal of subtrees is not yet supported — everything is sequential. Parallelism will be added when it becomes obvious where it is safe.

## Examples
They are located in `templates/`:
- **game-v1** — the simplest implementation, a single dev unit, the final result is `index.html`.
- **game-v2** — a bit more complex: there is a server, through which `index.html` and other resources are served.
