#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
docker compose exec -T db psql -v ON_ERROR_STOP=1 -U piura -d piura_electoral -f database/import/003_verify.sql
