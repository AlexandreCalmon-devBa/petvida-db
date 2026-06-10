#!/bin/bash
# =============================================================================
# TESTE: triggers.sql
# Verifica se todos os triggers foram criados e funcionam corretamente
# =============================================================================

DB_HOST="localhost"
DB_USER="root"
DB_PASS=""
DB_NAME="petvida"

echo "════════════════════════════════════════════════════════════════"
echo "🧪 TESTE - TRIGGERS.SQL (Triggers e Auditoria)"
echo "════════════════════════════════════════════════════════════════"

# Preparar banco
echo -e "\n1️⃣  Preparando banco..."
mysql -u$DB_USER -p"$DB_PASS" <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
EOF
mysql -u$DB_USER -p"$DB_PASS" < /workspaces/petvida-db/database/schema.sql
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME < /workspaces/petvida-db/database/seed.sql
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME < /workspaces/petvida-db/database/triggers.sql

# Listar triggers
echo -e "\n2️⃣  Triggers criados:"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SELECT TRIGGER_NAME, TRIGGER_EVENT, TRIGGER_STATEMENT 
FROM INFORMATION_SCHEMA.TRIGGERS 
WHERE TRIGGER_SCHEMA = '$DB_NAME'
LIMIT 10;
EOF

# Verificar tabela log_auditoria
echo -e "\n3️⃣  Tabela log_auditoria (estrutura):"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
DESCRIBE log_auditoria;
EOF

# Teste 1: INSERT Consulta
echo -e "\n4️⃣  Teste INSERT CONSULTA:"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
INSERT INTO consultas (animal_id, veterinario_id, data_hora, diagnostico, valor, status)
VALUES (1, 1, NOW(), 'Teste de auditoria', 199.99, 'agendada');

SELECT '--- Log após INSERT ---' AS '';
SELECT id, tabela_afetada, acao, registro_id, SUBSTRING(detalhes, 1, 60) as detalhes, data_hora 
FROM log_auditoria ORDER BY id DESC LIMIT 2;
EOF

# Teste 2: UPDATE Status
echo -e "\n5️⃣  Teste UPDATE STATUS CONSULTA:"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
UPDATE consultas SET status = 'em_atendimento' WHERE id = (SELECT MAX(id) FROM consultas WHERE valor = 199.99);

SELECT '--- Log após UPDATE ---' AS '';
SELECT id, tabela_afetada, acao, registro_id, detalhes, data_hora 
FROM log_auditoria ORDER BY id DESC LIMIT 2;
EOF

# Teste 3: INSERT Animal
echo -e "\n6️⃣  Teste INSERT ANIMAL:"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
INSERT INTO animais (nome, especie_id, raca, data_nascimento, tutor_id)
VALUES ('Teste Auditoria', 1, 'SRD', '2023-01-01', 1);

SELECT '--- Log após INSERT ANIMAL ---' AS '';
SELECT id, tabela_afetada, acao, registro_id, SUBSTRING(detalhes, 1, 60) as detalhes 
FROM log_auditoria WHERE tabela_afetada = 'animais' ORDER BY id DESC LIMIT 1;
EOF

# Teste 4: Atualizar Pagamento
echo -e "\n7️⃣  Teste UPDATE PAGAMENTO (data_pagamento auto-preenchida):"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
-- Usar um pagamento existente
SET @consulta_id = (SELECT MIN(id) FROM consultas WHERE id NOT IN (SELECT consulta_id FROM pagamentos) LIMIT 1);

IF @consulta_id IS NOT NULL THEN
    INSERT INTO pagamentos (consulta_id, valor_pago, forma_pagamento, data_pagamento, status)
    VALUES (@consulta_id, 100.00, 'dinheiro', '1900-01-01', 'pendente');
    
    UPDATE pagamentos 
    SET status = 'pago' 
    WHERE consulta_id = @consulta_id;
    
    SELECT '--- Pagamento com data preenchida ---' AS '';
    SELECT id, consulta_id, valor_pago, status, data_pagamento 
    FROM pagamentos 
    WHERE consulta_id = @consulta_id;
END IF;
EOF

# Teste 5: Tentar deletar com pagamento (deve falhar)
echo -e "\n8️⃣  Teste DELETE BLOQUEADO (consulta com pagamento pago):"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
-- Criar nova consulta e marcar como paga
INSERT INTO consultas (animal_id, veterinario_id, data_hora, diagnostico, valor, status)
VALUES (2, 2, NOW(), 'Será paga e não deletada', 250.00, 'concluida');

SET @consulta_id = (SELECT MAX(id) FROM consultas WHERE valor = 250.00);

INSERT INTO pagamentos (consulta_id, valor_pago, forma_pagamento, data_pagamento, status)
VALUES (@consulta_id, 250.00, 'cartao', NOW(), 'pago');

SELECT 'Tentando deletar consulta com pagamento pago...' AS '';

-- Tentar deletar (vai falhar e registrar no log)
DELETE FROM consultas WHERE id = @consulta_id;
EOF

# Resumo do log
echo -e "\n9️⃣  RESUMO DO LOG DE AUDITORIA:"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SELECT 
    tabela_afetada,
    acao,
    COUNT(*) as qtd
FROM log_auditoria
GROUP BY tabela_afetada, acao
ORDER BY tabela_afetada, acao;

SELECT '' AS '';
SELECT 'Últimos 10 registros:' AS '';
SELECT id, tabela_afetada, acao, registro_id, data_hora 
FROM log_auditoria 
ORDER BY id DESC 
LIMIT 10;
EOF

echo -e "\n════════════════════════════════════════════════════════════════"
echo "✅ TESTE DE TRIGGERS CONCLUÍDO"
echo "════════════════════════════════════════════════════════════════"
