// src/services/api.ts
// Servicio para comunicación con la API del backend POSWEBCrumen

import type { ApiResponse, LoginData, Usuario, Negocio, CreateUsuarioData, CreateNegocioData } from '../types';

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

  // Método para obtener todos los usuarios
  async getUsuarios(): Promise<ApiResponse<Usuario[]>> {
    console.log('👥 Obteniendo lista de usuarios'); // Log de consulta
    
    return this.request<Usuario[]>('/api/usuarios', {
      method: 'GET', // Método GET
    });
  }

  // Método para crear un nuevo usuario
  async createUsuario(userData: CreateUsuarioData): Promise<ApiResponse<{ idUsuario: number; usuario: string }>> {
    console.log('👤 Creando nuevo usuario:', userData.usuario); // Log de creación
    
    return this.request<{ idUsuario: number; usuario: string }>('/api/usuarios', {
      method: 'POST', // Método POST
      body: JSON.stringify(userData), // Datos del usuario en JSON
    });
  }

  // Método para actualizar un usuario existente
  async updateUsuario(id: number, userData: Partial<CreateUsuarioData>): Promise<ApiResponse<{ idUsuario: number }>> {
    console.log('✏️ Actualizando usuario ID:', id); // Log de actualización
    
    return this.request<{ idUsuario: number }>(`/api/usuarios/${id}`, {
      method: 'PUT', // Método PUT
      body: JSON.stringify(userData), // Datos actualizados en JSON
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

  // Método para obtener todos los clientes
  async getClientes(): Promise<ApiResponse<any[]>> {
    console.log('👥 Obteniendo lista de clientes'); // Log de consulta
    
    return this.request<any[]>('/api/clientes', {
      method: 'GET', // Método GET
    });
  }

  // Método para crear un nuevo cliente
  async createCliente(clienteData: any): Promise<ApiResponse<{ idCliente: number; nombre: string }>> {
    console.log('👥 Creando nuevo cliente:', clienteData.nombre); // Log de creación
    
    return this.request<{ idCliente: number; nombre: string }>('/api/clientes', {
      method: 'POST', // Método POST
      body: JSON.stringify(clienteData), // Datos del cliente en JSON
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
  async getProductos(): Promise<ApiResponse<any[]>> {
    console.log('📦 Obteniendo productos'); // Log de obtención
    
    return this.request<any[]>('/api/productos', {
      method: 'GET', // Método GET
    });
  }

  // Método para obtener productos por negocio
  async getProductosByNegocio(idNegocio: number): Promise<ApiResponse<any[]>> {
    console.log('📦 Obteniendo productos del negocio:', idNegocio); // Log de obtención
    
    return this.request<any[]>(`/api/productos/negocio/${idNegocio}`, {
      method: 'GET', // Método GET
    });
  }

  // Método para crear un nuevo producto (con imagen)
  async createProducto(productoData: FormData): Promise<ApiResponse<{ idProducto: number }>> {
    console.log('📦 Creando nuevo producto'); // Log de creación
    
    // Para FormData, no establecer Content-Type (el navegador lo hace automáticamente)
    return this.request<{ idProducto: number }>('/api/productos', {
      method: 'POST', // Método POST
      headers: {}, // Headers vacíos para FormData
      body: productoData, // FormData con imagen
    });
  }

  // Método para actualizar un producto existente (con imagen)
  async updateProducto(id: number, productoData: FormData): Promise<ApiResponse<{ idProducto: number }>> {
    console.log('✏️ Actualizando producto ID:', id); // Log de actualización
    
    return this.request<{ idProducto: number }>(`/api/productos/${id}`, {
      method: 'PUT', // Método PUT
      headers: {}, // Headers vacíos para FormData
      body: productoData, // FormData con imagen
    });
  }

  // Método para eliminar un producto
  async deleteProducto(id: number, data: any): Promise<ApiResponse<{ idProducto: number }>> {
    console.log('🗑️ Eliminando producto ID:', id); // Log de eliminación
    
    return this.request<{ idProducto: number }>(`/api/productos/${id}`, {
      method: 'DELETE', // Método DELETE
      body: JSON.stringify(data), // Datos adicionales
    });
  }

  // ===== MÉTODOS PARA INSUMOS =====

  // Método para obtener todos los insumos
  async getInsumos(): Promise<ApiResponse<any[]>> {
    console.log('📦 Obteniendo lista de insumos'); // Log de operación
    
    return this.request<any[]>('/api/insumos', {
      method: 'GET', // Método GET
    });
  }

  // Método para crear un nuevo insumo
  async createInsumo(insumoData: any): Promise<ApiResponse<{ idInsumo: number }>> {
    console.log('📦 Creando nuevo insumo:', insumoData); // Log de creación
    
    return this.request<{ idInsumo: number }>('/api/insumos', {
      method: 'POST', // Método POST
      body: JSON.stringify(insumoData), // Datos del insumo en JSON
    });
  }

  // Método para actualizar un insumo existente
  async updateInsumo(id: number, insumoData: any): Promise<ApiResponse<{ idInsumo: number }>> {
    console.log('📦 Actualizando insumo ID:', id, 'Datos:', insumoData); // Log de actualización
    
    return this.request<{ idInsumo: number }>(`/api/insumos/${id}`, {
      method: 'PUT', // Método PUT
      body: JSON.stringify(insumoData), // Datos actualizados en JSON
    });
  }

  // Método para eliminar un insumo
  async deleteInsumo(id: number, data: any): Promise<ApiResponse<{ idInsumo: number }>> {
    console.log('🗑️ Eliminando insumo ID:', id); // Log de eliminación
    
    return this.request<{ idInsumo: number }>(`/api/insumos/${id}`, {
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
}

// Crea y exporta una instancia única del servicio API
const apiService = new ApiService();

export default apiService;

// Exportaciones individuales para compatibilidad
export const login = (loginData: LoginData) => apiService.login(loginData);
export const getUsuarios = () => apiService.getUsuarios();
export const createUsuario = (userData: CreateUsuarioData) => apiService.createUsuario(userData);
export const updateUsuario = (id: number, userData: Partial<CreateUsuarioData>) => apiService.updateUsuario(id, userData);
export const getRoles = () => apiService.getRoles();
export const getClientes = () => apiService.getClientes();
export const createCliente = (clienteData: any) => apiService.createCliente(clienteData);
export const createNegocioCompleto = (data: any) => apiService.createNegocioCompleto(data);
export const getNegocios = () => apiService.getNegocios();
export const createNegocio = (negocioData: CreateNegocioData) => apiService.createNegocio(negocioData);
export const updateNegocio = (id: number, negocioData: Partial<CreateNegocioData>) => apiService.updateNegocio(id, negocioData);
export const healthCheck = () => apiService.healthCheck();

// Exportaciones para categorías
export const getCategorias = () => apiService.getCategorias();
export const getCategoriasDropdown = () => apiService.getCategoriasDropdown();
export const createCategoria = (categoriaData: any) => apiService.createCategoria(categoriaData);
export const updateCategoria = (id: number, categoriaData: any) => apiService.updateCategoria(id, categoriaData);
export const deleteCategoria = (id: number, data: any) => apiService.deleteCategoria(id, data);

// Exportaciones para productos
export const getProductos = () => apiService.getProductos();
export const getProductosByNegocio = (idNegocio: number) => apiService.getProductosByNegocio(idNegocio);
export const createProducto = (productoData: FormData) => apiService.createProducto(productoData);
export const updateProducto = (id: number, productoData: FormData) => apiService.updateProducto(id, productoData);
export const deleteProducto = (id: number, data: any) => apiService.deleteProducto(id, data);

// Exportaciones para insumos
export const getInsumos = () => apiService.getInsumos();
export const createInsumo = (insumoData: any) => apiService.createInsumo(insumoData);
export const updateInsumo = (id: number, insumoData: any) => apiService.updateInsumo(id, insumoData);
export const deleteInsumo = (id: number, data: any) => apiService.deleteInsumo(id, data);

// Exportaciones para subrecetas
export const getSubRecetas = () => apiService.getSubRecetas();

// Exportaciones para mesas
export const getMesas = () => apiService.getMesas();
export const createMesa = (mesaData: any) => apiService.createMesa(mesaData);
export const updateMesa = (id: number, mesaData: any) => apiService.updateMesa(id, mesaData);
export const deleteMesa = (id: number, data: any) => apiService.deleteMesa(id, data);