# {Library Name}

## Overview
What this package is, what task it abstracts, who needs it. 1-2 lines.

## Boundaries
- Does: {the public API — declaratively, what the user can do}.
- Does not do: {what is absent — these are the API boundaries}.

## Tech Stack
Python {version}, {dependencies}.

## Architecture
- `src/{package}/` — implementation, `__init__.py` is the entry point (public API).
- `tests/` — pytest, `testpaths` in the config.
- {demo, docs} — as needed.

## Patterns
- {patterns: entry-point re-export, single abstraction}.
- Naming: {module and test naming}.

## Non-Obvious Rules
- {rules that cannot be derived from the code}.

## Verification
- `pytest` — tests in `tests/`, isolated with mocks, check the public API.
- {definition of done}.

## Dependencies
- {direct dependencies}.