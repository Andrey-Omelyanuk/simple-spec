#!/usr/bin/env bash
# Repository check. There is nothing to install but text, so one thing is
# checked: does the text arrive in a foreign project intact — no references to
# this repository's paths and no tails of previous installs — and for every
# language.
#
#   ./test.bash
set -uo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

fails=0
ok()   { echo "  ✓ $1"; }
bad()  { echo "  ❌ $1"; fails=$((fails + 1)); }
head_() { echo; echo "$1"; }

# Reference forms install.sh must rewrite. One surviving an install is a broken
# path in a foreign project.
rewritten='src/LEVEL\.md|src/AGENTS\.md|src/templates|src/commands'

# Checks an install of a language: the command set and intact references.
check_install() {
  local lang="$1" p="$2" cmdsrc="$3"
  local want got survived f
  want="$(cd "$cmdsrc" && ls *.md | sort)"
  got="$(cd "$p/.opencode/command" && ls *.md 2>/dev/null | sort)"
  [ "$want" = "$got" ] && ok "$lang: command set matches" || bad "$lang: command set differs: [$got] instead of [$want]"
  survived="$(grep -rEn "$rewritten" "$p" || true)"
  [ -z "$survived" ] && ok "$lang: no src/ form survived" || bad "$lang: src/ forms survived:
$survived"
  for f in LEVEL.md README.md templates .installed; do
    [ -e "$p/.opencode/$f" ] && ok "$lang: kit: $f" || bad "$lang: kit: no $f"
  done
}

head_ "1. Default project install (en)"
proj="$TMP/proj"; mkdir -p "$proj"
if "$SRC/install.sh" "$proj" >/dev/null; then ok "install passed"; else bad "install failed"; fi
check_install en "$proj" "$SRC/src/commands"
grep -q '^lang en$' "$proj/.opencode/.installed" && ok "en: manifest keeps the language" || bad "en: manifest does not keep the language"
grep -q 'What goes where' "$proj/.opencode/README.md" && ok "en: README is English" || bad "en: README is not English"
[ -e "$proj/.opencode/AGENTS.md" ] && bad "the kit is named AGENTS.md — collides with the level file" || ok "the kit does not take the AGENTS.md name"

head_ "2. Every kit path mentioned in the texts exists"
# Tokens like .opencode/... from installed texts; a trailing dot is a sentence
# dot, not part of a path.
paths="$(grep -rhoE '\.opencode/[A-Za-z0-9_./-]+' "$proj" | sed 's/\.$//' | sort -u)"
[ -n "$paths" ] || bad "no kit reference left in the texts — the rewrite is broken"
while IFS= read -r p; do
  [ -z "$p" ] && continue
  if [ -e "$proj/$p" ]; then ok "$p"; else bad "$p — mentioned, but does not exist"; fi
done <<< "$paths"

head_ "3. Re-run"
cp -R "$proj" "$TMP/proj.before"
"$SRC/install.sh" "$proj" >/dev/null
diff -r "$TMP/proj.before" "$proj" >/dev/null && ok "idempotent" || bad "the second run changed the install"
[ -z "$(find "$proj" -name '*.new')" ] && ok "no temporary files left" || bad "*.new left"

head_ "4. Tails are removed"
# Pre-manifest install: commands and kit files of dead method versions.
touch "$proj/.opencode/command/object.md" "$proj/.opencode/OBJECT.md" "$proj/.opencode/AGENTS.md"
# Manifest install: a command this version no longer ships.
touch "$proj/.opencode/command/ghost.md"
echo "cmd ghost.md" >> "$proj/.opencode/.installed"
"$SRC/install.sh" "$proj" >/dev/null
for f in command/object.md OBJECT.md AGENTS.md command/ghost.md; do
  [ -e "$proj/.opencode/$f" ] && bad "$f remained" || ok "$f removed"
done
[ -e "$proj/.opencode/command/story.md" ] && ok "live commands are in place" || bad "live commands were removed"

head_ "5. The service folder is checked"
mkdir -p "$proj/templates" && echo mine > "$proj/templates/mine.md"
if "$SRC/install.sh" "$proj" . >/dev/null 2>&1; then bad "dir=. accepted — would delete the project's templates/"; else ok "dir=. rejected"; fi
[ -f "$proj/templates/mine.md" ] && ok "the project's templates/ untouched" || bad "the project's templates/ deleted"
for d in .. /abs a/../b; do
  if "$SRC/install.sh" "$proj" "$d" >/dev/null 2>&1; then bad "dir=$d accepted"; else ok "dir=$d rejected"; fi
done

head_ "6. Languages mirror src/"
src_cmds="$(cd "$SRC/src/commands" && ls *.md | sort)"
src_tpls="$(cd "$SRC/src/templates" && ls -d */ | sort)"
langs=""
for d in "$SRC"/src/*/; do
  [ -f "$d/LEVEL.md" ] || continue
  lang="$(basename "$d")"
  langs="$langs $lang"
  cmds="$(cd "$d/commands" && ls *.md 2>/dev/null | sort)"
  [ "$src_cmds" = "$cmds" ] && ok "$lang: command set mirrors src/" || bad "$lang: commands differ: [$cmds] instead of [$src_cmds]"
  tpls="$(cd "$d/templates" && ls -d */ 2>/dev/null | sort)"
  [ "$src_tpls" = "$tpls" ] && ok "$lang: template set mirrors src/" || bad "$lang: templates differ"
  for f in LEVEL.md README.md; do
    [ -e "$d/$f" ] && ok "$lang: $f in place" || bad "$lang: no $f"
  done
done
[ -n "$langs" ] || bad "no language found in src/"

head_ "7. Russian install and language preservation"
p="$TMP/proj-ru"; mkdir -p "$p"
if "$SRC/install.sh" "$p" -l ru >/dev/null; then ok "-l ru install passed"; else bad "-l ru install failed"; fi
check_install ru "$p" "$SRC/src/ru/commands"
grep -q '^lang ru$' "$p/.opencode/.installed" && ok "ru: manifest keeps the language" || bad "ru: manifest does not keep the language"
grep -q 'Что где лежит' "$p/.opencode/README.md" && ok "ru: README is Russian" || bad "ru: README is not Russian"
"$SRC/install.sh" "$p" >/dev/null
grep -q '^lang ru$' "$p/.opencode/.installed" && ok "a re-run without -l keeps ru" || bad "the re-run switched the language to en"
grep -q 'Что где лежит' "$p/.opencode/README.md" && ok "README stayed Russian" || bad "README switched"
if "$SRC/install.sh" "$p" -l xx >/dev/null 2>&1; then bad "-l xx accepted"; else ok "unknown language rejected"; fi

head_ "8. Tools put commands into their own folder"
for pair in ".claude commands" ".cursor commands" ".opencode command"; do
  set -- $pair
  p="$TMP/t$1"; mkdir -p "$p"
  "$SRC/install.sh" "$p" "$1" >/dev/null
  [ -f "$p/$1/$2/do.md" ] && ok "$1 → $2/" || bad "$1: commands not in $2/"
  grep -q "$1/$2/do.md" "$p/$1/README.md" && ok "$1: README index points at the commands" || bad "$1: README does not know where the commands are"
done

head_ "9. Global install, special characters in the path"
home="$TMP/ho&me#1"; mkdir -p "$home"
if HOME="$home" "$SRC/install.sh" --global claude >/dev/null 2>&1; then ok "install passed"; else bad "install failed on a path with & and #"; fi
[ -f "$home/.claude/commands/do.md" ] && ok "commands in place" || bad "no commands"
[ -f "$home/.claude/simple-spec/LEVEL.md" ] && ok "kit in place" || bad "no kit"
survived="$(grep -rEn "$rewritten" "$home" || true)"
[ -z "$survived" ] && ok "no src/ form survived" || bad "src/ forms survived:
$survived"
grep -q "$home/.claude/simple-spec/LEVEL.md" "$home/.claude/commands/architect.md" \
  && ok "kit reference built correctly (& and # not eaten by sed)" || bad "kit reference broken by escaping"
grep -q "$home/.claude/commands/story.md" "$home/.claude/simple-spec/README.md" \
  && ok "README index points at the commands folder, not the kit" || bad "README does not know where the commands are"

head_ "10. Unknown tool and empty call"
if HOME="$home" "$SRC/install.sh" --global nope >/dev/null 2>&1; then bad "unknown tool accepted"; else ok "unknown tool rejected"; fi
if "$SRC/install.sh" >/dev/null 2>&1; then bad "call without arguments accepted"; else ok "call without arguments rejected"; fi

echo
if [ "$fails" = 0 ]; then echo "✓ all green"; else echo "❌ failures: $fails"; fi
exit $((fails > 0))