# {Project Name}

## Overview
Что это за платформа и для чего. 1-2 строки.

## Boundaries
- Монорепо: backend (Django + Telegram бот), frontend, инфраструктура.
- Бот — часть Django monolith (aiogram), запускается отдельным процессом.
- {другие сервисы и их границы, если есть}.

## Architecture
- `main/` — Django monolith: REST API, доменные модели, Telegram бот, LLM.
- `web/` — SPA веб-клиент.
- `infra/` — Docker Compose, Nginx gateway, PostgreSQL, Redis, {S3}.
- {другие сервисы}.

## Non-Obvious Rules
- Все команды выполняются через `make` в корне проекта.
- Если нужной команды нет в makefile — добавляем новую по аналогии с существующими.
- Не запускаем docker compose напрямую, только через make.

## Development
- Все сервисы работают в Docker. Инструменты на хосте (IDE, opencode) подключаются к ним.
- `make` — единственный интерфейс: сборка, запуск, стоп, тесты, логи, консоль.
- Внутри репозитория не запускаются python, node, npm напрямую — только через `make` → `docker compose`.
- Выполнить произвольную команду в сервисе: `make sh s=<service> [u=user]`.
- Переменные окружения: `.env` в корне, копируется из `infra/.env.example` через `make init`.

## Verification
Каждый модуль имеет собственный AGENTS.md с секцией Verification.
Корневой уровень проверяется успешным `make run` и прохождением
тестов во всех модулях.
