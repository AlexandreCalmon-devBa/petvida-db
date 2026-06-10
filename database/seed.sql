-- =============================================================================
-- PROJETO: CLÍNICA VETERINÁRIA PETVIDA
-- SEED: 5 espécies | 3 veterinários | 8 tutores | 15 animais | 20 consultas | 20 pagamentos
-- =============================================================================

USE petvida;

-- -----------------------------------------------------------------------------
-- especies (5)
-- -----------------------------------------------------------------------------
INSERT INTO especies (nome) VALUES
('Cachorro'),
('Gato'),
('Pássaro'),
('Peixe'),
('Réptil');

-- -----------------------------------------------------------------------------
-- veterinarios (3)
-- -----------------------------------------------------------------------------
INSERT INTO veterinarios (nome, crmv, especialidade, telefone) VALUES
('Dr. Ricardo Silva',   'CRMV-SP 12345', 'Clínica Geral', '(11) 98888-1111'),
('Dra. Ana Souza',      'CRMV-SP 67890', 'Dermatologia',  '(11) 98888-2222'),
('Dr. Marcos Oliveira', 'CRMV-SP 11223', 'Ortopedia',     '(11) 98888-3333');

-- -----------------------------------------------------------------------------
-- tutores (8)
-- -----------------------------------------------------------------------------
INSERT INTO tutores (nome, cpf, email, telefone) VALUES
('João Pereira',      '123.456.789-01', 'joao@email.com',      '(11) 97777-1111'),
('Maria Oliveira',    '234.567.890-12', 'maria@email.com',     '(11) 97777-2222'),
('Carlos Santos',     '345.678.901-23', 'carlos@email.com',    '(11) 97777-3333'),
('Fernanda Lima',     '456.789.012-34', 'fernanda@email.com',  '(11) 97777-4444'),
('Roberto Costa',     '567.890.123-45', 'roberto@email.com',   '(11) 97777-5555'),
('Patrícia Almeida',  '678.901.234-56', 'patricia@email.com',  '(11) 97777-6666'),
('Gabriel Mendes',    '789.012.345-67', 'gabriel@email.com',   '(11) 97777-7777'),
('Natália Ferreira',  '890.123.456-78', 'natalia@email.com',   '(11) 97777-8888');

-- -----------------------------------------------------------------------------
-- animais (15)  — especie_id: 1=Cachorro 2=Gato 3=Pássaro 4=Peixe 5=Réptil
-- -----------------------------------------------------------------------------
INSERT INTO animais (nome, especie_id, raca, data_nascimento, tutor_id) VALUES
('Rex',      1, 'Labrador',       '2020-05-10', 1),
('Nina',     2, 'SRD',            '2021-08-15', 2),
('Thor',     1, 'Pitbull',        '2019-11-02', 3),
('Mel',      2, 'Siamês',         '2020-12-20', 4),
('Piu',      3, 'Calopsita',      '2022-03-01', 5),
('Nemo',     4, 'Betta',          '2023-01-15', 6),
('Draco',    5, 'Jabuti',         '2018-07-10', 7),
('Luna',     1, 'Poodle',         '2021-04-22', 8),
('Sushi',    4, 'Tetra',          '2023-09-05', 1),
('Kiki',     3, 'Canário',        '2022-06-12', 2),
('Sombra',   2, 'Maine Coon',     '2019-01-30', 3),
('Rexy',     1, 'Pastor Alemão',  '2020-09-18', 4),
('Hera',     5, 'Iguana',         '2021-02-14', 5),
('Pingo',    4, 'Guppy',          '2023-11-25', 6),
('Chiquinho',3, 'Periquito',      '2022-08-07', 7);

-- -----------------------------------------------------------------------------
-- consultas (20)
-- -----------------------------------------------------------------------------
INSERT INTO consultas (animal_id, veterinario_id, data_hora, diagnostico, valor, status) VALUES
( 1, 1, '2025-01-05 09:00:00', 'Vacinação de reforço.',                    180.00, 'concluida'),
( 2, 2, '2025-01-07 10:30:00', 'Exame de pele e tratamento tópico.',       220.00, 'concluida'),
( 3, 3, '2025-01-08 14:00:00', 'Avaliação ortopédica e fisioterapia.',     350.00, 'concluida'),
( 4, 1, '2025-01-09 11:15:00', 'Check-up geral e orientações nutricionais.',160.00,'concluida'),
( 5, 2, '2025-01-10 15:45:00', 'Exame respiratório de rotina.',            140.00, 'concluida'),
( 6, 3, '2025-01-11 13:00:00', 'Análise de água e troca de tanque.',       120.00, 'concluida'),
( 7, 1, '2025-01-12 10:00:00', 'Avaliação de casco e alimentação.',        210.00, 'concluida'),
( 8, 2, '2025-01-13 09:30:00', 'Alergia de pele leve.',                    230.00, 'concluida'),
( 9, 3, '2025-01-14 16:00:00', 'Consulta para ajuste de pH e bolhas.',     110.00, 'concluida'),
(10, 1, '2025-01-15 08:45:00', 'Exame de asas e orientação de higiene.',   150.00, 'concluida'),
(11, 2, '2025-01-16 14:30:00', 'Avaliação de pelagem e dieta.',            190.00, 'concluida'),
(12, 3, '2025-01-17 11:00:00', 'Revisão de cirurgia e curativo.',          280.00, 'concluida'),
(13, 1, '2025-01-18 12:30:00', 'Verificação de umidade e tratamento.',     200.00, 'em_atendimento'),
(14, 2, '2025-01-19 15:00:00', 'Check-up de rotina.',                      130.00, 'agendada'),
(15, 3, '2025-01-20 10:15:00', 'Exame de bico e vacinação.',               170.00, 'agendada'),
( 1, 2, '2025-01-21 09:00:00', 'Retorno por ferimento leve.',              200.00, 'cancelada'),
( 4, 3, '2025-01-22 14:00:00', 'Exame de sanitização bucal.',              180.00, 'pendente'),
( 7, 1, '2025-01-23 16:30:00', 'Acompanhamento de alimentação.',           190.00, 'em_atendimento'),
(10, 2, '2025-01-24 11:45:00', 'Consulta preventiva.',                     145.00, 'agendada'),
(12, 3, '2025-01-25 13:15:00', 'Controle pós-operatório.',                 275.00, 'agendada');

-- -----------------------------------------------------------------------------
-- pagamentos (20)
-- -----------------------------------------------------------------------------
INSERT INTO pagamentos (consulta_id, valor_pago, forma_pagamento, data_pagamento, status) VALUES
( 1, 180.00, 'pix',      '2025-01-05 10:00:00', 'pago'),
( 2, 220.00, 'cartao',   '2025-01-07 11:15:00', 'pago'),
( 3, 350.00, 'dinheiro', '2025-01-08 15:00:00', 'pago'),
( 4, 160.00, 'pix',      '2025-01-09 12:00:00', 'pago'),
( 5, 140.00, 'convenio', '2025-01-10 16:30:00', 'pago'),
( 6, 120.00, 'pix',      '2025-01-11 14:00:00', 'pago'),
( 7, 210.00, 'dinheiro', '2025-01-12 11:00:00', 'pago'),
( 8, 230.00, 'cartao',   '2025-01-13 10:15:00', 'pago'),
( 9, 110.00, 'pix',      '2025-01-14 17:00:00', 'pago'),
(10, 150.00, 'convenio', '2025-01-15 09:30:00', 'pago'),
(11, 190.00, 'dinheiro', '2025-01-16 15:00:00', 'pago'),
(12, 280.00, 'pix',      '2025-01-17 12:00:00', 'pago'),
(13,   0.00, 'pix',      '2025-01-18 13:30:00', 'pendente'),
(14,   0.00, 'cartao',   '2025-01-19 15:45:00', 'pendente'),
(15,   0.00, 'dinheiro', '2025-01-20 11:00:00', 'pendente'),
(16,   0.00, 'pix',      '2025-01-21 09:30:00', 'cancelado'),
(17, 190.00, 'convenio', '2025-01-22 15:00:00', 'pago'),
(18,   0.00, 'cartao',   '2025-01-23 17:00:00', 'pendente'),
(19,   0.00, 'pix',      '2025-01-24 12:30:00', 'pendente'),
(20,   0.00, 'dinheiro', '2025-01-25 13:45:00', 'pendente');