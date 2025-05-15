-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         8.4.3 - MySQL Community Server - GPL
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para usuarios_itp
CREATE DATABASE IF NOT EXISTS `usuarios_itp` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `usuarios_itp`;

-- Volcando estructura para tabla usuarios_itp.notificaciones
CREATE TABLE IF NOT EXISTS `notificaciones` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `mensaje` varchar(500) DEFAULT NULL,
  `fecha` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK-notificaciones` (`id_usuario`),
  CONSTRAINT `FK-notificaciones` FOREIGN KEY (`id_usuario`) REFERENCES `users` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=492 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla usuarios_itp.notificaciones: ~0 rows (aproximadamente)

-- Volcando estructura para tabla usuarios_itp.reservas
CREATE TABLE IF NOT EXISTS `reservas` (
  `ID_Reserva` int NOT NULL AUTO_INCREMENT,
  `Fecha_hora` varchar(50) DEFAULT NULL,
  `Persona_id` int DEFAULT NULL,
  `Estado` enum('reservado','cancelado') DEFAULT 'reservado',
  PRIMARY KEY (`ID_Reserva`),
  KEY `FK__users` (`Persona_id`),
  CONSTRAINT `FK__users` FOREIGN KEY (`Persona_id`) REFERENCES `users` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2720 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla usuarios_itp.reservas: ~0 rows (aproximadamente)

-- Volcando estructura para tabla usuarios_itp.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `ID_Rol` int NOT NULL AUTO_INCREMENT,
  `Rol` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ID_Rol`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla usuarios_itp.roles: ~2 rows (aproximadamente)
INSERT INTO `roles` (`ID_Rol`, `Rol`) VALUES
  (1, 'Administrador'),
  (2, 'Usuario');

-- Volcando estructura para tabla usuarios_itp.users
CREATE TABLE IF NOT EXISTS `users` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `NOMBRE` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `APELLIDO` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `IDENTIFICACION` int DEFAULT NULL,
  `CONTRASENA` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `CORREO` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `URLIMAGE` varchar(100) DEFAULT NULL,
  `ID_Rol` int DEFAULT NULL,
  `pdf_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_users_roles` (`ID_Rol`),
  CONSTRAINT `FK_users_roles` FOREIGN KEY (`ID_Rol`) REFERENCES `roles` (`ID_Rol`)
) ENGINE=InnoDB AUTO_INCREMENT=124 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Volcando datos para la tabla usuarios_itp.users: ~3 rows (aproximadamente)
INSERT INTO `users` (`ID`, `NOMBRE`, `APELLIDO`, `IDENTIFICACION`, `CONTRASENA`, `CORREO`, `URLIMAGE`, `ID_Rol`, `pdf_path`) VALUES
  (92, 'David ', 'Alexis', 1118366640, '$2b$12$mULNMM6uRn.m.fNfUkn0GOpVp5NCPqMuAenOVr8CWr.XkuIWrf4G.', 'damedina24@itp.edu.co', NULL, 1, 'C:\\Users\\USUARIO\\Documents\\itp\\Aplicaciones\\app-itp\\servidor\\models\\storage\\encrypted_pdfs\\user_92.pdf'),
  (97, 'usuario', 'prueba', 123, '$2b$12$mULNMM6uRn.m.fNfUkn0GOpVp5NCPqMuAenOVr8CWr.XkuIWrf4G.', 'prueba@gmail.com', NULL, 2, NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
