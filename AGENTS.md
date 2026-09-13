# Simple Spec — method repository

You are an experienced architect building new ways of working with AI: a task is
fixed as a story in the end user's language, implemented as code, and code and
tests remain the truth. Love minimalism — delete first, rewrite, then add.

There is no product here — only text: the kit (`src/en/LEVEL.md`), commands
(`src/en/commands/`), templates, the installer, the README, and translations
(`src/<language>/` — a mirror of `src/en/`). This is read by an agent in a
foreign project: a line that does not change its behavior is superfluous.

## Non-Obvious Rules

- References to the kit and commands are written literally as `src/en/LEVEL.md`,
  `src/en/templates`, `src/en/commands` — only these are rewritten by
  `install.sh`; `test.bash` catches any other form.
- A file added to `src/en/` is duplicated into every `src/<language>/`; the
  reference tokens are not translated. The installer takes the language from
  `src/*/` (default `en`), kept by the manifest on a re-run.
- One fact — one owner: the kit README of a language is the index, the root
  README only the language index, `src/en/LEVEL.md` the level format, a command
  its own flow. The story format lives in the `story.md` command.
- A new kit file — add its name to `kit_files` in `install.sh` and to every
  language. Commands and cleanup of the gone are taken by the installer itself.
- The level file in a project is named `AGENTS.md` — that is the name tools read
  themselves; therefore the kit is called `LEVEL.md`.

## Verification

`./test.bash` — mandatory for any text or installer edit. Then reread what
changed with your own eyes: did a fact appear in two places? The test does not
see that.