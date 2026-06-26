-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: petvida
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.24.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `animais`
--

DROP TABLE IF EXISTS `animais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `animais` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `especie_id` int NOT NULL,
  `raca` varchar(30) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `tutor_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `especie_id` (`especie_id`),
  KEY `tutor_id` (`tutor_id`),
  CONSTRAINT `animais_ibfk_1` FOREIGN KEY (`especie_id`) REFERENCES `especies` (`id`),
  CONSTRAINT `animais_ibfk_2` FOREIGN KEY (`tutor_id`) REFERENCES `tutores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `animais`
--

LOCK TABLES `animais` WRITE;
/*!40000 ALTER TABLE `animais` DISABLE KEYS */;
INSERT INTO `animais` VALUES (1,'Rex',1,'Labrador','2020-05-10',1),(2,'Nina',2,'SRD','2021-08-15',2),(3,'Thor',1,'Pitbull','2019-11-02',3),(4,'Mel',2,'Siamês','2020-12-20',4),(5,'Piu',3,'Calopsita','2022-03-01',5),(6,'Nemo',4,'Betta','2023-01-15',6),(7,'Draco',5,'Jabuti','2018-07-10',7),(8,'Luna',1,'Poodle','2021-04-22',8),(9,'Sushi',4,'Tetra','2023-09-05',1),(10,'Kiki',3,'Canário','2022-06-12',2),(11,'Sombra',2,'Maine Coon','2019-01-30',3),(12,'Rexy',1,'Pastor Alemão','2020-09-18',4),(13,'Hera',5,'Iguana','2021-02-14',5),(14,'Pingo',4,'Guppy','2023-11-25',6),(15,'Chiquinho',3,'Periquito','2022-08-07',7);
/*!40000 ALTER TABLE `animais` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_after_insert_animal` AFTER INSERT ON `animais` FOR EACH ROW BEGIN
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `consultas`
--

DROP TABLE IF EXISTS `consultas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consultas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `animal_id` int NOT NULL,
  `veterinario_id` int NOT NULL,
  `data_hora` datetime NOT NULL,
  `diagnostico` text,
  `valor` decimal(10,2) NOT NULL,
  `status` enum('agendada','em_atendimento','concluida','cancelada') NOT NULL DEFAULT 'agendada',
  PRIMARY KEY (`id`),
  KEY `idx_data_hora` (`data_hora`),
  KEY `animal_id` (`animal_id`),
  KEY `veterinario_id` (`veterinario_id`),
  CONSTRAINT `consultas_ibfk_1` FOREIGN KEY (`animal_id`) REFERENCES `animais` (`id`),
  CONSTRAINT `consultas_ibfk_2` FOREIGN KEY (`veterinario_id`) REFERENCES `veterinarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultas`
--

LOCK TABLES `consultas` WRITE;
/*!40000 ALTER TABLE `consultas` DISABLE KEYS */;
/*!40000 ALTER TABLE `consultas` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_after_insert_consulta` AFTER INSERT ON `consultas` FOR EACH ROW BEGIN
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_after_update_consulta_status` AFTER UPDATE ON `consultas` FOR EACH ROW BEGIN
    
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_before_delete_consulta` BEFORE DELETE ON `consultas` FOR EACH ROW BEGIN
    
    IF EXISTS (
        SELECT 1 FROM pagamentos 
        WHERE consulta_id = OLD.id AND status = 'pago'
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Erro: Não é possível deletar consulta com pagamento realizado!';
    END IF;
    
    
    INSERT INTO log_auditoria (tabela_afetada, acao, registro_id, detalhes)
    VALUES (
        'consultas',
        'DELETE',
        OLD.id,
        CONCAT('Consulta deletada: Animal ID=', OLD.animal_id, 
               ', Status era ', OLD.status, ', Valor=R$', FORMAT(OLD.valor, 2))
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_consultas_delete_restrita` BEFORE DELETE ON `consultas` FOR EACH ROW BEGIN
    IF OLD.status <> 'cancelada' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Exclusão permitida apenas para consultas canceladas.';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `especies`
--

DROP TABLE IF EXISTS `especies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `especies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especies`
--

LOCK TABLES `especies` WRITE;
/*!40000 ALTER TABLE `especies` DISABLE KEYS */;
INSERT INTO `especies` VALUES (1,'Cachorro'),(2,'Gato'),(3,'Pássaro'),(4,'Peixe'),(5,'Réptil');
/*!40000 ALTER TABLE `especies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log_auditoria`
--

DROP TABLE IF EXISTS `log_auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `log_auditoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tabela_afetada` varchar(50) NOT NULL,
  `acao` varchar(20) NOT NULL COMMENT 'INSERT, UPDATE, DELETE',
  `registro_id` int NOT NULL,
  `detalhes` text,
  `data_hora` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tabela` (`tabela_afetada`),
  KEY `idx_data` (`data_hora`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log_auditoria`
--

LOCK TABLES `log_auditoria` WRITE;
/*!40000 ALTER TABLE `log_auditoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `log_auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagamentos`
--

DROP TABLE IF EXISTS `pagamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `consulta_id` int NOT NULL,
  `valor_pago` decimal(10,2) NOT NULL DEFAULT '0.00',
  `forma_pagamento` enum('pix','cartao','dinheiro','convenio') NOT NULL,
  `data_pagamento` datetime NOT NULL,
  `status` enum('pago','pendente','cancelado') NOT NULL DEFAULT 'pendente',
  PRIMARY KEY (`id`),
  UNIQUE KEY `consulta_id` (`consulta_id`),
  CONSTRAINT `pagamentos_ibfk_1` FOREIGN KEY (`consulta_id`) REFERENCES `consultas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagamentos`
--

LOCK TABLES `pagamentos` WRITE;
/*!40000 ALTER TABLE `pagamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagamentos` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_before_update_pagamento` BEFORE UPDATE ON `pagamentos` FOR EACH ROW BEGIN
    
    IF NEW.status = 'pago' AND OLD.status <> 'pago' THEN
        SET NEW.data_pagamento = NOW();
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `tutores`
--

DROP TABLE IF EXISTS `tutores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tutores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `cpf` varchar(14) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cpf` (`cpf`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tutores`
--

LOCK TABLES `tutores` WRITE;
/*!40000 ALTER TABLE `tutores` DISABLE KEYS */;
INSERT INTO `tutores` VALUES (1,'João Pereira','123.456.789-01','joao@email.com','(11) 97777-1111'),(2,'Maria Oliveira','234.567.890-12','maria@email.com','(11) 97777-2222'),(3,'Carlos Santos','345.678.901-23','carlos@email.com','(11) 97777-3333'),(4,'Fernanda Lima','456.789.012-34','fernanda@email.com','(11) 97777-4444'),(5,'Roberto Costa','567.890.123-45','roberto@email.com','(11) 97777-5555'),(6,'Patrícia Almeida','678.901.234-56','patricia@email.com','(11) 97777-6666'),(7,'Gabriel Mendes','789.012.345-67','gabriel@email.com','(11) 97777-7777'),(8,'Natália Ferreira','890.123.456-78','natalia@email.com','(11) 97777-8888');
/*!40000 ALTER TABLE `tutores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `veterinarios`
--

DROP TABLE IF EXISTS `veterinarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `veterinarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `crmv` varchar(20) NOT NULL,
  `especialidade` varchar(50) NOT NULL,
  `telefone` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `crmv` (`crmv`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `veterinarios`
--

LOCK TABLES `veterinarios` WRITE;
/*!40000 ALTER TABLE `veterinarios` DISABLE KEYS */;
INSERT INTO `veterinarios` VALUES (1,'Dr. Ricardo Silva','CRMV-SP 12345','Clínica Geral','(11) 98888-1111'),(2,'Dra. Ana Souza','CRMV-SP 67890','Dermatologia','(11) 98888-2222'),(3,'Dr. Marcos Oliveira','CRMV-SP 11223','Ortopedia','(11) 98888-3333');
/*!40000 ALTER TABLE `veterinarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vw_agenda_hoje`
--

DROP TABLE IF EXISTS `vw_agenda_hoje`;
/*!50001 DROP VIEW IF EXISTS `vw_agenda_hoje`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_agenda_hoje` AS SELECT 
 1 AS `consulta_id`,
 1 AS `data_hora`,
 1 AS `status_consulta`,
 1 AS `diagnostico`,
 1 AS `valor_consulta`,
 1 AS `animal`,
 1 AS `especie`,
 1 AS `tutor`,
 1 AS `telefone_tutor`,
 1 AS `veterinario`,
 1 AS `especialidade`,
 1 AS `forma_pagamento`,
 1 AS `status_pagamento`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_animais_detalhados`
--

DROP TABLE IF EXISTS `vw_animais_detalhados`;
/*!50001 DROP VIEW IF EXISTS `vw_animais_detalhados`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_animais_detalhados` AS SELECT 
 1 AS `animal`,
 1 AS `especie`,
 1 AS `tutor`,
 1 AS `telefone_tutor`,
 1 AS `total_consultas`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_consultas_completas`
--

DROP TABLE IF EXISTS `vw_consultas_completas`;
/*!50001 DROP VIEW IF EXISTS `vw_consultas_completas`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_consultas_completas` AS SELECT 
 1 AS `consulta_id`,
 1 AS `data_hora`,
 1 AS `status_consulta`,
 1 AS `diagnostico`,
 1 AS `valor_consulta`,
 1 AS `animal`,
 1 AS `especie`,
 1 AS `tutor`,
 1 AS `telefone_tutor`,
 1 AS `veterinario`,
 1 AS `especialidade`,
 1 AS `forma_pagamento`,
 1 AS `status_pagamento`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_faturamento_mensal`
--

DROP TABLE IF EXISTS `vw_faturamento_mensal`;
/*!50001 DROP VIEW IF EXISTS `vw_faturamento_mensal`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_faturamento_mensal` AS SELECT 
 1 AS `ano`,
 1 AS `mes`,
 1 AS `veterinario`,
 1 AS `total_consultas`,
 1 AS `faturamento_total`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_inadimplentes`
--

DROP TABLE IF EXISTS `vw_inadimplentes`;
/*!50001 DROP VIEW IF EXISTS `vw_inadimplentes`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_inadimplentes` AS SELECT 
 1 AS `consulta_id`,
 1 AS `data_hora`,
 1 AS `valor_consulta`,
 1 AS `animal`,
 1 AS `tutor`,
 1 AS `telefone_tutor`,
 1 AS `status_pagamento`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vw_agenda_hoje`
--

/*!50001 DROP VIEW IF EXISTS `vw_agenda_hoje`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_agenda_hoje` AS select `vw_consultas_completas`.`consulta_id` AS `consulta_id`,`vw_consultas_completas`.`data_hora` AS `data_hora`,`vw_consultas_completas`.`status_consulta` AS `status_consulta`,`vw_consultas_completas`.`diagnostico` AS `diagnostico`,`vw_consultas_completas`.`valor_consulta` AS `valor_consulta`,`vw_consultas_completas`.`animal` AS `animal`,`vw_consultas_completas`.`especie` AS `especie`,`vw_consultas_completas`.`tutor` AS `tutor`,`vw_consultas_completas`.`telefone_tutor` AS `telefone_tutor`,`vw_consultas_completas`.`veterinario` AS `veterinario`,`vw_consultas_completas`.`especialidade` AS `especialidade`,`vw_consultas_completas`.`forma_pagamento` AS `forma_pagamento`,`vw_consultas_completas`.`status_pagamento` AS `status_pagamento` from `vw_consultas_completas` where (cast(`vw_consultas_completas`.`data_hora` as date) = curdate()) order by `vw_consultas_completas`.`data_hora` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_animais_detalhados`
--

/*!50001 DROP VIEW IF EXISTS `vw_animais_detalhados`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_animais_detalhados` AS select `a`.`nome` AS `animal`,`e`.`nome` AS `especie`,`t`.`nome` AS `tutor`,`t`.`telefone` AS `telefone_tutor`,count(`c`.`id`) AS `total_consultas` from (((`animais` `a` join `especies` `e` on((`a`.`especie_id` = `e`.`id`))) join `tutores` `t` on((`a`.`tutor_id` = `t`.`id`))) left join `consultas` `c` on((`c`.`animal_id` = `a`.`id`))) group by `a`.`id`,`a`.`nome`,`e`.`nome`,`t`.`nome`,`t`.`telefone` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_consultas_completas`
--

/*!50001 DROP VIEW IF EXISTS `vw_consultas_completas`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_consultas_completas` AS select `c`.`id` AS `consulta_id`,`c`.`data_hora` AS `data_hora`,`c`.`status` AS `status_consulta`,`c`.`diagnostico` AS `diagnostico`,`c`.`valor` AS `valor_consulta`,`a`.`nome` AS `animal`,`e`.`nome` AS `especie`,`t`.`nome` AS `tutor`,`t`.`telefone` AS `telefone_tutor`,`v`.`nome` AS `veterinario`,`v`.`especialidade` AS `especialidade`,`p`.`forma_pagamento` AS `forma_pagamento`,`p`.`status` AS `status_pagamento` from (((((`consultas` `c` join `animais` `a` on((`c`.`animal_id` = `a`.`id`))) join `especies` `e` on((`a`.`especie_id` = `e`.`id`))) join `tutores` `t` on((`a`.`tutor_id` = `t`.`id`))) join `veterinarios` `v` on((`c`.`veterinario_id` = `v`.`id`))) left join `pagamentos` `p` on((`p`.`consulta_id` = `c`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_faturamento_mensal`
--

/*!50001 DROP VIEW IF EXISTS `vw_faturamento_mensal`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_faturamento_mensal` AS select year(`vw_consultas_completas`.`data_hora`) AS `ano`,month(`vw_consultas_completas`.`data_hora`) AS `mes`,`vw_consultas_completas`.`veterinario` AS `veterinario`,count(0) AS `total_consultas`,sum(`vw_consultas_completas`.`valor_consulta`) AS `faturamento_total` from `vw_consultas_completas` group by `ano`,`mes`,`vw_consultas_completas`.`veterinario` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_inadimplentes`
--

/*!50001 DROP VIEW IF EXISTS `vw_inadimplentes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_inadimplentes` AS select `c`.`id` AS `consulta_id`,`c`.`data_hora` AS `data_hora`,`c`.`valor` AS `valor_consulta`,`a`.`nome` AS `animal`,`t`.`nome` AS `tutor`,`t`.`telefone` AS `telefone_tutor`,`p`.`status` AS `status_pagamento` from (((`consultas` `c` join `animais` `a` on((`c`.`animal_id` = `a`.`id`))) join `tutores` `t` on((`a`.`tutor_id` = `t`.`id`))) left join `pagamentos` `p` on((`p`.`consulta_id` = `c`.`id`))) where ((`c`.`status` = 'concluida') and ((`p`.`status` = 'pendente') or (`p`.`id` is null))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-26 22:43:16
