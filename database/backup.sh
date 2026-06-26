#!/usr/bin/env bash
set -euo pipefail

DB_NAME="petvida"
BACKUP_DIR="$(cd "$(dirname "$0")/.." && pwd)/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

sudo mysqldump -u root "$DB_NAME" > "$BACKUP_FILE"

printf 'Backup criado em %s\n' "$BACKUP_FILE"
