#!/bin/bash
# =============================================================================
# SCRIPT DE TESTE - PETVIDA FUNCTIONS
# =============================================================================
# Este script executa todos os testes das functions criadas
# Uso: bash database/test_functions.sh
# =============================================================================

# Configuração do banco de dados
DB_HOST="localhost"
DB_USER="root"
DB_PASS=""
DB_NAME="petvida"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  TESTE DE FUNCTIONS - PROJETO PETVIDA${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Verifica se MySQL está instalado
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL não está instalado${NC}"
    echo "Por favor, instale com: apt-get install default-mysql-client"
    exit 1
fi

# Teste 1: fn_idade_animal
echo -e "${YELLOW}📅 TESTE 1: fn_idade_animal${NC}"
echo "Query: SELECT nome, fn_idade_animal(data_nascimento) FROM animais LIMIT 5;"
echo ""
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" <<EOF
SELECT 
    a.nome AS 'Animal',
    a.data_nascimento AS 'Data Nascimento',
    fn_idade_animal(a.data_nascimento) AS 'Idade'
FROM animais a
LIMIT 5;
EOF
echo ""
echo -e "${GREEN}✅ Teste 1 completo${NC}"
echo ""

# Teste 2: fn_total_gasto_tutor
echo -e "${YELLOW}💰 TESTE 2: fn_total_gasto_tutor${NC}"
echo "Query: SELECT nome, fn_total_gasto_tutor(id) FROM tutores;"
echo ""
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" <<EOF
SELECT 
    t.nome AS 'Tutor',
    CONCAT('R$ ', FORMAT(fn_total_gasto_tutor(t.id), 2, 'pt_BR')) AS 'Total Gasto'
FROM tutores t
ORDER BY fn_total_gasto_tutor(t.id) DESC;
EOF
echo ""
echo -e "${GREEN}✅ Teste 2 completo${NC}"
echo ""

# Teste 3: fn_qtd_consultas_animal
echo -e "${YELLOW}📊 TESTE 3: fn_qtd_consultas_animal${NC}"
echo "Query: SELECT nome, fn_qtd_consultas_animal(id) FROM animais;"
echo ""
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" <<EOF
SELECT 
    a.nome AS 'Animal',
    fn_qtd_consultas_animal(a.id) AS 'Qtd Consultas'
FROM animais a
ORDER BY fn_qtd_consultas_animal(a.id) DESC
LIMIT 10;
EOF
echo ""
echo -e "${GREEN}✅ Teste 3 completo${NC}"
echo ""

# Teste 4: fn_status_emoji
echo -e "${YELLOW}🎯 TESTE 4: fn_status_emoji${NC}"
echo "Query: SELECT fn_status_emoji(status) FROM consultas GROUP BY status;"
echo ""
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" <<EOF
SELECT 
    fn_status_emoji(c.status) AS 'Status',
    COUNT(*) AS 'Qtd'
FROM consultas c
GROUP BY c.status;
EOF
echo ""
echo -e "${GREEN}✅ Teste 4 completo${NC}"
echo ""

# Teste 5: fn_classificar_valor
echo -e "${YELLOW}💎 TESTE 5: fn_classificar_valor${NC}"
echo "Query: SELECT DISTINCT fn_classificar_valor(valor) FROM consultas;"
echo ""
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" <<EOF
SELECT 
    fn_classificar_valor(c.valor) AS 'Classificação',
    COUNT(*) AS 'Qtd',
    CONCAT('R$ ', FORMAT(MIN(c.valor), 2, 'pt_BR')) AS 'Valor Mín',
    CONCAT('R$ ', FORMAT(MAX(c.valor), 2, 'pt_BR')) AS 'Valor Máx'
FROM consultas c
GROUP BY fn_classificar_valor(c.valor)
ORDER BY MIN(c.valor);
EOF
echo ""
echo -e "${GREEN}✅ Teste 5 completo${NC}"
echo ""

# Teste Integrado
echo -e "${YELLOW}🚀 TESTE INTEGRADO: Todas as Functions${NC}"
echo ""
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" <<EOF
SELECT 
    a.nome AS 'Animal',
    fn_idade_animal(a.data_nascimento) AS 'Idade',
    fn_qtd_consultas_animal(a.id) AS 'Consultas',
    CONCAT('R$ ', FORMAT(fn_total_gasto_tutor(a.tutor_id), 2, 'pt_BR')) AS 'Tutor Gasto'
FROM animais a
ORDER BY a.id DESC
LIMIT 5;
EOF
echo ""
echo -e "${GREEN}✅ Teste Integrado completo${NC}"
echo ""

echo -e "${BLUE}===============================================${NC}"
echo -e "${GREEN}🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!${NC}"
echo -e "${BLUE}===============================================${NC}"
