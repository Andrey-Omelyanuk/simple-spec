#!/usr/bin/env bash
# Ставит OOS-команды и подложку в целевой проект (он может уже существовать).
#
#   ./install.sh <путь-к-проекту> [служебная-папка]
#
# Служебная папка по умолчанию — .opencode. Команды кладутся в её подпапку, имя
# которой подстраивается под инструмент: .claude → commands, иначе → command.
# Подложка (OBJECT.md, AGENTS.md, README.md, check-object-names.sh) лежит плоско
# в служебной папке; ссылки внутри команд переписываются на неё.
#
# oos/ и stories/ создаются только если их нет — пользовательский контент не
# трогается. Повторный запуск обновляет кит, объекты и истории не затирает.
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

target="${1:-}"
dir="${2:-.opencode}"

if [ -z "$target" ]; then
  echo "Использование: $0 <путь-к-проекту> [служебная-папка=.opencode]" >&2
  exit 2
fi
if [ ! -d "$target" ]; then
  echo "❌ Не найден каталог проекта: $target" >&2
  exit 1
fi

# Подпапка команд под инструмент.
case "$(basename "$dir")" in
  .claude) cmd_sub="commands" ;;
  *)       cmd_sub="command" ;;
esac

dest="$target/$dir"
cmd_dest="$dest/$cmd_sub"
mkdir -p "$cmd_dest"

# Переписывает ссылки на подложку с путей репозитория на служебную папку.
rewrite() {
  sed -e "s#src/OBJECT.md#$dir/OBJECT.md#g" \
      -e "s#src/AGENTS.md#$dir/AGENTS.md#g" \
      -e "s#scripts/check-object-names.sh#$dir/check-object-names.sh#g" \
      -e "s#docs/projection.svg#projection.svg#g" \
      -e "s#\\bREADME\\b#$dir/README.md#g"
}

# Подложка.
rewrite < "$SRC/src/OBJECT.md" > "$dest/OBJECT.md"
rewrite < "$SRC/src/AGENTS.md" > "$dest/AGENTS.md"
rewrite < "$SRC/README.md"     > "$dest/README.md"
rewrite < "$SRC/scripts/check-object-names.sh" > "$dest/check-object-names.sh"
chmod +x "$dest/check-object-names.sh"
cp "$SRC/docs/projection.svg" "$dest/projection.svg"

# Команды.
for f in "$SRC"/src/commands/*.md; do
  rewrite < "$f" > "$cmd_dest/$(basename "$f")"
done

# Данные проекта — только если их ещё нет.
mkdir -p "$target/oos" "$target/stories"

echo "✓ Установлено в $dest/"
echo "  команды:  $cmd_sub/{story,object,object-check,architect}.md"
echo "  подложка: OBJECT.md, AGENTS.md, README.md, check-object-names.sh"
echo "  данные:   $target/oos/, $target/stories/"
echo
echo "Команды /story /object /object-check /architect появятся после перезапуска инструмента."
