-- =============================================================================
-- PROJETO: CLÍNICA VETERINÁRIA PETVIDA
-- OBJETIVO: Criar VIEWs que encapsulam JOINs complexos
-- =============================================================================

USE petvida;

-- 1) vw_consultas_completas — JOIN de TODAS as 6 tabelas
-- Retorna: data_hora, status, diagnóstico, valor, animal, espécie, tutor, telefone, veterinário, especialidade, forma pagamento, status pagamento.
CREATE OR REPLACE VIEW vw_consultas_completas AS
SELECT 
    c.data_hora,
    c.status AS status_consulta,
    c.diagnostico,
    c.valor AS valor_consulta,
    a.nome AS animal,
    e.nome AS especie,
    t.nome AS tutor,
    t.telefone AS telefone_tutor,
    v.nome AS veterinario,
    v.especialidade,
    p.forma_pagamento,
    p.status AS status_pagamento
FROM consultas c
JOIN animais a ON c.animal_id = a.id
JOIN especies e ON a.especie_id = e.id
JOIN tutores t ON a.tutor_id = t.id
JOIN veterinarios v ON c.veterinario_id = v.id
LEFT JOIN pagamentos p ON c.id = p.consulta_id;

-- 2) vw_agenda_hoje — Baseada na view anterior, filtrada por CURDATE(), ordenada por hora.
CREATE OR REPLACE VIEW vw_agenda_hoje AS
SELECT * 
FROM vw_consultas_completas
WHERE DATE(data_hora) = CURDATE()
ORDER BY data_hora;

-- 3) vw_faturamento_mensal — GROUP BY ano/mês/veterinário com COUNT e SUM.
CREATE OR REPLACE VIEW vw_faturamento_mensal AS
SELECT 
    YEAR(data_hora) AS ano,
    MONTH(data_hora) AS mes,
    veterinario,
    COUNT(*) AS total_consultas,
    SUM(valor_consulta) AS faturamento_total
FROM vw_consultas_completas
GROUP BY ano, mes, veterinario;

-- 4) vw_animais_detalhados — Animais com tutor, espécie e COUNT de consultas (LEFT JOIN para incluir animais sem consulta).
CREATE OR REPLACE VIEW vw_animais_detalhados AS
SELECT 
    a.nome AS animal,
    t.nome AS tutor,
    e.nome AS especie,
    COUNT(c.id) AS total_consultas
FROM animais a
JOIN tutores t ON a.tutor_id = t.id
JOIN especies e ON a.especie_id = e.id
LEFT JOIN consultas c ON a.id = c.animal_id
GROUP BY a.id, a.nome, t.nome, e.nome;

-- 5) vw_inadimplentes — Consultas concluídas com pagamento pendente ou inexistente.
CREATE OR REPLACE VIEW vw_inadimplentes AS
SELECT * 
FROM vw_consultas_completas
WHERE status_consulta = 'concluida' 
  AND (status_pagamento = 'pendente' OR status_pagamento IS NULL);
