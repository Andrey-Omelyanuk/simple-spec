# {Project Name}

## Overview
What this platform is and what for. 1-2 lines.

## Boundaries
- Monorepo: {composition — backend, frontend, infrastructure}.
- {what lives inside one of the services rather than separately: e.g. a bot as a
  process of the backend}.
- Does not do: {what stays outside the monorepo}.

## Architecture
- `{backend}/` — {monolith: REST API, domain models, ...}.
- `{web}/` — {SPA web client}.
- `{infra}/` — {Docker Compose, gateway, DB, cache, storage}.
- {other services}.

## Non-Obvious Rules
- {The single launch interface: e.g. `make` at the root — build, run,
  stop, tests, logs, console}.
- {A needed command is missing — add it by analogy with the existing ones, not
  around them}.
- {Nothing is launched directly bypassing this interface: neither docker compose,
  nor python/node inside the repository}.
- {How to run an arbitrary command in a service}.
- {Environment variables: where they live, where they are copied from}.

## Verification
{How the whole is checked: each level has its own `Verification`, the root level
is a successful launch of everything and green tests in all levels. Name the
commands.}