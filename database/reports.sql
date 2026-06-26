USE petvida;

-- 1) Ranking de tutores que mais gastam
SELECT
    ROW_NUMBER() OVER (ORDER BY total_gasto DESC, qtd_consultas DESC, t.nome) AS posicao,
    t.nome AS tutor,
    ROUND(COALESCE(total_gasto, 0), 2) AS total_gasto,
    COALESCE(qtd_consultas, 0) AS qtd_consultas
FROM (
    SELECT
        tut.id,
        SUM(c.valor) AS total_gasto,
        COUNT(c.id) AS qtd_consultas
    FROM tutores tut
    LEFT JOIN animais a ON a.tutor_id = tut.id
    LEFT JOIN consultas c ON c.animal_id = a.id
    GROUP BY tut.id
) gasto
JOIN tutores t ON t.id = gasto.id
ORDER BY total_gasto DESC, qtd_consultas DESC, t.nome;

-- 2) Faturamento mensal
SELECT
    YEAR(c.data_hora) AS ano,
    MONTH(c.data_hora) AS mes,
    COUNT(c.id) AS total_consultas,
    ROUND(SUM(c.valor), 2) AS bruto,
    ROUND(SUM(CASE WHEN p.status = 'pago' THEN p.valor_pago ELSE 0 END), 2) AS recebido,
    ROUND(SUM(CASE WHEN p.status <> 'pago' THEN c.valor ELSE 0 END), 2) AS pendente
FROM consultas c
LEFT JOIN pagamentos p ON p.consulta_id = c.id
GROUP BY YEAR(c.data_hora), MONTH(c.data_hora)
ORDER BY ano, mes;

-- 3) Animais sem consulta há 6+ meses
SELECT
    a.id,
    a.nome AS animal,
    esp.nome AS especie,
    tut.nome AS tutor,
    MAX(c.data_hora) AS ultima_consulta,
    DATEDIFF(CURDATE(), MAX(c.data_hora)) AS dias_sem_consulta
FROM animais a
LEFT JOIN consultas c ON c.animal_id = a.id
LEFT JOIN especies esp ON esp.id = a.especie_id
LEFT JOIN tutores tut ON tut.id = a.tutor_id
GROUP BY a.id, a.nome, esp.nome, tut.nome
HAVING MAX(c.data_hora) IS NULL OR DATEDIFF(CURDATE(), MAX(c.data_hora)) >= 180
ORDER BY dias_sem_consulta DESC, a.nome;

-- 4) Dashboard financeiro (1 query)
SELECT
    COUNT(c.id) AS total_consultas,
    ROUND(SUM(c.valor), 2) AS bruto,
    ROUND(SUM(CASE WHEN p.status = 'pago' THEN p.valor_pago ELSE 0 END), 2) AS recebido,
    ROUND(SUM(CASE WHEN p.status <> 'pago' THEN c.valor ELSE 0 END), 2) AS pendente,
    ROUND(
        CASE WHEN SUM(c.valor) > 0 THEN (SUM(CASE WHEN p.status <> 'pago' THEN c.valor ELSE 0 END) / SUM(c.valor)) * 100 ELSE 0 END,
        2
    ) AS percentual_inadimplencia
FROM consultas c
LEFT JOIN pagamentos p ON p.consulta_id = c.id;

-- 5) Veterinário do mês
SELECT
    v.nome AS veterinario,
    ROUND(SUM(c.valor), 2) AS faturamento_mes
FROM consultas c
JOIN veterinarios v ON v.id = c.veterinario_id
WHERE YEAR(c.data_hora) = YEAR(CURDATE())
  AND MONTH(c.data_hora) = MONTH(CURDATE())
GROUP BY v.id, v.nome
ORDER BY faturamento_mes DESC
LIMIT 1;

-- 6) Distribuição por espécie
SELECT
    esp.nome AS especie,
    COUNT(a.id) AS qtd_animais,
    ROUND((COUNT(a.id) * 100.0 / total.total), 2) AS percentual_do_total
FROM animais a
JOIN especies esp ON esp.id = a.especie_id
CROSS JOIN (
    SELECT COUNT(*) AS total FROM animais
) total
GROUP BY esp.id, esp.nome, total.total
ORDER BY qtd_animais DESC, esp.nome;
