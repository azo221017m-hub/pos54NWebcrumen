// src/services/api.ts
// Servicio para comunicación con la API del backend POSWEBCrumen

import type { 
  ApiResponse, 
  LoginData, 
  Usuario, 
  Negocio, 
  CreateNegocioData,
  UsuarioSistema,
  CreateUsuarioSistemaData,
  UpdateUsuarioSistemaData,
  NegocioDropdown,
  RolDropdown,
  UMedida,
  CreateUMedidaData,
  UpdateUMedidaData,
  Cliente,
  CreateClienteData,
  UpdateClienteData
} from '../types';

// URL base de la API - se obtiene de variables de entorno o usa localhost por defecto
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Clase principal del servicio API que maneja todas las llamadas a la API
class ApiService {
  private baseURL: string; // URL base de la API

  constructor() {
    this.baseURL = API_BASE_URL; // Inicializa la URL base
    console.log('🌐 ApiService inicializado con URL:', this.baseURL); // Log de inicialización
  }

  // Método privado para realizar peticiones HTTP
  private async request<T>(
    endpoint: string, // Endpoint de la API
    options: RequestInit = {} // Opciones de la petición
  ): Promise<ApiResponse<T>> {
    try {
      console.log(`📡 Realizando petición: ${options.method || 'GET'} ${endpoint}`); // Log de petición
      
      // Construye la URL completa
      const url = `${this.baseURL}${endpoint}`;
      console.log(`🌐 URL completa: ${url}`); // Log de URL
      
      // Configuración por defecto de la petición
      const config: RequestInit = {
        ...options, // Opciones adicionales
      };

      // Solo agregar Content-Type si no es FormData
      if (!(options.body instanceof FormData)) {
        config.headers = {
          'Content-Type': 'application/json', // Tipo de contenido JSON
          ...options.headers, // Headers adicionales
        };
      } else {
        // Para FormData, usar headers proporcionados (sin Content-Type)
        config.headers = {
          ...options.headers, // Headers adicionales
        };
      }

      console.log(`⚙️ Configuración de la petición:`, config); // Log de configuración

      // Realiza la petición
      const response = await fetch(url, config);
      console.log(`📊 Status de respuesta: ${response.status}`); // Log de status
      
      // Verificar si la respuesta es válida antes de analizar el JSON
      if (!response.ok) {
        console.error('❌ Respuesta HTTP no válida:', response.status, response.statusText);
        return {
          success: false,
          message: `Error HTTP: ${response.status} ${response.statusText}`,
          error: 'HTTP_ERROR',
        };
      }
      
      // Parsea la respuesta JSON
      const data: ApiResponse<T> = await response.json();
      console.log(`📦 Datos de respuesta completos:`, data); // Log de datos completos
      
      // Log del resultado
      if (data.success) {
        console.log('✅ Petición exitosa:', data.message); // Log de éxito
      } else {
        console.log('❌ Error en petición:', data.message); // Log de error
      }
      
      return data; // Retorna los datos
      
    } catch (error) {
      console.error('💥 Error en petición API:', error); // Log de error de red
      
      // Retorna error estructurado
      return {
        success: false,
        message: 'Error de conexión con el servidor',
        error: 'NETWORK_ERROR'
      };
    }
  }

  // Método para login de usuarios
  async login(loginData: LoginData): Promise<ApiResponse<{ user: Usuario }>> {
    console.log('🔐 Iniciando login para usuario:', loginData.usuario); // Log de login
    
    return this.request<{ user: Usuario }>('/api/auth/login', {
      method: 'POST', // Método POST
      body: JSON.stringify(loginData), // Datos de login en JSON
    });
  }

  // Método para obtener todos los usuarios del sistema
  async getUsuarios(): Promise<ApiResponse<UsuarioSistema[]>> {
    console.log('👥 Obteniendo lista de usuarios del sistema'); // Log de consulta
    
    return this.request<UsuarioSistema[]>('/api/usuarios', {
      method: 'GET', // Método GET
    });
  }

  // Método para crear un nuevo usuario del sistema
  async createUsuario(userData: CreateUsuarioSistemaData): Promise<ApiResponse<{ idUsuario: number; alias: string }>> {
    console.log('👤 Creando nuevo usuario del sistema:', userData.alias); // Log de creación
    
    return this.request<{ idUsuario: number; alias: string }>('/api/usuarios', {
      method: 'POST', // Método POST
      body: JSON.stringify(userData), // Datos del usuario en JSON
    });
  }

  // Método para actualizar un usuario existente del sistema
  async updateUsuario(id: number, userData: UpdateUsuarioSistemaData): Promise<ApiResponse<{ idUsuario: number }>> {
    console.log('✏️ Actualizando usuario del sistema ID:', id); // Log de actualización
    
    return this.request<{ idUsuario: number }>(`/api/usuarios/${id}`, {
      method: 'PUT', // Método PUT
      body: JSON.stringify(userData), // Datos actualizados en JSON
    });
  }

  // Método para eliminar un usuario del sistema (soft delete)
  async deleteUsuario(id: number): Promise<ApiResponse<{ idUsuario: number }>> {
    console.log('🗑️ Eliminando usuario del sistema ID:', id); // Log de eliminación
    
    return this.request<{ idUsuario: number }>(`/api/usuarios/${id}`, {
      method: 'DELETE', // Método DELETE
    });
  }

  // Método para obtener negocios para dropdown
  async getNegociosDropdown(): Promise<ApiResponse<NegocioDropdown[]>> {
    console.log('🏢 Obteniendo negocios para dropdown'); // Log de consulta
    
    return this.request<NegocioDropdown[]>('/api/usuarios/negocios/dropdown', {
      method: 'GET', // Método GET
    });
  }

  // Método para obtener roles para dropdown
  async getRolesDropdown(): Promise<ApiResponse<RolDropdown[]>> {
    console.log('👥 Obteniendo roles para dropdown'); // Log de consulta
    
    return this.request<RolDropdown[]>('/api/usuarios/roles/dropdown', {
      method: 'GET', // Método GET
    });
  }

  // Método para obtener todos los negocios
  async getNegocios(): Promise<ApiResponse<Negocio[]>> {
    console.log('🏢 Obteniendo lista de negocios'); // Log de consulta
    
    return this.request<Negocio[]>('/api/negocios', {
      method: 'GET', // Método GET
    });
  }

  // Método para obtener todos los roles (simplificado para dropdowns)
  async getRoles(): Promise<ApiResponse<any[]>> {
    console.log('👥 Obteniendo lista de roles'); // Log de consulta
    
    return this.request<any[]>('/api/roles', {
      method: 'GET', // Método GET
    });
  }

  // Método para obtener todos los roles completos (para gestión)
  async getRolesComplete(): Promise<ApiResponse<any[]>> {
    console.log('👥 Obteniendo lista completa de roles'); // Log de consulta
    
    return this.request<any[]>('/api/roles/complete', {
      method: 'GET', // Método GET
    });
  }

  // Método para crear un nuevo rol
  async createRol(rolData: any): Promise<ApiResponse<{ idRol: number; nombreRol: string }>> {
    console.log('👥 Creando nuevo rol:', rolData.nombreRol); // Log de creación
    
    return this.request<{ idRol: number; nombreRol: string }>('/api/roles', {
      method: 'POST', // Método POST
      body: JSON.stringify(rolData), // Datos del rol en JSON
    });
  }

  // Método para actualizar un rol existente
  async updateRol(idRol: number, rolData: any): Promise<ApiResponse<{ idRol: number; nombreRol: string }>> {
    console.log('👥 Actualizando rol:', idRol, rolData.nombreRol); // Log de actualización
    
    return this.request<{ idRol: number; nombreRol: string }>(`/api/roles/${idRol}`, {
      method: 'PUT', // Método PUT
      body: JSON.stringify(rolData), // Datos del rol en JSON
    });
  }

  // Método para eliminar un rol (cambiar a inactivo)
  async deleteRol(id: number, data: any): Promise<ApiResponse<any>> {
    console.log(`🗑️ Eliminando rol ID: ${id}`); // Log de eliminación
    
    return this.request<any>(`/api/roles/${id}`, {
      method: 'DELETE', // Método DELETE
      body: JSON.stringify(data), // Datos de auditoría
    });
  }



  // Método para obtener parámetros de un negocio
  async getParametrosNegocio(idNegocio: number): Promise<ApiResponse<any[]>> {
    console.log('⚙️ Obteniendo parámetros del negocio:', idNegocio); // Log de consulta
    
    return this.request<any[]>(`/api/parametros-negocio/${idNegocio}`, {
      method: 'GET', // Método GET
    });
  }

  // Método para crear parámetros de negocio
  async createParametrosNegocio(parametrosData: any): Promise<ApiResponse<{ idParametro: number; idNegocio: number }>> {
    console.log('⚙️ Creando parámetros de negocio'); // Log de creación
    
    return this.request<{ idParametro: number; idNegocio: number }>('/api/parametros-negocio', {
      method: 'POST', // Método POST
      body: JSON.stringify(parametrosData), // Datos de parámetros en JSON
    });
  }

  // Método para registro completo de negocio (cliente + negocio + parámetros)
  async createNegocioCompleto(negocioCompletoData: any): Promise<ApiResponse<{ idCliente: number; idNegocio: number; numerocliente: string }>> {
    console.log('🏢 Creando negocio completo'); // Log de creación
    
    return this.request<{ idCliente: number; idNegocio: number; numerocliente: string }>('/api/parametros-negocio/completo', {
      method: 'POST', // Método POST
      body: JSON.stringify(negocioCompletoData), // Datos completos en JSON
    });
  }

  // Método para crear un nuevo negocio
  async createNegocio(negocioData: CreateNegocioData): Promise<ApiResponse<{ idNegocio: number; nombreNegocio: string }>> {
    console.log('🏢 Creando nuevo negocio:', negocioData.nombreNegocio); // Log de creación
    
    return this.request<{ idNegocio: number; nombreNegocio: string }>('/api/negocios', {
      method: 'POST', // Método POST
      body: JSON.stringify(negocioData), // Datos del negocio en JSON
    });
  }

  // Método para actualizar un negocio existente
  async updateNegocio(id: number, negocioData: Partial<CreateNegocioData>): Promise<ApiResponse<{ idNegocio: number }>> {
    console.log('✏️ Actualizando negocio ID:', id); // Log de actualización
    
    return this.request<{ idNegocio: number }>(`/api/negocios/${id}`, {
      method: 'PUT', // Método PUT
      body: JSON.stringify(negocioData), // Datos actualizados en JSON
    });
  }

  // Método para verificar la salud del servidor
  async healthCheck(): Promise<ApiResponse<any>> {
    console.log('💊 Verificando salud del servidor'); // Log de health check
    
    return this.request<any>('/health', {
      method: 'GET', // Método GET
    });
  }

  // ===== MÉTODOS PARA CATEGORÍAS =====

  // Método para obtener todas las categorías
  async getCategorias(): Promise<ApiResponse<any[]>> {
    console.log('📂 Obteniendo categorías'); // Log de obtención
    
    return this.request<any[]>('/api/categorias', {
      method: 'GET', // Método GET
    });
  }

  // Método para obtener categorías para dropdown
  async getCategoriasDropdown(): Promise<ApiResponse<any[]>> {
    console.log('📋 Obteniendo categorías para dropdown'); // Log de obtención
    
    return this.request<any[]>('/api/categorias/dropdown', {
      method: 'GET', // Método GET
    });
  }

  // Método para crear una nueva categoría
  async createCategoria(categoriaData: any): Promise<ApiResponse<{ idCategoria: number }>> {
    console.log('📂 Creando nueva categoría'); // Log de creación
    
    return this.request<{ idCategoria: number }>('/api/categorias', {
      method: 'POST', // Método POST
      body: JSON.stringify(categoriaData), // Datos de la categoría en JSON
    });
  }

  // Método para actualizar una categoría existente
  async updateCategoria(id: number, categoriaData: any): Promise<ApiResponse<{ idCategoria: number }>> {
    console.log('✏️ Actualizando categoría ID:', id); // Log de actualización
    
    return this.request<{ idCategoria: number }>(`/api/categorias/${id}`, {
      method: 'PUT', // Método PUT
      body: JSON.stringify(categoriaData), // Datos actualizados en JSON
    });
  }

  // Método para eliminar una categoría
  async deleteCategoria(id: number, data: any): Promise<ApiResponse<{ idCategoria: number }>> {
    console.log('🗑️ Eliminando categoría ID:', id); // Log de eliminación
    
    return this.request<{ idCategoria: number }>(`/api/categorias/${id}`, {
      method: 'DELETE', // Método DELETE
      body: JSON.stringify(data), // Datos adicionales
    });
  }

  // ===== MÉTODOS PARA PRODUCTOS =====

  // Método para obtener todos los productos

  // Método para actualizar un producto existente (con imagen)
  async updateProducto(id: number, productoData: FormData): Promise<ApiResponse<{ idProducto: number }>> {
    console.log('✏️ Actualizando producto ID:', id); // Log de actualización
    
    return this.request<{ idProducto: number }>(`/api/productos/${id}`, {
      method: 'PUT', // Método PUT
      headers: {}, // Headers vacíos para FormData
      body: productoData, // FormData con imagen
    });
  }

  // Método para obtener imagen de un producto
  async getProductoImagen(id: number): Promise<Blob> {
    console.log('🖼️ Obteniendo imagen del producto ID:', id); // Log de obtención
    
    const response = await fetch(`${this.baseURL}/api/productos/${id}/imagen`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error('Error al obtener imagen del producto');
    }

    return response.blob();
  }

  // Método para obtener URL de imagen de un producto  
  getProductoImagenUrl(id: number): string {
    return `${this.baseURL}/api/productos/${id}/imagen`;
  }

  // Método para eliminar un producto
  async deleteProducto(id: number, data: any): Promise<ApiResponse<{ idProducto: number }>> {
    console.log('🗑️ Eliminando producto ID:', id); // Log de eliminación
    
    return this.request<{ idProducto: number }>(`/api/productos/${id}`, {
      method: 'DELETE', // Método DELETE
      body: JSON.stringify(data), // Datos adicionales
    });
  }



  // Método para obtener subrecetas
  async getSubRecetas(): Promise<ApiResponse<any[]>> {
    console.log('📋 Obteniendo subrecetas'); // Log de consulta
    
    return this.request<any[]>('/api/sub-recetas', {
      method: 'GET', // Método GET
    });
  }

  // Métodos para gestión de mesas
  
  // Método para obtener mesas
  async getMesas(): Promise<ApiResponse<any[]>> {
    console.log('🍽️ Obteniendo mesas'); // Log de consulta
    
    return this.request<any[]>('/api/mesas', {
      method: 'GET', // Método GET
    });
  }

  // Método para crear una nueva mesa
  async createMesa(mesaData: any): Promise<ApiResponse<any>> {
    console.log('🍽️ Creando nueva mesa:', mesaData); // Log de creación
    
    return this.request<any>('/api/mesas', {
      method: 'POST', // Método POST
      body: JSON.stringify(mesaData), // Datos de la mesa en JSON
    });
  }

  // Método para actualizar una mesa
  async updateMesa(id: number, mesaData: any): Promise<ApiResponse<any>> {
    console.log(`🔄 Actualizando mesa ID: ${id}`, mesaData); // Log de actualización
    
    return this.request<any>(`/api/mesas/${id}`, {
      method: 'PUT', // Método PUT
      body: JSON.stringify(mesaData), // Datos actualizados en JSON
    });
  }

  // Método para eliminar una mesa (cambiar a inactiva)
  async deleteMesa(id: number, data: any): Promise<ApiResponse<any>> {
    console.log(`🗑️ Eliminando mesa ID: ${id}`); // Log de eliminación
    
    return this.request<any>(`/api/mesas/${id}`, {
      method: 'DELETE', // Método DELETE
      body: JSON.stringify(data), // Datos de auditoría
    });
  }

  // Métodos para gestión de descuentos
  
  // Método para obtener descuentos
  async getDescuentos(): Promise<ApiResponse<any[]>> {
    console.log('💰 Obteniendo descuentos'); // Log de consulta
    
    return this.request<any[]>('/api/descuentos', {
      method: 'GET', // Método GET
    });
  }

  // Método para crear un nuevo descuento
  async createDescuento(descuentoData: any): Promise<ApiResponse<any>> {
    console.log('💰 Creando nuevo descuento:', descuentoData); // Log de creación
    
    return this.request<any>('/api/descuentos', {
      method: 'POST', // Método POST
      body: JSON.stringify(descuentoData), // Datos del descuento en JSON
    });
  }

  // Método para actualizar un descuento
  async updateDescuento(id: number, descuentoData: any): Promise<ApiResponse<any>> {
    console.log(`🔄 Actualizando descuento ID: ${id}`, descuentoData); // Log de actualización
    
    return this.request<any>(`/api/descuentos/${id}`, {
      method: 'PUT', // Método PUT
      body: JSON.stringify(descuentoData), // Datos actualizados en JSON
    });
  }

  // Método para eliminar un descuento (cambiar a inactivo)
  async deleteDescuento(id: number, data: any): Promise<ApiResponse<any>> {
    console.log(`🗑️ Eliminando descuento ID: ${id}`); // Log de eliminación
    
    return this.request<any>(`/api/descuentos/${id}`, {
      method: 'DELETE', // Método DELETE
      body: JSON.stringify(data), // Datos de auditoría
    });
  }

  // Métodos para gestión de proveedores
  
  // Método para obtener proveedores
  async getProveedores(): Promise<ApiResponse<any[]>> {
    console.log('🏪 Obteniendo proveedores'); // Log de consulta
    
    return this.request<any[]>('/api/proveedores', {
      method: 'GET', // Método GET
    });
  }

  // Método para crear un nuevo proveedor
  async createProveedor(proveedorData: any): Promise<ApiResponse<any>> {
    console.log('🏪 Creando nuevo proveedor:', proveedorData); // Log de creación
    
    return this.request<any>('/api/proveedores', {
      method: 'POST', // Método POST
      body: JSON.stringify(proveedorData), // Datos del proveedor en JSON
    });
  }

  // Método para actualizar un proveedor
  async updateProveedor(id: number, proveedorData: any): Promise<ApiResponse<any>> {
    console.log(`🔄 Actualizando proveedor ID: ${id}`, proveedorData); // Log de actualización
    
    return this.request<any>(`/api/proveedores/${id}`, {
      method: 'PUT', // Método PUT
      body: JSON.stringify(proveedorData), // Datos actualizados en JSON
    });
  }

  // Método para eliminar un proveedor
  async deleteProveedor(id: number): Promise<ApiResponse<any>> {
    console.log(`🗑️ Eliminando proveedor ID: ${id}`); // Log de eliminación
    
    return this.request<any>(`/api/proveedores/${id}`, {
      method: 'DELETE', // Método DELETE
    });
  }

  // Métodos para UMMovimiento (Unidades de Medida de Compra)
  
  // Método para obtener todas las unidades de medida de compra
  async getUMMovimientos(): Promise<ApiResponse<any[]>> {
    console.log('📏 Obteniendo lista de unidades de medida de compra'); // Log de consulta
    
    return this.request<any[]>('/api/ummovimientos', {
      method: 'GET', // Método GET
    });
  }

  // Método para obtener una unidad de medida específica por ID
  async getUMMovimientoById(id: number): Promise<ApiResponse<any>> {
    console.log(`📏 Obteniendo unidad de medida ID: ${id}`); // Log de consulta
    
    return this.request<any>(`/api/ummovimientos/${id}`, {
      method: 'GET', // Método GET
    });
  }

  // Método para crear una nueva unidad de medida de compra
  async createUMMovimiento(umData: any): Promise<ApiResponse<any>> {
    console.log('📏 Creando nueva unidad de medida de compra:', umData.nombreUmCompra); // Log de creación
    
    return this.request<any>('/api/ummovimientos', {
      method: 'POST', // Método POST
      body: JSON.stringify(umData), // Datos de la unidad de medida en JSON
    });
  }

  // Método para actualizar una unidad de medida de compra
  async updateUMMovimiento(id: number, umData: any): Promise<ApiResponse<any>> {
    console.log(`📏 Actualizando unidad de medida ID: ${id}`, umData); // Log de actualización
    
    return this.request<any>(`/api/ummovimientos/${id}`, {
      method: 'PUT', // Método PUT
      body: JSON.stringify(umData), // Datos actualizados en JSON
    });
  }

  // Métodos para Cuentas Contables
  
  // Método para obtener todas las cuentas contables
  async getCuentas(): Promise<ApiResponse<any[]>> {
    console.log('💳 Obteniendo lista de cuentas contables'); // Log de consulta
    
    return this.request<any[]>('/api/cuentas', {
      method: 'GET', // Método GET
    });
  }

  // Método para obtener una cuenta contable específica por ID
  async getCuentaById(id: number): Promise<ApiResponse<any>> {
    console.log(`💳 Obteniendo cuenta contable ID: ${id}`); // Log de consulta
    
    return this.request<any>(`/api/cuentas/${id}`, {
      method: 'GET', // Método GET
    });
  }

  // Método para crear una nueva cuenta contable
  async createCuenta(cuentaData: any): Promise<ApiResponse<any>> {
    console.log('💳 Creando nueva cuenta contable:', cuentaData.nombrecuentacontable); // Log de creación
    
    return this.request<any>('/api/cuentas', {
      method: 'POST', // Método POST
      body: JSON.stringify(cuentaData), // Datos de la cuenta contable en JSON
    });
  }

  // Método para actualizar una cuenta contable
  async updateCuenta(id: number, cuentaData: any): Promise<ApiResponse<any>> {
    console.log(`💳 Actualizando cuenta contable ID: ${id}`, cuentaData); // Log de actualización
    
    return this.request<any>(`/api/cuentas/${id}`, {
      method: 'PUT', // Método PUT
      body: JSON.stringify(cuentaData), // Datos actualizados en JSON
    });
  }

  // Métodos para Insumos
  
  // Método para obtener todos los insumos
  async getInsumos(): Promise<ApiResponse<any[]>> {
    console.log('📦 Obteniendo lista de insumos'); // Log de consulta
    
    return this.request<any[]>('/api/insumos', {
      method: 'GET', // Método GET
    });
  }

  // Método para obtener un insumo específico por ID
  async getInsumoById(id: number): Promise<ApiResponse<any>> {
    console.log(`📦 Obteniendo insumo ID: ${id}`); // Log de consulta
    
    return this.request<any>(`/api/insumos/${id}`, {
      method: 'GET', // Método GET
    });
  }

  // Método para crear un nuevo insumo
  async createInsumo(insumoData: any): Promise<ApiResponse<any>> {
    console.log('📦 Creando nuevo insumo:', insumoData.nombre); // Log de creación
    
    return this.request<any>('/api/insumos', {
      method: 'POST', // Método POST
      body: JSON.stringify(insumoData), // Datos del insumo en JSON
    });
  }

  // Método para actualizar un insumo
  async updateInsumo(id: number, insumoData: any): Promise<ApiResponse<any>> {
    console.log(`📦 Actualizando insumo ID: ${id}`, insumoData); // Log de actualización
    
    return this.request<any>(`/api/insumos/${id}`, {
      method: 'PUT', // Método PUT
      body: JSON.stringify(insumoData), // Datos actualizados en JSON
    });
  }

  // Método para desactivar un insumo
  async deleteInsumo(id: number): Promise<ApiResponse<any>> {
    console.log(`📦 Desactivando insumo ID: ${id}`); // Log de eliminación
    
    return this.request<any>(`/api/insumos/${id}`, {
      method: 'DELETE', // Método DELETE
    });
  }

  // Método para obtener cuentas contables para dropdown
  async getCuentasContablesDropdown(): Promise<ApiResponse<any[]>> {
    console.log('💳 Obteniendo cuentas contables para dropdown'); // Log de consulta
    
    return this.request<any[]>('/api/insumos/cuentas-dropdown', {
      method: 'GET', // Método GET
    });
  }

  // ===== MÉTODOS PARA UNIDADES DE MEDIDA =====

  // Método para obtener todas las unidades de medida
  async getUMedidas(): Promise<ApiResponse<UMedida[]>> {
    console.log('📏 Obteniendo unidades de medida'); // Log de consulta
    
    return this.request<UMedida[]>('/api/umedidas', {
      method: 'GET', // Método GET
    });
  }

  // Método para crear una nueva unidad de medida
  async createUMedida(umedidaData: CreateUMedidaData): Promise<ApiResponse<{ idUmCompra: number }>> {
    console.log('📏 Creando nueva unidad de medida:', umedidaData.nombreUmCompra); // Log de creación
    
    return this.request<{ idUmCompra: number }>('/api/umedidas', {
      method: 'POST', // Método POST
      body: JSON.stringify(umedidaData), // Datos en JSON
    });
  }

  // Método para actualizar una unidad de medida existente
  async updateUMedida(id: number, umedidaData: UpdateUMedidaData): Promise<ApiResponse<{ idUmCompra: number }>> {
    console.log('📏 Actualizando unidad de medida:', id); // Log de actualización
    
    return this.request<{ idUmCompra: number }>(`/api/umedidas/${id}`, {
      method: 'PUT', // Método PUT
      body: JSON.stringify(umedidaData), // Datos en JSON
    });
  }

  // Método para eliminar una unidad de medida
  async deleteUMedida(id: number): Promise<ApiResponse<any>> {
    console.log('📏 Eliminando unidad de medida:', id); // Log de eliminación
    
    return this.request<any>(`/api/umedidas/${id}`, {
      method: 'DELETE', // Método DELETE
    });
  }

  // =====================================
  // MÉTODOS PARA CLIENTES
  // =====================================

  // Obtener todos los clientes
  async getClientes(): Promise<ApiResponse<Cliente[]>> {
    console.log('👥 Obteniendo clientes...'); // Log de obtención
    
    return this.request<Cliente[]>('/api/clientes', {
      method: 'GET', // Método GET
    });
  }

  // Obtener cliente por ID
  async getClienteById(id: number): Promise<ApiResponse<Cliente>> {
    console.log('👥 Obteniendo cliente por ID:', id); // Log de obtención
    
    return this.request<Cliente>(`/api/clientes/${id}`, {
      method: 'GET', // Método GET
    });
  }

  // Crear nuevo cliente
  async createCliente(clienteData: CreateClienteData): Promise<ApiResponse<{id: number}>> {
    console.log('👥 Creando cliente:', clienteData.nombre); // Log de creación
    
    return this.request<{id: number}>('/api/clientes', {
      method: 'POST', // Método POST
      body: JSON.stringify(clienteData), // Datos del cliente
    });
  }

  // Actualizar cliente
  async updateCliente(id: number, clienteData: UpdateClienteData): Promise<ApiResponse<any>> {
    console.log('👥 Actualizando cliente:', id); // Log de actualización
    
    return this.request<any>(`/api/clientes/${id}`, {
      method: 'PUT', // Método PUT
      body: JSON.stringify(clienteData), // Datos del cliente
    });
  }

  // Eliminar cliente
  async deleteCliente(id: number): Promise<ApiResponse<any>> {
    console.log('👥 Eliminando cliente:', id); // Log de eliminación
    
    return this.request<any>(`/api/clientes/${id}`, {
      method: 'DELETE', // Método DELETE
    });
  }
}

// Crea y exporta una instancia única del servicio API
const apiService = new ApiService();

export default apiService;

// Exportaciones individuales para compatibilidad
export const login = (loginData: LoginData) => apiService.login(loginData);
export const getUsuarios = () => apiService.getUsuarios();
export const createUsuario = (userData: CreateUsuarioSistemaData) => apiService.createUsuario(userData);
export const updateUsuario = (id: number, userData: UpdateUsuarioSistemaData) => apiService.updateUsuario(id, userData);
export const getRoles = () => apiService.getRoles();
export const getClientes = () => apiService.getClientes();
export const createCliente = (clienteData: CreateClienteData) => apiService.createCliente(clienteData);
export const updateCliente = (id: number, clienteData: UpdateClienteData) => apiService.updateCliente(id, clienteData);
export const deleteCliente = (id: number) => apiService.deleteCliente(id);
export const createNegocioCompleto = (data: any) => apiService.createNegocioCompleto(data);
export const getNegocios = () => apiService.getNegocios();
export const createNegocio = (negocioData: CreateNegocioData) => apiService.createNegocio(negocioData);
export const updateNegocio = (id: number, negocioData: Partial<CreateNegocioData>) => apiService.updateNegocio(id, negocioData);
export const healthCheck = () => apiService.healthCheck();

// Exportaciones para categorías
// Categorias API methods removed
export const createCategoria = (categoriaData: any) => apiService.createCategoria(categoriaData);
export const updateCategoria = (id: number, categoriaData: any) => apiService.updateCategoria(id, categoriaData);
export const deleteCategoria = (id: number, data: any) => apiService.deleteCategoria(id, data);

// Exportaciones para productos
export const getProductoImagen = (id: number) => apiService.getProductoImagen(id);
export const getProductoImagenUrl = (id: number) => apiService.getProductoImagenUrl(id);
export const updateProducto = (id: number, productoData: FormData) => apiService.updateProducto(id, productoData);
export const deleteProducto = (id: number, data: any) => apiService.deleteProducto(id, data);

// Exportaciones para insumos
export const getInsumos = () => apiService.getInsumos();
export const getInsumoById = (id: number) => apiService.getInsumoById(id);
export const createInsumo = (insumoData: any) => apiService.createInsumo(insumoData);
export const updateInsumo = (id: number, insumoData: any) => apiService.updateInsumo(id, insumoData);
export const deleteInsumo = (id: number) => apiService.deleteInsumo(id);
export const getCuentasContablesDropdown = () => apiService.getCuentasContablesDropdown();

// Exportaciones para subrecetas
export const getSubRecetas = () => apiService.getSubRecetas();

// Exportaciones para mesas
export const getMesas = () => apiService.getMesas();
export const createMesa = (mesaData: any) => apiService.createMesa(mesaData);
export const updateMesa = (id: number, mesaData: any) => apiService.updateMesa(id, mesaData);
export const deleteMesa = (id: number, data: any) => apiService.deleteMesa(id, data);

// Exportaciones para proveedores
export const getProveedores = () => apiService.getProveedores();
export const createProveedor = (proveedorData: any) => apiService.createProveedor(proveedorData);
export const updateProveedor = (id: number, proveedorData: any) => apiService.updateProveedor(id, proveedorData);
export const deleteProveedor = (id: number) => apiService.deleteProveedor(id);

// Exportaciones para unidades de medida de compra
export const getUMMovimientos = () => apiService.getUMMovimientos();
export const getUMMovimientoById = (id: number) => apiService.getUMMovimientoById(id);
export const createUMMovimiento = (umData: any) => apiService.createUMMovimiento(umData);
export const updateUMMovimiento = (id: number, umData: any) => apiService.updateUMMovimiento(id, umData);

// Exportaciones para cuentas contables (tipos de movimiento)
export const getCuentas = () => apiService.getCuentas();
export const getCuentaById = (id: number) => apiService.getCuentaById(id);
export const createCuenta = (cuentaData: any) => apiService.createCuenta(cuentaData);
export const updateCuenta = (id: number, cuentaData: any) => apiService.updateCuenta(id, cuentaData);
export function getUMCompras() {
  throw new Error('Function not implemented.');
}

export function updateUMCompra(idUmCompra: number, updateData: { nombreUmCompra: string; valor: number; umMatPrima: string; valorConvertido: number; }) {
  // Mark parameters as used to satisfy TypeScript's noUnusedParameters rule
  void idUmCompra;
  void updateData;
  throw new Error('Function not implemented.');
}

export function createUMCompra(formData: { nombreUmCompra: string; valor: number; umMatPrima: string; valorConvertido: number; usuario: string; }) {
  // Mark parameter as used to satisfy TypeScript's noUnusedParameters rule
  void formData;
  throw new Error('Function not implemented.');
}

export function deleteUMCompra(idUmCompra: number) {
  // Mark parameter as used to satisfy TypeScript's noUnusedParameters rule
  void idUmCompra;
  throw new Error('Function not implemented.');
}

