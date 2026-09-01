# Python Library

A reusable Python package with a crisp public API. One level — the repository
root (src-layout). The level format is `src/LEVEL.md`.

## Scheme

```
root                    ← root.md  (the only level)
├── src/{package}/      ← implementation
├── tests/              ← pytest
└── {demo, docs}        ← as needed
```

The library is a self-contained level, so there is one `AGENTS.md` at the root.
Child modules inside `src/{package}/` don't become levels unless they have their
own `Verification` boundary — they are covered in the `Architecture`/`Patterns` of
the root `AGENTS.md`.

## How to expand

1. `/architect` reads `src/templates/python-lib/` and `src/LEVEL.md`.
2. Per `root.md` — the root `AGENTS.md`: what the package abstracts, what the
   public API is (that's `Boundaries` — everything else is "does not do"), the
   stack, the way of checking (`pytest`, `testpaths`).
3. Domain content (`{...}`) comes from the conversation with the user — don't
   invent it.