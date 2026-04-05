#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:8080}"

echo "▸ Smoke test against ${API_URL}"

ping_response="$(curl -fsS "${API_URL}/ping")"
if [[ "${ping_response}" != *"hello"* ]]; then
  echo "Ping failed: unexpected response: ${ping_response}"
  exit 1
fi
echo "✓ /ping"

filter_response="$(curl -fsS -X POST "${API_URL}/filter-unknown" \
  -H "Content-Type: application/json" \
  -d '["hello","world","hello"]')"
if [[ "${filter_response}" != \[*\] ]]; then
  echo "Filter failed: unexpected response: ${filter_response}"
  exit 1
fi
echo "✓ /filter-unknown"

ignore_response="$(curl -fsS -X POST "${API_URL}/ignore" \
  -H "Content-Type: application/json" \
  -d '{"words":["smokeignoreword"]}')"
if [[ "${ignore_response}" != "\"done\"" ]]; then
  echo "Ignore failed: unexpected response: ${ignore_response}"
  exit 1
fi
echo "✓ /ignore"

know_response="$(curl -fsS -X POST "${API_URL}/know" \
  -H "Content-Type: application/json" \
  -d '{"words":["smokeknowword"]}')"
if [[ "${know_response}" != "\"done\"" ]]; then
  echo "Know failed: unexpected response: ${know_response}"
  exit 1
fi
echo "✓ /know"

echo "Smoke test passed."
