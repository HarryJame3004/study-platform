#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
target_dir="$HOME/.local/bin"
install -d -- "$target_dir"
install -m 755 -- "$script_dir/up" "$target_dir/up"
printf 'Installed %s/up\n' "$target_dir"

case ":$PATH:" in
  *":$target_dir:"*) ;;
  *) printf 'Add %s to your PATH to run up from any directory.\n' "$target_dir" ;;
esac
