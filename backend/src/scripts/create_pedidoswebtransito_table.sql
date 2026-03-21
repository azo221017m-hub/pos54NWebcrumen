-- Script para crear la tabla tblposcrumenwebpedidoswebtransito
-- Tabla de tránsito para pedidos WEB del cliente, usada para mostrar el estado del pedido
-- al cliente en tiempo real (tablero "Mis Pedidos").
-- IMPORTANTE: Ejecutar este script en la base de datos de producción antes de usar la
-- funcionalidad de "Mis Pedidos" en el portal de clientes.

CREATE TABLE IF NOT EXISTS tblposcrumenwebpedidoswebtransito (
  idpedidowebtransito INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  folioventa VARCHAR(100) NOT NULL COMMENT 'Folio de la venta asociada',
  idnegocio INT(10) UNSIGNED NOT NULL COMMENT 'ID del negocio',
  totalpedido DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Total del pedido',
  fechahorapedidosolicitado DATETIME NOT NULL COMMENT 'Fecha/hora en que se solicitó el pedido',
  telefonocliente VARCHAR(20) NULL DEFAULT NULL COMMENT 'Teléfono del cliente (para consulta sin autenticación)',
  referenciacliente VARCHAR(200) NULL DEFAULT NULL COMMENT 'Nombre/referencia del cliente',
  detalleproductos LONGTEXT NULL COMMENT 'JSON con detalle de productos del pedido',
  estatuspedidotransito VARCHAR(30) NOT NULL DEFAULT 'SOLICITADO' COMMENT 'Estado: SOLICITADO, PREPARANDO, EN_CAMINO, ENTREGADO, CANCELADO',
  detallesclientepedidostransito TEXT NULL COMMENT 'Detalles del cliente (dirección, contacto, etc.)',
  observacionesnegociopedidostransito TEXT NULL COMMENT 'Observaciones del negocio para el cliente',
  puntosobtenidospedidostransito INT(11) NOT NULL DEFAULT 0 COMMENT 'Puntos obtenidos en este pedido',
  puntosusadospedidostransito INT(11) NOT NULL DEFAULT 0 COMMENT 'Puntos usados en este pedido',
  saldopuntospedidostransito INT(11) NOT NULL DEFAULT 0 COMMENT 'Saldo de puntos acumulado',
  mensajeclientepedidostransito TEXT NULL COMMENT 'Mensaje del cliente al negocio (mini-chat)',
  mensajenegociopedidostransito TEXT NULL COMMENT 'Mensaje del negocio al cliente (mini-chat)',
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
  estadopedidowebtransito TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado del pedido web en tránsito: 1=activo, 0=inactivo',
  PRIMARY KEY (idpedidowebtransito),
  INDEX idx_telefonocliente (telefonocliente),
  INDEX idx_idnegocio (idnegocio),
  INDEX idx_folioventa (folioventa),
  INDEX idx_estatuspedidotransito (estatuspedidotransito),
  INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabla de tránsito para pedidos WEB - muestra estado del pedido al cliente en tiempo real';

-- Comentarios de las columnas
-- idpedidowebtransito: ID único autogenerado del registro de tránsito
-- folioventa: Folio de la venta en tblposcrumenwebventas
-- idnegocio: ID del negocio que procesa el pedido
-- totalpedido: Monto total del pedido
-- fechahorapedidosolicitado: Fecha y hora en que el cliente solicitó el pedido (NOW() al crear)
-- telefonocliente: Teléfono del cliente, usado para consultar pedidos sin autenticación
-- referenciacliente: Nombre o referencia del cliente
-- detalleproductos: JSON con los productos del pedido (nombre, cantidad, precio, etc.)
-- estatuspedidotransito: Estado actual del pedido (sincronizado con estadodeventa via TRANSIT_STATUS_MAP)
-- detallesclientepedidostransito: Información del cliente (dirección, contacto) concatenada
-- observacionesnegociopedidostransito: Notas del negocio visibles para el cliente
-- puntosobtenidospedidostransito: Puntos de fidelidad obtenidos
-- puntosusadospedidostransito: Puntos de fidelidad utilizados
-- saldopuntospedidostransito: Saldo acumulado de puntos
-- mensajeclientepedidostransito: Último mensaje del cliente al negocio (mini-chat)
-- mensajenegociopedidostransito: Último mensaje del negocio al cliente (mini-chat)
-- fecha_creacion: Timestamp de creación (NOW() al insertar)
-- fecha_actualizacion: Timestamp de última modificación (actualizado automáticamente)
-- estadopedidowebtransito: Estado del pedido web en tránsito (1=activo, 0=inactivo)
