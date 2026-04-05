#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# Load .env if present
if [ -f .env ]; then
  set -a && source .env && set +a
fi

# ── 1. Database ────────────────────────────────────────────────────────────────
echo "▸ Starting database..."
docker-compose up -d

echo -n "▸ Waiting for database to be ready..."
until docker compose exec -T mysql mysqladmin ping -h 127.0.0.1 -uroot -p"$MYSQL_PASSWORD" >/dev/null 2>&1; do
  printf "."
  sleep 1
done
echo " ready"


# ── 2. Server ──────────────────────────────────────────────────────────────────
echo "▸ Installing Server dependencies..."
(cd server && npm install)

echo "▸ Starting Server..."
(cd server && npm run start) &
SERVER_PID=$!

trap "kill $SERVER_PID 2>/dev/null; exit" INT TERM
wait $SERVER_PID
