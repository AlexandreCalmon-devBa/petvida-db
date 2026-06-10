-- =============================================================================
-- PROJETO PETVIDA - TESTE DAS FUNCTIONS
-- OBJETIVO: Validar todas as 5 functions criadas com queries reais
-- =============================================================================

USE petvida;

-- =============================================================================
-- TESTE 1: fn_idade_animal
-- Retorna a idade de cada animal em formato "X anos e Y meses"
-- =============================================================================

SELECT 
    '=== TESTE 1: fn_idade_animal ===' AS teste,
    a.nome AS 'Nome do Animal',
    a.data_nascimento AS 'Data Nascimento',
    fn_idade_animal(a.data_nascimento) AS 'Idade Formatada'
FROM animais a
ORDER BY a.id
LIMIT 10;

-- =============================================================================
-- TESTE 2: fn_total_gasto_tutor
-- Calcula quanto cada tutor já gastou em consultas (exceto canceladas)
-- =============================================================================

SELECT 
    '=== TESTE 2: fn_total_gasto_tutor ===' AS teste,
    t.id AS 'ID Tutor',
    t.nome AS 'Nome do Tutor',
    CONCAT('R$ ', FORMAT(fn_total_gasto_tutor(t.id), 2, 'pt_BR')) AS 'Total Gasto'
FROM tutores t
ORDER BY fn_total_gasto_tutor(t.id) DESC;

-- =============================================================================
-- TESTE 3: fn_qtd_consultas_animal
-- Conta quantas consultas cada animal teve
-- =============================================================================

SELECT 
    '=== TESTE 3: fn_qtd_consultas_animal ===' AS teste,
    a.nome AS 'Nome do Animal',
    e.nome AS 'Espécie',
    fn_qtd_consultas_animal(a.id) AS 'Qtd Consultas'
FROM animais a
INNER JOIN especies e ON a.especie_id = e.id
ORDER BY fn_qtd_consultas_animal(a.id) DESC;

-- =============================================================================
-- TESTE 4: fn_status_emoji
-- Exibe status de consultas com emojis descritivos
-- =============================================================================

SELECT 
    '=== TESTE 4: fn_status_emoji ===' AS teste,
    c.id AS 'ID Consulta',
    a.nome AS 'Animal',
    fn_status_emoji(c.status) AS 'Status com Emoji',
    CONCAT('R$ ', FORMAT(c.valor, 2, 'pt_BR')) AS 'Valor'
FROM consultas c
INNER JOIN animais a ON c.animal_id = a.id
GROUP BY c.status
ORDER BY FIELD(c.status, 'agendada', 'em_atendimento', 'concluida', 'cancelada');

-- =============================================================================
-- TESTE 5: fn_classificar_valor
-- Classifica consultas por valor (Simples, Padrão, Especial)
-- =============================================================================

SELECT 
    '=== TESTE 5: fn_classificar_valor ===' AS teste,
    c.id AS 'ID Consulta',
    a.nome AS 'Animal',
    CONCAT('R$ ', FORMAT(c.valor, 2, 'pt_BR')) AS 'Valor',
    fn_classificar_valor(c.valor) AS 'Classificação'
FROM consultas c
INNER JOIN animais a ON c.animal_id = a.id
ORDER BY c.valor ASC;

-- =============================================================================
-- TESTE INTEGRADO: Usando múltiplas functions em um relatório
-- =============================================================================

SELECT 
    '=== TESTE INTEGRADO ===' AS relatorio,
    t.nome AS 'Tutor',
    a.nome AS 'Animal',
    fn_idade_animal(a.data_nascimento) AS 'Idade',
    fn_qtd_consultas_animal(a.id) AS 'Consultas',
    CONCAT('R$ ', FORMAT(fn_total_gasto_tutor(t.id), 2, 'pt_BR')) AS 'Total Gasto'
FROM tutores t
INNER JOIN animais a ON t.id = a.tutor_id
ORDER BY t.nome, a.nome;

-- =============================================================================
-- TESTE DE RELATÓRIO: Dashboard de Consultas com Emojis e Classificação
-- =============================================================================

SELECT 
    c.id AS 'ID',
    a.nome AS 'Animal',
    fn_status_emoji(c.status) AS 'Status',
    fn_classificar_valor(c.valor) AS 'Tipo',
    CONCAT('R$ ', FORMAT(c.valor, 2, 'pt_BR')) AS 'Valor',
    DATE_FORMAT(c.data_hora, '%d/%m/%Y %H:%i') AS 'Data/Hora'
FROM consultas c
INNER JOIN animais a ON c.animal_id = a.id
ORDER BY c.data_hora DESC;

-- =============================================================================
-- FIM DOS TESTES
-- =============================================================================
