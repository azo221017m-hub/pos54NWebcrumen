// backend/src/types/index.ts
// Definición de tipos TypeScript para toda la aplicación POSWEBCrumen

// Tipo para la respuesta estándar de la API
export interface ApiResponse<T = any> {
  success: boolean; // Indica si la operación fue exitosa
  message: string; // Mensaje descriptivo de la respuesta
  data?: T; // Datos opcionales de la respuesta
  error?: string; // Mensaje de error opcional
}

// Extiende los tipos de Express para incluir la sesión
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    idNegocio?: number;
    usuarioAuditoria?: string;
  }
}

// Tipo para datos de login
export interface LoginData {
  usuario: string; // Alias del usuario (se mapea a tblposcrumenwebusuarios.alias)
  password: string; // Contraseña
}

// Tipo para intentos de login según tabla tblposcrumenwebintentoslogin
export interface IntentoLogin {
  id: number; // ID único del intento (AI PK)
  aliasusuario: string; // Alias del usuario
  intentos: number; // Conteo de intentos (smallint 6)
  ultimologin: Date; // Fecha y hora del último login exitoso
  fechabloqueado: Date; // Fecha y hora de bloqueo
  idnegocio: number; // ID del negocio
}

// Tipo para crear/actualizar intentos de login
export interface CreateIntentoLoginData {
  aliasusuario: string; // Alias del usuario (requerido)
  intentos: number; // Número de intentos (requerido)
  ultimologin?: Date; // Fecha del último login exitoso (opcional)
  fechabloqueado?: Date; // Fecha de bloqueo (opcional)
  idnegocio: number; // ID del negocio (requerido)
}

// Tipo para usuario según tabla tblposcrumenwebusuarios
export interface Usuario {
  idUsuario: number; // ID único del usuario
  idNegocio: number; // ID del negocio
  idRol: number; // ID del rol
  nombre: string; // Nombre completo
  alias: string; // Alias del usuario
  password: string; // Contraseña
  telefono: string; // Teléfono
  cumple: Date; // Fecha de cumpleaños
  frasepersonal: string; // Frase personal
  fotoine: Buffer; // Foto INE (LONGBLOB)
  fotopersona: Buffer; // Foto persona (LONGBLOB)
  fotoavatar: Buffer; // Foto avatar (LONGBLOB)
  desempeno: number; // Desempeño (decimal 5,2)
  popularidad: number; // Popularidad (decimal 5,2)
  estatus: number; // Estado del usuario (1=activo, 9=bloqueado, 0=inactivo)
  fechaRegistroauditoria: Date; // Fecha de registro
  usuarioauditoria: string; // Usuario de auditoría
  fehamodificacionauditoria: Date; // Fecha de modificación
}

// Tipo para datos de registro de usuario
export interface CreateUsuarioData {
  idNegocio: number; // ID del negocio
  idRol: number; // ID del rol
  nombre: string; // Nombre completo
  usuario: string; // Nombre de usuario
  password: string; // Contraseña
  email: string; // Correo electrónico
  activo?: number; // Estado del usuario (1=activo, 0=inactivo)
  usuarioAuditoria: string; // Usuario que crea el registro
}

// Tipo para datos de registro de negocio
export interface CreateNegocioData {
  numerocliente: string; // Número de cliente
  nombreNegocio: string; // Nombre del negocio
  rfc: string; // RFC
  direccion: string; // Dirección
  telefono: string; // Teléfono
  usuario: string; // Usuario que crea el registro
}

// Tipo para datos de registro de rol
export interface CreateRolData {
  nombreRol: string; // Nombre del rol
  descripcion: string; // Descripción del rol
  estatus?: number; // Estado del rol (1=activo, 0=inactivo)
  usuario?: string; // Usuario que crea el registro
}

// Tipos para enums de clientes
export type CategoriaCliente = 'NUEVO' | 'RECURRENTE' | 'FRECUENTE' | 'VIP' | 'INACTIVO';
export type EstatusSeguimiento = 'NINGUNO' | 'EN_PROSPECCIÓN' | 'EN_NEGOCIACIÓN' | 'CERRADO' | 'PERDIDO';
export type MedioContacto = 'WHATSAPP' | 'LLAMADA' | 'EMAIL' | 'OTRO';

// Tipo para crear un nuevo cliente
export interface CreateClienteData {
  nombre: string; // Nombre del cliente
  referencia: string; // Referencia del cliente
  cumple: string; // Fecha de cumpleaños (YYYY-MM-DD)
  categoriacliente: CategoriaCliente; // Categoría del cliente
  satisfaccion?: number; // Nivel de satisfacción (opcional)
  comentarios?: string; // Comentarios generales (opcional)
  puntosfidelidad?: number; // Puntos de fidelidad (opcional)
  estatus_seguimiento: EstatusSeguimiento; // Estado del seguimiento
  responsable_seguimiento: string; // Responsable del seguimiento
  medio_contacto: MedioContacto; // Medio de contacto preferido
  observacionesseguimiento?: string; // Observaciones del seguimiento
  fechaultimoseguimiento: string; // Fecha del último seguimiento (YYYY-MM-DD)
  telefono: string; // Teléfono del cliente
  email: string; // Email del cliente
  direccion?: string; // Dirección del cliente (opcional)
  estatus: number; // Estado del cliente (1=activo, 0=inactivo)
  usuarioauditoria: string; // Usuario de auditoría
  idnegocio: number; // ID del negocio
}

// Tipo para datos completos del cliente
export interface Cliente {
  idCliente: number; // ID único del cliente
  nombre: string; // Nombre del cliente
  referencia: string; // Referencia del cliente
  cumple: string; // Fecha de cumpleaños (YYYY-MM-DD)
  categoriacliente: CategoriaCliente; // Categoría del cliente
  satisfaccion: number; // Nivel de satisfacción (1-5)
  comentarios: string; // Comentarios generales
  puntosfidelidad: number; // Puntos de fidelidad acumulados
  estatus_seguimiento: EstatusSeguimiento; // Estado del seguimiento
  responsable_seguimiento: string; // Responsable del seguimiento
  medio_contacto: MedioContacto; // Medio de contacto preferido
  observacionesseguimiento: string; // Observaciones del seguimiento
  fechaultimoseguimiento: string; // Fecha del último seguimiento (YYYY-MM-DD)
  telefono: string; // Teléfono del cliente
  email: string; // Email del cliente
  direccion: string; // Dirección del cliente
  estatus: number; // Estado del cliente (1=activo, 0=inactivo)
  fecharegistroauditoria: string; // Fecha de registro de auditoría
  usuarioauditoria: string; // Usuario de auditoría
  fehamodificacionauditoria: string; // Fecha de modificación de auditoría
  idnegocio: number; // ID del negocio al que pertenece
}

// Tipo para actualizar un cliente existente
export interface UpdateClienteData {
  nombre?: string; // Nombre del cliente (opcional)
  referencia?: string; // Referencia del cliente (opcional)
  cumple?: string; // Fecha de cumpleaños (opcional)
  categoriacliente?: CategoriaCliente; // Categoría del cliente (opcional)
  satisfaccion?: number; // Nivel de satisfacción (opcional)
  comentarios?: string; // Comentarios generales (opcional)
  puntosfidelidad?: number; // Puntos de fidelidad (opcional)
  estatus_seguimiento?: EstatusSeguimiento; // Estado del seguimiento (opcional)
  responsable_seguimiento?: string; // Responsable del seguimiento (opcional)
  medio_contacto?: MedioContacto; // Medio de contacto (opcional)
  observacionesseguimiento?: string; // Observaciones del seguimiento (opcional)
  fechaultimoseguimiento?: string; // Fecha del último seguimiento (opcional)
  telefono?: string; // Teléfono del cliente (opcional)
  email?: string; // Email del cliente (opcional)
  direccion?: string; // Dirección del cliente (opcional)
  estatus?: number; // Estado del cliente (opcional)
  usuarioauditoria: string; // Usuario de auditoría (requerido para actualización)
}

// Tipo para datos de registro de parámetros de negocio
export interface CreateParametrosNegocioData {
  idNegocio: number; // ID del negocio asociado
  tipoNegocio: string; // Tipo de negocio
  impresionRecibo?: number; // Impresión de recibo (1=sí, 0=no)
  encabezado: string; // Encabezado del recibo
  pie: string; // Pie del recibo
  tipoRecibo: string; // Tipo de recibo
  envioMensaje?: number; // Envío de mensaje (1=sí, 0=no)
  estatus?: number; // Estado (1=activo, 0=inactivo)
  usuario?: string; // Usuario que crea el registro
}

// Tipo para datos de categoría en la base de datos
export interface Categoria {
  idCategoria: number; // ID único de la categoría
  nombre: string; // Nombre de la categoría
  descripcion: string; // Descripción de la categoría
  estatus: number; // Estado de la categoría (1=activo, 0=inactivo)
  fechaRegistro: Date; // Fecha de registro
  fechaActualizacion: Date; // Fecha de última actualización
  usuario: string; // Usuario que registró la categoría
}

// Tipo para datos de registro de categoría según tblposcrumenwebcategorias
export interface CreateCategoriaData {
  nombre: string; // varchar(100) - Nombre de la categoría
  imagencategoria?: string; // longblob - Imagen de la categoría (base64)
  descripcion?: string; // text - Descripción de la categoría
  estatus?: number; // tinyint(1) - Estado (1=activo, 0=inactivo)
  usuarioauditoria?: string; // Usuario que crea/modifica el registro
  idnegocio?: number; // ID del negocio al que pertenece
}

// Tipo para datos de producto en la base de datos
export interface Producto {
  idProducto: number; // ID único del producto
  idCategoria: number; // ID de la categoría
  idReceta?: number; // ID de la receta (opcional)
  nombre: string; // Nombre del producto
  descripcion: string; // Descripción del producto
  precio: number; // Precio del producto
  existencia: number; // Existencia disponible
  estatus: number; // Estado del producto (1=activo, 0=inactivo)
  fechaRegistro: Date; // Fecha de registro
  fechaActualizacion: Date; // Fecha de última actualización
  usuario: string; // Usuario que registró el producto
  idNegocio: number; // ID del negocio al que pertenece
  imagenProducto?: Buffer; // Imagen del producto (LONGBLOB)
}

// Tipo para datos de registro de producto
export interface CreateProductoData {
  idCategoria: number; // ID de la categoría
  idReceta?: number; // ID de la receta (opcional)
  nombre: string; // Nombre del producto
  descripcion: string; // Descripción del producto
  precio: number; // Precio del producto
  existencia: number; // Existencia inicial
  estatus?: number; // Estado (1=activo, 0=inactivo)
  usuario?: string; // Usuario que crea el registro
  idNegocio: number; // ID del negocio
  imagenProducto?: Buffer; // Imagen del producto
}

// Tipo para datos de insumo según tabla tblposcrumenwebinsumos
export interface Insumo {
  id_insumo: number; // ID único del insumo (AI PK)
  nombre: string; // Nombre del insumo (varchar 100)
  unidad_medida: 'Kg' | 'Lt' | 'Pza'; // Unidad de medida del insumo (varchar 20)
  tipo_insumo: 'PRODUCTO' | 'INSUMO'; // Tipo de insumo (enum)
  stock_actual: number; // Stock actual disponible (decimal 10,2)
  stock_minimo: number; // Stock mínimo (decimal 10,2)
  costo_promedio_ponderado: number; // Costo promedio ponderado (decimal 12,4)
  precio_venta: number; // Precio de venta (decimal 12,2)
  id_cuentacontable: number; // ID de cuenta contable (int 11)
  activo: boolean; // Estado activo/inactivo (tinyint 1)
  fecha_registro: string; // Fecha de registro (datetime)
  fecha_actualizacion: string; // Fecha de última actualización (datetime)
  usuario: string; // Usuario que registró el insumo
}

// Tipo para crear/actualizar insumo
export interface CreateInsumoData {
  nombre: string; // Nombre del insumo (requerido)
  unidad_medida: 'Kg' | 'Lt' | 'Pza'; // Unidad de medida (requerido)
  tipo_insumo: 'PRODUCTO' | 'INSUMO'; // Tipo de insumo (requerido)
  stock_actual: number; // Stock inicial/actual (requerido)
  stock_minimo: number; // Stock mínimo (requerido)
  costo_promedio_ponderado: number; // Costo promedio ponderado (requerido)
  precio_venta: number; // Precio de venta (requerido)
  id_cuentacontable: number; // ID de cuenta contable (requerido)
}

// Tipo para mesa según tabla tblposcrumenwebmesas
export interface Mesa {
  idmesa: number; // ID único de la mesa (AI PK)
  nombremesa: string; // Nombre de la mesa (varchar 100)
  numeromesa: number; // Número de la mesa (int 11)
  cantcomensales: number; // Cantidad de comensales (int 11)
  estatusmesa: 'DISPONIBLE' | 'OCUPADA' | 'RESERVADA'; // Estado de la mesa (enum)
  tiempodeinicio: Date; // Tiempo de inicio (datetime)
  tiempoactual: Date; // Tiempo actual (datetime)
  estatustiempo: 'EN_CURSO' | 'DEMORA' | 'INACTIVA'; // Estado del tiempo (enum)
  fechaRegistroauditoria: Date; // Fecha de registro (datetime)
  usuarioauditoria: string; // Usuario de auditoría (varchar 100)
  fehamodificacionauditoria: Date; // Fecha de modificación (datetime)
  idnegocio: number; // ID del negocio (int 11)
}

// Tipo para crear/actualizar mesa
export interface CreateMesaData {
  nombremesa: string; // Nombre de la mesa (requerido)
  numeromesa: number; // Número de la mesa (requerido)
  cantcomensales: number; // Cantidad de comensales (requerido)
  estatusmesa: 'DISPONIBLE' | 'OCUPADA' | 'RESERVADA'; // Estado de la mesa (requerido)
  usuarioauditoria: string; // Usuario de auditoría (requerido)
  idnegocio: number; // ID del negocio (requerido)
}

// Tipo para actualizar una mesa
export interface UpdateMesaData {
  nombremesa?: string; // Nombre de la mesa (opcional)
  numeromesa?: number; // Número de la mesa (opcional)
  cantcomensales?: number; // Cantidad de comensales (opcional)
  estatusmesa?: 'DISPONIBLE' | 'OCUPADA' | 'RESERVADA' | 'INACTIVA'; // Estado de la mesa (opcional)
  actualizado_por: string; // Usuario que actualiza la mesa
}

// Tipo para datos de proveedor en la base de datos
export interface Proveedor {
  id_proveedor: number; // ID único del proveedor (AI PK)
  nombre: string; // Nombre del proveedor varchar(150)
  rfc: string; // RFC varchar(20)
  telefono: string; // Teléfono varchar(30)
  correo: string; // Correo electrónico varchar(100)
  direccion: string; // Dirección text
  banco: string; // Banco varchar(100)
  cuenta: string; // Número de cuenta varchar(50)
  activo: boolean; // Activo tinyint(1) -> boolean
  fechaRegistroauditoria: Date; // Fecha de registro
  usuarioauditoria: string; // Usuario que registra
  fehamodificacionauditoria?: Date; // Fecha de modificación (opcional)
  idnegocio: number; // ID del negocio
}

// Tipo para crear un nuevo proveedor
export interface CreateProveedorData {
  nombre: string; // Nombre del proveedor (requerido)
  rfc: string; // RFC (requerido)
  telefono: string; // Teléfono (requerido)
  correo: string; // Correo electrónico (requerido)
  direccion: string; // Dirección (requerido)
  banco: string; // Banco (requerido)
  cuenta: string; // Número de cuenta (requerido)
  activo: boolean; // Activo (requerido)
  usuarioauditoria: string; // Usuario (requerido)
  idnegocio: number; // ID del negocio (requerido)
}

// Tipo para actualizar un proveedor
export interface UpdateProveedorData {
  nombre?: string; // Nombre del proveedor (opcional)
  rfc?: string; // RFC (opcional)
  telefono?: string; // Teléfono (opcional)
  correo?: string; // Correo electrónico (opcional)
  direccion?: string; // Dirección (opcional)
  banco?: string; // Banco (opcional)
  cuenta?: string; // Número de cuenta (opcional)
  activo?: boolean; // Activo (opcional)
  usuarioauditoria?: string; // Usuario (opcional)
}

// Tipo para unidad de medida de compra en la base de datos
export interface UMCompra {
  idUmCompra: number; // ID único de la unidad de medida de compra
  nombreUmCompra: string; // Nombre de la unidad de medida de compra
  valor: number; // Valor de conversión
  umMatPrima: string; // Unidad de materia prima (Lt, ml, Kl, gr, pza)
  valorConvertido: number; // Valor convertido
  fechaRegistro: Date; // Fecha de registro
  fechaActualizacion: Date; // Fecha de última actualización
  usuario: string; // Usuario que realizó el registro/actualización
}

// Tipo para crear una nueva unidad de medida de compra
export interface CreateUMCompraData {
  nombreUmCompra: string; // Nombre de la unidad de medida de compra (requerido)
  valor: number; // Valor de conversión (requerido)
  umMatPrima: string; // Unidad de materia prima (requerido: Lt, ml, Kl, gr, pza)
  valorConvertido: number; // Valor convertido (requerido)
  usuario: string; // Usuario que realiza el registro (requerido)
}

// Tipo para actualizar una unidad de medida de compra
export interface UpdateUMCompraData {
  nombreUmCompra: string; // Nombre de la unidad de medida de compra (requerido)
  valor: number; // Valor de conversión (requerido)
  umMatPrima: string; // Unidad de materia prima (requerido: Lt, ml, Kl, gr, pza)
  valorConvertido: number; // Valor convertido (requerido)
}

// Tipo para tipo de movimiento en la base de datos
export interface TipoMovimiento {
  idtipomovimiento: number; // ID único del tipo de movimiento
  nombretipomovimiento: string; // Nombre del tipo de movimiento
  categoriatipomovimiento: string; // Categoría del tipo de movimiento
}

// Tipo para crear un nuevo tipo de movimiento
export interface CreateTipoMovimientoData {
  nombretipomovimiento: string; // Nombre del tipo de movimiento (requerido)
  categoriatipomovimiento: string; // Categoría del tipo de movimiento (requerido)
}

// Tipo para actualizar un tipo de movimiento
export interface UpdateTipoMovimientoData {
  nombretipomovimiento: string; // Nombre del tipo de movimiento (requerido)
  categoriatipomovimiento: string; // Categoría del tipo de movimiento (requerido)
}

// Tipo para subtipo de movimiento en la base de datos
export interface SubtipoMovimiento {
  idsubtipomovimiento: number; // ID único del subtipo de movimiento
  nombretiposubmovimiento: string; // Nombre del subtipo de movimiento
  idtipomovimiento: number; // ID del tipo de movimiento (FK)
  preciosubtipomovimiento: number; // Precio del subtipo de movimiento
  // Campos adicionales para joins
  nombretipomovimiento?: string; // Nombre del tipo de movimiento (para mostrar)
}

// Tipo para crear un nuevo subtipo de movimiento
export interface CreateSubtipoMovimientoData {
  nombretiposubmovimiento: string; // Nombre del subtipo de movimiento (requerido)
  idtipomovimiento: number; // ID del tipo de movimiento (requerido)
  preciosubtipomovimiento: number; // Precio del subtipo de movimiento (requerido)
}

// Tipo para actualizar un subtipo de movimiento
export interface UpdateSubtipoMovimientoData {
  nombretiposubmovimiento: string; // Nombre del subtipo de movimiento (requerido)
  idtipomovimiento: number; // ID del tipo de movimiento (requerido)
  preciosubtipomovimiento: number; // Precio del subtipo de movimiento (requerido)
}

// Tipo para negocio según tabla tblposcrumenwebnegocio
export interface Negocio {
  idNegocio: number; // ID único del negocio
  numerocliente: string; // Número de cliente
  nombreNegocio: string; // Nombre del negocio
  rfc: string; // RFC
  direccion: string; // Dirección
  telefono: string; // Teléfono
  fechaRegistro: Date; // Fecha de registro
  fechaActualizacion: Date; // Fecha de última actualización
  usuario: string; // Usuario que creó el registro
}

// Tipo para naturaleza de movimiento contable (valores permitidos)
export type NaturalezaMovimiento = 'COMPRA' | 'GASTO';

// Tipo para categoría de compra (valores permitidos)
export type CategoriaCompra = 'Inventario' | 'activo fijo' | 'servicios' | 'administrativas' | 'extraodinarias' | 'inversión';

// Tipo para categoría de gasto (valores permitidos)
export type CategoriaGasto = 'operación' | 'financiero' | 'extraorinario';

// Tipo para unidad de medida de movimiento
export interface UMMovimiento {
  idum: number; // ID único de la unidad
  nombreum: string; // Nombre de la unidad de medida
}

// Tipos para descuentos
export type TipoDescuento = '$' | '%'; // Tipo de descuento: peso o porcentaje
export type EstatusDescuento = 'ACTIVO' | 'INACTIVO'; // Estatus del descuento
export type RequiereAutorizacion = 'SI' | 'NO'; // Si requiere autorización

// Tipo para descuento según tabla tblposcrumenwebdescuentos
export interface Descuento {
  id_descuento: number; // ID único del descuento (AI PK)
  nombre: string; // Nombre del descuento (varchar 100)
  tipodescuento: string; // Tipo de descuento (varchar 50)
  valor: number | string; // Valor del descuento (decimal 10,2) - puede ser string desde BD
  estatusdescuento: string; // Estatus (varchar 20)
  requiereautorizacion: 'SI' | 'NO'; // Requiere autorización (enum SI, NO)
  fechaRegistroauditoria: Date | string; // Fecha de registro (datetime)
  usuarioauditoria: string; // Usuario de auditoría (varchar 100)
  fehamodificacionauditoria: Date | string; // Fecha de modificación (datetime) - nombre real de la BD
  idnegocio: number; // ID del negocio (int 11)
}

// Tipo para crear descuento
export interface CreateDescuentoData {
  nombre: string; // Nombre del descuento (requerido)
  tipodescuento: TipoDescuento; // Tipo de descuento (requerido)
  valor: number; // Valor del descuento (requerido)
  estatusdescuento: EstatusDescuento; // Estatus del descuento (requerido)
  requiereautorizacion: RequiereAutorizacion; // Requiere autorización (requerido)
  usuarioauditoria?: string; // Usuario de auditoría (opcional)
  idnegocio?: number; // ID del negocio (opcional)
}

// Tipo para actualizar descuento
export interface UpdateDescuentoData {
  nombre?: string; // Nombre del descuento (opcional)
  tipodescuento?: TipoDescuento; // Tipo de descuento (opcional)
  valor?: number; // Valor del descuento (opcional)
  estatusdescuento?: EstatusDescuento; // Estatus del descuento (opcional)
  requiereautorizacion?: RequiereAutorizacion; // Requiere autorización (opcional)
  usuarioauditoria?: string; // Usuario de auditoría (opcional)
}

// Tipos para roles de usuario
export type PrivilegioRol = '1' | '2' | '3' | '4'; // Niveles de privilegio
export type EstatusRol = 0 | 1; // Estatus del rol (0=inactivo, 1=activo)

// Tipo para rol de usuario según tabla tblposcrumenwebrolesdeusuario
export interface RolUsuario {
  idRol: number; // ID único del rol (AI PK)
  nombreRol: string; // Nombre del rol (varchar 100)
  descripcion: string; // Descripción del rol (text)
  privilegio: string; // Privilegio del rol (text)
  estatus: EstatusRol; // Estatus del rol (tinyint 1)
  fechaRegistroauditoria: Date | string; // Fecha de registro (datetime)
  usuarioauditoria: string; // Usuario de auditoría (varchar 100)
  fehamodificacionauditoria: Date | string; // Fecha de modificación (datetime)
  idnegocio: number; // ID del negocio (int 11)
}

// Tipo para crear rol de usuario
export interface CreateRolUsuarioData {
  nombreRol: string; // Nombre del rol (requerido)
  descripcion: string; // Descripción del rol (requerido)
  privilegio: PrivilegioRol; // Privilegio del rol (requerido)
  estatus: EstatusRol; // Estatus del rol (requerido)
  usuarioauditoria?: string; // Usuario de auditoría (opcional)
  idnegocio?: number; // ID del negocio (opcional)
}

// Tipo para actualizar rol de usuario
export interface UpdateRolUsuarioData {
  nombreRol?: string; // Nombre del rol (opcional)
  descripcion?: string; // Descripción del rol (opcional)
  privilegio?: PrivilegioRol; // Privilegio del rol (opcional)
  estatus?: EstatusRol; // Estatus del rol (opcional)
  usuarioauditoria?: string; // Usuario de auditoría (opcional)
}

// Tipos para usuarios del sistema
export type EstatusUsuario = 0 | 1; // Estatus del usuario (0=inactivo, 1=activo)

// Tipo para usuario según tabla tblposcrumenwebusuarios
export interface UsuarioSistema {
  idUsuario: number; // ID único del usuario (AI PK)
  idNegocio: number; // ID del negocio (int 11)
  idRol: number; // ID del rol (int 11)
  nombre: string; // Nombre del usuario (varchar 150)
  alias: string; // Alias del usuario (varchar 100)
  password?: string; // Contraseña hasheada (varchar 255) - opcional para consultas
  telefono: string; // Teléfono (varchar 150)
  cumple: Date | string; // Fecha de cumpleaños (date)
  frasepersonal: string; // Frase personal (text)
  fotoine: Buffer | string | null; // Foto INE (longblob)
  fotopersona: Buffer | string | null; // Foto personal (longblob)
  fotoavatar: Buffer | string | null; // Foto avatar (longblob)
  desempeno: number; // Desempeño del 0-5 (decimal 5,2)
  popularidad: number; // Popularidad del 0-5 (decimal 5,2)
  estatus: EstatusUsuario; // Estatus del usuario (tinyint 1)
  fechaRegistroauditoria: Date | string; // Fecha de registro (datetime)
  usuarioauditoria: string; // Usuario de auditoría (varchar 100)
  fehamodificacionauditoria: Date | string; // Fecha de modificación (datetime)
  // Campos adicionales de JOIN
  nombreNegocio?: string; // Nombre del negocio (join)
  nombreRol?: string; // Nombre del rol (join)
}

// Tipo para crear usuario del sistema
export interface CreateUsuarioSistemaData {
  idNegocio: number; // ID del negocio (requerido)
  idRol: number; // ID del rol (requerido)
  nombre: string; // Nombre del usuario (requerido)
  alias: string; // Alias del usuario (requerido)
  password: string; // Contraseña sin hashear (requerido)
  telefono: string; // Teléfono (requerido)
  cumple: Date | string; // Fecha de cumpleaños (requerido)
  frasepersonal?: string; // Frase personal (opcional)
  fotoine?: Buffer | string; // Foto INE (opcional)
  fotopersona?: Buffer | string; // Foto personal (opcional)
  fotoavatar?: Buffer | string; // Foto avatar (opcional)
  desempeno?: number; // Desempeño (opcional, default 0)
  popularidad?: number; // Popularidad (opcional, default 0)
  estatus?: EstatusUsuario; // Estatus (opcional, default 1)
  usuarioauditoria?: string; // Usuario de auditoría (opcional)
}

// Tipo para actualizar usuario del sistema
export interface UpdateUsuarioSistemaData {
  idNegocio?: number; // ID del negocio (opcional)
  idRol?: number; // ID del rol (opcional)
  nombre?: string; // Nombre del usuario (opcional)
  alias?: string; // Alias del usuario (opcional)
  password?: string; // Contraseña sin hashear (opcional)
  telefono?: string; // Teléfono (opcional)
  cumple?: Date | string; // Fecha de cumpleaños (opcional)
  frasepersonal?: string; // Frase personal (opcional)
  fotoine?: Buffer | string; // Foto INE (opcional)
  fotopersona?: Buffer | string; // Foto personal (opcional)
  fotoavatar?: Buffer | string; // Foto avatar (opcional)
  desempeno?: number; // Desempeño (opcional)
  popularidad?: number; // Popularidad (opcional)
  estatus?: EstatusUsuario; // Estatus (opcional)
  usuarioauditoria?: string; // Usuario de auditoría (opcional)
}

// Tipo para negocio (para dropdown)
export interface NegocioDropdown {
  idNegocio: number; // ID del negocio
  nombreNegocio: string; // Nombre del negocio
}

// Tipo para rol (para dropdown)
export interface RolDropdown {
  idRol: number; // ID del rol
  nombreRol: string; // Nombre del rol
}

// ===== TIPOS PARA UNIDADES DE MEDIDA DE COMPRA =====

// Tipo para las unidades de materia prima permitidas
export type UnidadMateriaPrima = 'Kg' | 'Lt' | 'Pza';

// Tipo para Unidad de Medida según tabla tblposrumenwebumcompra
export interface UMedida {
  idUmCompra: number; // ID único de la unidad de medida (AI PK)
  nombreUmCompra: string; // Nombre de la unidad de medida
  valor: number; // Valor decimal (12,3)
  umMatPrima: UnidadMateriaPrima; // Unidad de materia prima (Kg, Lt, Pza)
  valorConvertido: number; // Valor convertido decimal (12,3)
  fechaRegistroauditoria: Date; // Fecha de registro
  usuarioauditoria: string; // Usuario que registra
  fehamodificacionauditoria?: Date; // Fecha de modificación (opcional)
  idnegocio: number; // ID del negocio
}

// Tipo para crear nueva unidad de medida
export interface CreateUMedidaData {
  nombreUmCompra: string; // Nombre de la unidad (requerido)
  valor: number; // Valor (requerido)
  umMatPrima: UnidadMateriaPrima; // Unidad de materia prima (requerido)
  valorConvertido: number; // Valor convertido (requerido)
  usuarioauditoria: string; // Usuario (requerido)
  idnegocio: number; // ID del negocio (requerido)
}

// Tipo para actualizar unidad de medida
export interface UpdateUMedidaData {
  nombreUmCompra?: string; // Nombre de la unidad (opcional)
  valor?: number; // Valor (opcional)
  umMatPrima?: UnidadMateriaPrima; // Unidad de materia prima (opcional)
  valorConvertido?: number; // Valor convertido (opcional)
  usuarioauditoria?: string; // Usuario (opcional)
}

// ===== TIPOS PARA INSUMOS =====

// Tipo para las unidades de medida de insumos permitidas
export type UnidadMedidaInsumo = 'Kg' | 'Lt' | 'Pza';

// Tipo para Insumo Web según tabla tblposcrumenwebinsumos  
export interface InsumoWeb {
  id_insumo: number; // ID único del insumo (AI PK)
  nombre: string; // Nombre del insumo
  unidad_medida: UnidadMedidaInsumo; // Unidad de medida (Kg, Lt, Pza)
  stock_actual: number; // Stock actual decimal (10,2)
  stock_minimo: number; // Stock mínimo decimal (10,2)
  costo_promedio_ponderado: number; // Costo promedio ponderado decimal (12,4)
  precio_venta: number; // Precio de venta decimal (12,2)
  idinocuidad: string; // ID inocuidad varchar(50)
  id_cuentacontable_insumo: string; // ID cuenta contable varchar(100)
  activo: boolean; // Activo tinyint(1) -> boolean
  inventariable: boolean; // Inventariable tinyint(1) -> boolean
  fechaRegistroauditoria: Date; // Fecha de registro
  usuarioauditoria: string; // Usuario que registra
  fehamodificacionauditoria?: Date; // Fecha de modificación (opcional)
  idnegocio: number; // ID del negocio
}

// Tipo para crear nuevo insumo web
export interface CreateInsumoWebData {
  nombre: string; // Nombre del insumo
  unidad_medida: string; // Unidad de medida (Kg, Lt, Pza)
  stock_actual: number; // Stock actual
  stock_minimo: number; // Stock mínimo
  costo_promedio_ponderado?: number; // Costo promedio ponderado (opcional)
  precio_venta?: number; // Precio de venta (opcional)
  idinocuidad?: string; // ID de inocuidad (opcional)
  id_cuentacontable?: string; // ID de cuenta contable (opcional)
  activo?: boolean; // Estado del insumo (activo/inactivo)
  inventariable?: boolean; // Si el insumo es inventariable
}

// Tipo para actualizar insumo web
export interface UpdateInsumoWebData {
  nombre?: string; // Nombre del insumo (opcional)
  unidad_medida?: UnidadMedidaInsumo; // Unidad de medida (opcional)
  stock_actual?: number; // Stock actual (opcional)
  stock_minimo?: number; // Stock mínimo (opcional)
  id_cuentacontable_insumo?: string; // ID cuenta contable (opcional)
  activo?: boolean; // Activo (opcional)
  inventariable?: boolean; // Inventariable (opcional)
  usuarioauditoria?: string; // Usuario (opcional)
}

// ===== TIPOS PARA CUENTAS CONTABLES =====

// Tipo para naturaleza de cuenta contable
export type NaturalezaCuentaContable = 'COMPRA' | 'GASTO';

// Tipo para tipo de cuenta contable
export type TipoCuentaContable = 
  // Para COMPRA
  | 'Inventario' 
  | 'Activo Fijo' 
  | 'Servicio' 
  | 'Administrativa' 
  | 'Eventual'
  // Para GASTO (reutiliza 'Administrativa' y 'Eventual')
  | 'Operativo' 
  | 'Financiero';

// Tipo para Cuenta Contable según tabla tblposcrumenwebcuentacontable
export interface CuentaContable {
  id_cuentacontable: number; // ID único de la cuenta contable (AI PK)
  naturalezacuentacontable: NaturalezaCuentaContable; // Naturaleza (COMPRA, GASTO)
  nombrecuentacontable: string; // Nombre de la cuenta contable varchar(150)
  tipocuentacontable: TipoCuentaContable; // Tipo de cuenta contable varchar(100)
  fechaRegistroauditoria: Date; // Fecha de registro
  usuarioauditoria: string; // Usuario que registra
  fechamodificacionauditoria?: Date; // Fecha de modificación (opcional)
  idnegocio: number; // ID del negocio
}

// Tipo para crear nueva cuenta contable
export interface CreateCuentaContableData {
  naturalezacuentacontable: NaturalezaCuentaContable; // Naturaleza (requerido)
  nombrecuentacontable: string; // Nombre de la cuenta (requerido)
  tipocuentacontable: TipoCuentaContable; // Tipo de cuenta (requerido)
  usuarioauditoria: string; // Usuario (requerido)
  idnegocio: number; // ID del negocio (requerido)
}

// Tipo para actualizar cuenta contable
export interface UpdateCuentaContableData {
  naturalezacuentacontable?: NaturalezaCuentaContable; // Naturaleza (opcional)
  nombrecuentacontable?: string; // Nombre de la cuenta (opcional)
  tipocuentacontable?: TipoCuentaContable; // Tipo de cuenta (opcional)
  usuarioauditoria?: string; // Usuario (opcional)
}

// Tipo para negocio según tabla tblposcrumenwebnegocio
export interface NegocioConfiguracion {
  idNegocio: number; // ID único del negocio (AI PK)
  numeronegocio: string; // Número del negocio
  nombreNegocio: string; // Nombre del negocio
  rfcnegocio: string; // RFC del negocio
  direccionfiscalnegocio: string; // Dirección fiscal
  contactonegocio: string; // Contacto del negocio
  logotipo?: Buffer; // Logotipo (longblob - opcional)
  telefonocontacto: string; // Teléfono de contacto
  estatusnegocio: boolean; // Estatus del negocio (0/1)
  fechaRegistroauditoria: Date; // Fecha de registro
  usuarioauditoria: string; // Usuario auditoría
  fehamodificacionauditoria?: Date; // Fecha modificación (opcional)
}

// Tipo para crear negocio
export interface CreateNegocioConfiguracionData {
  numeronegocio: string; // Número del negocio (requerido)
  nombreNegocio: string; // Nombre del negocio (requerido)
  rfcnegocio: string; // RFC del negocio (requerido)
  direccionfiscalnegocio: string; // Dirección fiscal (requerido)
  contactonegocio: string; // Contacto del negocio (requerido)
  logotipo?: Buffer; // Logotipo (opcional)
  telefonocontacto: string; // Teléfono de contacto (requerido)
  estatusnegocio: boolean; // Estatus del negocio (requerido)
  usuarioauditoria: string; // Usuario auditoría (requerido)
}

// Tipo para actualizar negocio
export interface UpdateNegocioConfiguracionData {
  numeronegocio?: string; // Número del negocio (opcional)
  nombreNegocio?: string; // Nombre del negocio (opcional)
  rfcnegocio?: string; // RFC del negocio (opcional)
  direccionfiscalnegocio?: string; // Dirección fiscal (opcional)
  contactonegocio?: string; // Contacto del negocio (opcional)
  logotipo?: Buffer; // Logotipo (opcional)
  telefonocontacto?: string; // Teléfono de contacto (opcional)
  estatusnegocio?: boolean; // Estatus del negocio (opcional)
  usuarioauditoria?: string; // Usuario auditoría (opcional)
}

// Tipo para parámetros de negocio según tabla tblposcrumenwebparametrosnegocio
export interface ParametrosNegocioCompletos {
  idParametro: number; // ID único del parámetro (AI PK)
  idNegocio: number; // ID del negocio
  telefonoNegocio: string; // Teléfono del negocio
  telefonoPedidos: string; // Teléfono para pedidos
  ubicacion: string; // Ubicación del negocio
  tipoNegocio: string; // Tipo de negocio
  impresionRecibo: boolean; // Impresión de recibo (0/1)
  impresionTablero: boolean; // Impresión de tablero (0/1)
  envioWhats: boolean; // Envío por WhatsApp (0/1)
  encabezado: string; // Encabezado de recibos
  pie: string; // Pie de recibos
  impresionComanda: boolean; // Impresión de comanda (0/1)
  envioMensaje: boolean; // Envío de mensaje (0/1)
  estatus: boolean; // Estatus (activo/inactivo)
  fechaRegistroAuditoria: Date; // Fecha de registro
  usuarioAuditoria: string; // Usuario auditoría
  fechaModificacionAuditoria?: Date; // Fecha modificación (opcional)
}

// Tipo para crear parámetros de negocio completos
export interface CreateParametrosNegocioCompletosData {
  idNegocio: number; // ID del negocio (requerido)
  telefonoNegocio: string; // Teléfono del negocio (requerido)
  telefonoPedidos: string; // Teléfono para pedidos (requerido)
  ubicacion: string; // Ubicación del negocio (requerido)
  tipoNegocio: string; // Tipo de negocio (requerido)
  impresionRecibo: boolean; // Impresión de recibo (requerido)
  impresionTablero: boolean; // Impresión de tablero (requerido)
  envioWhats: boolean; // Envío por WhatsApp (requerido)
  encabezado: string; // Encabezado de recibos (requerido)
  pie: string; // Pie de recibos (requerido)
  impresionComanda: boolean; // Impresión de comanda (requerido)
  envioMensaje: boolean; // Envío de mensaje (requerido)
  estatus: boolean; // Estatus (requerido)
  usuarioAuditoria: string; // Usuario auditoría (requerido)
}

// Tipo para actualizar parámetros de negocio completos
export interface UpdateParametrosNegocioCompletosData {
  telefonoNegocio?: string; // Teléfono del negocio (opcional)
  telefonoPedidos?: string; // Teléfono para pedidos (opcional)
  ubicacion?: string; // Ubicación del negocio (opcional)
  tipoNegocio?: string; // Tipo de negocio (opcional)
  impresionRecibo?: boolean; // Impresión de recibo (opcional)
  impresionTablero?: boolean; // Impresión de tablero (opcional)
  envioWhats?: boolean; // Envío por WhatsApp (opcional)
  encabezado?: string; // Encabezado de recibos (opcional)
  pie?: string; // Pie de recibos (opcional)
  impresionComanda?: boolean; // Impresión de comanda (opcional)
  envioMensaje?: boolean; // Envío de mensaje (opcional)
  estatus?: boolean; // Estatus (opcional)
  usuarioAuditoria?: string; // Usuario auditoría (opcional)
}

// Tipo combinado para negocio configuración completo (negocio + parámetros)
export interface NegocioConfiguracionCompleto extends NegocioConfiguracion {
  parametros?: ParametrosNegocioCompletos; // Parámetros asociados al negocio
}

// Extend the Request interface to include user property
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    alias: string;
    idNegocio: number;
  };
}

