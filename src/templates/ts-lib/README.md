# TypeScript Library

A reusable TypeScript library with a crisp public API. One level — the repository
root. The level format is `src/LEVEL.md`.

## Scheme

```
root                    ← root.md  (the only level)
├── src/                ← sources; index.ts is the entry point (re-export)
├── dist/               ← built library (UMD + ESM + d.ts)
├── e2e/                ← e2e tests of the public API through the built package
└── {package,tests}     ← as needed
```

The library is a self-contained level, so there is one `AGENTS.md` at the root.
Inner folders (`src/model/`, `src/queries/`) don't become levels unless they have
their own `Verification` boundary — they are covered in the `Architecture`/`Patterns`
of the root `AGENTS.md`.

## How to expand

1. `/architect` reads `src/templates/ts-lib/` and `src/LEVEL.md`.
2. Per `root.md` — the root `AGENTS.md`: what the library abstracts, what the
   public API is (that's `Boundaries` — everything else is "does not do"), the
   stack, the way of checking (unit + e2e).
3. Domain content (`{...}`) comes from the conversation with the user — don't
   invent it.