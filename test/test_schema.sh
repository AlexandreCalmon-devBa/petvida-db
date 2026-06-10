#!/bin/bash
# =============================================================================
# TESTE: schema.sql
# Verifica se todas as tabelas foram criadas corretamente
# =============================================================================

DB_HOST="localhost"
DB_USER="root"
DB_PASS=""
DB_NAME="petvida"

echo "════════════════════════════════════════════════════════════════"
echo "🧪 TESTE - SCHEMA.SQL (Criação de Tabelas)"
echo "════════════════════════════════════════════════════════════════"

# Criar banco do zero
echo -e "\n1️⃣  Recriando banco e carregando schema..."
mysql -u$DB_USER -p"$DB_PASS" <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
EOF
mysql -u$DB_USER -p"$DB_PASS" < /workspaces/petvida-db/database/schema.sql

# Listar todas as tabelas
echo -e "\n2️⃣  Tabelas criadas:"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SHOW TABLES;
EOF

# Verificar estrutura de cada tabela
echo -e "\n3️⃣  Estrutura das tabelas:"

TABLES=("especies" "veterinarios" "tutores" "animais" "consultas" "pagamentos")

for table in "${TABLES[@]}"; do
    echo -e "\n📋 Tabela: $table"
    mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
DESCRIBE $table;
EOF
done

echo -e "\n════════════════════════════════════════════════════════════════"
echo "✅ TESTE DE SCHEMA CONCLUÍDO"
echo "════════════════════════════════════════════════════════════════"
