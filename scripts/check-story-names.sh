#!/usr/bin/env bash
# Проверяет правило из README: имя файла истории уникально внутри каждой папки
# story/ (включая все вложенные). Это позволяет переносить истории между папками,
# не переделывая ссылки `// story:`.
#
# Запуск из корня репозитория:  scripts/check-story-names.sh
# Код возврата: 0 — уникальны, 1 — есть дубликаты.
set -euo pipefail

status=0
while IFS= read -r root; do
  dups=$(find "$root" -name '*.md' -printf '%f\n' | sort | uniq -d)
  if [ -n "$dups" ]; then
    echo "❌ Дубликаты имён историй в $root:"
    echo "$dups" | sed 's/^/   /'
    status=1
  fi
done < <(find . -type d -name story -not -path '*/node_modules/*')

[ "$status" -eq 0 ] && echo "✓ Имена историй уникальны"
exit $status
