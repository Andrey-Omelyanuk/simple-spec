# Game (2D top-down)

## Overview
2D-игра с видом сверху: персонаж ходит по карте, упирается в стены, встречает врагов.
Точка сборки симуляции и движка.

## Boundaries
Делает: связывает чистую логику (`sim`) с IO-оболочкой (`engine`) в `main.ts`.
Не делает: сам по себе не содержит ни игровых правил, ни рендера — всё в подуровнях.

## Tech Stack
TypeScript, Vite (dev/сборка), Canvas 2D API (рендер). Тесты: Jest.
Весь тулчейн — в Docker (node:22-alpine); на хосте Node/npm не требуются.

## Architecture
```
game/
  Dockerfile          среда разработки (node:22-alpine)
  docker-compose.yml  сервис dev: vite на 127.0.0.1:3000, через него же build/test
  .dockerignore
  src/
    sim/      чистая игровая логика (детерминированная, тестируемая)
    engine/   игровой цикл, рендер, ввод (IO, сайд-эффекты)
    main.ts   склейка: создаёт мир (sim) и запускает цикл (engine)
  story/      истории
```

## Development
Всё — только через docker compose, хост остаётся чистым:
- `docker compose run --rm dev npm install` — поставить зависимости (в volume, не на хост).
- `docker compose up dev` — dev-сервер на http://127.0.0.1:3000.
- `docker compose run --rm dev npm run build` — сборка.
- `docker compose run --rm dev npm test` — тесты.

## Patterns
- Кадр = `input → sim.update(state, input, dt) → engine.render(state)`.
- Состояние игры живёт только в `sim`; `engine` его лишь показывает.

## Non-Obvious Rules
- Главная граница проекта: `sim` ничего не знает про `engine`. Никаких импортов
  из `engine` в `sim`, никакого DOM/Canvas в `sim`. Зависимость только в одну
  сторону: `engine` → `sim`.
- На хосте `npm`/`node`/`vite` не запускаем — любая команда тулчейна идёт через
  `docker compose`. `node_modules` живёт в volume, на хосте его быть не должно.

## Verification
История почти всегда реализуется в `sim` и проверяется детерминированным
юнит-тестом там же (см. `src/sim/AGENTS.md`). `engine` тестами не покрывается —
проверяется запуском (`vite`) и глазами. Критерий готовности истории: все её
сценарии зелёные в `sim`-тестах, игра визуально работает.

## Dependencies
- Docker + docker compose (среда разработки).
- Браузер (Canvas 2D API, requestAnimationFrame) — только на уровне `engine`.
