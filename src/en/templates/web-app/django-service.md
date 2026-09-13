# {Service Name} (Django)

## Overview
A backend server: a REST API for all clients, domain models, {integrations}.

## Boundaries
- Does: API, business logic, storage, {integrations}.
- Does not do: UI (that's the client services), {what else it doesn't do}.

## Tech Stack
Python {version}, Django {version}, {DRF, task queue, DB, cache, the rest}.

## Architecture
- `{project}/` — settings, urls, wsgi, {entry points of background processes}.
- `apps/{core}/` — shared for the apps: {base model, filters, shared REST}.
- `apps/{domain}/` — {the domain}.
- ... one for each app below.

## Patterns
- Each Django app is a separate level with its own `AGENTS.md`.
- {Models inherit from the shared base model in core}.
- {API: how views and serializers are built, what they inherit from}.
- {What every app with models must have: admin etc.}.

## Verification
- {Tests: the tool, where they live, how they are named}.
- {The linter and how it is run}.
- {The command that checks the whole service}.

## Dependencies
- {infrastructure: DB, cache, storage}.
- {external APIs, if any}.