# Django Monorepo

Классический монорепо: Django monolith (backend), SPA-клиент, инфраструктура.
Образец — проекты `pg`, `fitness`. Каждый сервис и каждое Django-приложение —
отдельный уровень со своим `AGENTS.md`. Формат уровня — `src/AGENTS.md`.

## Схема уровней

```
root                      ← root.md
├── main/                 ← django-service.md  (Django monolith: API, домен, бот)
│   └── apps/<домен>/     ← django-app.md       (одно приложение Django)
├── web/                  ← сервис по надобности (SPA, иной стек)
├── infra/                ← сервис по надобности (Docker Compose, gateway, БД)
└── <ещё сервис>/         ← сервис по надобности (scanner и т.п.)
```

`main/` и его `apps/*` обязательны (backend). `web/`, `infra/` и прочие сервисы
заводятся по надобности — уровень появляется, когда у него есть своя граница и
свой `Verification`. Если доп. сервис — тоже Django (например, `scanner/`), его
выстраивают по `django-service.md`.

## Как раскрывать

1. `/architect` читает `src/templates/django-monorepo/` и `src/AGENTS.md`.
2. По `root.md` — корневой `AGENTS.md`: имя проекта, границы монорепо, схема
   папок, команды (`make`), `Verification`.
3. По `django-service.md` — `main/AGENTS.md`: стек, список `apps/*`, общие
   паттерны и способ проверки (`pytest`, `pylint`).
4. По `django-app.md` — по одному `apps/<домен>/AGENTS.md` на каждое приложение:
   границы app'а, модели, REST, паттерны, проверка.
5. Доменное наполнение (`{...}`) — из разговора с пользователем, не выдумывать.
