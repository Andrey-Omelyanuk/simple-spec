#!/usr/bin/env bash
# Ставит команды Simple Spec и кит — в проект или глобально для пользователя.
#
#   ./install.sh <путь-к-проекту> [служебная-папка]   # в конкретный проект
#   ./install.sh --global [opencode|claude|cursor]     # глобально для юзера
#
# В проект: служебная папка по умолчанию .opencode, кит лежит плоско в ней,
# ссылки в командах — project-relative. plan/ создаётся, если его нет.
#
# Глобально: команды кладутся в папку инструмента (opencode →
# ~/.config/opencode/command, claude → ~/.claude/commands, cursor →
# ~/.cursor/commands), кит — в simple-spec/ рядом, ссылки в командах
# переписываются на абсолютный путь к ней.
# plan/ НЕ создаётся — он пер-проектный, его заводят сами команды.
#
# Целевой проект может уже существовать; повторный запуск обновляет кит и не
# затирает пользовательский контент.
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  cat >&2 <<'U'
Использование:
  ./install.sh <путь-к-проекту> [служебная-папка=.opencode]
  ./install.sh --global [opencode|claude|cursor]
U
  exit 2
}

mode="project"
if [ "${1:-}" = "--global" ] || [ "${1:-}" = "-g" ]; then
  mode="global"
  tool="${2:-opencode}"
fi

if [ "$mode" = "global" ]; then
  case "$tool" in
    opencode) base="$HOME/.config/opencode"; cmd_sub="command"  ;;
    claude)   base="$HOME/.claude";          cmd_sub="commands" ;;
    cursor)   base="$HOME/.cursor";          cmd_sub="commands" ;;
    *) echo "❌ Неизвестный инструмент: $tool (ожидается opencode, claude или cursor)" >&2; exit 1 ;;
  esac
  kit="$base/simple-spec"    # кит
  cmd_dest="$base/$cmd_sub"  # команды
  ref="$kit"                 # ссылки в командах → абсолютный путь к киту
else
  target="${1:-}"
  dir="${2:-.opencode}"
  [ -z "$target" ] && usage
  [ -d "$target" ] || { echo "❌ Не найден каталог проекта: $target" >&2; exit 1; }
  case "$(basename "$dir")" in
    .claude) cmd_sub="commands" ;;
    .cursor) cmd_sub="commands" ;;
    *)       cmd_sub="command"  ;;
  esac
  kit="$target/$dir"
  cmd_dest="$kit/$cmd_sub"
  ref="$dir"                 # ссылки в командах → project-relative
fi

mkdir -p "$kit" "$cmd_dest"

# Переписывает ссылки на кит с путей репозитория на целевые.
rewrite() {
  sed -e "s#src/PLAN.md#$ref/PLAN.md#g" \
      -e "s#src/AGENTS.md#$ref/AGENTS.md#g"
}

# Кит.
rewrite < "$SRC/src/PLAN.md" > "$kit/PLAN.md"
rewrite < "$SRC/src/AGENTS.md" > "$kit/AGENTS.md"
rewrite < "$SRC/README.md"     > "$kit/README.md"

# Команды.
for f in "$SRC"/src/commands/*.md; do
  rewrite < "$f" > "$cmd_dest/$(basename "$f")"
done

# Хвосты прошлых установок (старые имена команд и файлов кита).
rm -f "$cmd_dest/wip.md" \
      "$cmd_dest/wip-check.md" \
      "$cmd_dest/plan-check.md" \
      "$kit/WIP.md" \
      "$kit/check-wip-names.sh" \
      "$kit/check-plan-names.sh"

if [ "$mode" = "project" ]; then
  mkdir -p "$target/plan"
  echo "✓ Установлено в проект: $kit/"
  echo "  команды:  $cmd_sub/{plan,start,finish,architect}.md"
  echo "  кит:      PLAN.md, AGENTS.md, README.md"
  echo "  данные:   $target/plan/"
else
  echo "✓ Установлено глобально ($tool):"
  echo "  команды:  $cmd_dest/{plan,start,finish,architect}.md"
  echo "  кит:      $kit/"
  echo "  plan/ — пер-проектный, создаётся командами в текущем проекте."
fi
echo
echo "Команды /plan /start /finish /architect появятся после перезапуска инструмента."
