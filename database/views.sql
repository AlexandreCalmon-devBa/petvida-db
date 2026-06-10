-- =============================================================================
-- PROJETO: CLÍNICA VETERINÁRIA PETVIDA
-- OBJETIVO: VIEWs encapsulando JOINs complexos
-- =============================================================================

USE petvida;

-- -----------------------------------------------------------------------------
-- 1. vw_consultas_completas — JOIN de todas as 6 tabelas
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_consultas_completas AS
SELECT
    c.id               AS consulta_id,
    c.data_hora,
    c.status           AS status_consulta,
    c.diagnostico,
    c.valor            AS valor_consulta,
    a.nome             AS animal,
    e.nome             AS especie,
    t.nome             AS tutor,
    t.telefone         AS telefone_tutor,
    v.nome             AS veterinario,
    v.especialidade,
    p.forma_pagamento,
    p.status           AS status_pagamento
FROM consultas c
JOIN animais      a ON c.animal_id      = a.id
JOIN especies     e ON a.especie_id     = e.id
JOIN tutores      t ON a.tutor_id       = t.id
JOIN veterinarios v ON c.veterinario_id = v.id
LEFT JOIN pagamentos p ON p.consulta_id = c.id;

-- -----------------------------------------------------------------------------
-- 2. vw_agenda_hoje — consultas do dia ordenadas por hora
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_agenda_hoje AS
SELECT *
FROM vw_consultas_completas
WHERE DATE(data_hora) = CURDATE()
ORDER BY data_hora;

-- -----------------------------------------------------------------------------
-- 3. vw_faturamento_mensal — faturamento por ano/mês/veterinário
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_faturamento_mensal AS
SELECT
    YEAR(data_hora)  AS ano,
    MONTH(data_hora) AS mes,
    veterinario,
    COUNT(*)         AS total_consultas,
    SUM(valor_consulta) AS faturamento_total
FROM vw_consultas_completas
GROUP BY ano, mes, veterinario;

-- -----------------------------------------------------------------------------
-- 4. vw_animais_detalhados — animais com tutor, espécie e total de consultas
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_animais_detalhados AS
SELECT
    a.nome       AS animal,
    e.nome       AS especie,
    t.nome       AS tutor,
    t.telefone   AS telefone_tutor,
    COUNT(c.id)  AS total_consultas
FROM animais a
JOIN especies     e ON a.especie_id = e.id
JOIN tutores      t ON a.tutor_id   = t.id
LEFT JOIN consultas c ON c.animal_id = a.id
GROUP BY a.id, a.nome, e.nome, t.nome, t.telefone;

-- -----------------------------------------------------------------------------
-- 5. vw_inadimplentes — consultas concluídas com pagamento pendente ou ausente
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_inadimplentes AS
SELECT
    c.id          AS consulta_id,
    c.data_hora,
    c.valor       AS valor_consulta,
    a.nome        AS animal,
    t.nome        AS tutor,
    t.telefone    AS telefone_tutor,
    p.status      AS status_pagamento
FROM consultas c
JOIN animais  a ON c.animal_id  = a.id
JOIN tutores  t ON a.tutor_id   = t.id
LEFT JOIN pagamentos p ON p.consulta_id = c.id
WHERE c.status = 'concluida'
  AND (p.status = 'pendente' OR p.id IS NULL);