#!/usr/bin/env bash
# Installs Simple Spec commands and the kit — into a project or globally for the
# user.
#
#   ./install.sh <path-to-project> [service-folder] [-l language]   # into a project
#   ./install.sh --global [opencode|claude|cursor] [-l language]    # global for the user
#
# The language is the -l flag (default en): texts come from src/ for en and from
# src/<language>/ for the rest. The installed language is written to the manifest
# and kept by a re-run without the flag; -l switches the language.
#
# Into a project: the service folder defaults to .opencode, the kit lies flat in
# it, references in the commands are project-relative.
#
# Global: commands go to the tool's folder (opencode →
# ~/.config/opencode/command, claude → ~/.claude/commands, cursor →
# ~/.cursor/commands), the kit — into simple-spec/ next to it, references in the
# commands are rewritten to its absolute path.
#
# The target project's stories/ is not touched: /story creates it at the root.
#
# A re-run updates the kit and, by the manifest of the previous install
# ($kit/.installed), removes what it installed and this one no longer does:
# renamed and gone commands disappear on their own. User content is not touched —
# except $kit/templates: it is overwritten entirely, your own templates don't
# live there.
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

die() { echo "❌ $1" >&2; exit 1; }

usage() {
  cat >&2 <<'U'
Usage:
  ./install.sh <path-to-project> [service-folder=.opencode] [-l language=en]
  ./install.sh --global [opencode|claude|cursor] [-l language=en]
U
  exit 2
}

lang_opt=""
pos=()
while [ $# -gt 0 ]; do
  case "$1" in
    -l|--lang)
      [ $# -ge 2 ] || die "Flag $1 requires a language value (en, ru, ...)"
      lang_opt="$2"; shift 2 ;;
    -g|--global)
      pos+=("$1"); shift ;;
    -*) usage ;;
    *) pos+=("$1"); shift ;;
  esac
done
set -- "${pos[@]}"

if [ "${1:-}" = "--global" ] || [ "${1:-}" = "-g" ]; then
  mode="global"
  tool="${2:-opencode}"
  case "$tool" in
    opencode) base="$HOME/.config/opencode"; cmd_sub="command"  ;;
    claude)   base="$HOME/.claude";          cmd_sub="commands" ;;
    cursor)   base="$HOME/.cursor";          cmd_sub="commands" ;;
    *) die "Unknown tool: $tool (expected opencode, claude or cursor)" ;;
  esac
  kit="$base/simple-spec"    # kit
  cmd_dest="$base/$cmd_sub"  # commands
  ref="$kit"                 # kit references  → absolute path to the kit
  cmd_ref="$cmd_dest"        # command references → absolute path to their folder
else
  mode="project"
  target="${1:-}"
  dir="${2:-.opencode}"
  [ -z "$target" ] && usage
  [ -d "$target" ] || die "Project folder not found: $target"
  dir="${dir%/}"
  # The service folder must be a relative path inside the project: otherwise the
  # kit leaves the project, and the `rm -rf $kit/templates` below would delete a
  # foreign folder — with `dir=.` that is the project's own `templates/`.
  case "$dir" in
    ""|.|..|/*) die "Service folder must be a relative path inside the project, not «${2:-}»" ;;
  esac
  case "/$dir/" in
    */../*) die "Service folder must be a relative path inside the project, not «${2:-}»" ;;
  esac
  case "$(basename "$dir")" in
    .claude) cmd_sub="commands" ;;
    .cursor) cmd_sub="commands" ;;
    *)       cmd_sub="command"  ;;
  esac
  kit="$target/$dir"
  cmd_dest="$kit/$cmd_sub"
  ref="$dir"                 # kit references  → project-relative
  cmd_ref="$dir/$cmd_sub"    # command references → project-relative
fi

mkdir -p "$kit" "$cmd_dest"
manifest="$kit/.installed"

# Install language: the -l flag, else the language of the previous install
# (manifest), else en.
lang="${lang_opt:-}"
if [ -z "$lang" ] && [ -f "$manifest" ]; then
  lang="$(grep '^lang ' "$manifest" | awk '{print $2}' || true)"
fi
lang="${lang:-en}"
case "$lang" in
  en) src_root="$SRC/src" ;;
  *)  [ -d "$SRC/src/$lang" ] || die "No translation for language: $lang"; src_root="$SRC/src/$lang" ;;
esac

# Escapes what sed would read as syntax: separator #, & and \.
esc() { printf '%s' "$1" | sed 's/[\\&#]/\\&/g'; }

# Rewrites kit and command references from repository paths to the target ones.
rewrite() {
  sed -e "s#src/LEVEL.md#$(esc "$ref")/LEVEL.md#g" \
      -e "s#src/templates#$(esc "$ref")/templates#g" \
      -e "s#src/commands#$(esc "$cmd_ref")#g"
}

# What this install ships. From here — the manifest and the output lines.
kit_files=(LEVEL.md README.md templates)
cmd_files=()
for f in "$src_root"/commands/*.md; do cmd_files+=("$(basename "$f")"); done

# Kit.
rewrite < "$src_root/LEVEL.md" > "$kit/LEVEL.md"
rewrite < "$src_root/README.md" > "$kit/README.md"

# Commands.
for f in "$src_root"/commands/*.md; do
  rewrite < "$f" > "$cmd_dest/$(basename "$f")"
done

# Architecture templates.
rm -rf "$kit/templates"
cp -R "$src_root/templates" "$kit/templates"
find "$kit/templates" -type f -name '*.md' | while IFS= read -r f; do
  rewrite < "$f" > "$f.new" && mv "$f.new" "$f"
done

has() { local n="$1"; shift; local x; for x in "$@"; do [ "$x" = "$n" ] && return 0; done; return 1; }

# Installs before the manifest. The list is closed: these are all names install.sh
# ever installed and no longer does. Nothing to append here — anything gone from
# now on is removed by the manifest.
rm -f "$cmd_dest/object.md"      "$cmd_dest/object-check.md" \
      "$cmd_dest/story-check.md" "$cmd_dest/plan.md" "$cmd_dest/finish.md" \
      "$kit/AGENTS.md"           "$kit/OBJECT.md" \
      "$kit/PLAN.md"             "$kit/PLAN-FORMAT.md" \
      "$kit/STORY-FORMAT.md"     "$kit/projection.svg" \
      "$kit/check-object-names.sh" "$kit/check-plan-names.sh"

# Previous install: remove what it installed and this one no longer does.
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
  echo "# simple-spec $version — installed; the next run removes what this no longer ships"
  echo "lang $lang"
  printf 'kit %s\n' "${kit_files[@]}"
  printf 'cmd %s\n' "${cmd_files[@]}"
} > "$manifest"

cmd_list="$(printf '%s,' "${cmd_files[@]%.md}")"; cmd_list="{${cmd_list%,}}.md"
kit_list="$(printf '%s, ' "${kit_files[@]}")";    kit_list="${kit_list%, }"
slashes="$(printf '/%s ' "${cmd_files[@]%.md}")"

if [ "$mode" = "project" ]; then
  echo "✓ Installed into project: $kit/ (simple-spec $version)"
  echo "  commands:  $cmd_sub/$cmd_list"
  echo "  kit:       $kit_list"
else
  echo "✓ Installed globally ($tool, simple-spec $version):"
  echo "  commands:  $cmd_dest/$cmd_list"
  echo "  kit:       $kit/"
fi
echo "  stories:   stories/ at the project root — created by /story."
echo
echo "Commands ${slashes}appear after the tool restart."