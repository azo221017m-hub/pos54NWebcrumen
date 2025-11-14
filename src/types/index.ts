// src/types/index.ts
// Tipos TypeScript para el frontend de POSWEBCrumen

// Tipo para las pantallas de la aplicación
export type ScreenType = 
  | 'presentation' // Pantalla de presentación inicial
  | 'login' // Pantalla de login
  | 'home' // Pantalla principal/dashboard
  | 'tablero-inicial' // Nuevo tablero inicial
  | 'config-categorias' // Configuración de categorías
  | 'config-mesas' // Configuración de mesas
  | 'config-descuentos' // Configuración de descuentos
  | 'config-roles' // Configuración de roles de usuario
  | 'config-usuarios' // Configuración de usuarios del sistema
  | 'config-umedida' // Configuración de unidades de medida
  | 'config-insumos' // Configuración de insumos
  | 'config-cuenta-contable' // Configuración de cuentas contables
  | 'config-proveedores' // Configuración de proveedores
  | 'config-clientes' // Configuración de clientes
  | 'config-productos' // Configuración de productos
  | 'config-negocios' // Configuración de negocios
  | 'config-perfil' // Configuración de perfil
  | 'iniciar-venta' // Iniciar nueva venta
  | 'indicadores-ventas' // Indicadores de ventas
  | 'sistema-configuracion' // Configuración del sistema
  | 'config-moderadores' // Configuración de moderadores
  | 'config-categoria-moderadores' // Configuración de categorías de moderadores
  | 'config-asigna-moderadores';

// Tipo para la respuesta estándar de la API
export interface ApiResponse<T = any> {
  success: boolean; // Indica si la operación fue exitosa
  message: string; // Mensaje descriptivo de la respuesta
  data?: T; // Datos opcionales de la respuesta
  error?: string; // Mensaje de error opcional
  authorization?: {
    idNegocio: number; // ID del negocio
    usuarioAuditoria: string; // Usuario auditoria
  }; // Información de autorización opcional
}

// Tipo para datos de usuario
export interface Usuario {
  idUsuario: number; // ID único del usuario
  idNegocio: number; // ID del negocio al que pertenece
  idRol: number; // ID del rol del usuario
  nombre: string; // Nombre completo del usuario
  alias: string; // Alias del usuario para login
  telefono: string; // Teléfono del usuario
  cumple: string; // Fecha de cumpleaños
  frasepersonal: string; // Frase personal
  desempeno: number; // Desempeño del usuario
  popularidad: number; // Popularidad del usuario
  estatus: number; // Estado del usuario (1=activo, 9=bloqueado)
  fechaRegistroauditoria: string; // Fecha de registro del usuario
  usuarioauditoria: string; // Usuario que realizó la última modificación
  fehamodificacionauditoria: string; // Fecha de última modificación
}

// Tipo para datos de negocio
export interface Negocio {
  idNegocio: number; // ID único del negocio
  numerocliente: string; // Número de cliente del negocio
  nombreNegocio: string; // Nombre del negocio
  rfc: string; // RFC del negocio
  direccion: string; // Dirección completa del negocio
  telefono: string; // Teléfono de contacto
  estatusCliente: number; // Estado del cliente (1=activo, 0=inactivo)
  fechaRegistro: string; // Fecha de registro del negocio
  fechaActualizacion: string; // Fecha de última actualización
  usuario: string; // Usuario que registró el negocio
}

// Tipo para datos de login
export interface LoginData {
  usuario: string; // Nombre de usuario
  password: string; // Contraseña
  idNegocio?: number; // ID del negocio (opcional)
}

// Tipo para el contexto de autenticación
export interface AuthContextType {
  user: Usuario | null; // Usuario autenticado actual
  isAuthenticated: boolean; // Estado de autenticación
  isLoading: boolean; // Estado de carga
  login: (loginData: LoginData) => Promise<boolean>; // Función de login
  logout: () => void; // Función de logout
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
  usuarioAuditoria?: string; // Usuario que crea el registro
}

// Tipo para datos de registro de negocio
export interface CreateNegocioData {
  numerocliente: string; // Número de cliente
  nombreNegocio: string; // Nombre del negocio
  rfc: string; // RFC
  direccion: string; // Dirección
  telefono: string; // Teléfono
  usuario?: string; // Usuario que crea el registro
}

// Tipo para datos de rol
export interface Rol {
  idRol: number; // ID único del rol
  nombreRol: string; // Nombre del rol
  descripcion: string; // Descripción del rol
  estatus: number; // Estado del rol (1=activo, 0=inactivo)
  fechaRegistro: string; // Fecha de registro
  fechaActualizacion: string; // Fecha de actualización
  usuario: string; // Usuario que modificó
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

// Tipo para parámetros de negocio
export interface ParametrosNegocio {
  idParametro: number; // ID único del parámetro
  idNegocio: number; // ID del negocio asociado
  tipoNegocio: string; // Tipo de negocio
  impresionRecibo: number; // Impresión de recibo (1=sí, 0=no)
  encabezado: string; // Encabezado del recibo
  pie: string; // Pie del recibo
  tipoRecibo: string; // Tipo de recibo
  envioMensaje: number; // Envío de mensaje (1=sí, 0=no)
  estatus: number; // Estado (1=activo, 0=inactivo)
  fechaRegistro: string; // Fecha de registro
  fechaActualizacion: string; // Fecha de actualización
  usuario: string; // Usuario que modificó
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

// Tipo para registro completo de negocio (cliente + negocio + parámetros)
export interface CreateNegocioCompletoData {
  cliente: CreateClienteData; // Datos del cliente
  negocio: {
    nombreNegocio: string; // Nombre del negocio
    rfc: string; // RFC
    direccion: string; // Dirección
    telefono: string; // Teléfono
    estatusCliente?: number; // Estado del cliente (1=activo, 0=inactivo)
    usuario?: string; // Usuario que crea el registro
  };
  parametros: CreateParametrosNegocioData; // Parámetros del negocio
}

// Tipo para las pantallas de la aplicación

// Tipo para los indicadores del dashboard
export interface Indicator {
  id: string; // ID único del indicador
  title: string; // Título del indicador
  value: string | number; // Valor a mostrar
  description: string; // Descripción del indicador
  icon: string; // Icono a mostrar
  color: string; // Color del indicador
}

// Tipo para datos de categoría
export interface Categoria {
  idCategoria: number; // ID único de la categoría
  nombre: string; // Nombre de la categoría
  descripcion: string; // Descripción de la categoría
  estatus: number; // Estado de la categoría (1=activo, 0=inactivo)
  fechaRegistro: string; // Fecha de registro
  fechaActualizacion: string; // Fecha de última actualización
  usuario: string; // Usuario que registró la categoría
}

// Tipo para datos de registro de categoría
export interface CreateCategoriaData {
  nombre: string; // Nombre de la categoría
  descripcion: string; // Descripción de la categoría
  estatus?: number; // Estado (1=activo, 0=inactivo)
  usuario?: string; // Usuario que crea el registro
}

// Tipo para datos de producto
export interface Producto {
  idProducto: number; // ID único del producto
  idCategoria: number; // ID de la categoría
  idReceta?: number; // ID de la receta (opcional)
  nombre: string; // Nombre del producto
  descripcion: string; // Descripción del producto
  precio: number; // Precio del producto
  existencia: number; // Existencia disponible
  estatus: number; // Estado del producto (1=activo, 0=inactivo)
  fechaRegistro: string; // Fecha de registro
  fechaActualizacion: string; // Fecha de última actualización
  usuario: string; // Usuario que registró el producto
  idNegocio: number; // ID del negocio al que pertenece
  imagenProducto?: string; // Imagen del producto (base64)
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
  imagenProducto?: File; // Archivo de imagen del producto
}

// Tipo para datos de insumo (según tabla tblposcrumenwebinsumos)
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

// Tipo para datos de cuenta contable (para dropdown)
export interface CuentaContableOption {
  idcuentacontable: number;
  nombrecuentacontable: string;
}

// Tipo para producto en un pedido
export interface PedidoProducto {
  nombre: string; // Nombre del producto
  cantidad: number; // Cantidad solicitada
  precio: number; // Precio unitario
  subtotal: number; // Subtotal del producto (cantidad * precio)
}

// Tipo para pedido tipo comanda
export interface Pedido {
  idPedido: string; // ID único del pedido
  numeroComanda: string; // Número de comanda
  cliente: string; // Nombre del cliente
  productos: PedidoProducto[]; // Lista de productos en el pedido
  total: number; // Total del pedido
  formaPago: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'MIXTO'; // Forma de pago
  estado: 'PENDIENTE' | 'PREPARANDO' | 'LISTO' | 'ENTREGADO' | 'CANCELADO'; // Estado del pedido
  fechaPedido: string; // Fecha y hora del pedido
  horaPedido: string; // Hora específica del pedido
  mesa?: string; // Mesa asignada (opcional)
  observaciones?: string; // Observaciones especiales (opcional)
}

// Tipo para mesa según tabla tblposcrumenwebmesas (versión actualizada)
export interface Mesa {
  idmesa: number; // ID único de la mesa
  nombremesa: string; // Nombre de la mesa
  numeromesa: number; // Número de la mesa
  cantcomensales: number; // Cantidad de comensales
  estatusmesa: 'DISPONIBLE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO'; // Estado de la mesa
  tiempodeinicio: string; // Tiempo de inicio
  tiempoactual: string; // Tiempo actual
  estatustiempo: 'EN_CURSO' | 'DEMORA' | 'INACTIVA'; // Estado del tiempo
  fechaRegistroauditoria: string; // Fecha de registro
  usuarioauditoria: string; // Usuario de auditoría
  fehamodificacionauditoria: string; // Fecha de modificación
  idnegocio: number; // ID del negocio
}

// Tipo para crear/actualizar mesa (versión actualizada)
export interface CreateMesaData {
  nombremesa: string; // Nombre de la mesa
  numeromesa: number; // Número de la mesa
  cantcomensales: number; // Cantidad de comensales
  estatusmesa: 'DISPONIBLE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO'; // Estado de la mesa
}

// Tipo para datos de proveedor
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

// Tipo para crear un proveedor
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

// Tipo para unidades de medida de compra
export interface UMMovimiento {
  idUmCompra: number; // ID único de la unidad de medida
  nombreUmCompra: string; // Nombre de la unidad de medida (máx 100 caracteres)
  valor: number; // Valor decimal de la unidad de medida
  umMatPrima: 'Kl' | 'Lt' | 'gr' | 'ml' | 'pza'; // Unidad de materia prima (valores permitidos)
  valorConvertido: number; // Valor convertido decimal
  fechaRegistro: string; // Fecha de registro
  fechaActualizacion: string; // Fecha de última actualización
  usuario: string; // Usuario que realizó la operación
}

// Tipo para crear una unidad de medida de compra
export interface CreateUMMovimientoData {
  nombreUmCompra: string; // Nombre de la unidad de medida (requerido)
  valor: number; // Valor decimal de la unidad de medida (requerido)
  umMatPrima: 'Kl' | 'Lt' | 'gr' | 'ml' | 'pza'; // Unidad de materia prima (requerido)
  valorConvertido: number; // Valor convertido decimal (requerido)
  usuario?: string; // Usuario que crea el registro (opcional)
}

// Tipo para actualizar una unidad de medida de compra
export interface UpdateUMMovimientoData {
  nombreUmCompra: string; // Nombre de la unidad de medida (requerido)
  valor: number; // Valor decimal de la unidad de medida (requerido)
  umMatPrima: 'Kl' | 'Lt' | 'gr' | 'ml' | 'pza'; // Unidad de materia prima (requerido)
  valorConvertido: number; // Valor convertido decimal (requerido)
  usuario?: string; // Usuario que actualiza el registro (opcional)
}

// Tipos para naturaleza de movimiento contable
export type NaturalezaMovimiento = 'COMPRA' | 'GASTO';

// Tipos para categorías de movimiento según naturaleza
export type CategoriaCompra = 'Inventario' | 'activo fijo' | 'servicios' | 'administrativas' | 'extraodinarias' | 'inversión';
export type CategoriaGasto = 'operación' | 'financiero' | 'extraorinario';

// Tipo para cuentas contables
export interface TipoMovimiento {
  idcuentacontable: number; // ID único de la cuenta contable
  nombrecuentacontable: string; // Nombre de la cuenta contable (máx 100 caracteres)
  categoriacuentacontable: CategoriaCompra | CategoriaGasto; // Categoría según naturaleza
  naturalezacuentacontable: NaturalezaMovimiento; // Naturaleza del movimiento (COMPRA|GASTO)
}

// Tipo para crear una cuenta contable
export interface CreateTipoMovimientoData {
  nombrecuentacontable: string; // Nombre de la cuenta contable (requerido)
  categoriacuentacontable: CategoriaCompra | CategoriaGasto; // Categoría según naturaleza (requerido)
  naturalezacuentacontable: NaturalezaMovimiento; // Naturaleza del movimiento (requerido)
}

// Tipo para actualizar una cuenta contable
export interface UpdateTipoMovimientoData {
  nombrecuentacontable: string; // Nombre de la cuenta contable (requerido)
  categoriacuentacontable: CategoriaCompra | CategoriaGasto; // Categoría según naturaleza (requerido)
  naturalezacuentacontable: NaturalezaMovimiento; // Naturaleza del movimiento (requerido)
}

// Tipos para descuentos
export type TipoDescuento = '$' | '%'; // Tipo de descuento: peso o porcentaje
export type EstatusDescuento = 'ACTIVO' | 'INACTIVO'; // Estatus del descuento
export type RequiereAutorizacion = 'SI' | 'NO'; // Si requiere autorización

// Tipo para descuento según tabla tblposcrumenwebdescuentos
export interface Descuento {
  id_descuento: number; // ID único del descuento (AI PK)
  nombre: string; // Nombre del descuento (varchar 100)
  tipodescuento: TipoDescuento; // Tipo de descuento ($, %)
  valor: number | string; // Valor del descuento (decimal 10,2) - puede ser string desde BD
  estatusdescuento: EstatusDescuento; // Estatus (ACTIVO, INACTIVO)
  requiereautorizacion: RequiereAutorizacion; // Requiere autorización (SI, NO)
  fechaRegistroauditoria: Date | string; // Fecha de registro
  usuarioauditoria: string; // Usuario de auditoría
  fehamodificacionauditoria: Date | string; // Fecha de modificación (nombre real de BD)
  idnegocio: number; // ID del negocio
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
  privilegio: PrivilegioRol; // Privilegio del rol
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
  password?: string; // Contraseña hasheada (varchar 255) - opcional para mostrar
  telefono: string; // Teléfono (varchar 150)
  cumple: Date | string; // Fecha de cumpleaños (date)
  frasepersonal: string; // Frase personal (text)
  fotoine?: string; // Foto INE base64 (longblob)
  fotopersona?: string; // Foto personal base64 (longblob)
  fotoavatar?: string; // Foto avatar base64 (longblob)
  desempeno: number; // Desempeño del 0-5 (decimal 5,2)
  popularidad: number; // Popularidad del 0-5 (decimal 5,2)
  estatus: EstatusUsuario; // Estatus del usuario (tinyint 1)
  fechaRegistroauditoria: Date | string; // Fecha de registro (datetime)
  usuarioauditoria: string; // Usuario de auditoría (varchar 100)
  fehamodificacionauditoria: Date | string; // Fecha de modificación (datetime)
  // Campos relacionados (para mostrar en el frontend)
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
  fotoine?: string; // Foto INE base64 (opcional)
  fotopersona?: string; // Foto personal base64 (opcional)
  fotoavatar?: string; // Foto avatar base64 (opcional)
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
  fotoine?: string; // Foto INE base64 (opcional)
  fotopersona?: string; // Foto personal base64 (opcional)
  fotoavatar?: string; // Foto avatar base64 (opcional)
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

// Constante con las opciones de unidades de materia prima
export const UNIDADES_MATERIA_PRIMA: { value: UnidadMateriaPrima; label: string }[] = [
  { value: 'Kg', label: 'Kilogramos (Kg)' },
  { value: 'Lt', label: 'Litros (Lt)' },
  { value: 'Pza', label: 'Piezas (Pza)' }
];

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

// ===== TIPOS PARA INSUMOS WEB =====

// Tipo para las unidades de medida de insumos permitidas
export type UnidadMedidaInsumo = 'Kg' | 'Lt' | 'Pza';

// Constante con las opciones de unidades de medida para insumos
export const UNIDADES_MEDIDA_INSUMO: { value: UnidadMedidaInsumo; label: string }[] = [
  { value: 'Kg', label: 'Kilogramos (Kg)' },
  { value: 'Lt', label: 'Litros (Lt)' },
  { value: 'Pza', label: 'Piezas (Pza)' }
];

// Constante con las opciones de cuentas contables
export const CUENTAS_CONTABLES: { value: string; label: string }[] = [
  { value: '501', label: '501 - Inventarios' },
  { value: '502', label: '502 - Materia Prima' },
  { value: '503', label: '503 - Productos en Proceso' },
  { value: '504', label: '504 - Productos Terminados' },
  { value: '505', label: '505 - Suministros' }
];

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
  nombre: string; // Nombre del insumo (requerido)
  unidad_medida: UnidadMedidaInsumo; // Unidad de medida (requerido)
  stock_actual: number; // Stock actual (requerido)
  stock_minimo: number; // Stock mínimo (requerido)
  id_cuentacontable_insumo: string; // ID cuenta contable (requerido)
  activo: boolean; // Activo (requerido)
  inventariable: boolean; // Inventariable (requerido)
  usuarioauditoria: string; // Usuario (requerido)
  idnegocio: number; // ID del negocio (requerido)
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

// Constante con las opciones de naturaleza de cuenta contable
export const NATURALEZAS_CUENTA_CONTABLE: { value: NaturalezaCuentaContable; label: string }[] = [
  { value: 'COMPRA', label: 'Compra' },
  { value: 'GASTO', label: 'Gasto' }
];

// Constante con las opciones de tipo de cuenta para COMPRA
export const TIPOS_CUENTA_COMPRA: { value: TipoCuentaContable; label: string }[] = [
  { value: 'Inventario', label: 'Inventario' },
  { value: 'Activo Fijo', label: 'Activo Fijo' },
  { value: 'Servicio', label: 'Servicio' },
  { value: 'Administrativa', label: 'Administrativa' },
  { value: 'Eventual', label: 'Eventual' }
];

// Constante con las opciones de tipo de cuenta para GASTO
export const TIPOS_CUENTA_GASTO: { value: TipoCuentaContable; label: string }[] = [
  { value: 'Operativo', label: 'Operativo' },
  { value: 'Financiero', label: 'Financiero' },
  { value: 'Eventual', label: 'Eventual' }
];

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

// Tipos para ConfigNegocios - Frontend

// Tipo para negocio de configuración
export interface NegocioConfiguracion {
  idNegocio: number; // ID único del negocio
  numeronegocio: string; // Número del negocio
  nombreNegocio: string; // Nombre del negocio
  rfcnegocio: string; // RFC del negocio
  direccionfiscalnegocio: string; // Dirección fiscal
  contactonegocio: string; // Contacto del negocio
  logotipo?: string; // Logotipo en base64 (para display)
  telefonocontacto: string; // Teléfono de contacto
  estatusnegocio: boolean; // Estatus del negocio
  fechaRegistroauditoria: string; // Fecha de registro
  usuarioauditoria: string; // Usuario auditoría
  fehamodificacionauditoria?: string; // Fecha modificación (opcional)
}

// Tipo para parámetros de negocio completos
export interface ParametrosNegocioCompletos {
  idParametro: number; // ID único del parámetro
  idNegocio: number; // ID del negocio
  telefonoNegocio: string; // Teléfono del negocio
  telefonoPedidos: string; // Teléfono para pedidos
  ubicacion: string; // Ubicación del negocio
  tipoNegocio: string; // Tipo de negocio
  impresionRecibo: boolean; // Impresión de recibo
  impresionTablero: boolean; // Impresión de tablero
  envioWhats: boolean; // Envío por WhatsApp
  encabezado: string; // Encabezado de recibos
  pie: string; // Pie de recibos
  impresionComanda: boolean; // Impresión de comanda
  envioMensaje: boolean; // Envío de mensaje
  estatus: boolean; // Estatus (activo/inactivo)
  fechaRegistroAuditoria: string; // Fecha de registro
  usuarioAuditoria: string; // Usuario auditoría
  fechaModificacionAuditoria?: string; // Fecha modificación (opcional)
}

// Tipo combinado para negocio configuración completo
export interface NegocioConfiguracionCompleto extends NegocioConfiguracion {
  parametros?: ParametrosNegocioCompletos; // Parámetros asociados al negocio
}

// Tipo para crear negocio
export interface CreateNegocioConfiguracionData {
  numeronegocio: string; // Número del negocio (requerido)
  nombreNegocio: string; // Nombre del negocio (requerido)
  rfcnegocio: string; // RFC del negocio (requerido)
  direccionfiscalnegocio: string; // Dirección fiscal (requerido)
  contactonegocio: string; // Contacto del negocio (requerido)
  logotipo?: File; // Logotipo como archivo (opcional)
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
  logotipo?: File; // Logotipo como archivo (opcional)
  telefonocontacto?: string; // Teléfono de contacto (opcional)
  estatusnegocio?: boolean; // Estatus del negocio (opcional)
  usuarioauditoria?: string; // Usuario auditoría (opcional)
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

// Tipo para la categoría de moderador
export interface CategoriaModerador {
  id: number; // ID único de la categoría
  nombre: string; // Nombre de la categoría
  descripcion: string; // Descripción de la categoría
}

// Tipo para datos de moderador
export interface Moderador {
  id: number; // ID único del moderador
  nombre: string; // Nombre del moderador
  email: string; // Email del moderador
}





