-- =============================================================================
-- PROJETO: CLÍNICA VETERINÁRIA PETVIDA
-- OBJETIVO: Procedures para automação de processos com validações e transações
-- =============================================================================

USE petvida;

-- =============================================================================
-- 1) sp_agendar_consulta
--    Valida animal, veterinário e conflito de horário.
--    TRANSAÇÃO: insere consulta + pagamento pendente.
-- =============================================================================
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_agendar_consulta$$

CREATE PROCEDURE sp_agendar_consulta(
    IN p_animal_id      INT,
    IN p_vet_id         INT,
    IN p_data_hora      DATETIME,
    IN p_valor          DECIMAL(10,2)
)
BEGIN
    DECLARE v_animal_existe  INT DEFAULT 0;
    DECLARE v_vet_existe     INT DEFAULT 0;
    DECLARE v_conflito       INT DEFAULT 0;
    DECLARE v_consulta_id    INT;

    -- Valida animal
    SELECT COUNT(*) INTO v_animal_existe
    FROM animais WHERE id = p_animal_id;

    IF v_animal_existe = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Erro: animal não encontrado.';
    END IF;

    -- Valida veterinário
    SELECT COUNT(*) INTO v_vet_existe
    FROM veterinarios WHERE id = p_vet_id;

    IF v_vet_existe = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Erro: veterinário não encontrado.';
    END IF;

    -- Valida conflito de horário (janela de 30 minutos)
    SELECT COUNT(*) INTO v_conflito
    FROM consultas
    WHERE veterinario_id = p_vet_id
      AND status NOT IN ('cancelada')
      AND ABS(TIMESTAMPDIFF(MINUTE, data_hora, p_data_hora)) < 30;

    IF v_conflito > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Erro: veterinário já possui consulta nesse horário (janela de 30 min).';
    END IF;

    -- TRANSAÇÃO: insere consulta e pagamento pendente
    START TRANSACTION;

        INSERT INTO consultas (animal_id, veterinario_id, data_hora, diagnostico, valor, status)
        VALUES (p_animal_id, p_vet_id, p_data_hora, NULL, p_valor, 'agendada');

        SET v_consulta_id = LAST_INSERT_ID();

        INSERT INTO pagamentos (consulta_id, valor_pago, forma_pagamento, data_pagamento, status)
        VALUES (v_consulta_id, 0.00, 'pendente', NOW(), 'pendente');

    COMMIT;

    SELECT v_consulta_id AS consulta_id,
           'Consulta agendada com sucesso!' AS mensagem;
END$$

-- =============================================================================
-- 2) sp_concluir_consulta
--    Atualiza status para 'concluida' e preenche diagnóstico.
--    Valida existência e status atual.
-- =============================================================================
DROP PROCEDURE IF EXISTS sp_concluir_consulta$$

CREATE PROCEDURE sp_concluir_consulta(
    IN p_consulta_id INT,
    IN p_diagnostico TEXT
)
BEGIN
    DECLARE v_existe  INT DEFAULT 0;
    DECLARE v_status  VARCHAR(20);

    -- Valida existência
    SELECT COUNT(*), status INTO v_existe, v_status
    FROM consultas WHERE id = p_consulta_id;

    IF v_existe = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Erro: consulta não encontrada.';
    END IF;

    IF v_status = 'concluida' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Erro: consulta já está concluída.';
    END IF;

    IF v_status = 'cancelada' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Erro: não é possível concluir uma consulta cancelada.';
    END IF;

    UPDATE consultas
    SET status      = 'concluida',
        diagnostico = p_diagnostico
    WHERE id = p_consulta_id;

    SELECT 'Consulta concluída com sucesso!' AS mensagem;
END$$

-- =============================================================================
-- 3) sp_registrar_pagamento
--    Marca pagamento como 'pago'. Valida existência e se já não está pago.
-- =============================================================================
DROP PROCEDURE IF EXISTS sp_registrar_pagamento$$

CREATE PROCEDURE sp_registrar_pagamento(
    IN p_consulta_id      INT,
    IN p_forma_pagamento  VARCHAR(20)
)
BEGIN
    DECLARE v_pagamento_id  INT;
    DECLARE v_status_pag    VARCHAR(20);
    DECLARE v_valor         DECIMAL(10,2);

    -- Valida existência do pagamento vinculado
    SELECT p.id, p.status, c.valor
    INTO v_pagamento_id, v_status_pag, v_valor
    FROM pagamentos p
    JOIN consultas c ON c.id = p.consulta_id
    WHERE p.consulta_id = p_consulta_id
    LIMIT 1;

    IF v_pagamento_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Erro: nenhum pagamento encontrado para esta consulta.';
    END IF;

    IF v_status_pag = 'pago' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Erro: pagamento já foi registrado para esta consulta.';
    END IF;

    IF v_status_pag = 'cancelado' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Erro: não é possível registrar pagamento de uma consulta cancelada.';
    END IF;

    UPDATE pagamentos
    SET status           = 'pago',
        valor_pago       = v_valor,
        forma_pagamento  = p_forma_pagamento,
        data_pagamento   = NOW()
    WHERE id = v_pagamento_id;

    SELECT 'Pagamento registrado com sucesso!' AS mensagem,
           v_valor AS valor_pago,
           p_forma_pagamento AS forma;
END$$

-- =============================================================================
-- 4) sp_cancelar_consulta
--    TRANSAÇÃO: muda consulta e pagamento para 'cancelado'.
-- =============================================================================
DROP PROCEDURE IF EXISTS sp_cancelar_consulta$$

CREATE PROCEDURE sp_cancelar_consulta(
    IN p_consulta_id INT
)
BEGIN
    DECLARE v_existe    INT DEFAULT 0;
    DECLARE v_status    VARCHAR(20);

    -- Valida existência
    SELECT COUNT(*), status INTO v_existe, v_status
    FROM consultas WHERE id = p_consulta_id;

    IF v_existe = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Erro: consulta não encontrada.';
    END IF;

    IF v_status = 'cancelada' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Erro: consulta já está cancelada.';
    END IF;

    IF v_status = 'concluida' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Erro: não é possível cancelar uma consulta já concluída.';
    END IF;

    -- TRANSAÇÃO: cancela consulta e pagamento
    START TRANSACTION;

        UPDATE consultas
        SET status = 'cancelada'
        WHERE id = p_consulta_id;

        UPDATE pagamentos
        SET status = 'cancelado'
        WHERE consulta_id = p_consulta_id;

    COMMIT;

    SELECT 'Consulta cancelada com sucesso!' AS mensagem;
END$$

-- =============================================================================
-- 5) sp_cadastrar_animal
--    Valida tutor e espécie existem. Retorna id criado via SELECT.
-- =============================================================================
DROP PROCEDURE IF EXISTS sp_cadastrar_animal$$

CREATE PROCEDURE sp_cadastrar_animal(
    IN  p_nome        VARCHAR(50),
    IN  p_especie_id  INT,
    IN  p_raca        VARCHAR(30),
    IN  p_nascimento  DATE,
    IN  p_tutor_id    INT
)
BEGIN
    DECLARE v_tutor_existe   INT DEFAULT 0;
    DECLARE v_especie_existe INT DEFAULT 0;
    DECLARE v_animal_id      INT;

    -- Valida tutor
    SELECT COUNT(*) INTO v_tutor_existe
    FROM tutores WHERE id = p_tutor_id;

    IF v_tutor_existe = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Erro: tutor não encontrado.';
    END IF;

    -- Valida espécie (tabela especies do seed)
    SELECT COUNT(*) INTO v_especie_existe
    FROM especies WHERE id = p_especie_id;

    IF v_especie_existe = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Erro: espécie não encontrada.';
    END IF;

    INSERT INTO animais (nome, especie_id, raca, data_nascimento, tutor_id)
    VALUES (p_nome, p_especie_id, p_raca, p_nascimento, p_tutor_id);

    SET v_animal_id = LAST_INSERT_ID();

    SELECT v_animal_id AS animal_id,
           'Animal cadastrado com sucesso!' AS mensagem;
END$$

DELIMITER ;

-- =============================================================================
-- TESTES — CENÁRIOS DE SUCESSO E ERRO
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- TESTE 1: sp_agendar_consulta
-- ─────────────────────────────────────────────────────────────────────────────

-- [SUCESSO] Agendar consulta válida para animal 2, vet 1, em horário livre
CALL sp_agendar_consulta(2, 1, '2025-06-10 09:00:00', 180.00);

-- [ERRO] Animal inexistente (id 999)
CALL sp_agendar_consulta(999, 1, '2025-06-11 10:00:00', 150.00);

-- [ERRO] Veterinário inexistente (id 999)
CALL sp_agendar_consulta(1, 999, '2025-06-12 10:00:00', 150.00);

-- [ERRO] Conflito de horário (mesmo vet, mesmo horário acima)
CALL sp_agendar_consulta(3, 1, '2025-06-10 09:10:00', 200.00);

-- ─────────────────────────────────────────────────────────────────────────────
-- TESTE 2: sp_concluir_consulta
-- ─────────────────────────────────────────────────────────────────────────────

-- [SUCESSO] Concluir a consulta agendada no teste anterior (use o id retornado, ex: 21)
CALL sp_concluir_consulta(21, 'Exame de rotina sem alterações.');

-- [ERRO] Consulta inexistente
CALL sp_concluir_consulta(9999, 'Diagnóstico X');

-- [ERRO] Tentar concluir novamente a mesma consulta
CALL sp_concluir_consulta(21, 'Tentativa duplicada');

-- ─────────────────────────────────────────────────────────────────────────────
-- TESTE 3: sp_registrar_pagamento
-- ─────────────────────────────────────────────────────────────────────────────

-- [SUCESSO] Registrar pagamento da consulta 21 via pix
CALL sp_registrar_pagamento(21, 'pix');

-- [ERRO] Consulta sem pagamento vinculado / inexistente
CALL sp_registrar_pagamento(9999, 'dinheiro');

-- [ERRO] Pagamento já efetuado (tentar novamente na consulta 21)
CALL sp_registrar_pagamento(21, 'cartao');

-- ─────────────────────────────────────────────────────────────────────────────
-- TESTE 4: sp_cancelar_consulta
-- ─────────────────────────────────────────────────────────────────────────────

-- [SUCESSO] Agendar nova consulta e depois cancelar
CALL sp_agendar_consulta(4, 2, '2025-07-01 15:00:00', 200.00);
-- Use o id retornado (ex: 22):
CALL sp_cancelar_consulta(22);

-- [ERRO] Consulta inexistente
CALL sp_cancelar_consulta(9999);

-- [ERRO] Tentar cancelar consulta já cancelada
CALL sp_cancelar_consulta(22);

-- [ERRO] Tentar cancelar consulta já concluída (id 21)
CALL sp_cancelar_consulta(21);

-- ─────────────────────────────────────────────────────────────────────────────
-- TESTE 5: sp_cadastrar_animal
-- ─────────────────────────────────────────────────────────────────────────────

-- [SUCESSO] Cadastrar animal com tutor e espécie válidos
CALL sp_cadastrar_animal('Bolota', 1, 'Dachshund', '2023-04-10', 2);

-- [ERRO] Tutor inexistente
CALL sp_cadastrar_animal('Fantasma', 2, 'SRD', '2022-01-01', 999);

-- [ERRO] Espécie inexistente
CALL sp_cadastrar_animal('Zumbi', 99, 'SRD', '2022-01-01', 1);