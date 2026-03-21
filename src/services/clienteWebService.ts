import { api } from './api';

export interface ClienteRegistroData {
  referencia: string;
  telefono?: string;
  cumple?: string;
  direccion?: string;
  password: string;
}

export interface ClienteRegistroResponse {
  success: boolean;
  message: string;
  data?: { idCliente: number };
}

export interface ClienteWebData {
  idCliente: number;
  nombre: string;
  referencia?: string;
  telefono: string;
  direccion?: string;
}

export interface PedidoTransito {
  idpedidowebtransito: number;
  folioventa: string;
  idnegocio: number;
  totalpedido: number;
  fechahorapedidosolicitado: string;
  telefonocliente: string;
  referenciacliente: string | null;
  detalleproductos: string;
  estatuspedidotransito: string;
  detallesclientepedidostransito: string | null;
  observacionesnegociopedidostransito: string | null;
  puntosobtenidospedidostransito: number;
  puntosusadospedidostransito: number;
  saldopuntospedidostransito: number;
  mensajeclientepedidostransito: string | null;
  mensajenegociopedidostransito: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  negocio_logotipo: string | null;
  negocio_contacto: string | null;
}

export interface ClienteLoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    cliente: ClienteWebData;
  };
}

export interface NegocioPublico {
  idNegocio: number;
  nombreNegocio: string;
  tipoNegocio: string;
  logotipo: string | null;
  calificacion: number | null;
  etiquetas: string | null;
  abiertoahoraweb: number;
  promocionhoyweb: number;
  entregarapidaweb: number;
  nuevoweb: number;
}

const CLIENTE_SESSION_KEY = 'clienteWebSession';
const CLIENTE_MODE_KEY = 'clienteMode';

/** idNegocio value used in the client's JWT before a business is selected */
const NO_BUSINESS_SELECTED = 0;

/** idRol value used for client-portal users (distinct from any regular system role) */
const CLIENT_ROLE = 99;

export const clienteWebService = {
  /**
   * Autentica un cliente contra tblposcrumenwebclientes
   */
  login: async (telefono: string, password: string): Promise<ClienteLoginResponse> => {
    try {
      const response = await api.post<ClienteLoginResponse>('/auth/login-cliente', {
        telefono,
        password
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  /**
   * Registra un nuevo cliente públicamente en tblposcrumenwebclientes
   */
  registrarCliente: async (data: ClienteRegistroData): Promise<ClienteRegistroResponse> => {
    try {
      const response = await api.post<ClienteRegistroResponse>('/auth/registro-cliente', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  },

  /**
   * Obtiene un token de cliente con el idNegocio del negocio seleccionado
   */
  seleccionarNegocio: async (idNegocio: number): Promise<string> => {
    const response = await api.post<{ success: boolean; data: { token: string } }>(
      '/auth/cliente-token-negocio',
      { idNegocio }
    );
    return response.data.data.token;
  },

  /**
   * Obtiene la lista pública de negocios activos (sin autenticación)
   */
  obtenerNegociosPublico: async (): Promise<NegocioPublico[]> => {
    try {
      const response = await api.get<{ success: boolean; data: NegocioPublico[] }>(
        '/negocios/publico'
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener negocios públicos:', error);
      return [];
    }
  },

  /**
   * Obtiene los pedidos activos del cliente (sin autenticación, por teléfono)
   */
  obtenerMisPedidos: async (): Promise<PedidoTransito[]> => {
    try {
      const session = clienteWebService.getClienteSession();
      const telefono = session?.telefono;
      if (!telefono) return [];
      const response = await api.get<{ success: boolean; data: PedidoTransito[] }>(
        '/auth/mis-pedidos',
        { params: { telefono } }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener mis pedidos:', error);
      return [];
    }
  },

  /**
   * Envía un mensaje del cliente en un pedido en tránsito (sin autenticación)
   */
  enviarMensajePedido: async (idpedidowebtransito: number, mensaje: string): Promise<boolean> => {
    try {
      const session = clienteWebService.getClienteSession();
      const telefono = session?.telefono;
      if (!telefono) return false;
      const response = await api.post<{ success: boolean }>('/auth/enviar-mensaje-pedido', {
        idpedidowebtransito,
        mensaje,
        telefono
      });
      return response.data.success;
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      return false;
    }
  },

  /**
   * Guarda la sesión del cliente en localStorage
   */
  saveClienteSession: (token: string, cliente: ClienteWebData): void => {
    localStorage.setItem('token', token);
    localStorage.setItem(CLIENTE_SESSION_KEY, JSON.stringify(cliente));
    localStorage.setItem(CLIENTE_MODE_KEY, 'true');
    // Store a minimal "usuario" so parts of the app that check localStorage still work
    localStorage.setItem('usuario', JSON.stringify({
      id: cliente.idCliente,
      nombre: cliente.nombre,
      alias: cliente.telefono,
      telefono: cliente.telefono,
      idNegocio: NO_BUSINESS_SELECTED,
      idRol: CLIENT_ROLE,
      estatus: 1
    }));
    localStorage.setItem('privilegio', '0');
  },

  /**
   * Actualiza el token y el idNegocio activo del cliente en localStorage
   */
  updateNegocioToken: (token: string, idNegocio: number): void => {
    localStorage.setItem('token', token);
    localStorage.setItem('idnegocio', String(idNegocio));
    // Update the usuario object with the selected idNegocio
    const clienteData = clienteWebService.getClienteSession();
    if (clienteData) {
      localStorage.setItem('usuario', JSON.stringify({
        id: clienteData.idCliente,
        nombre: clienteData.nombre,
        alias: clienteData.telefono,
        telefono: clienteData.telefono,
        idNegocio,
        idRol: CLIENT_ROLE,
        estatus: 1
      }));
    }
  },

  /**
   * Obtiene los datos del cliente desde localStorage
   */
  getClienteSession: (): ClienteWebData | null => {
    const data = localStorage.getItem(CLIENTE_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Verifica si la sesión actual es de un cliente web
   */
  isClienteMode: (): boolean => {
    return localStorage.getItem(CLIENTE_MODE_KEY) === 'true';
  },

  /**
   * Limpia toda la sesión del cliente
   */
  clearClienteSession: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('idnegocio');
    localStorage.removeItem('privilegio');
    localStorage.removeItem(CLIENTE_SESSION_KEY);
    localStorage.removeItem(CLIENTE_MODE_KEY);
  }
};

export default clienteWebService;
