#!/usr/bin/env bash
# Ставит OOS-команды и подложку — в проект или глобально для пользователя.
#
#   ./install.sh <путь-к-проекту> [служебная-папка]   # в конкретный проект
#   ./install.sh --global [opencode|claude]           # глобально для юзера
#
# В проект: служебная папка по умолчанию .opencode, подложка лежит плоско в ней,
# ссылки в командах — project-relative. oos/ и stories/ создаются, если их нет.
#
# Глобально: команды кладутся в командную папку инструмента (opencode →
# ~/.config/opencode/command, claude → ~/.claude/commands), подложка — в
# oos-kit/ рядом, ссылки в командах переписываются на абсолютный путь к ней.
# oos/ и stories/ НЕ создаются — они пер-проектные, их заводят сами команды.
#
# Целевой проект может уже существовать; повторный запуск обновляет кит и не
# затирает пользовательский контент.
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  cat >&2 <<'U'
Использование:
  ./install.sh <путь-к-проекту> [служебная-папка=.opencode]
  ./install.sh --global [opencode|claude]
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
    *) echo "❌ Неизвестный инструмент: $tool (ожидается opencode или claude)" >&2; exit 1 ;;
  esac
  kit="$base/oos-kit"        # подложка
  cmd_dest="$base/$cmd_sub"  # команды
  ref="$kit"                 # ссылки в командах → абсолютный путь к подложке
else
  target="${1:-}"
  dir="${2:-.opencode}"
  [ -z "$target" ] && usage
  [ -d "$target" ] || { echo "❌ Не найден каталог проекта: $target" >&2; exit 1; }
  case "$(basename "$dir")" in
    .claude) cmd_sub="commands" ;;
    *)       cmd_sub="command"  ;;
  esac
  kit="$target/$dir"
  cmd_dest="$kit/$cmd_sub"
  ref="$dir"                 # ссылки в командах → project-relative
fi

mkdir -p "$kit" "$cmd_dest"

# Переписывает ссылки на подложку с путей репозитория на целевые.
rewrite() {
  sed -e "s#src/OBJECT.md#$ref/OBJECT.md#g" \
      -e "s#src/AGENTS.md#$ref/AGENTS.md#g" \
      -e "s#scripts/check-object-names.sh#$ref/check-object-names.sh#g" \
      -e "s#docs/projection.svg#projection.svg#g" \
      -e "s#\\bREADME\\b#$ref/README.md#g"
}

# Подложка.
rewrite < "$SRC/src/OBJECT.md" > "$kit/OBJECT.md"
rewrite < "$SRC/src/AGENTS.md" > "$kit/AGENTS.md"
rewrite < "$SRC/README.md"     > "$kit/README.md"
rewrite < "$SRC/scripts/check-object-names.sh" > "$kit/check-object-names.sh"
chmod +x "$kit/check-object-names.sh"
cp "$SRC/docs/projection.svg" "$kit/projection.svg"

# Команды.
for f in "$SRC"/src/commands/*.md; do
  rewrite < "$f" > "$cmd_dest/$(basename "$f")"
done

if [ "$mode" = "project" ]; then
  mkdir -p "$target/oos" "$target/stories"   # только если их ещё нет
  echo "✓ Установлено в проект: $kit/"
  echo "  команды:  $cmd_sub/{story,object,object-check,architect}.md"
  echo "  подложка: OBJECT.md, AGENTS.md, README.md, check-object-names.sh"
  echo "  данные:   $target/oos/, $target/stories/"
else
  echo "✓ Установлено глобально ($tool):"
  echo "  команды:  $cmd_dest/{story,object,object-check,architect}.md"
  echo "  подложка: $kit/"
  echo "  oos/ и stories/ — пер-проектные, создаются командами в текущем проекте."
fi
echo
echo "Команды /story /object /object-check /architect появятся после перезапуска инструмента."
