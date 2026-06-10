#!/bin/bash
# =============================================================================
# TESTE: functions.sql
# Verifica se todas as functions foram criadas e retornam dados
# =============================================================================

DB_HOST="localhost"
DB_USER="root"
DB_PASS=""
DB_NAME="petvida"

echo "════════════════════════════════════════════════════════════════"
echo "🧪 TESTE - FUNCTIONS.SQL (Funções)"
echo "════════════════════════════════════════════════════════════════"

# Preparar banco
echo -e "\n1️⃣  Preparando banco..."
mysql -u$DB_USER -p"$DB_PASS" <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
EOF
mysql -u$DB_USER -p"$DB_PASS" < /workspaces/petvida-db/database/schema.sql
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME < /workspaces/petvida-db/database/seed.sql
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME < /workspaces/petvida-db/database/functions.sql

# Listar functions
echo -e "\n2️⃣  Functions criadas:"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_SCHEMA = '$DB_NAME' AND ROUTINE_TYPE = 'FUNCTION';
EOF

# Teste 1: fn_idade_animal
echo -e "\n3️⃣  Testando fn_idade_animal (Idade do Animal):"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SELECT 
    a.nome AS Animal,
    a.data_nascimento,
    fn_idade_animal(a.data_nascimento) AS Idade
FROM animais a
LIMIT 5;
EOF

# Teste 2: fn_total_gasto_tutor
echo -e "\n4️⃣  Testando fn_total_gasto_tutor (Total Gasto por Tutor):"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SELECT 
    t.id,
    t.nome AS Tutor,
    fn_total_gasto_tutor(t.id) AS Total_Gasto
FROM tutores t
LIMIT 5;
EOF

# Teste 3: fn_qtd_consultas_animal
echo -e "\n5️⃣  Testando fn_qtd_consultas_animal (Qtd de Consultas):"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SELECT 
    a.id,
    a.nome AS Animal,
    fn_qtd_consultas_animal(a.id) AS Total_Consultas
FROM animais a
LIMIT 5;
EOF

# Teste 4: fn_status_emoji
echo -e "\n6️⃣  Testando fn_status_emoji (Status com Emoji):"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SELECT 
    fn_status_emoji('agendada') AS Agendada,
    fn_status_emoji('concluida') AS Concluída,
    fn_status_emoji('cancelada') AS Cancelada,
    fn_status_emoji('em_atendimento') AS Em_Atendimento;
EOF

# Teste 5: fn_classificar_valor
echo -e "\n7️⃣  Testando fn_classificar_valor (Classificação de Valor):"
mysql -u$DB_USER -p"$DB_PASS" $DB_NAME <<EOF
SELECT 
    fn_classificar_valor(50) AS Simples,
    fn_classificar_valor(150) AS Padrao,
    fn_classificar_valor(350) AS Especial;
EOF

echo -e "\n════════════════════════════════════════════════════════════════"
echo "✅ TESTE DE FUNCTIONS CONCLUÍDO"
echo "════════════════════════════════════════════════════════════════"
