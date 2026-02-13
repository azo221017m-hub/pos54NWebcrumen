import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

/**
 * Inicializa Socket.IO con el servidor HTTP existente
 * @param httpServer - Servidor HTTP de Express
 * @returns Instancia de Socket.IO
 */
export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  if (io) {
    console.log('⚠️  Socket.IO ya está inicializado');
    return io;
  }

  // Configurar CORS para Socket.IO
  const allowedOrigins = [
    'http://localhost:5173', // Desarrollo local
    process.env.FRONTEND_URL || 'https://pos54nwebcrumen.onrender.com' // Producción
  ];

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Permitir peticiones sin origin (como herramientas de desarrollo) o desde orígenes permitidos
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('No permitido por CORS'));
        }
      },
      credentials: true,
    },
    // Configuración adicional para producción
    transports: ['websocket', 'polling'], // Soportar ambos transportes
    pingTimeout: 60000, // 60 segundos
    pingInterval: 25000, // 25 segundos
  });

  // Manejar conexiones
  io.on('connection', (socket) => {
    console.log(`✅ Cliente conectado: ${socket.id}`);

    // Manejar desconexiones
    socket.on('disconnect', (reason) => {
      console.log(`❌ Cliente desconectado: ${socket.id} - Razón: ${reason}`);
    });

    // Manejar errores
    socket.on('error', (error) => {
      console.error(`❌ Error en socket ${socket.id}:`, error);
    });

    // Permitir que el cliente se una a una sala específica por negocio
    socket.on('join:negocio', (idnegocio: number) => {
      const room = `negocio:${idnegocio}`;
      socket.join(room);
      console.log(`📍 Socket ${socket.id} se unió a la sala: ${room}`);
    });

    // Permitir que el cliente salga de una sala
    socket.on('leave:negocio', (idnegocio: number) => {
      const room = `negocio:${idnegocio}`;
      socket.leave(room);
      console.log(`📍 Socket ${socket.id} salió de la sala: ${room}`);
    });
  });

  console.log('✅ Socket.IO inicializado correctamente');
  return io;
};

/**
 * Obtiene la instancia de Socket.IO
 * @returns Instancia de Socket.IO o null si no está inicializada
 */
export const getIO = (): SocketIOServer | null => {
  if (!io) {
    console.warn('⚠️  Socket.IO no está inicializado. Llama a initializeSocket() primero.');
  }
  return io;
};

/**
 * Emite un evento a todos los clientes conectados
 * @param event - Nombre del evento
 * @param data - Datos a enviar
 */
export const emitToAll = (event: string, data: unknown): void => {
  if (!io) {
    console.warn('⚠️  No se puede emitir evento: Socket.IO no está inicializado');
    return;
  }
  io.emit(event, data);
  console.log(`📡 Evento emitido a todos: ${event}`);
};

/**
 * Emite un evento a todos los clientes de un negocio específico
 * @param idnegocio - ID del negocio
 * @param event - Nombre del evento
 * @param data - Datos a enviar
 */
export const emitToNegocio = (idnegocio: number, event: string, data: unknown): void => {
  if (!io) {
    console.warn('⚠️  No se puede emitir evento: Socket.IO no está inicializado');
    return;
  }
  const room = `negocio:${idnegocio}`;
  io.to(room).emit(event, data);
  console.log(`📡 Evento emitido a sala ${room}: ${event}`);
};

/**
 * Tipos de eventos estándar del sistema
 * Usar estos nombres de eventos para mantener consistencia
 */
export const SOCKET_EVENTS = {
  // Ventas
  VENTAS_UPDATED: 'ventas:updated',
  VENTA_CREATED: 'venta:created',
  VENTA_UPDATED: 'venta:updated',
  VENTA_CANCELLED: 'venta:cancelled',
  
  // Pagos
  PAGOS_UPDATED: 'pagos:updated',
  PAGO_CREATED: 'pago:created',
  PAGO_UPDATED: 'pago:updated',
  
  // Turnos
  TURNOS_UPDATED: 'turnos:updated',
  TURNO_OPENED: 'turno:opened',
  TURNO_CLOSED: 'turno:closed',
  
  // Movimientos
  MOVIMIENTOS_UPDATED: 'movimientos:updated',
  MOVIMIENTO_CREATED: 'movimiento:created',
  
  // Gastos
  GASTOS_UPDATED: 'gastos:updated',
  GASTO_CREATED: 'gasto:created',
  GASTO_UPDATED: 'gasto:updated',
  GASTO_DELETED: 'gasto:deleted',
  
  // Dashboard - evento general para invalidar todas las métricas
  DASHBOARD_UPDATED: 'dashboard:updated',
  
  // Inventario
  INVENTARIO_UPDATED: 'inventario:updated',
  
  // Productos
  PRODUCTOS_UPDATED: 'productos:updated',
  
  // Insumos
  INSUMOS_UPDATED: 'insumos:updated',
} as const;
