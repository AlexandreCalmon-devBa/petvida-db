#!/bin/bash

# Script de teste dos triggers

DB="petvida"
USER="root"
PASSWORD=""

echo "════════════════════════════════════════════════════════════════"
echo "TESTE DE TRIGGERS - PROJETO PETVIDA"
echo "════════════════════════════════════════════════════════════════"

# Carregar triggers
echo -e "\n1️⃣  Carregando triggers..."
mysql -u$USER -p"$PASSWORD" $DB < /workspaces/petvida-db/database/triggers.sql

# Teste 1: INSERT em consultas
echo -e "\n2️⃣  TESTE 1: Inserindo nova consulta (deve registrar no log)..."
mysql -u$USER -p"$PASSWORD" $DB <<EOF
INSERT INTO consultas (animal_id, veterinario_id, data_hora, diagnostico, valor, status)
VALUES (1, 1, NOW(), 'Consulta de rotina', 150.00, 'agendada');

SELECT '--- LOG APÓS INSERT CONSULTA ---' as '';
SELECT id, tabela_afetada, acao, registro_id, detalhes, data_hora FROM log_auditoria ORDER BY id DESC LIMIT 3;
EOF

# Teste 2: UPDATE status de consulta
echo -e "\n3️⃣  TESTE 2: Atualizando status de consulta de 'agendada' para 'em_atendimento'..."
mysql -u$USER -p"$PASSWORD" $DB <<EOF
UPDATE consultas SET status = 'em_atendimento' WHERE id = (SELECT MAX(id) FROM consultas);

SELECT '--- LOG APÓS UPDATE STATUS ---' as '';
SELECT id, tabela_afetada, acao, registro_id, detalhes, data_hora FROM log_auditoria ORDER BY id DESC LIMIT 3;
EOF

# Teste 3: Completar a consulta
echo -e "\n4️⃣  TESTE 3: Marcando consulta como concluída..."
mysql -u$USER -p"$PASSWORD" $DB <<EOF
UPDATE consultas SET status = 'concluida' WHERE id = (SELECT MAX(id) FROM consultas);

SELECT '--- LOG APÓS CONCLUSÃO ---' as '';
SELECT id, tabela_afetada, acao, registro_id, detalhes, data_hora FROM log_auditoria ORDER BY id DESC LIMIT 3;
EOF

# Teste 4: Tentar deletar consulta sem pagamento (deve suceder)
echo -e "\n5️⃣  TESTE 4: Deletando consulta SEM pagamento (deve suceder)..."
mysql -u$USER -p"$PASSWORD" $DB <<EOF
DELETE FROM consultas WHERE id = (SELECT MAX(id) FROM consultas);

SELECT '--- LOG APÓS DELETE SEM PAGAMENTO ---' as '';
SELECT id, tabela_afetada, acao, registro_id, detalhes, data_hora FROM log_auditoria ORDER BY id DESC LIMIT 2;
EOF

# Teste 5: Criar nova consulta, pagar e tentar deletar
echo -e "\n6️⃣  TESTE 5: Tentando deletar consulta COM pagamento pago (deve FALHAR)..."
CONSULTA_ID=$(mysql -u$USER -p"$PASSWORD" $DB -se "SELECT MAX(id) FROM consultas LIMIT 1;")

mysql -u$USER -p"$PASSWORD" $DB <<EOF
-- Inserir nova consulta se não existir
INSERT INTO consultas (animal_id, veterinario_id, data_hora, diagnostico, valor, status)
SELECT 1, 1, NOW(), 'Consulta pagável', 200.00, 'concluida'
WHERE NOT EXISTS (SELECT 1 FROM consultas WHERE valor = 200.00);

-- Obter ID da última consulta
SET @consulta_id = (SELECT MAX(id) FROM consultas);

-- Inserir pagamento pago
INSERT INTO pagamentos (consulta_id, valor_pago, forma_pagamento, data_pagamento, status)
VALUES (@consulta_id, 200.00, 'cartao', NOW(), 'pago')
ON DUPLICATE KEY UPDATE status = 'pago', data_pagamento = NOW();

SELECT CONCAT('Consulta ID: ', @consulta_id) as '';
SELECT '--- Tentando deletar consulta com pagamento pago... ---' as '';

-- Tentar deletar (vai dar erro)
DELETE FROM consultas WHERE id = @consulta_id;
EOF

echo -e "\n7️⃣  TESTE 6: INSERT em animais (deve registrar no log)..."
mysql -u$USER -p"$PASSWORD" $DB <<EOF
INSERT INTO animais (nome, especie_id, raca, data_nascimento, tutor_id)
VALUES ('Tornado', 1, 'Vira-lata', '2022-03-15', 1);

SELECT '--- LOG APÓS INSERT ANIMAL ---' as '';
SELECT id, tabela_afetada, acao, registro_id, detalhes, data_hora FROM log_auditoria 
WHERE tabela_afetada = 'animais' ORDER BY id DESC LIMIT 2;
EOF

# Teste 7: Atualizar pagamento para pago
echo -e "\n8️⃣  TESTE 7: Marcando pagamento como 'pago' (deve preencher data_pagamento automaticamente)..."
mysql -u$USER -p"$PASSWORD" $DB <<EOF
-- Usar uma consulta que existe
SET @consulta_id = (SELECT MIN(id) FROM consultas WHERE id NOT IN (SELECT consulta_id FROM pagamentos));

-- Inserir pagamento pendente se não existir
INSERT INTO pagamentos (consulta_id, valor_pago, forma_pagamento, data_pagamento, status)
SELECT @consulta_id, 100.00, 'dinheiro', NOW(), 'pendente'
WHERE NOT EXISTS (SELECT 1 FROM pagamentos WHERE consulta_id = @consulta_id);

-- Atualizar status para pago
UPDATE pagamentos 
SET status = 'pago', valor_pago = 100.00 
WHERE consulta_id = @consulta_id;

SELECT '--- Pagamento após atualização para PAGO ---' as '';
SELECT id, consulta_id, valor_pago, status, data_pagamento FROM pagamentos WHERE id = (SELECT MAX(id) FROM pagamentos);
EOF

# Resumo final do log
echo -e "\n════════════════════════════════════════════════════════════════"
echo "📊 RESUMO FINAL DO LOG DE AUDITORIA"
echo "════════════════════════════════════════════════════════════════"
mysql -u$USER -p"$PASSWORD" $DB <<EOF
SELECT 
    COUNT(*) as total_registros,
    tabela_afetada,
    acao,
    COUNT(*) as qtd
FROM log_auditoria
GROUP BY tabela_afetada, acao
ORDER BY tabela_afetada, acao;

SELECT '---' as '';
SELECT 'Últimos 10 registros do log:' as '';
SELECT id, tabela_afetada, acao, registro_id, data_hora FROM log_auditoria ORDER BY id DESC LIMIT 10;
EOF

echo -e "\n✅ TESTES CONCLUÍDOS!"
echo "════════════════════════════════════════════════════════════════"
