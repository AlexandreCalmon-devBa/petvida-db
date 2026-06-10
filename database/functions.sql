-- =============================================================================
-- PROJETO PETVIDA - FUNCTIONS (Stored Functions)
-- OBJETIVO: Criar functions reutilizáveis para cálculos e transformações de dados
-- =============================================================================

USE petvida;

-- =============================================================================
-- FUNCTION 1: fn_idade_animal
-- DESCRIÇÃO: Retorna a idade do animal em formato "X anos e Y meses"
-- PARÂMETRO: data_nascimento (DATE) - Data de nascimento do animal
-- RETORNO: VARCHAR - Exemplo: "5 anos e 3 meses"
-- UTILIDADE: Usar em SELECTs para exibir idade formatada dos animais
-- =============================================================================
DELIMITER $$

CREATE FUNCTION fn_idade_animal(data_nascimento DATE) 
RETURNS VARCHAR(50)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE anos INT;
    DECLARE meses INT;
    DECLARE resultado VARCHAR(50);
    
    -- Calcula a diferença em ANOS desde a data de nascimento até hoje
    SET anos = TIMESTAMPDIFF(YEAR, data_nascimento, CURDATE());
    
    -- Calcula a diferença em MESES e pega apenas o resto (meses adicionais após os anos)
    SET meses = TIMESTAMPDIFF(MONTH, data_nascimento, CURDATE()) - (anos * 12);
    
    -- Monta a string no formato desejado
    SET resultado = CONCAT(anos, ' anos e ', meses, ' meses');
    
    RETURN resultado;
END$$

DELIMITER ;

-- =============================================================================
-- FUNCTION 2: fn_total_gasto_tutor
-- DESCRIÇÃO: Calcula o valor total gasto em consultas por um tutor
-- PARÂMETRO: tutor_id (INT) - ID do tutor
-- RETORNO: DECIMAL(10,2) - Valor total em reais
-- OBSERVAÇÃO: Consultas com status 'cancelada' são EXCLUÍDAS do cálculo
-- UTILIDADE: Analisar gastos por tutor, criar relatórios financeiros
-- =============================================================================
DELIMITER $$

CREATE FUNCTION fn_total_gasto_tutor(tutor_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE total DECIMAL(10,2);
    
    -- Soma o valor de todas as consultas do tutor, exceto as canceladas
    SELECT COALESCE(SUM(c.valor), 0)
    INTO total
    FROM consultas c
    INNER JOIN animais a ON c.animal_id = a.id
    WHERE a.tutor_id = tutor_id
      AND c.status != 'cancelada';  -- Exclui consultas canceladas
    
    RETURN total;
END$$

DELIMITER ;

-- =============================================================================
-- FUNCTION 3: fn_qtd_consultas_animal
-- DESCRIÇÃO: Conta quantas consultas um animal teve
-- PARÂMETRO: animal_id (INT) - ID do animal
-- RETORNO: INT - Número total de consultas
-- UTILIDADE: Verificar frequência de atendimento do animal
-- =============================================================================
DELIMITER $$

CREATE FUNCTION fn_qtd_consultas_animal(animal_id INT)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE total_consultas INT;
    
    -- Conta todas as consultas do animal (independente do status)
    SELECT COUNT(*)
    INTO total_consultas
    FROM consultas
    WHERE animal_id = animal_id;
    
    RETURN total_consultas;
END$$

DELIMITER ;

-- =============================================================================
-- FUNCTION 4: fn_status_emoji
-- DESCRIÇÃO: Converte status de consulta em emoji descritivo
-- PARÂMETRO: status (VARCHAR) - Status da consulta (agendada, em_atendimento, concluida, cancelada)
-- RETORNO: VARCHAR - Emoji + Status formatado
-- MAPPERS:
--   agendada       → 📅 Agendada
--   em_atendimento → 🏥 Em Atendimento
--   concluida      → ✅ Concluída
--   cancelada      → ❌ Cancelada
-- UTILIDADE: Melhorar visualização de status em relatórios e dashboards
-- =============================================================================
DELIMITER $$

CREATE FUNCTION fn_status_emoji(status VARCHAR(30))
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE resultado VARCHAR(50);
    
    -- Mapeia cada status para seu emoji correspondente
    CASE status
        WHEN 'agendada' THEN
            SET resultado = '📅 Agendada';
        WHEN 'em_atendimento' THEN
            SET resultado = '🏥 Em Atendimento';
        WHEN 'concluida' THEN
            SET resultado = '✅ Concluída';
        WHEN 'cancelada' THEN
            SET resultado = '❌ Cancelada';
        ELSE
            SET resultado = '❓ Desconhecido';
    END CASE;
    
    RETURN resultado;
END$$

DELIMITER ;

-- =============================================================================
-- FUNCTION 5: fn_classificar_valor
-- DESCRIÇÃO: Classifica o valor da consulta em categorias
-- PARÂMETRO: valor (DECIMAL) - Valor da consulta em reais
-- RETORNO: VARCHAR - Classificação do tipo de procedimento
-- CLASSIFICAÇÃO:
--   < 100        → Consulta Simples
--   100 até 300  → Consulta Padrão
--   > 300        → Procedimento Especial
-- UTILIDADE: Segmentar receitas, analisar ticket médio, gerar relatórios por tipo
-- =============================================================================
DELIMITER $$

CREATE FUNCTION fn_classificar_valor(valor DECIMAL(10,2))
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE resultado VARCHAR(50);
    
    -- Classifica o valor em 3 categorias
    IF valor < 100 THEN
        SET resultado = 'Consulta Simples';
    ELSEIF valor <= 300 THEN
        SET resultado = 'Consulta Padrão';
    ELSE
        SET resultado = 'Procedimento Especial';
    END IF;
    
    RETURN resultado;
END$$

DELIMITER ;

-- =============================================================================
-- FIM DAS FUNCTIONS
-- =============================================================================
-- Todas as functions estão criadas e prontas para uso em SELECTs
-- Exemplo de uso:
--   SELECT nome, fn_idade_animal(data_nascimento) FROM animais;
--   SELECT nome, fn_total_gasto_tutor(id) FROM tutores;
--   SELECT fn_status_emoji(status) FROM consultas;
-- =============================================================================
