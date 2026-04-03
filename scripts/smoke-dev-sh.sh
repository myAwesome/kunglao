#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEV_SH="$ROOT_DIR/dev.sh"

if ! bash -n "$DEV_SH"; then
  echo "FAIL: dev.sh has invalid shell syntax"
  exit 1
fi

if ! grep -q '^SERVER_PID=\$!$' "$DEV_SH"; then
  echo "FAIL: expected line 'SERVER_PID=\$!' in dev.sh"
  exit 1
fi

echo "PASS: dev.sh syntax and SERVER_PID assignment look good"
