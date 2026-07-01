#!/usr/bin/env bash
# Проверяет правило из README: имя файла объекта уникально внутри каждой папки
# oos/ (включая все вложенные). Это позволяет переносить объекты между папками,
# не переделывая ссылки `// object:`.
#
# Запуск из корня репозитория:  scripts/check-object-names.sh
# Код возврата: 0 — уникальны, 1 — есть дубликаты.
set -euo pipefail

status=0
while IFS= read -r root; do
  dups=$(find "$root" -name '*.md' -printf '%f\n' | sort | uniq -d)
  if [ -n "$dups" ]; then
    echo "❌ Дубликаты имён объектов в $root:"
    echo "$dups" | sed 's/^/   /'
    status=1
  fi
done < <(find . -type d -name oos -not -path '*/node_modules/*')

[ "$status" -eq 0 ] && echo "✓ Имена объектов уникальны"
exit $status
