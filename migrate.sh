#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
command -v docker >/dev/null || { echo 'Docker is required'; exit 1; }
docker compose up -d --wait db
if docker compose exec -T db psql -U piura -d piura_electoral -tAc "SELECT to_regclass('public.departamentos') IS NOT NULL" | grep -qx t; then
  echo 'Schema already exists. Not importing again to avoid duplicate loads.'
  echo 'Use ./verify.sh or explicitly reset the local database with docker compose down -v.'
  exit 1
fi
docker compose exec -T db psql -v ON_ERROR_STOP=1 -U piura -d piura_electoral -f database/migrations/001_initial_schema.sql
docker compose exec -T db psql -v ON_ERROR_STOP=1 -U piura -d piura_electoral -f database/import/002_load_all.sql
