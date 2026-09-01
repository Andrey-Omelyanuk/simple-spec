# Web App

A monorepo: a Django backend monolith, an SPA client, infrastructure. Every
service and every Django app is a separate level with its own `AGENTS.md`. The
level format is `src/LEVEL.md`.

## Level scheme

```
root                        ← root.md
├── {backend}/              ← django-service.md  (monolith: API, domain)
│   └── apps/<domain>/      ← django-app.md      (one Django app)
├── {web}/                  ← a service as needed (SPA, other stack)
├── {infra}/                ← a service as needed (Docker Compose, gateway, DB)
└── <another service>/      ← a service as needed
```

The backend and its `apps/*` are mandatory. The other services are created as
needed — a level appears when it has its own boundary and its own `Verification`.
Another Django service is built with the same `django-service.md`.

## How to expand

1. `/architect` reads `src/templates/web-app/` and `src/LEVEL.md`.
2. Per `root.md` — the root `AGENTS.md`: project name, monorepo boundaries, folder
   scheme, how the whole is run and checked.
3. Per `django-service.md` — the backend service's `AGENTS.md`: stack, the list of
   `apps/*`, common patterns, the way of checking.
4. Per `django-app.md` — one `apps/<domain>/AGENTS.md` per app: the app's
   boundaries, models, REST, patterns, checking.
5. Folder names and domain content (`{...}`) come from the conversation with the
   user — don't invent them.