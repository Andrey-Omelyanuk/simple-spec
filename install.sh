#!/usr/bin/env bash
# Ставит команды Simple Spec и кит — в проект или глобально для пользователя.
#
#   ./install.sh <путь-к-проекту> [служебная-папка]   # в конкретный проект
#   ./install.sh --global [opencode|claude|cursor]     # глобально для юзера
#
# В проект: служебная папка по умолчанию .opencode, кит лежит плоско в ней,
# ссылки в командах — project-relative.
#
# Глобально: команды кладутся в папку инструмента (opencode →
# ~/.config/opencode/command, claude → ~/.claude/commands, cursor →
# ~/.cursor/commands), кит — в simple-spec/ рядом, ссылки в командах
# переписываются на абсолютный путь к ней.
#
# stories/ целевого проекта установщик не трогает: их заводит /story в корне.
#
# Повторный запуск обновляет кит и по манифесту прошлой установки
# ($kit/.installed) убирает то, что она ставила, а эта уже нет: переименованные
# и исчезнувшие команды уходят сами. Пользовательское не трогается — кроме
# $kit/templates: она перезаписывается целиком, свои шаблоны там не живут.
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

die() { echo "❌ $1" >&2; exit 1; }

usage() {
  cat >&2 <<'U'
Использование:
  ./install.sh <путь-к-проекту> [служебная-папка=.opencode]
  ./install.sh --global [opencode|claude|cursor]
U
  exit 2
}

if [ "${1:-}" = "--global" ] || [ "${1:-}" = "-g" ]; then
  mode="global"
  tool="${2:-opencode}"
  case "$tool" in
    opencode) base="$HOME/.config/opencode"; cmd_sub="command"  ;;
    claude)   base="$HOME/.claude";          cmd_sub="commands" ;;
    cursor)   base="$HOME/.cursor";          cmd_sub="commands" ;;
    *) die "Неизвестный инструмент: $tool (ожидается opencode, claude или cursor)" ;;
  esac
  kit="$base/simple-spec"    # кит
  cmd_dest="$base/$cmd_sub"  # команды
  ref="$kit"                 # ссылки на кит      → абсолютный путь к киту
  cmd_ref="$cmd_dest"        # ссылки на команды  → абсолютный путь к их папке
else
  mode="project"
  target="${1:-}"
  dir="${2:-.opencode}"
  [ -z "$target" ] && usage
  [ -d "$target" ] || die "Не найден каталог проекта: $target"
  dir="${dir%/}"
  # Служебная папка обязана быть относительным путём внутри проекта: иначе кит
  # уезжает наружу, а `rm -rf $kit/templates` ниже сносит чужую папку — при
  # `dir=.` это `templates/` самого проекта.
  case "$dir" in
    ""|.|..|/*) die "Служебная папка — относительный путь внутри проекта, не «${2:-}»" ;;
  esac
  case "/$dir/" in
    */../*) die "Служебная папка — относительный путь внутри проекта, не «${2:-}»" ;;
  esac
  case "$(basename "$dir")" in
    .claude) cmd_sub="commands" ;;
    .cursor) cmd_sub="commands" ;;
    *)       cmd_sub="command"  ;;
  esac
  kit="$target/$dir"
  cmd_dest="$kit/$cmd_sub"
  ref="$dir"                 # ссылки на кит      → project-relative
  cmd_ref="$dir/$cmd_sub"    # ссылки на команды  → project-relative
fi

mkdir -p "$kit" "$cmd_dest"
manifest="$kit/.installed"

# Экранирует то, что sed прочтёт как синтаксис: разделитель #, & и \.
esc() { printf '%s' "$1" | sed 's/[\\&#]/\\&/g'; }

# Переписывает ссылки на кит и команды с путей репозитория на целевые.
rewrite() {
  sed -e "s#src/LEVEL.md#$(esc "$ref")/LEVEL.md#g" \
      -e "s#src/templates#$(esc "$ref")/templates#g" \
      -e "s#src/commands#$(esc "$cmd_ref")#g"
}

# Что ставит эта установка. Отсюда же — манифест и строки вывода.
kit_files=(LEVEL.md README.md templates)
cmd_files=()
for f in "$SRC"/src/commands/*.md; do cmd_files+=("$(basename "$f")"); done

# Кит.
rewrite < "$SRC/src/LEVEL.md" > "$kit/LEVEL.md"
rewrite < "$SRC/README.md"    > "$kit/README.md"

# Команды.
for f in "$SRC"/src/commands/*.md; do
  rewrite < "$f" > "$cmd_dest/$(basename "$f")"
done

# Шаблоны архитектуры.
rm -rf "$kit/templates"
cp -R "$SRC/src/templates" "$kit/templates"
find "$kit/templates" -type f -name '*.md' | while IFS= read -r f; do
  rewrite < "$f" > "$f.new" && mv "$f.new" "$f"
done

has() { local n="$1"; shift; local x; for x in "$@"; do [ "$x" = "$n" ] && return 0; done; return 1; }

# Установки до манифеста. Список закрытый: это все имена, которые install.sh
# когда-либо ставил и больше не ставит. Дописывать сюда нечего — исчезнувшее с
# этого момента убирает манифест.
rm -f "$cmd_dest/object.md"      "$cmd_dest/object-check.md" \
      "$cmd_dest/story-check.md" "$cmd_dest/plan.md" "$cmd_dest/finish.md" \
      "$kit/AGENTS.md"           "$kit/OBJECT.md" \
      "$kit/PLAN.md"             "$kit/PLAN-FORMAT.md" \
      "$kit/STORY-FORMAT.md"     "$kit/projection.svg" \
      "$kit/check-object-names.sh" "$kit/check-plan-names.sh"

# Прошлая установка: убираем то, что она ставила, а эта — уже нет.
if [ -f "$manifest" ]; then
  while read -r kind name; do
    case "$kind" in
      kit) has "$name" "${kit_files[@]}" || rm -rf "$kit/$name"    ;;
      cmd) has "$name" "${cmd_files[@]}" || rm -f  "$cmd_dest/$name" ;;
    esac
  done < <(grep -v '^#' "$manifest" || true)
fi

version="$(git -C "$SRC" rev-parse --short HEAD 2>/dev/null || echo unknown)"
{
  echo "# simple-spec $version — поставленное; по этому списку следующий запуск уберёт лишнее"
  printf 'kit %s\n' "${kit_files[@]}"
  printf 'cmd %s\n' "${cmd_files[@]}"
} > "$manifest"

cmd_list="$(printf '%s,' "${cmd_files[@]%.md}")"; cmd_list="{${cmd_list%,}}.md"
kit_list="$(printf '%s, ' "${kit_files[@]}")";    kit_list="${kit_list%, }"
slashes="$(printf '/%s ' "${cmd_files[@]%.md}")"

if [ "$mode" = "project" ]; then
  echo "✓ Установлено в проект: $kit/ (simple-spec $version)"
  echo "  команды:  $cmd_sub/$cmd_list"
  echo "  кит:      $kit_list"
else
  echo "✓ Установлено глобально ($tool, simple-spec $version):"
  echo "  команды:  $cmd_dest/$cmd_list"
  echo "  кит:      $kit/"
fi
echo "  истории:  stories/ в корне проекта — заводит /story."
echo
echo "Команды ${slashes}появятся после перезапуска инструмента."
