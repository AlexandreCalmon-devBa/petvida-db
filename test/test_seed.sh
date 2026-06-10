#!/bin/bash
# =============================================================================
# TESTE: seed.sql
# Verifica se dados de teste foram inseridos corretamente
# =============================================================================

DB_HOST="localhost"
DB_USER="root"
DB_PASS=""
DB_NAME="petvida"

echo "════════════════════════════════════════════════════════════════"
echo "🧪 TESTE - SEED.SQL (Dados de Teste)"
echo "════════════════════════════════════════════════════════════════"

# Preparar banco
echo -e "\n1️⃣  Preparando banco..."
mysql -u$DB_USER -p"$DB_PASS" <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
EOF
mysql -u$DB_USER -p"$DB_PASS" < /workspaces/petvida-db/database/schema.sql
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME < /workspaces/petvida-db/database/seed.sql

# Listar quantidades
echo -e "\n2️⃣  Contagem de registros:"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SELECT 'Espécies' as Tabela, COUNT(*) as Total FROM especies
UNION ALL
SELECT 'Veterinários', COUNT(*) FROM veterinarios
UNION ALL
SELECT 'Tutores', COUNT(*) FROM tutores
UNION ALL
SELECT 'Animais', COUNT(*) FROM animais
UNION ALL
SELECT 'Consultas', COUNT(*) FROM consultas
UNION ALL
SELECT 'Pagamentos', COUNT(*) FROM pagamentos;
EOF

# Mostrar alguns dados
echo -e "\n3️⃣  Veterinários cadastrados:"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SELECT id, nome, crmv, especialidade FROM veterinarios LIMIT 5;
EOF

echo -e "\n4️⃣  Tutores cadastrados:"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SELECT id, nome, email, telefone FROM tutores LIMIT 5;
EOF

echo -e "\n5️⃣  Animais cadastrados:"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SELECT a.id, a.nome, e.nome as Especie, a.raca, t.nome as Tutor 
FROM animais a
JOIN especies e ON a.especie_id = e.id
JOIN tutores t ON a.tutor_id = t.id
LIMIT 5;
EOF

echo -e "\n6️⃣  Consultas agendadas:"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SELECT c.id, a.nome as Animal, v.nome as Veterinario, c.data_hora, c.status, c.valor
FROM consultas c
JOIN animais a ON c.animal_id = a.id
JOIN veterinarios v ON c.veterinario_id = v.id
LIMIT 5;
EOF

echo -e "\n════════════════════════════════════════════════════════════════"
echo "✅ TESTE DE SEED CONCLUÍDO"
echo "════════════════════════════════════════════════════════════════"
