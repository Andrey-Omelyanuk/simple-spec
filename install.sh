#!/usr/bin/env bash
# Ставит команды Simple Spec и подложку — в проект или глобально для пользователя.
#
#   ./install.sh <путь-к-проекту> [служебная-папка]   # в конкретный проект
#   ./install.sh --global [opencode|claude|cursor]     # глобально для юзера
#
# В проект: служебная папка по умолчанию .opencode, подложка лежит плоско в ней,
# ссылки в командах — project-relative. plan/ создаётся, если его нет.
#
# Глобально: команды кладутся в папку инструмента (opencode →
# ~/.config/opencode/command, claude → ~/.claude/commands, cursor →
# ~/.cursor/commands), подложка — в simple-spec/ рядом, ссылки в командах
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
  kit="$base/simple-spec"    # подложка
  cmd_dest="$base/$cmd_sub"  # команды
  ref="$kit"                 # ссылки в командах → абсолютный путь к подложке
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

# Переписывает ссылки на подложку с путей репозитория на целевые.
rewrite() {
  sed -e "s#src/PLAN.md#$ref/PLAN.md#g" \
      -e "s#src/AGENTS.md#$ref/AGENTS.md#g" \
      -e "s#scripts/check-plan-names.sh#$ref/check-plan-names.sh#g"
}

# Подложка.
rewrite < "$SRC/src/PLAN.md" > "$kit/PLAN.md"
rewrite < "$SRC/src/AGENTS.md" > "$kit/AGENTS.md"
rewrite < "$SRC/README.md"     > "$kit/README.md"
rewrite < "$SRC/scripts/check-plan-names.sh" > "$kit/check-plan-names.sh"
chmod +x "$kit/check-plan-names.sh"

# Команды.
for f in "$SRC"/src/commands/*.md; do
  rewrite < "$f" > "$cmd_dest/$(basename "$f")"
done

# Хвосты прошлых установок (OOS / wip / старые имена).
rm -f "$cmd_dest/story.md" \
      "$cmd_dest/object.md" \
      "$cmd_dest/object-check.md" \
      "$cmd_dest/wip.md" \
      "$cmd_dest/wip-check.md" \
      "$cmd_dest/plan-check.md" \
      "$kit/OBJECT.md" \
      "$kit/WIP.md" \
      "$kit/check-object-names.sh" \
      "$kit/check-wip-names.sh"
if [ "$mode" = "global" ] && [ -d "$base/oos-kit" ]; then
  rm -rf "$base/oos-kit"
fi

if [ "$mode" = "project" ]; then
  mkdir -p "$target/plan"
  echo "✓ Установлено в проект: $kit/"
  echo "  команды:  $cmd_sub/{plan,start,finish,architect}.md"
  echo "  подложка: PLAN.md, AGENTS.md, README.md, check-plan-names.sh"
  echo "  данные:   $target/plan/"
else
  echo "✓ Установлено глобально ($tool):"
  echo "  команды:  $cmd_dest/{plan,start,finish,architect}.md"
  echo "  подложка: $kit/"
  echo "  plan/ — пер-проектный, создаётся командами в текущем проекте."
fi
echo
echo "Команды /plan /start /finish /architect появятся после перезапуска инструмента."
