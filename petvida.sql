-- =============================================================================
-- PROJETO: CLÍNICA VETERINÁRIA PETVIDA
-- OBJETIVO: Gerenciamento de veterinários, tutores, animais e consultas
-- =============================================================================

-- PARTE 2 — SQL: CREATE TABLE
CREATE DATABASE IF NOT EXISTS petvida;
USE petvida;

-- Criar tabela de veterinários (Referenciada por consultas)
CREATE TABLE veterinarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    crmv VARCHAR(20) NOT NULL UNIQUE,
    especialidade VARCHAR(50) NOT NULL,
    telefone VARCHAR(20) NOT NULL
);

-- Criar tabela de tutores (Referenciada por animais)
CREATE TABLE tutores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(100),
    telefone VARCHAR(20) NOT NULL
);

-- Criar tabela de animais (Referenciada por consultas)
CREATE TABLE animais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    especie VARCHAR(30) NOT NULL,
    raca VARCHAR(30),
    data_nascimento DATE,
    tutor_id INT NOT NULL,
    FOREIGN KEY (tutor_id) REFERENCES tutores(id)
);

-- Criar tabela de consultas
CREATE TABLE consultas (
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

-- Inserindo Veterinários
INSERT INTO veterinarios (nome, crmv, especialidade, telefone) VALUES
('Dr. Ricardo Silva', 'CRMV-SP 12345', 'Clínica Geral', '(11) 98888-1111'),
('Dra. Ana Souza', 'CRMV-SP 67890', 'Dermatologia', '(11) 98888-2222'),
('Dr. Marcos Oliveira', 'CRMV-SP 11223', 'Ortopedia', '(11) 98888-3333');

-- Inserindo Tutores
INSERT INTO tutores (nome, cpf, email, telefone) VALUES
('João Pereira', '123.456.789-01', 'joao@email.com', '(11) 97777-1111'),
('Maria Oliveira', '234.567.890-12', 'maria@email.com', '(11) 97777-2222'),
('Carlos Santos', '345.678.901-23', 'carlos@email.com', '(11) 97777-3333'),
('Fernanda Lima', '456.789.012-34', 'fernanda@email.com', '(11) 97777-4444'),
('Roberto Costa', '567.890.123-45', 'roberto@email.com', '(11) 97777-5555');

-- Inserindo Animais
INSERT INTO animais (nome, especie, raca, data_nascimento, tutor_id) VALUES
('Rex', 'Cachorro', 'Labrador', '2020-05-10', 1),
('Bolinha', 'Cachorro', 'Poodle', '2021-08-15', 1),
('Mingau', 'Gato', 'Siamês', '2019-03-20', 2),
('Thor', 'Cachorro', 'Golden Retriever', '2022-01-05', 3),
('Luna', 'Gato', 'Persa', '2020-11-12', 4),
('Mel', 'Cachorro', 'Beagle', '2018-06-30', 5),
('Fred', 'Cachorro', 'SRD', '2023-02-14', 5);

-- Inserindo Consultas
INSERT INTO consultas (animal_id, veterinario_id, data_hora, diagnostico, valor) VALUES
(1, 1, '2024-05-01 10:00:00', 'Check-up anual, animal saudável.', 150.00),
(2, 2, '2024-05-02 14:30:00', 'Alergia cutânea leve.', 200.00),
(3, 1, '2024-05-03 09:00:00', 'Vacinação em dia.', 120.00),
(4, 3, '2024-05-04 11:00:00', 'Dores na pata traseira, repouso indicado.', 250.00),
(5, 2, '2024-05-05 16:00:00', 'Limpeza de ouvidos.', 180.00),
(6, 1, '2024-05-06 10:30:00', 'Vermifugação.', 100.00),
(7, 3, '2024-05-07 15:00:00', 'Avaliação pós-cirúrgica.', 300.00),
(1, 2, '2024-05-08 11:30:00', 'Retorno para acompanhamento.', 150.00),
(3, 1, '2024-05-09 08:30:00', 'Febre leve, prescrito antibiótico.', 220.00),
(4, 3, '2024-05-10 14:00:00', 'Fisioterapia.', 200.00);

-- =============================================================================
-- PARTE 4 — SQL: SELECT, JOIN e WHERE
-- =============================================================================

-- 4.1 Listar todos os animais com o nome do tutor
SELECT a.nome AS animal, t.nome AS tutor 
FROM animais a 
JOIN tutores t ON a.tutor_id = t.id;

-- 4.2 Listar todas as consultas com: nome do animal, nome do tutor, nome do veterinário, data e valor
SELECT a.nome AS animal, t.nome AS tutor, v.nome AS veterinario, c.data_hora, c.valor
FROM consultas c
JOIN animais a ON c.animal_id = a.id
JOIN tutores t ON a.tutor_id = t.id
JOIN veterinarios v ON c.veterinario_id = v.id;

-- 4.3 Listar apenas as consultas realizadas por um veterinário específico (Dr. Ricardo Silva)
SELECT c.*, v.nome 
FROM consultas c
JOIN veterinarios v ON c.veterinario_id = v.id
WHERE v.nome = 'Dr. Ricardo Silva';

-- 4.4 Listar os animais de uma espécie específica (Cachorro)
SELECT * FROM animais WHERE especie = 'Cachorro';

-- 4.5 Listar os tutores que têm mais de 1 animal cadastrado
SELECT t.nome, COUNT(a.id) AS total_animais
FROM tutores t
JOIN animais a ON t.id = a.tutor_id
GROUP BY t.id, t.nome
HAVING total_animais > 1;

-- 4.6 Calcular o faturamento total da clínica
SELECT SUM(valor) AS faturamento_total FROM consultas;

-- 4.7 Calcular o faturamento por veterinário, ordenado do maior para o menor
SELECT v.nome, SUM(c.valor) AS faturamento_veterinario
FROM veterinarios v
JOIN consultas c ON v.id = c.veterinario_id
GROUP BY v.id, v.nome
ORDER BY faturamento_veterinario DESC;

-- 4.8 Listar os animais que NUNCA tiveram consulta (Inserindo um animal sem consulta para teste)
INSERT INTO animais (nome, especie, raca, data_nascimento, tutor_id) VALUES ('Sem Consulta', 'Gato', 'SRD', '2024-01-01', 1);
SELECT a.nome 
FROM animais a
LEFT JOIN consultas c ON a.id = c.animal_id
WHERE c.id IS NULL;

-- =============================================================================
-- PARTE 5 — SQL: UPDATE e DELETE
-- =============================================================================

-- 5.1 Atualizar o telefone de um tutor
UPDATE tutores SET telefone = '(11) 99999-9999' WHERE nome = 'João Pereira';

-- 5.2 Atualizar o diagnóstico de uma consulta específica
UPDATE consultas SET diagnostico = 'Check-up completo e vacinação' WHERE id = 1;

-- 5.3 Tente deletar um tutor que tem animais cadastrados (Isso causará erro de FK)
-- DELETE FROM tutores WHERE id = 1; 
-- Explicação: O MySQL impede a exclusão porque existem registros na tabela 'animais' que dependem deste tutor.

-- 5.4 Deletar uma consulta específica
DELETE FROM consultas WHERE id = 10;

-- =============================================================================
-- PARTE 6 — STORED PROCEDURE e FUNCTION
-- =============================================================================

DELIMITER $$

-- 6.1 Stored Procedure: agendar_consulta
CREATE PROCEDURE agendar_consulta(
    IN p_animal_id INT, 
    IN p_veterinario_id INT, 
    IN p_data_hora DATETIME, 
    IN p_valor DECIMAL(10,2)
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM animais WHERE id = p_animal_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Erro: Animal não encontrado.';
    ELSE
        INSERT INTO consultas (animal_id, veterinario_id, data_hora, valor) 
        VALUES (p_animal_id, p_veterinario_id, p_data_hora, p_valor);
        SELECT CONCAT('Sucesso! Consulta agendada. ID: ', LAST_INSERT_ID()) AS mensagem;
    END IF;
END$$

-- 6.2 Function: total_consultas_animal
CREATE FUNCTION total_consultas_animal(p_animal_id INT) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE total INT;
    SELECT COUNT(*) INTO total FROM consultas WHERE animal_id = p_animal_id;
    RETURN total;
END$$

DELIMITER ;

-- Testando Procedure e Function
CALL agendar_consulta(1, 1, '2024-06-01 10:00:00', 150.00);
SELECT total_consultas_animal(1) AS total_consultas_rex;

-- =============================================================================
-- PARTE 7 — GRANT e REVOKE
-- =============================================================================

-- Criando usuários (Simulação)
CREATE USER IF NOT EXISTS 'recepcionista'@'localhost' IDENTIFIED BY 'senha123';
CREATE USER IF NOT EXISTS 'veterinario_sistema'@'localhost' IDENTIFIED BY 'senha456';
CREATE USER IF NOT EXISTS 'admin_clinica'@'localhost' IDENTIFIED BY 'admin123';

-- Recepcionista: SELECT e INSERT em tutores, animais e consultas
GRANT SELECT, INSERT ON petvida.tutores TO 'recepcionista'@'localhost';
GRANT SELECT, INSERT ON petvida.animais TO 'recepcionista'@'localhost';
GRANT SELECT, INSERT ON petvida.consultas TO 'recepcionista'@'localhost';

-- Veterinário: SELECT em tudo e UPDATE no diagnóstico das consultas
GRANT SELECT ON petvida.* TO 'veterinario_sistema'@'localhost';
GRANT UPDATE (diagnostico) ON petvida.consultas TO 'veterinario_sistema'@'localhost';

-- Admin: Acesso total
GRANT ALL PRIVILEGES ON petvida.* TO 'admin_clinica'@'localhost';

-- Revoke para recepcionista
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'recepcionista'@'localhost';
DROP USER 'recepcionista'@'localhost';
