-- =============================================================================
-- PROJETO PETVIDA - EXEMPLOS PRÁTICOS DE USO DAS FUNCTIONS
-- Casos de uso reais do dia a dia da clínica
-- =============================================================================

USE petvida;

-- =============================================================================
-- CASO 1: Listar todos os animais com suas idades
-- Útil para: Relatório geral de animais da clínica
-- =============================================================================

SELECT 
    a.id,
    a.nome AS 'Animal',
    e.nome AS 'Espécie',
    t.nome AS 'Tutor',
    fn_idade_animal(a.data_nascimento) AS 'Idade'
FROM animais a
INNER JOIN especies e ON a.especie_id = e.id
INNER JOIN tutores t ON a.tutor_id = t.id
ORDER BY a.nome;

-- RESULTADO ESPERADO:
-- 1  | Chiquinho | Pássaro   | Gabriel Mendes   | 3 anos e 10 meses
-- 2  | Draco     | Réptil    | Gabriel Mendes   | 7 anos e 11 meses
-- 3  | Hera      | Réptil    | Gabriel Mendes   | 4 anos e 4 meses
-- ...


-- =============================================================================
-- CASO 2: Ver quanto cada tutor gastou (com limite de crédito)
-- Útil para: Controle de pagamentos e crédito de tutores
-- =============================================================================

SELECT 
    t.id,
    t.nome AS 'Tutor',
    CONCAT('R$ ', FORMAT(fn_total_gasto_tutor(t.id), 2, 'pt_BR')) AS 'Total Gasto',
    CONCAT('R$ ', FORMAT(5000 - fn_total_gasto_tutor(t.id), 2, 'pt_BR')) AS 'Crédito Disponível'
FROM tutores t
WHERE fn_total_gasto_tutor(t.id) > 1500
ORDER BY fn_total_gasto_tutor(t.id) DESC;

-- RESULTADO ESPERADO:
-- 1 | João Pereira   | R$ 2030,00 | R$ 2970,00
-- 2 | Maria Oliveira | R$ 2045,00 | R$ 2955,00
-- 3 | Carlos Santos  | R$ 2220,00 | R$ 2780,00


-- =============================================================================
-- CASO 3: Identificar animais com muitas consultas (clientes frequentes)
-- Útil para: Programa de fidelidade ou descontos para clientes frequentes
-- =============================================================================

SELECT 
    a.id,
    a.nome AS 'Animal',
    t.nome AS 'Tutor',
    fn_qtd_consultas_animal(a.id) AS 'Total Consultas',
    CASE 
        WHEN fn_qtd_consultas_animal(a.id) >= 5 THEN 'VIP - 10% desconto'
        WHEN fn_qtd_consultas_animal(a.id) >= 3 THEN 'Frequente - 5% desconto'
        ELSE 'Regular'
    END AS 'Classificação'
FROM animais a
INNER JOIN tutores t ON a.tutor_id = t.id
WHERE fn_qtd_consultas_animal(a.id) >= 2
ORDER BY fn_qtd_consultas_animal(a.id) DESC;

-- RESULTADO ESPERADO:
-- 1 | Rex      | João Pereira   | 2 | Frequente - 5% desconto
-- 7 | Draco    | Gabriel Mendes | 2 | Frequente - 5% desconto
-- 10| Kiki     | Maria Oliveira | 2 | Frequente - 5% desconto


-- =============================================================================
-- CASO 4: Dashboard de consultas com status visual
-- Útil para: Recepção - visualizar estado das consultas do dia
-- =============================================================================

SELECT 
    c.id AS 'ID',
    a.nome AS 'Animal',
    v.nome AS 'Veterinário',
    DATE_FORMAT(c.data_hora, '%H:%i') AS 'Horário',
    fn_status_emoji(c.status) AS 'Status'
FROM consultas c
INNER JOIN animais a ON c.animal_id = a.id
INNER JOIN veterinarios v ON c.veterinario_id = v.id
WHERE DATE(c.data_hora) = CURDATE()
ORDER BY c.data_hora;

-- RESULTADO ESPERADO:
-- 15 | Piu      | Dr. Ricardo Silva | 08:45 | 📅 Agendada
-- 18 | Chiquinho| Dra. Ana Souza    | 11:45 | 🏥 Em Atendimento
-- 20 | Rexy     | Dr. Marcos        | 13:15 | 📅 Agendada


-- =============================================================================
-- CASO 5: Análise de faturamento por tipo de procedimento
-- Útil para: Financeiro - avaliar receita por categoria de procedimento
-- =============================================================================

SELECT 
    fn_classificar_valor(c.valor) AS 'Tipo Procedimento',
    COUNT(*) AS 'Qtd',
    CONCAT('R$ ', FORMAT(MIN(c.valor), 2, 'pt_BR')) AS 'Valor Mín',
    CONCAT('R$ ', FORMAT(AVG(c.valor), 2, 'pt_BR')) AS 'Valor Médio',
    CONCAT('R$ ', FORMAT(MAX(c.valor), 2, 'pt_BR')) AS 'Valor Máx',
    CONCAT('R$ ', FORMAT(SUM(c.valor), 2, 'pt_BR')) AS 'Total Faturado'
FROM consultas c
WHERE c.status != 'cancelada'
GROUP BY fn_classificar_valor(c.valor)
ORDER BY SUM(c.valor) DESC;

-- RESULTADO ESPERADO:
-- Consulta Padrão        | 13 | R$ 100,00 | R$ 197,69 | R$ 300,00 | R$ 2570,00
-- Procedimento Especial  | 2  | R$ 275,00 | R$ 315,00 | R$ 350,00 | R$ 630,00
-- Consulta Simples       | 5  | R$ 110,00 | R$ 125,00 | R$ 150,00 | R$ 625,00


-- =============================================================================
-- CASO 6: Relatório de pendências - consultas agendadas
-- Útil para: Confirmar agendamentos com tutores
-- =============================================================================

SELECT 
    a.nome AS 'Animal',
    t.nome AS 'Tutor',
    t.telefone AS 'Telefone',
    DATE_FORMAT(c.data_hora, '%d/%m/%Y %H:%i') AS 'Data/Hora',
    fn_status_emoji(c.status) AS 'Status'
FROM consultas c
INNER JOIN animais a ON c.animal_id = a.id
INNER JOIN tutores t ON a.tutor_id = t.id
WHERE c.status IN ('agendada', 'em_atendimento')
ORDER BY c.data_hora ASC;

-- RESULTADO ESPERADO:
-- Piu      | Roberto Costa | (11) 97777-5555 | 20/01/2025 10:15 | 📅 Agendada
-- Pingo    | Patrícia      | (11) 97777-6666 | 19/01/2025 15:00 | 📅 Agendada
-- Kiki     | Maria         | (11) 97777-2222 | 24/01/2025 11:45 | 📅 Agendada
-- Chiquinho| Gabriel       | (11) 97777-7777 | 23/01/2025 16:30 | 🏥 Em Atendimento


-- =============================================================================
-- CASO 7: Ranking de veterinários por faturamento
-- Útil para: Gestão - avaliar desempenho dos profissionais
-- =============================================================================

SELECT 
    v.nome AS 'Veterinário',
    COUNT(c.id) AS 'Qtd Consultas',
    CONCAT('R$ ', FORMAT(SUM(c.valor), 2, 'pt_BR')) AS 'Faturamento Total',
    CONCAT('R$ ', FORMAT(AVG(c.valor), 2, 'pt_BR')) AS 'Ticket Médio'
FROM consultas c
INNER JOIN veterinarios v ON c.veterinario_id = v.id
WHERE c.status != 'cancelada'
GROUP BY c.veterinario_id
ORDER BY SUM(c.valor) DESC;

-- RESULTADO ESPERADO:
-- Dr. Marcos Oliveira | 6 | R$ 1505,00 | R$ 250,83
-- Dr. Ricardo Silva   | 5 | R$ 1280,00 | R$ 256,00
-- Dra. Ana Souza      | 9 | R$ 1640,00 | R$ 182,22


-- =============================================================================
-- CASO 8: Análise de animais por idade (segmentação)
-- Útil para: Marketing - campanhas segmentadas por idade
-- =============================================================================

SELECT 
    CASE 
        WHEN YEAR(CURDATE()) - YEAR(a.data_nascimento) < 1 THEN 'Filhote'
        WHEN YEAR(CURDATE()) - YEAR(a.data_nascimento) BETWEEN 1 AND 3 THEN 'Jovem'
        WHEN YEAR(CURDATE()) - YEAR(a.data_nascimento) BETWEEN 4 AND 7 THEN 'Adulto'
        ELSE 'Sênior'
    END AS 'Faixa Etária',
    COUNT(*) AS 'Qtd Animais',
    GROUP_CONCAT(a.nome SEPARATOR ', ') AS 'Animais'
FROM animais a
GROUP BY 
    CASE 
        WHEN YEAR(CURDATE()) - YEAR(a.data_nascimento) < 1 THEN 'Filhote'
        WHEN YEAR(CURDATE()) - YEAR(a.data_nascimento) BETWEEN 1 AND 3 THEN 'Jovem'
        WHEN YEAR(CURDATE()) - YEAR(a.data_nascimento) BETWEEN 4 AND 7 THEN 'Adulto'
        ELSE 'Sênior'
    END;

-- RESULTADO ESPERADO:
-- Filhote | 3 | Piu, Nemo, Chiquinho
-- Jovem   | 4 | Nina, Mel, Luna, Hera
-- Adulto  | 5 | Rex, Thor, Pingo, Kiki, Sushi
-- Sênior  | 3 | Draco, Sombra, Rexy


-- =============================================================================
-- CASO 9: Consulta rápida - animais de um tutor específico
-- Útil para: Atendimento - ver histórico completo do cliente
-- =============================================================================

SELECT 
    a.nome AS 'Animal',
    fn_idade_animal(a.data_nascimento) AS 'Idade',
    fn_qtd_consultas_animal(a.id) AS 'Consultas',
    CONCAT('R$ ', FORMAT(fn_total_gasto_tutor(a.tutor_id), 2, 'pt_BR')) AS 'Gasto Total do Tutor'
FROM animais a
WHERE a.tutor_id = 1  -- João Pereira
ORDER BY a.nome;

-- RESULTADO ESPERADO (Tutor: João Pereira):
-- Rex   | 5 anos e 13 meses | 2 | R$ 2030,00
-- Sushi | 2 anos e 9 meses  | 1 | R$ 2030,00


-- =============================================================================
-- CASO 10: Dashboard executivo - métricas gerais
-- Útil para: Diretor/Gerente - visão geral da clínica
-- =============================================================================

SELECT 
    'Total Animais' AS 'Métrica',
    COUNT(*) AS 'Valor'
FROM animais

UNION ALL

SELECT 'Total Consultas', COUNT(*) FROM consultas

UNION ALL

SELECT 'Consultas Concluídas', COUNT(*) FROM consultas WHERE status = 'concluida'

UNION ALL

SELECT 'Faturamento Total', CONCAT('R$ ', FORMAT(SUM(valor), 2, 'pt_BR'))
FROM consultas WHERE status != 'cancelada'

UNION ALL

SELECT 'Consulta Média', CONCAT('R$ ', FORMAT(AVG(valor), 2, 'pt_BR'))
FROM consultas WHERE status != 'cancelada'

UNION ALL

SELECT 'Animal Mais Velho', 
    (SELECT a.nome FROM animais a ORDER BY a.data_nascimento ASC LIMIT 1)
FROM dual;

-- RESULTADO ESPERADO:
-- Total Animais          | 15
-- Total Consultas        | 20
-- Consultas Concluídas   | 12
-- Faturamento Total      | R$ 3825,00
-- Consulta Média         | R$ 214,88
-- Animal Mais Velho      | Draco


-- =============================================================================
-- FIM DOS EXEMPLOS PRÁTICOS
-- =============================================================================
-- Todas as functions estão prontas para uso em queries reais do dia a dia!
-- Copie, adapte e use conforme a necessidade da clínica.
-- =============================================================================
