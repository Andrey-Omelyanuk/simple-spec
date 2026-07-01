# Web (Frontend)

## Overview
Веб-интерфейс приложения: страницы, компоненты, клиентская логика.

## Boundaries
Делает: рендеринг UI, валидация форм на клиенте, вызовы API.
Не делает: бизнес-логику и хранение данных — это на стороне бэкенда.

## Tech Stack
React + TypeScript, Vite. Тесты: Jest + Storybook (test-runner).

## Architecture
```
web/
  src/
    components/   переиспользуемые компоненты
    pages/        страницы (роуты)
    api/          клиент к бэкенду
    lib/          утилиты, хуки
  oos/            объекты (живая спека)
  stories/        истории (append-only лог намерений)
```

## Patterns
- Компонент = папка: `Button/Button.tsx`, `Button.test.tsx`, `Button.stories.tsx`.
- Ошибки API не глотаем — пробрасываем в UI через состояние ошибки.
- Именование: компоненты PascalCase, хуки `useXxx`, утилиты camelCase.

## Non-Obvious Rules
- Прямые `fetch` в компонентах запрещены — только через `api/`.
- Состояние сервера держим в react-query, локальное — в useState.

## Verification
Как проверяется, что объект реализован на этом уровне.

- **Unit (Jest):** логика компонентов, хуки, утилиты. Файл рядом с кодом:
  `Component.test.tsx`.
- **E2E (Storybook):** каждый пункт поведения объекта = отдельная story (Storybook)
  в `*.stories.tsx`, прогон через `@storybook/test-runner`.
- **Связь с объектом:** в начале теста и story — ссылка на объект:
  `// object: <unique-name>`.
- **Критерий готовности:** для объекта есть unit-покрытие логики и хотя бы одна
  e2e-story на каждый пункт поведения; всё зелёное.

## Dependencies
- API бэкенда (контракт в `api/`).
