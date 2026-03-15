-- Script para crear la tabla tblposcrumenwebanuncios
CREATE TABLE IF NOT EXISTS `tblposcrumenwebanuncios` (
  `idAnuncio` INT NOT NULL AUTO_INCREMENT,
  `tituloDeAnuncio` VARCHAR(255) NOT NULL,
  `detalleAnuncio` TEXT NULL,
  `imagen1Anuncio` LONGTEXT NULL,
  `imagen2Anuncio` LONGTEXT NULL,
  `imagen3Anuncio` LONGTEXT NULL,
  `imagen4Anuncio` LONGTEXT NULL,
  `imagen5Anuncio` LONGTEXT NULL,
  `fechaDeVigencia` DATE NULL,
  `usuarioauditoria` VARCHAR(100) NULL,
  `fechamodificacionauditoria` DATETIME NULL,
  PRIMARY KEY (`idAnuncio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
