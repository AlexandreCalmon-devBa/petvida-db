#!/bin/bash
# =============================================================================
# TESTE: views.sql
# Verifica se todas as views foram criadas e retornam dados
# =============================================================================

DB_HOST="localhost"
DB_USER="root"
DB_PASS=""
DB_NAME="petvida"

echo "════════════════════════════════════════════════════════════════"
echo "🧪 TESTE - VIEWS.SQL (Visões)"
echo "════════════════════════════════════════════════════════════════"

# Preparar banco
echo -e "\n1️⃣  Preparando banco..."
mysql -u$DB_USER -p"$DB_PASS" <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
EOF
mysql -u$DB_USER -p"$DB_PASS" < /workspaces/petvida-db/database/schema.sql
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME < /workspaces/petvida-db/database/seed.sql
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME < /workspaces/petvida-db/database/views.sql

# Listar views
echo -e "\n2️⃣  Views criadas:"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SHOW FULL TABLES WHERE TABLE_TYPE LIKE 'VIEW';
EOF

# Testar cada view
echo -e "\n3️⃣  Consultando view_animais_tutores (Animais com Tutores):"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SELECT * FROM view_animais_tutores LIMIT 5;
EOF

echo -e "\n4️⃣  Consultando view_consultas_completas (Consultas com Detalhes):"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SELECT * FROM view_consultas_completas LIMIT 5;
EOF

echo -e "\n5️⃣  Consultando view_pagamentos_consultas (Pagamentos com Consultas):"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SELECT * FROM view_pagamentos_consultas LIMIT 5;
EOF

echo -e "\n════════════════════════════════════════════════════════════════"
echo "✅ TESTE DE VIEWS CONCLUÍDO"
echo "════════════════════════════════════════════════════════════════"
