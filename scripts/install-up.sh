#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
target_dir="$HOME/.local/bin"
install -d -- "$target_dir"
install -m 755 -- "$script_dir/up" "$target_dir/up"
if [[ -f "$script_dir/new-lesson" ]]; then
  install -m 755 -- "$script_dir/new-lesson" "$target_dir/new-lesson"
fi
printf 'Installed %s/up%s\n' "$target_dir" "$([[ -f "$target_dir/new-lesson" ]] && printf ' and %s/new-lesson' "$target_dir")"

case ":$PATH:" in
  *":$target_dir:"*) ;;
  *) printf 'Add %s to your PATH to run up from any directory.\n' "$target_dir" ;;
esac
