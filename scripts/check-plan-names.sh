#!/usr/bin/env bash
# Проверяет правило из PLAN.md («Связь с кодом»): имя файла плана уникально
# внутри каждой папки plan/ (включая все вложенные). Это позволяет переносить
# файлы между папками, не переделывая ссылки `// plan:`.
#
# Запуск из корня репозитория:  scripts/check-plan-names.sh
# Код возврата: 0 — уникальны, 1 — есть дубликаты.
set -euo pipefail

status=0
while IFS= read -r root; do
  dups=$(find "$root" -name '*.md' -printf '%f\n' | sort | uniq -d)
  if [ -n "$dups" ]; then
    echo "❌ Дубликаты имён в $root:"
    echo "$dups" | sed 's/^/   /'
    status=1
  fi
done < <(find . -type d -name plan -not -path '*/node_modules/*')

[ "$status" -eq 0 ] && echo "✓ Имена планов уникальны"
exit $status
