-- Database schema for PETVIDA
CREATE DATABASE IF NOT EXISTS petvida CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE petvida;

CREATE TABLE especies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE veterinarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    crmv VARCHAR(30) NOT NULL UNIQUE,
    especialidade VARCHAR(60) NOT NULL,
    telefone VARCHAR(25) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE tutores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(150),
    telefone VARCHAR(25) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE animais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    especie_id INT NOT NULL,
    raca VARCHAR(60),
    data_nascimento DATE,
    tutor_id INT NOT NULL,
    FOREIGN KEY (especie_id) REFERENCES especies(id),
    FOREIGN KEY (tutor_id) REFERENCES tutores(id)
) ENGINE=InnoDB;

CREATE TABLE consultas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT NOT NULL,
    veterinario_id INT NOT NULL,
    data_hora DATETIME NOT NULL,
    diagnostico TEXT,
    valor DECIMAL(10,2) NOT NULL,
    status ENUM('agendada', 'em_atendimento', 'concluida', 'cancelada') NOT NULL DEFAULT 'agendada',
    INDEX idx_consultas_data_hora (data_hora),
    FOREIGN KEY (animal_id) REFERENCES animais(id),
    FOREIGN KEY (veterinario_id) REFERENCES veterinarios(id)
) ENGINE=InnoDB;

CREATE TABLE pagamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consulta_id INT NOT NULL UNIQUE,
    valor_pago DECIMAL(10,2) NOT NULL,
    forma_pagamento ENUM('pix', 'cartao', 'dinheiro', 'convenio') NOT NULL,
    data_pagamento DATETIME NOT NULL,
    status ENUM('pago', 'pendente', 'cancelado') NOT NULL DEFAULT 'pendente',
    FOREIGN KEY (consulta_id) REFERENCES consultas(id)
) ENGINE=InnoDB;
