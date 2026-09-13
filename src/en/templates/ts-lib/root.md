# {Library Name}

## Overview
What this library is, what task it abstracts, who needs it. 1-2 lines.

## Boundaries
- Does: {the public API — declaratively, what the user can do}.
- Does not do: {what is absent — these are the API boundaries}.

## Tech Stack
TypeScript {target}, {dependencies}, Jest/ts-jest, {bundler: rollup/vite}.

## Architecture
- `src/index.ts` — the entry point, re-exports all modules.
- `src/` — sources, one module per folder.
- `dist/` — the built package (UMD + ESM + d.ts).
- `e2e/` — e2e tests of the public API.

## Patterns
- {patterns: entry-point module, single client/abstraction}.
- Naming: {file, class and test naming}.

## Non-Obvious Rules
- {rules that cannot be derived from the code}.

## Verification
- Unit: `*.spec.ts` next to the module, jest; the module is isolated with mocks.
- E2E: `e2e/` imports the built package from `dist/` — checks the public API.
- Lint + build without errors (tsc --noEmit).
- Definition of done: {build and all tests green}.

## Dependencies
- {direct dependencies}.