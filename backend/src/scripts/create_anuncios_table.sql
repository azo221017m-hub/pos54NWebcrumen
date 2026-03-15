-- Script para crear la tabla tblposcrumenwebanuncios
CREATE TABLE IF NOT EXISTS `tblposcrumenwebanuncios` (
  `idAnuncio` INT NOT NULL AUTO_INCREMENT,
  `tituloDeAnuncio` VARCHAR(250) NOT NULL,
  `detalleAnuncio` TEXT NULL,
  `imagen1Anuncio` LONGBLOB NULL,
  `imagen2Anuncio` LONGBLOB NULL,
  `imagen3Anuncio` LONGBLOB NULL,
  `imagen4Anuncio` LONGBLOB NULL,
  `imagen5Anuncio` LONGBLOB NULL,
  `fechaDeVigencia` DATE NULL,
  `usuarioauditoria` VARCHAR(100) NULL,
  `fechamodificacionauditoria` DATETIME NULL,
  PRIMARY KEY (`idAnuncio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
