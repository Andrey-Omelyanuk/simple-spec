# Level format

The `AGENTS.md` file describes a **level** of the hierarchy (module, service,
library). It is a map, not a retelling of the code. This is the format of such a
file; in the project the file itself is always named `AGENTS.md` — that is the
name tools read on their own.

The main rule: write only what **cannot be read from the code in 30 seconds**.
Purpose and boundaries of the level cannot, so they are here. Function signatures
and data structures can, so we don't duplicate them here.

Three sections are mandatory: `Overview`, `Boundaries`, `Verification`. The rest
you take as needed; don't leave any empty. If you need a section that is not in
the template — the fact has no owner: it is almost always `Non-Obvious Rules` or
`Patterns`.

## Template

```
# {Module Name}

## Overview
Why this level exists. 1-2 lines.

## Boundaries
What this level does and what it does **not** do.

## Tech Stack
Technologies used.

## Architecture
Directory structure.

## Patterns
Code patterns (error handling, naming, etc.). Comments — only "why"
(decisions, rejected alternatives), never "what".

## Non-Obvious Rules
Rules that cannot be derived from the code.

## Verification
How to verify that the story is implemented at this level: with which test kinds
and by which rules they are formed (tools, file locations, how tests are named,
definition of done). Describe rules, not a list of tests.

## Dependencies
What this level depends on (direct dependencies only).
```