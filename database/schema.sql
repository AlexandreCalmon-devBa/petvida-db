-- =============================================================================
-- PROJETO: CLÍNICA VETERINÁRIA PETVIDA
-- OBJETIVO: Gerenciamento de veterinários, tutores, animais e consultas
-- =============================================================================

-- PARTE 2 — SQL: CREATE TABLE
CREATE DATABASE IF NOT EXISTS petvida;
USE petvida;

-- Criar tabela de veterinários (Referenciada por consultas)
CREATE TABLE IF NOT EXISTS veterinarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    crmv VARCHAR(20) NOT NULL UNIQUE,
    especialidade VARCHAR(50) NOT NULL,
    telefone VARCHAR(20) NOT NULL
);

-- Criar tabela de tutores (Referenciada por animais)
CREATE TABLE IF NOT EXISTS tutores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(100),
    telefone VARCHAR(20) NOT NULL
);

-- Criar tabela de animais (Referenciada por consultas)
CREATE TABLE IF NOT EXISTS animais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    especie VARCHAR(30) NOT NULL,
    raca VARCHAR(30),
    data_nascimento DATE,
    tutor_id INT NOT NULL,
    FOREIGN KEY (tutor_id) REFERENCES tutores(id)
);

-- Criar tabela de consultas
CREATE TABLE IF NOT EXISTS consultas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    veterinario_id INT NOT NULL,
    data_hora DATETIME NOT NULL,
    diagnostico TEXT,
    valor DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (animal_id) REFERENCES animais(id),
    FOREIGN KEY (veterinario_id) REFERENCES veterinarios(id)
);

-- =============================================================================
-- PARTE 3 — SQL: INSERT
-- =============================================================================

-- Inserindo Veterinários (Mínimo 3)
INSERT IGNORE INTO veterinarios (nome, crmv, especialidade, telefone) VALUES
('Dr. Ricardo Silva', 'CRMV-SP 12345', 'Clínica Geral', '(11) 98888-1111'),
('Dra. Ana Souza', 'CRMV-SP 67890', 'Dermatologia', '(11) 98888-2222'),
('Dr. Marcos Oliveira', 'CRMV-SP 11223', 'Ortopedia', '(11) 98888-3333');

-- Inserindo Tutores (Mínimo 5)
INSERT IGNORE INTO tutores (nome, cpf, email, telefone) VALUES
('João Pereira', '123.456.789-01', 'joao@email.com', '(11) 97777-1111'),
('Maria Oliveira', '234.567.890-12', 'maria@email.com', '(11) 97777-2222'),
('Carlos Santos', '345.678.901-23', 'carlos@email.com', '(11) 97777-3333'),
('Fernanda Lima', '456.789.012-34', 'fernanda@email.com', '(11) 97777-4444'),
('Roberto Costa', '567.890.123-45', 'roberto@email.com', '(11) 97777-5555');

-- Inserindo Animais (Mínimo 7)
INSERT IGNORE INTO animais (nome, especie, raca, data_nascimento, tutor_id) VALUES
('Rex', 'Cachorro', 'Labrador', '2020-05-10', 1),
('Bolinha', 'Cachorro', 'Poodle', '2021-08-15', 1),
('Mingau', 'Gato', 'Siamês', '2019-03-20', 2),
('Thor', 'Cachorro', 'Golden Retriever', '2022-01-05', 3),
('Luna', 'Gato', 'Persa', '2020-11-12', 4),
('Mel', 'Cachorro', 'Beagle', '2018-06-30', 5),
('Fred', 'Cachorro', 'SRD', '2023-02-14', 5);

-- Inserindo Consultas (Mínimo 10)
INSERT IGNORE INTO consultas (animal_id, veterinario_id, data_hora, diagnostico, valor) VALUES
(1, 1, '2024-05-01 10:00:00', 'Check-up anual', 150.00),
(2, 2, '2024-05-02 14:30:00', 'Alergia cutânea', 200.00),
(3, 1, '2024-05-03 09:00:00', 'Vacinação', 120.00),
(4, 3, '2024-05-04 11:00:00', 'Dores na pata', 250.00),
(5, 2, '2024-05-05 16:00:00', 'Limpeza de ouvidos', 180.00),
(6, 1, '2024-05-06 10:30:00', 'Vermifugação', 100.00),
(7, 3, '2024-05-07 15:00:00', 'Avaliação pós-cirúrgica', 300.00),
(1, 2, '2024-05-08 11:30:00', 'Retorno', 150.00),
(3, 1, '2024-05-09 08:30:00', 'Febre leve', 220.00),
(4, 3, '2024-05-10 14:00:00', 'Fisioterapia', 200.00);
