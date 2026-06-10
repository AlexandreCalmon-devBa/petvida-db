-- =============================================================================
-- PROJETO: CLÍNICA VETERINÁRIA PETVIDA
-- OBJETIVO: Gerenciamento de veterinários, tutores, animais e consultas
-- =============================================================================

CREATE DATABASE IF NOT EXISTS petvida;
USE petvida;

-- -----------------------------------------------------------------------------
-- 1. especies
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS especies (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(30) NOT NULL UNIQUE
);

-- -----------------------------------------------------------------------------
-- 2. veterinarios
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS veterinarios (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    nome         VARCHAR(100) NOT NULL,
    crmv         VARCHAR(20)  NOT NULL UNIQUE,
    especialidade VARCHAR(50) NOT NULL,
    telefone     VARCHAR(20)  NOT NULL
);

-- -----------------------------------------------------------------------------
-- 3. tutores
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tutores (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    nome     VARCHAR(100) NOT NULL,
    cpf      VARCHAR(14)  NOT NULL UNIQUE,
    email    VARCHAR(100),
    telefone VARCHAR(20)  NOT NULL
);

-- -----------------------------------------------------------------------------
-- 4. animais
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS animais (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(50) NOT NULL,
    especie_id      INT         NOT NULL,
    raca            VARCHAR(30),
    data_nascimento DATE,
    tutor_id        INT         NOT NULL,
    FOREIGN KEY (especie_id) REFERENCES especies(id),
    FOREIGN KEY (tutor_id)   REFERENCES tutores(id)
);

-- -----------------------------------------------------------------------------
-- 5. consultas
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consultas (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    animal_id      INT          NOT NULL,
    veterinario_id INT          NOT NULL,
    data_hora      DATETIME     NOT NULL,
    diagnostico    TEXT,
    valor          DECIMAL(10,2) NOT NULL,
    status         ENUM('agendada','em_atendimento','concluida','cancelada') NOT NULL DEFAULT 'agendada',
    INDEX idx_data_hora (data_hora),
    FOREIGN KEY (animal_id)      REFERENCES animais(id),
    FOREIGN KEY (veterinario_id) REFERENCES veterinarios(id)
);

-- -----------------------------------------------------------------------------
-- 6. pagamentos
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagamentos (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    consulta_id      INT           NOT NULL UNIQUE,
    valor_pago       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    forma_pagamento  ENUM('pix','cartao','dinheiro','convenio') NOT NULL,
    data_pagamento   DATETIME      NOT NULL,
    status           ENUM('pago','pendente','cancelado') NOT NULL DEFAULT 'pendente',
    FOREIGN KEY (consulta_id) REFERENCES consultas(id)
);