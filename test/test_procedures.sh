#!/bin/bash
# =============================================================================
# TESTE: procedures.sql
# Verifica se todas as procedures foram criadas e funcionam corretamente
# =============================================================================

DB_HOST="localhost"
DB_USER="root"
DB_PASS=""
DB_NAME="petvida"

echo "════════════════════════════════════════════════════════════════"
echo "🧪 TESTE - PROCEDURES.SQL (Procedures/Stored Procedures)"
echo "════════════════════════════════════════════════════════════════"

# Preparar banco
echo -e "\n1️⃣  Preparando banco..."
mysql -u$DB_USER -p"$DB_PASS" <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
EOF
mysql -u$DB_USER -p"$DB_PASS" < /workspaces/petvida-db/database/schema.sql
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME < /workspaces/petvida-db/database/seed.sql
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME < /workspaces/petvida-db/database/procedures.sql

# Listar procedures
echo -e "\n2️⃣  Procedures criadas:"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SELECT ROUTINE_NAME 
FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_SCHEMA = '$DB_NAME' 
  AND ROUTINE_TYPE = 'PROCEDURE'
ORDER BY ROUTINE_NAME;
EOF

# Teste cada procedure
echo -e "\n3️⃣  Testando sp_agendar_consulta (Agendar Consulta):"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
CALL sp_agendar_consulta(1, 1, DATE_ADD(NOW(), INTERVAL 7 DAY), 150.00);

SELECT '--- Consulta agendada ---' AS '';
SELECT c.id, a.nome as Animal, v.nome as Vet, c.data_hora, c.status
FROM consultas c
JOIN animais a ON c.animal_id = a.id
JOIN veterinarios v ON c.veterinario_id = v.id
ORDER BY c.id DESC LIMIT 1;

SELECT '--- Pagamento criado ---' AS '';
SELECT p.* FROM pagamentos p ORDER BY p.id DESC LIMIT 1;
EOF

echo -e "\n4️⃣  Testando sp_confirmar_consulta (Confirmar/Marcar como Realizada):"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SET @consulta_id = (SELECT MAX(id) FROM consultas);
CALL sp_confirmar_consulta(@consulta_id);

SELECT '--- Consulta confirmada ---' AS '';
SELECT id, status FROM consultas WHERE id = @consulta_id;
EOF

echo -e "\n5️⃣  Testando sp_listar_consultas_vencidas (Consultas Vencidas):"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
CALL sp_listar_consultas_vencidas();
EOF

echo -e "\n6️⃣  Testando sp_cancelar_consulta (Cancelar Consulta):"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
-- Criar nova consulta para cancelar
CALL sp_agendar_consulta(2, 2, DATE_ADD(NOW(), INTERVAL 10 DAY), 200.00);
SET @consulta_id = (SELECT MAX(id) FROM consultas);

CALL sp_cancelar_consulta(@consulta_id);

SELECT '--- Consulta cancelada ---' AS '';
SELECT id, status FROM consultas WHERE id = @consulta_id;
EOF

echo -e "\n7️⃣  Testando sp_relatorio_receitas (Relatório de Receitas):"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
CALL sp_relatorio_receitas();
EOF

echo -e "\n════════════════════════════════════════════════════════════════"
echo "✅ TESTE DE PROCEDURES CONCLUÍDO"
echo "════════════════════════════════════════════════════════════════"
