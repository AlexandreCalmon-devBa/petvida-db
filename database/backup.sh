#!/bin/bash
# =============================================================================
# PROJETO: CLÍNICA VETERINÁRIA PETVIDA
# ARQUIVO: database/backup.sh
# OBJETIVO: Rotina de backup automático do banco petvida via mysqldump
# USO:      bash database/backup.sh
#           bash database/backup.sh --user root --password MinhasenhaQ1
# =============================================================================

# ── Configurações padrão (sobrescritas por argumentos ou variáveis de ambiente) ──
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_NAME="${DB_NAME:-petvida}"

# ── Diretório de saída ────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$(dirname "$SCRIPT_DIR")/backups"
mkdir -p "$BACKUP_DIR"

# ── Parse de argumentos opcionais ────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --user)      DB_USER="$2";     shift 2 ;;
    --password)  DB_PASSWORD="$2"; shift 2 ;;
    --host)      DB_HOST="$2";     shift 2 ;;
    --port)      DB_PORT="$2";     shift 2 ;;
    --db)        DB_NAME="$2";     shift 2 ;;
    *) echo "Opção desconhecida: $1"; exit 1 ;;
  esac
done

# ── Nome do arquivo com data e hora ──────────────────────────────────────────
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="${DB_NAME}_${TIMESTAMP}.sql"
FILEPATH="$BACKUP_DIR/$FILENAME"

# ── Executa o backup ──────────────────────────────────────────────────────────
echo ""
echo "=================================================="
echo "  🐾 PetVida — Backup do Banco de Dados"
echo "=================================================="
echo "  Host:    $DB_HOST:$DB_PORT"
echo "  Banco:   $DB_NAME"
echo "  Usuário: $DB_USER"
echo "  Arquivo: $FILENAME"
echo "--------------------------------------------------"

# Monta argumento de senha
PASS_ARG=""
if [ -n "$DB_PASSWORD" ]; then
  PASS_ARG="-p${DB_PASSWORD}"
fi

mysqldump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USER" \
  $PASS_ARG \
  --single-transaction \
  --routines \
  --triggers \
  --add-drop-table \
  --comments \
  --set-charset \
  "$DB_NAME" > "$FILEPATH"

# ── Verifica resultado ────────────────────────────────────────────────────────
if [ $? -eq 0 ]; then
  SIZE=$(du -h "$FILEPATH" | cut -f1)
  echo "  ✅ Backup gerado com sucesso!"
  echo "  📁 Local:  backups/$FILENAME"
  echo "  📦 Tamanho: $SIZE"
else
  echo "  ❌ Falha ao gerar backup!"
  rm -f "$FILEPATH"
  exit 1
fi

echo "=================================================="
echo ""
