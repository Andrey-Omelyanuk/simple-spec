#!/usr/bin/env bash
# Проверяет правила из PLAN.md («Связь с кодом»):
# 1. Имя файла плана уникально внутри каждой папки plan/ (включая вложенные) —
#    это позволяет переносить файлы между папками, не переделывая метки.
# 2. Висячих меток нет: комментарий `plan: <имя>` в коде без файла в plan/.
#
# Запуск из корня репозитория:  scripts/check-plan-names.sh
# Код возврата: 0 — чисто, 1 — есть нарушения.
set -euo pipefail

status=0
names=""

while IFS= read -r root; do
  files=$(find "$root" -name '*.md' | sed 's|.*/||')
  [ -n "$files" ] || continue
  dups=$(printf '%s\n' "$files" | sort | uniq -d)
  if [ -n "$dups" ]; then
    echo "❌ Дубликаты имён в $root:"
    printf '%s\n' "$dups" | sed 's/^/   /'
    status=1
  fi
  names=$(printf '%s\n%s' "$names" "$(printf '%s\n' "$files" | sed 's/\.md$//')")
done < <(find . -type d -name plan -not -path '*/node_modules/*')

# Метка — комментарий, содержащий `plan: <имя>`; ищем только в коде,
# *.md пропускаем — в документах примеры и шаблоны, не метки.
while IFS= read -r hit; do
  [ -n "$hit" ] || continue
  name=$(printf '%s\n' "$hit" | sed 's/.*plan: \([A-Za-z0-9_-]\{1,\}\).*/\1/')
  if ! printf '%s\n' "$names" | grep -qx -- "$name"; then
    echo "❌ Висячая метка «plan: $name» — $(printf '%s\n' "$hit" | cut -d: -f1,2)"
    status=1
  fi
done < <(grep -rEn --exclude-dir=node_modules --exclude-dir=.git --exclude='*.md' \
           '(//|#|--|;|/\*|\*|<!--).*plan: [A-Za-z0-9_-]+' . 2>/dev/null || true)

[ "$status" -eq 0 ] && echo "✓ Планы: имена уникальны, висячих меток нет"
exit $status
