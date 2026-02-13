import { io, Socket } from 'socket.io-client';

/**
 * Singleton Socket.IO client
 * Conecta al servidor WebSocket y mantiene una única conexión durante toda la sesión
 */

let socket: Socket | null = null;

/**
 * Inicializa la conexión WebSocket
 * Solo se debe llamar una vez al montar la aplicación
 * @returns Instancia del socket
 */
export const initSocket = (): Socket => {
  if (socket) {
    console.log('⚠️  Socket ya está inicializado');
    return socket;
  }

  // Obtener URL del backend desde variables de entorno
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  console.log('🔌 Inicializando conexión WebSocket a:', backendUrl);

  socket = io(backendUrl, {
    // Configuración de reconexión automática
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    
    // Usar WebSocket primero, luego polling como fallback
    transports: ['websocket', 'polling'],
    
    // Timeout de conexión
    timeout: 10000,
    
    // Habilitar autenticación automática con credenciales
    withCredentials: true,
  });

  // Manejar conexión exitosa
  socket.on('connect', () => {
    console.log('✅ Conectado al servidor WebSocket:', socket?.id);
    
    // Unirse a la sala del negocio si hay usuario autenticado
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        if (usuario.idNegocio) {
          socket?.emit('join:negocio', usuario.idNegocio);
          console.log(`📍 Unido a sala del negocio: ${usuario.idNegocio}`);
        }
      } catch (error) {
        console.error('Error al parsear usuario:', error);
      }
    }
  });

  // Manejar desconexión
  socket.on('disconnect', (reason) => {
    console.log('❌ Desconectado del servidor WebSocket:', reason);
    
    if (reason === 'io server disconnect') {
      // El servidor forzó la desconexión, intentar reconectar manualmente
      socket?.connect();
    }
  });

  // Manejar errores de conexión
  socket.on('connect_error', (error) => {
    console.error('❌ Error de conexión WebSocket:', error.message);
  });

  // Manejar reconexión
  socket.on('reconnect', (attemptNumber) => {
    console.log(`✅ Reconectado al servidor WebSocket (intento ${attemptNumber})`);
    
    // Volver a unirse a la sala del negocio
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        if (usuario.idNegocio) {
          socket?.emit('join:negocio', usuario.idNegocio);
        }
      } catch (error) {
        console.error('Error al parsear usuario en reconnect:', error);
      }
    }
  });

  // Manejar intento de reconexión
  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`🔄 Intentando reconectar... (intento ${attemptNumber})`);
  });

  // Manejar fallo de reconexión
  socket.on('reconnect_failed', () => {
    console.error('❌ Fallo al reconectar al servidor WebSocket');
  });

  return socket;
};

/**
 * Obtiene la instancia del socket
 * @returns Instancia del socket o null si no está inicializado
 */
export const getSocket = (): Socket | null => {
  if (!socket) {
    console.warn('⚠️  Socket no está inicializado. Llama a initSocket() primero.');
  }
  return socket;
};

/**
 * Desconecta el socket
 */
export const disconnectSocket = (): void => {
  if (socket) {
    console.log('👋 Desconectando socket...');
    socket.disconnect();
    socket = null;
  }
};

/**
 * Reexportar tipos de Socket.IO para uso en otros módulos
 */
export type { Socket };
