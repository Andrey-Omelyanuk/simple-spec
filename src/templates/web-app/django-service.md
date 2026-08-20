# {Service Name} (Django Monolith)

## Overview
Backend-сервер: REST API для всех клиентов, доменные модели, {интеграции}.

## Boundaries
- Делает: API, бизнес-логика, хранение, {интеграции}.
- Не делает: UI (это web/bot), {что ещё не делает}.

## Tech Stack
Python {версия}, Django {версия}, DRF, Celery, PostgreSQL, Redis, Centrifugo, aiogram.

## Architecture
- `{project}/` — Django project settings, urls, celery, wsgi.
- `apps/core/` — базовые модели (UUID_Model), фильтры, pub_sub, User API.
- `apps/{домен}/` — {домен}.
- ... по одному на каждое приложение ниже.

## Patterns
- Каждое приложение Django — отдельный уровень со своим AGENTS.md.
- Модели наследуются от `core.UUID_Model`.
- API через DRF ModelViewSet + кастомный FilterBackend из core.
- Сериализаторы наследуются от `core.rest.serializers.CoreModelSerializer`.
- Каждое приложение с моделями имеет `admin.py` с `ModelAdmin`.

## Verification
- `pytest` — тесты в каждом приложении (tests/).
- `pylint` — линтинг (ci-lint target в makefile).
- Команда: `make ci-build && make ci-test`

## Dependencies
- infra/ (PostgreSQL, Redis, {S3})
- {внешние API, если есть}
