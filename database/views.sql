-- =============================================================================
-- PROJETO: CLÍNICA VETERINÁRIA PETVIDA
-- OBJETIVO: Criar VIEWs baseadas no schema simplificado
-- =============================================================================

USE petvida;

-- 1) vw_consultas_completas — JOIN das 4 tabelas base
CREATE OR REPLACE VIEW vw_consultas_completas AS
SELECT 
    c.data_hora,
    c.diagnostico,
    c.valor AS valor_consulta,
    a.nome AS animal,
    a.especie,
    t.nome AS tutor,
    t.telefone AS telefone_tutor,
    v.nome AS veterinario,
    v.especialidade
FROM consultas c
JOIN animais a ON c.animal_id = a.id
JOIN tutores t ON a.tutor_id = t.id
JOIN veterinarios v ON c.veterinario_id = v.id;

-- 2) vw_agenda_hoje
CREATE OR REPLACE VIEW vw_agenda_hoje AS
SELECT * 
FROM vw_consultas_completas
WHERE DATE(data_hora) = CURDATE()
ORDER BY data_hora;

-- 3) vw_faturamento_mensal
CREATE OR REPLACE VIEW vw_faturamento_mensal AS
SELECT 
    YEAR(data_hora) AS ano,
    MONTH(data_hora) AS mes,
    veterinario,
    COUNT(*) AS total_consultas,
    SUM(valor_consulta) AS faturamento_total
FROM vw_consultas_completas
GROUP BY ano, mes, veterinario;

-- 4) vw_animais_detalhados
CREATE OR REPLACE VIEW vw_animais_detalhados AS
SELECT 
    a.nome AS animal,
    t.nome AS tutor,
    a.especie,
    COUNT(c.id) AS total_consultas
FROM animais a
JOIN tutores t ON a.tutor_id = t.id
LEFT JOIN consultas c ON a.id = c.animal_id
GROUP BY a.id, a.nome, t.nome, a.especie;
