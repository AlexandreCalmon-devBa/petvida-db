-- =============================================================================
-- PROJETO: CLÍNICA VETERINÁRIA PETVIDA
-- ARQUIVO: triggers.sql
-- OBJETIVO: Triggers para auditoria e validações automatizadas
-- =============================================================================

USE petvida;

-- =============================================================================
-- 1. TABELA DE AUDITORIA
-- =============================================================================

CREATE TABLE IF NOT EXISTS log_auditoria (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    tabela_afetada  VARCHAR(50)  NOT NULL,
    acao            VARCHAR(20)  NOT NULL COMMENT 'INSERT, UPDATE, DELETE',
    registro_id     INT          NOT NULL,
    detalhes        TEXT,
    data_hora       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tabela (tabela_afetada),
    INDEX idx_data (data_hora)
);

-- =============================================================================
-- 2. TRIGGER: trg_after_insert_consulta
-- Registra no log quando uma nova consulta é inserida
-- =============================================================================

DELIMITER //

CREATE TRIGGER IF NOT EXISTS trg_after_insert_consulta
AFTER INSERT ON consultas
FOR EACH ROW
BEGIN
    INSERT INTO log_auditoria (tabela_afetada, acao, registro_id, detalhes)
    VALUES (
        'consultas',
        'INSERT',
        NEW.id,
        CONCAT('Nova consulta: Animal ID=', NEW.animal_id, 
               ', Veterinário ID=', NEW.veterinario_id,
               ', Status=', NEW.status,
               ', Valor=R$', FORMAT(NEW.valor, 2))
    );
END //

-- =============================================================================
-- 3. TRIGGER: trg_after_update_consulta_status
-- Registra quando o status da consulta muda (usa OLD e NEW)
-- =============================================================================

CREATE TRIGGER IF NOT EXISTS trg_after_update_consulta_status
AFTER UPDATE ON consultas
FOR EACH ROW
BEGIN
    -- Só registra se o status foi alterado
    IF OLD.status <> NEW.status THEN
        INSERT INTO log_auditoria (tabela_afetada, acao, registro_id, detalhes)
        VALUES (
            'consultas',
            'UPDATE',
            NEW.id,
            CONCAT('Status alterado de ', OLD.status, ' para ', NEW.status,
                   ' (Consulta ID=', NEW.id, ')')
        );
    END IF;
END //

-- =============================================================================
-- 4. TRIGGER: trg_before_delete_consulta
-- Impede exclusão de consulta com pagamento pago
-- =============================================================================

CREATE TRIGGER IF NOT EXISTS trg_before_delete_consulta
BEFORE DELETE ON consultas
FOR EACH ROW
BEGIN
    -- Verifica se existe pagamento pago para esta consulta
    IF EXISTS (
        SELECT 1 FROM pagamentos 
        WHERE consulta_id = OLD.id AND status = 'pago'
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Erro: Não é possível deletar consulta com pagamento realizado!';
    END IF;
    
    -- Se deletar, registra no log
    INSERT INTO log_auditoria (tabela_afetada, acao, registro_id, detalhes)
    VALUES (
        'consultas',
        'DELETE',
        OLD.id,
        CONCAT('Consulta deletada: Animal ID=', OLD.animal_id, 
               ', Status era ', OLD.status, ', Valor=R$', FORMAT(OLD.valor, 2))
    );
END //

-- =============================================================================
-- 5. TRIGGER: trg_after_insert_animal
-- Registra quando um novo animal é inserido
-- =============================================================================

CREATE TRIGGER IF NOT EXISTS trg_after_insert_animal
AFTER INSERT ON animais
FOR EACH ROW
BEGIN
    INSERT INTO log_auditoria (tabela_afetada, acao, registro_id, detalhes)
    VALUES (
        'animais',
        'INSERT',
        NEW.id,
        CONCAT('Novo animal: ', NEW.nome, 
               ', Espécie ID=', NEW.especie_id,
               ', Tutor ID=', NEW.tutor_id,
               ', Raça=', COALESCE(NEW.raca, 'N/A'))
    );
END //

-- =============================================================================
-- 6. TRIGGER: trg_before_update_pagamento
-- Se status for alterado para 'pago', preenche data_pagamento com CURDATE()
-- =============================================================================

CREATE TRIGGER IF NOT EXISTS trg_before_update_pagamento
BEFORE UPDATE ON pagamentos
FOR EACH ROW
BEGIN
    -- Se status está sendo atualizado para 'pago' e data_pagamento está NULL
    IF NEW.status = 'pago' AND OLD.status <> 'pago' THEN
        SET NEW.data_pagamento = NOW();
    END IF;
END //

DELIMITER ;

-- =============================================================================
-- FIM: triggers.sql
-- =============================================================================
