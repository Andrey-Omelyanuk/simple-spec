#!/usr/bin/env bash
# Проверка репозитория. Ставить нечего, кроме текста, поэтому проверяется одно:
# доедет ли текст до чужого проекта целым — без ссылок на пути этого репозитория
# и без хвостов прошлых установок.
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

# Формы ссылок, которые install.sh обязан переписать. Пережившая установку —
# сломанный путь в чужом проекте.
rewritten='src/LEVEL\.md|src/AGENTS\.md|src/templates|src/commands'

head_ "1. Проектная установка (.opencode)"
proj="$TMP/proj"; mkdir -p "$proj"
if "$SRC/install.sh" "$proj" >/dev/null; then ok "установка прошла"; else bad "установка провалилась"; fi

survived="$(grep -rEn "$rewritten" "$proj" || true)"
[ -z "$survived" ] && ok "ни одной формы src/ не пережило" || bad "пережили формы src/:
$survived"

want="$(cd "$SRC/src/commands" && ls *.md | sort)"
got="$(cd "$proj/.opencode/command" && ls *.md 2>/dev/null | sort)"
[ "$want" = "$got" ] && ok "набор команд совпал с src/commands" || bad "набор команд разошёлся: [$got] вместо [$want]"

for f in LEVEL.md README.md templates .installed; do
  [ -e "$proj/.opencode/$f" ] && ok "кит: $f" || bad "кит: нет $f"
done
[ -e "$proj/.opencode/AGENTS.md" ] && bad "кит зовётся AGENTS.md — коллизия с файлом уровня" || ok "кит не занимает имя AGENTS.md"

head_ "2. Каждый путь кита, упомянутый в текстах, существует"
# Токены вида .opencode/... из установленных текстов; хвостовая точка — это
# точка предложения, а не часть пути.
paths="$(grep -rhoE '\.opencode/[A-Za-z0-9_./-]+' "$proj" | sed 's/\.$//' | sort -u)"
[ -n "$paths" ] || bad "в текстах не осталось ни одной ссылки на кит — рерайт сломан"
while IFS= read -r p; do
  [ -z "$p" ] && continue
  if [ -e "$proj/$p" ]; then ok "$p"; else bad "$p — упомянут, но не существует"; fi
done <<< "$paths"

head_ "3. Повторный запуск"
cp -R "$proj" "$TMP/proj.before"
"$SRC/install.sh" "$proj" >/dev/null
diff -r "$TMP/proj.before" "$proj" >/dev/null && ok "идемпотентен" || bad "второй запуск изменил установку"
[ -z "$(find "$proj" -name '*.new')" ] && ok "временных файлов не осталось" || bad "остались *.new"

head_ "4. Хвосты убираются"
# Установка до манифеста: команды и файлы кита мёртвых версий метода.
touch "$proj/.opencode/command/object.md" "$proj/.opencode/OBJECT.md" "$proj/.opencode/AGENTS.md"
# Установка с манифестом: команда, которую эта версия больше не ставит.
touch "$proj/.opencode/command/ghost.md"
echo "cmd ghost.md" >> "$proj/.opencode/.installed"
"$SRC/install.sh" "$proj" >/dev/null
for f in command/object.md OBJECT.md AGENTS.md command/ghost.md; do
  [ -e "$proj/.opencode/$f" ] && bad "$f остался" || ok "$f убран"
done
[ -e "$proj/.opencode/command/story.md" ] && ok "живые команды на месте" || bad "снесены живые команды"

head_ "5. Служебная папка проверяется"
mkdir -p "$proj/templates" && echo мой > "$proj/templates/mine.md"
if "$SRC/install.sh" "$proj" . >/dev/null 2>&1; then bad "dir=. принят — снесёт templates/ проекта"; else ok "dir=. отбит"; fi
[ -f "$proj/templates/mine.md" ] && ok "templates/ проекта не тронута" || bad "templates/ проекта снесена"
for d in .. /abs a/../b; do
  if "$SRC/install.sh" "$proj" "$d" >/dev/null 2>&1; then bad "dir=$d принят"; else ok "dir=$d отбит"; fi
done

head_ "6. Инструменты кладут команды в свою папку"
for pair in ".claude commands" ".cursor commands" ".opencode command"; do
  set -- $pair
  p="$TMP/t$1"; mkdir -p "$p"
  "$SRC/install.sh" "$p" "$1" >/dev/null
  [ -f "$p/$1/$2/start.md" ] && ok "$1 → $2/" || bad "$1: команды не в $2/"
  grep -q "$1/$2/start.md" "$p/$1/README.md" && ok "$1: индекс README ведёт на команды" || bad "$1: README не знает, где команды"
done

head_ "7. Глобальная установка, спецсимволы в пути"
home="$TMP/ho&me#1"; mkdir -p "$home"
if HOME="$home" "$SRC/install.sh" --global claude >/dev/null 2>&1; then ok "установка прошла"; else bad "установка провалилась на пути с & и #"; fi
[ -f "$home/.claude/commands/start.md" ] && ok "команды на месте" || bad "команд нет"
[ -f "$home/.claude/simple-spec/LEVEL.md" ] && ok "кит на месте" || bad "кита нет"
survived="$(grep -rEn "$rewritten" "$home" || true)"
[ -z "$survived" ] && ok "ни одной формы src/ не пережило" || bad "пережили формы src/:
$survived"
grep -q "$home/.claude/simple-spec/LEVEL.md" "$home/.claude/commands/architect.md" \
  && ok "ссылка на кит собрана верно (& и # не съедены sed)" || bad "ссылка на кит побита экранированием"
grep -q "$home/.claude/commands/story.md" "$home/.claude/simple-spec/README.md" \
  && ok "индекс README ведёт на папку команд, а не на кит" || bad "README не знает, где команды"

head_ "8. Неизвестный инструмент и пустой вызов"
if HOME="$home" "$SRC/install.sh" --global nope >/dev/null 2>&1; then bad "неизвестный инструмент принят"; else ok "неизвестный инструмент отбит"; fi
if "$SRC/install.sh" >/dev/null 2>&1; then bad "вызов без аргументов принят"; else ok "вызов без аргументов отбит"; fi

echo
if [ "$fails" = 0 ]; then echo "✓ всё зелёное"; else echo "❌ провалов: $fails"; fi
exit $((fails > 0))
