-- ==========================================
-- SCRIPT COMPLETO: Reinicializar Base de Datos
-- ==========================================

-- Eliminar base de datos si ya existe
DROP DATABASE IF EXISTS plataforma_educativa;

-- Crear base de datos nueva
CREATE DATABASE plataforma_educativa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE plataforma_educativa;

-- Desactivar restricciones temporales
SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;

-- ==========================================
-- TABLA: Usuarios
-- ==========================================
CREATE TABLE `Usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contrasena` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('Docente','Estudiante') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Usuarios` VALUES 
(1,'Lesly','lesly@educa.com','12345','Docente','2025-10-30 13:10:37'),
(2,'Shirley','shirley@educa.com','12345','Estudiante','2025-10-30 13:10:37'),
(3,'Liliana','liliana@educa.com','12345','Estudiante','2025-10-30 13:10:37'),
(4,'Kevin','kevin@educa.com','12345','Estudiante','2025-10-30 13:10:37'),
(5,'Paul','paul@educa.com','12345','Estudiante','2025-10-30 13:10:37'),
(6,'juan','juan@educa.com','123456','Docente','2025-10-30 16:06:42'),
(7,'María García','maria@educa.com','123451','Estudiante','2025-10-31 14:40:20'),
(8,'Carlos Rodríguez','carlos@educa.com','123451','Estudiante','2025-10-31 14:40:20'),
(9,'Ana Martínez','ana@educa.com','123451','Estudiante','2025-10-31 14:40:20'),
(10,'Pedro López','pedro@educa.com','123451','Estudiante','2025-10-31 14:40:20'),
(11,'Laura Hernández','laura@educa.com','123451','Estudiante','2025-10-31 14:40:20'),
(12,'Diego González','diego@educa.com','123451','Estudiante','2025-10-31 14:40:20'),
(13,'Sofía Pérez','sofia@educa.com','123451','Estudiante','2025-10-31 14:40:20'),
(14,'Javier Sánchez','javier@educa.com','123451','Estudiante','2025-10-31 14:40:20'),
(15,'Elena Ramírez','elena@educa.com','123451','Estudiante','2025-10-31 14:40:20'),
(16,'Miguel Torres','miguel@educa.com','123451','Estudiante','2025-10-31 14:40:20');

-- ==========================================
-- TABLA: Cursos
-- ==========================================
CREATE TABLE `Cursos` (
  `id_curso` int NOT NULL AUTO_INCREMENT,
  `nombre_curso` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `id_docente` int NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_curso`),
  KEY `idx_cursos_id_docente` (`id_docente`),
  CONSTRAINT `fk_cursos_docente` FOREIGN KEY (`id_docente`) REFERENCES `Usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Cursos` VALUES 
(1,'Redes y Conectividad','Curso sobre redes de computadoras y protocolos',1,'2025-10-30 13:10:37'),
(2,'Inteligencia Artificial','Curso sobre IA, machine learning y algoritmos',1,'2025-10-31 14:37:44');

-- ==========================================
-- TABLA: Tareas
-- ==========================================
CREATE TABLE `Tareas` (
  `id_tarea` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `fecha_publicacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_limite` date DEFAULT NULL,
  `hora_limite` time DEFAULT NULL,
  `archivo_material` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_curso` int NOT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_tarea`),
  KEY `idx_tareas_id_curso` (`id_curso`),
  CONSTRAINT `fk_tareas_curso` FOREIGN KEY (`id_curso`) REFERENCES `Cursos` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Tareas` VALUES 
(1,'Proyecto Publisher-Subscriber','Desarrollar el módulo de notificaciones en tiempo real.','2025-10-30 13:10:37','2025-11-10','23:59:00','proyecto_pubsub.zip',1,1),
(4,'Proyecto final de arquitecturacccc','Entregar el informe completo en PDF.','2025-10-31 03:05:48','2025-11-09','23:59:00','https://servidor.com/archivos/proyecto.pdf',1,1),
(5,'Tarea 1 - Prueba PubSub','Esta es una tarea para probar Redis Pub/Sub','2025-10-31 11:36:44','2025-11-04','18:00:00','guia.pdf',1,1),
(6,'Tarea 1 - Prueba PubSub','Esta es una tarea para probar Redis Pub/Sub','2025-10-31 11:38:52','2025-11-04','18:00:00','guingfvhga.pdf',1,1),
(13,'prueba lili','esperemos que salgha todo bien ','2025-10-31 16:47:21','2025-12-11','12:48:00','ai_studio_code (1).sh',2,1),
(16,'dhffdgdfg','dfg','2025-10-31 17:26:48','2025-10-08','15:26:00','Brainstorming Proceso Diseño Logo Colorido.pdf',2,1);

-- ==========================================
-- TABLA: Inscripciones
-- ==========================================
CREATE TABLE `Inscripciones` (
  `id_inscripcion` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int NOT NULL,
  `id_curso` int NOT NULL,
  `fecha_inscripcion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_inscripcion`),
  UNIQUE KEY `uq_estudiante_curso` (`id_estudiante`,`id_curso`),
  CONSTRAINT `fk_insc_curso` FOREIGN KEY (`id_curso`) REFERENCES `Cursos` (`id_curso`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_insc_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `Usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Inscripciones` VALUES 
(8, 2, 1, '2025-10-31 14:48:09'),
(9, 3, 1, '2025-10-31 14:48:09'),
(10, 4, 1, '2025-10-31 14:48:09'),
(11, 5, 1, '2025-10-31 14:48:09'),
(12, 7, 1, '2025-10-31 14:48:09'),
(13, 8, 1, '2025-10-31 14:48:09'),
(14, 9, 1, '2025-10-31 14:48:09'),
(15, 10, 1, '2025-10-31 14:48:09'),
(16, 11, 2, '2025-10-31 14:48:09'),
(17, 12, 2, '2025-10-31 14:48:09'),
(18, 13, 2, '2025-10-31 14:48:09'),
(19, 14, 2, '2025-10-31 14:48:09'),
(20, 15, 2, '2025-10-31 14:48:09'),
(21, 16, 2, '2025-10-31 14:48:09'),
(22, 2, 2, '2025-10-31 14:48:09'),
(23, 3, 2, '2025-10-31 14:48:09'),
(24, 4, 2, '2025-10-31 14:48:09'),
(25, 5, 2, '2025-10-31 14:48:09'),
(26, 7, 2, '2025-10-31 14:48:09');

-- ==========================================
-- TABLA: Notificaciones
-- ==========================================
CREATE TABLE `Notificaciones` (
  `id_notificacion` int NOT NULL AUTO_INCREMENT,
  `mensaje` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_envio` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_tarea` int NOT NULL,
  `id_estudiante` int NOT NULL,
  `estado` enum('Pendiente','Leida') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendiente',
  PRIMARY KEY (`id_notificacion`),
  KEY `idx_not_id_tarea` (`id_tarea`),
  KEY `idx_not_id_estudiante` (`id_estudiante`),
  CONSTRAINT `fk_not_estudiante` FOREIGN KEY (`id_estudiante`) REFERENCES `Usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_not_tarea` FOREIGN KEY (`id_tarea`) REFERENCES `Tareas` (`id_tarea`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Notificaciones` VALUES 
(1,'Nueva tarea publicada: Proyecto Publisher-Subscriber','2025-10-30 13:10:37',1,2,'Pendiente'),
(2,'Nueva tarea publicada: Proyecto Publisher-Subscriber','2025-10-30 13:10:37',1,3,'Pendiente'),
(17,'📚 Nueva Tarea: dhffdgdfg','2025-10-31 17:26:50',16,11,'Pendiente'),
(18,'📚 Nueva Tarea: dhffdgdfg','2025-10-31 17:26:50',16,12,'Pendiente'),
(19,'📚 Nueva Tarea: dhffdgdfg','2025-10-31 17:26:50',16,7,'Pendiente'),
(20,'📚 Nueva Tarea: dhffdgdfg','2025-10-31 17:26:50',16,13,'Pendiente');

-- ==========================================
-- REACTIVAR VALIDACIONES
-- ==========================================
SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;

-- Fin del script
-- ==========================================
