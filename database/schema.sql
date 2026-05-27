-- =============================================================================
-- PROJETO: CLÍNICA VETERINÁRIA PETVIDA
-- OBJETIVO: Gerenciamento de veterinários, tutores, animais e consultas
-- =============================================================================

CREATE DATABASE IF NOT EXISTS petvida;
USE petvida;

-- 1) Tabela de espécies
CREATE TABLE IF NOT EXISTS especies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

-- 2) Tabela de veterinários
CREATE TABLE IF NOT EXISTS veterinarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    crmv VARCHAR(20) NOT NULL UNIQUE,
    especialidade VARCHAR(50) NOT NULL,
    telefone VARCHAR(20) NOT NULL
);

-- 3) Tabela de tutores
CREATE TABLE IF NOT EXISTS tutores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(100),
    telefone VARCHAR(20) NOT NULL
);

-- 4) Tabela de animais
CREATE TABLE IF NOT EXISTS animais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    especie_id INT NOT NULL,
    raca VARCHAR(30),
    data_nascimento DATE,
    tutor_id INT NOT NULL,
    FOREIGN KEY (especie_id) REFERENCES especies(id),
    FOREIGN KEY (tutor_id) REFERENCES tutores(id)
);

-- 5) Tabela de consultas
CREATE TABLE IF NOT EXISTS consultas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    veterinario_id INT NOT NULL,
    data_hora DATETIME NOT NULL,
    diagnostico TEXT,
    valor DECIMAL(10, 2) NOT NULL,
    status ENUM('agendada', 'em_atendimento', 'concluida', 'cancelada') NOT NULL DEFAULT 'agendada',
    FOREIGN KEY (animal_id) REFERENCES animais(id),
    FOREIGN KEY (veterinario_id) REFERENCES veterinarios(id)
);

-- 6) Tabela de pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consulta_id INT NOT NULL UNIQUE,
    valor_pago DECIMAL(10, 2) NOT NULL,
    forma_pagamento ENUM('pix', 'cartao', 'dinheiro', 'convenio') NOT NULL,
    data_pagamento DATETIME,
    status ENUM('pago', 'pendente', 'cancelado') NOT NULL DEFAULT 'pendente',
    FOREIGN KEY (consulta_id) REFERENCES consultas(id)
);

-- =============================================================================
-- INSERÇÃO DE DADOS PARA TESTE
-- =============================================================================

-- Espécies
INSERT IGNORE INTO especies (nome) VALUES ('Cachorro'), ('Gato'), ('Pássaro');

-- Veterinários
INSERT IGNORE INTO veterinarios (nome, crmv, especialidade, telefone) VALUES
('Dr. Ricardo Silva', 'CRMV-SP 12345', 'Clínica Geral', '(11) 98888-1111'),
('Dra. Ana Souza', 'CRMV-SP 67890', 'Dermatologia', '(11) 98888-2222'),
('Dr. Marcos Oliveira', 'CRMV-SP 11223', 'Ortopedia', '(11) 98888-3333');

-- Tutores
INSERT IGNORE INTO tutores (nome, cpf, email, telefone) VALUES
('João Pereira', '123.456.789-01', 'joao@email.com', '(11) 97777-1111'),
('Maria Oliveira', '234.567.890-12', 'maria@email.com', '(11) 97777-2222');

-- Animais
INSERT IGNORE INTO animais (nome, especie_id, raca, data_nascimento, tutor_id) VALUES
('Rex', 1, 'Labrador', '2020-05-10', 1),
('Bolinha', 1, 'Poodle', '2021-08-15', 1),
('Mingau', 2, 'Siamês', '2019-03-20', 2);

-- Consultas (Hoje e passadas)
INSERT IGNORE INTO consultas (id, animal_id, veterinario_id, data_hora, diagnostico, valor, status) VALUES
(1, 1, 1, NOW(), 'Check-up hoje', 150.00, 'agendada'),
(2, 2, 2, '2024-05-20 10:00:00', 'Consulta passada', 200.00, 'concluida'),
(3, 3, 1, '2024-05-21 09:00:00', 'Vacinação', 120.00, 'concluida');

-- Pagamentos
INSERT IGNORE INTO pagamentos (consulta_id, valor_pago, forma_pagamento, data_pagamento, status) VALUES
(2, 200.00, 'pix', '2024-05-20 11:00:00', 'pago'),
(3, 0.00, 'cartao', NULL, 'pendente');
