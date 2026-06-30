-- =============================================================================
-- PROJETO: CLÍNICA VETERINÁRIA PETVIDA
-- ARQUIVO: security.sql
-- OBJETIVO: Criar perfis de acesso com GRANT/REVOKE por função
-- =============================================================================

CREATE DATABASE IF NOT EXISTS petvida;
USE petvida;

-- Usuários
CREATE USER IF NOT EXISTS 'recepcionista'@'localhost' IDENTIFIED BY 'Recep123!';
CREATE USER IF NOT EXISTS 'veterinario'@'localhost' IDENTIFIED BY 'Vet123!';
CREATE USER IF NOT EXISTS 'gerente'@'localhost' IDENTIFIED BY 'Gerente123!';
CREATE USER IF NOT EXISTS 'admin'@'localhost' IDENTIFIED BY 'Admin123!';

-- Garantir uma base limpa para o modelo pedido
GRANT USAGE ON *.* TO 'recepcionista'@'localhost';
GRANT USAGE ON *.* TO 'veterinario'@'localhost';
GRANT USAGE ON *.* TO 'gerente'@'localhost';
GRANT USAGE ON *.* TO 'admin'@'localhost';
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'recepcionista'@'localhost';
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'veterinario'@'localhost';
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'gerente'@'localhost';
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'admin'@'localhost';

-- -----------------------------------------------------------------------------
-- Procedimentos de compatibilidade por nome curto
-- -----------------------------------------------------------------------------
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_agendar$$
CREATE PROCEDURE sp_agendar(
    IN p_animal_id INT,
    IN p_vet_id INT,
    IN p_data_hora DATETIME,
    IN p_valor DECIMAL(10,2)
)
BEGIN
    CALL sp_agendar_consulta(p_animal_id, p_vet_id, p_data_hora, p_valor);
END$$

DROP PROCEDURE IF EXISTS sp_cadastrar$$
CREATE PROCEDURE sp_cadastrar(
    IN p_nome VARCHAR(50),
    IN p_especie_id INT,
    IN p_raca VARCHAR(30),
    IN p_data_nascimento DATE,
    IN p_tutor_id INT
)
BEGIN
    CALL sp_cadastrar_animal(p_nome, p_especie_id, p_raca, p_data_nascimento, p_tutor_id);
END$$

DROP PROCEDURE IF EXISTS sp_concluir$$
CREATE PROCEDURE sp_concluir(
    IN p_consulta_id INT,
    IN p_diagnostico TEXT
)
BEGIN
    CALL sp_concluir_consulta(p_consulta_id, p_diagnostico);
END$$

DELIMITER ;

-- -----------------------------------------------------------------------------
-- Recepcionista
-- -----------------------------------------------------------------------------
GRANT SELECT, INSERT ON petvida.tutores TO 'recepcionista'@'localhost';
GRANT SELECT, INSERT ON petvida.animais TO 'recepcionista'@'localhost';
GRANT SELECT, INSERT ON petvida.consultas TO 'recepcionista'@'localhost';
GRANT SELECT, INSERT ON petvida.especies TO 'recepcionista'@'localhost';
GRANT EXECUTE ON PROCEDURE petvida.sp_agendar TO 'recepcionista'@'localhost';
GRANT EXECUTE ON PROCEDURE petvida.sp_cadastrar TO 'recepcionista'@'localhost';

-- -----------------------------------------------------------------------------
-- Veterinário
-- -----------------------------------------------------------------------------
GRANT SELECT ON petvida.* TO 'veterinario'@'localhost';
GRANT UPDATE (diagnostico, status) ON petvida.consultas TO 'veterinario'@'localhost';
GRANT EXECUTE ON PROCEDURE petvida.sp_concluir TO 'veterinario'@'localhost';

-- -----------------------------------------------------------------------------
-- Gerente
-- -----------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON petvida.* TO 'gerente'@'localhost';
GRANT DELETE ON petvida.consultas TO 'gerente'@'localhost';
GRANT EXECUTE ON PROCEDURE petvida.sp_agendar_consulta TO 'gerente'@'localhost';
GRANT EXECUTE ON PROCEDURE petvida.sp_concluir_consulta TO 'gerente'@'localhost';
GRANT EXECUTE ON PROCEDURE petvida.sp_registrar_pagamento TO 'gerente'@'localhost';
GRANT EXECUTE ON PROCEDURE petvida.sp_cancelar_consulta TO 'gerente'@'localhost';
GRANT EXECUTE ON PROCEDURE petvida.sp_cadastrar_animal TO 'gerente'@'localhost';

-- -----------------------------------------------------------------------------
-- Admin
-- -----------------------------------------------------------------------------
GRANT ALL PRIVILEGES ON petvida.* TO 'admin'@'localhost' WITH GRANT OPTION;

FLUSH PRIVILEGES;

-- =============================================================================
-- REVOKE: Remover acessos da recepcionista
-- Exemplo de uso: quando a recepcionista é desligada ou muda de função.
-- Descomente para executar.
-- =============================================================================

-- REVOKE SELECT, INSERT ON petvida.tutores FROM 'recepcionista'@'localhost';
-- REVOKE SELECT, INSERT ON petvida.animais FROM 'recepcionista'@'localhost';
-- REVOKE SELECT, INSERT ON petvida.consultas FROM 'recepcionista'@'localhost';
-- REVOKE SELECT, INSERT ON petvida.especies FROM 'recepcionista'@'localhost';
-- REVOKE EXECUTE ON PROCEDURE petvida.sp_agendar FROM 'recepcionista'@'localhost';
-- REVOKE EXECUTE ON PROCEDURE petvida.sp_cadastrar FROM 'recepcionista'@'localhost';
-- FLUSH PRIVILEGES;
