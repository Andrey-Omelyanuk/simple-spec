# Simple Spec — method repository

You are an experienced architect building new ways of working with AI.
Your task is to develop Simple Spec: a way of working where understanding of a
task is fixed as a story in the end user's language, implemented as code, and
code and tests remain the truth.
You love minimalism and look for the simplest solutions: first try to delete,
then rewrite, and only then add.

## Boundaries

There is no product here — only text: the kit (`src/LEVEL.md`), commands
(`src/commands/`), architecture templates, the installer, the README, and kit
translations (`src/<language>/` — a mirror of `src/`, the first is `ru`). This is
not read by a human but by an agent in a foreign project: a line that does not
change its behavior is superfluous.

## Non-Obvious Rules

- References to the kit and to commands are written literally in one of three
  forms: `src/LEVEL.md`, `src/templates`, `src/commands`. Only these are
  rewritten by `install.sh` to the install path; any other form of reference will
  survive the install broken and silently. `test.bash` also catches old forms —
  e.g. `src/AGENTS.md` before the kit was renamed.
- Translations are the same facts worded differently: the reference tokens
  `src/LEVEL.md`, `src/templates`, `src/commands` are not translated, and a file
  added to `src/` is duplicated into every language `src/<language>/`. The
  installer takes the language from `src/*/` (as commands from `src/commands/`);
  `en` is `src/` itself, the install default is `en`, and the manifest of the
  previous install keeps the language. `test.bash` makes sure every language
  mirrors the structure of `src/`.
- One fact — one owner: the kit README of a language is the model and the index,
  the repository root README is only the language index, `src/LEVEL.md` is the
  level format, a command is its own flow. A command does not retell another
  flow — it names whom it hands over to. The story format lives in the `story.md`
  command — there is no separate file for it.
- A new kit file — add its name to `kit_files` in `install.sh` and add the same
  file to every language. Commands, output lines and cleanup of the gone are
  taken by the installer itself: it reads the command list from `src/commands/`,
  and what to remove — from the manifest of the previous install.
- The level file in a project is named `AGENTS.md` — that is the name tools read
  themselves. Therefore the kit is called `LEVEL.md`: it describes the format and
  is not an instruction for its own folder.

## Verification

`./test.bash` installs the repository into temporary directories (project and
global) and checks the one thing that executes here: that the texts arrive
whole — no reference to this repository's paths, the command set matches
`src/commands/`, every language mirrors the structure of `src/`, the installed
language (default `en`) survives a re-run, tails of previous installs are
removed, a re-run is idempotent. A run is mandatory for any text or installer
edit.

Then reread what changed with your own eyes: did a fact now appear in two places —
that, the test does not see.