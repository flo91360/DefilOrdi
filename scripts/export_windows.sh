#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p exports
godot --headless --path . --editor --quit
godot --headless --path . --export-release "Windows Desktop" exports/DefilOrdi.exe
test -s exports/DefilOrdi.exe
if [ -f exports/DefilOrdi.pck ]; then
  echo "Unexpected separate resource pack" >&2
  exit 1
fi
echo "Executable generated: exports/DefilOrdi.exe"
