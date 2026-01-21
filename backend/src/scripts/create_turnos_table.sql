-- Script para crear la tabla tblposcrumenwebturnos
-- Tabla para gestionar los turnos de trabajo del negocio

CREATE TABLE IF NOT EXISTS tblposcrumenwebturnos (
  idturno INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  numeroturno INT(11) NOT NULL DEFAULT 0,
  fechainicioturno DATETIME NOT NULL,
  fechafinturno DATETIME NULL DEFAULT NULL,
  estatusturno VARCHAR(20) NOT NULL DEFAULT 'abierto',
  claveturno VARCHAR(50) NOT NULL DEFAULT '',
  usuarioturno VARCHAR(100) NOT NULL DEFAULT '',
  idnegocio INT(10) UNSIGNED NOT NULL,
  PRIMARY KEY (idturno),
  INDEX idx_idnegocio (idnegocio),
  INDEX idx_estatusturno (estatusturno),
  INDEX idx_claveturno (claveturno)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentarios de las columnas
-- idturno: ID único autogenerado del turno
-- numeroturno: Número del turno, igual al idturno (autogenerado)
-- fechainicioturno: Fecha y hora de inicio del turno (autogenerada con NOW())
-- fechafinturno: Fecha y hora de cierre del turno (NULL hasta que se cierra)
-- estatusturno: Estado del turno: 'abierto' o 'cerrado'
-- claveturno: Clave compuesta: [ddmmyyyyHHMMSS]+[numeroturno]+[idusuario]+[idnegocio]
-- usuarioturno: Alias del usuario que inició el turno
-- idnegocio: ID del negocio asociado al turno
