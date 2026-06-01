-- =============================================================================
-- PROJETO: CLÍNICA VETERINÁRIA PETVIDA
-- OBJETIVO: Criar VIEWs baseadas no schema corrigido
-- =============================================================================

USE petvida;

-- -----------------------------------------------------------------------------
-- 1) vw_consultas_completas
--    JOIN das 5 tabelas base (inclui especies para obter nome da espécie).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_consultas_completas AS
SELECT
    c.id              AS consulta_id,
    c.data_hora,
    c.diagnostico,
    c.valor           AS valor_consulta,
    c.status,
    a.nome            AS animal,
    e.nome            AS especie,
    t.nome            AS tutor,
    t.telefone        AS telefone_tutor,
    v.nome            AS veterinario,
    v.especialidade
FROM consultas c
JOIN animais     a ON c.animal_id      = a.id
JOIN especies    e ON a.especie_id     = e.id
JOIN tutores     t ON a.tutor_id       = t.id
JOIN veterinarios v ON c.veterinario_id = v.id;

-- -----------------------------------------------------------------------------
-- 2) vw_agenda_hoje
--    Consultas do dia atual ordenadas por horário.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_agenda_hoje AS
SELECT *
FROM vw_consultas_completas
WHERE DATE(data_hora) = CURDATE()
ORDER BY data_hora;

-- -----------------------------------------------------------------------------
-- 3) vw_faturamento_mensal
--    Total de consultas e faturamento por mês/ano/veterinário.
--    Considera apenas consultas concluídas.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_faturamento_mensal AS
SELECT
    YEAR(data_hora)  AS ano,
    MONTH(data_hora) AS mes,
    veterinario,
    COUNT(*)         AS total_consultas,
    SUM(valor_consulta) AS faturamento_total
FROM vw_consultas_completas
WHERE status = 'concluida'
GROUP BY ano, mes, veterinario;

-- -----------------------------------------------------------------------------
-- 4) vw_animais_detalhados
--    Dados do animal com nome da espécie (via JOIN) e total de consultas.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_animais_detalhados AS
SELECT
    a.id              AS animal_id,
    a.nome            AS animal,
    e.nome            AS especie,
    a.raca,
    t.nome            AS tutor,
    t.telefone        AS telefone_tutor,
    COUNT(c.id)       AS total_consultas
FROM animais a
JOIN especies  e ON a.especie_id = e.id
JOIN tutores   t ON a.tutor_id   = t.id
LEFT JOIN consultas c ON a.id    = c.animal_id
GROUP BY a.id, a.nome, e.nome, a.raca, t.nome, t.telefone;

-- -----------------------------------------------------------------------------
-- 5) vw_pagamentos_pendentes  (BÔNUS — útil para gestão financeira)
--    Lista consultas com pagamento ainda em aberto.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_pagamentos_pendentes AS
SELECT
    p.id             AS pagamento_id,
    c.data_hora,
    cc.animal        AS animal,
    cc.tutor         AS tutor,
    cc.telefone_tutor,
    cc.veterinario,
    c.valor          AS valor_consulta,
    p.forma_pagamento,
    p.status         AS status_pagamento
FROM pagamentos p
JOIN consultas  c  ON p.consulta_id  = c.id
JOIN vw_consultas_completas cc ON c.id = cc.consulta_id
WHERE p.status IN ('pendente');