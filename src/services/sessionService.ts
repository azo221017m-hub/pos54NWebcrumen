/**
 * Servicio de Gestión de Sesiones
 * Maneja la validación de tokens JWT, auto-logout y renovación de sesión
 */

import { jwtDecode } from 'jwt-decode';

// Tipos para el payload del token JWT
interface JWTPayload {
  id: number;
  alias: string;
  nombre: string;
  idNegocio: number;
  idRol: number;
  iat: number; // issued at (timestamp de creación)
  exp: number; // expiration (timestamp de expiración)
}

// Constantes de configuración
const TOKEN_KEY = 'token';
const USUARIO_KEY = 'usuario';
const CHECK_INTERVAL_MS = 60000; // Verificar cada 1 minuto
const WARNING_TIME_MS = 300000; // Advertir 5 minutos antes de expirar

/**
 * Decodifica el token JWT y retorna el payload
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return decoded;
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
};

/**
 * Obtiene el token desde localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Verifica si el token ha expirado
 * @returns true si el token está expirado o no es válido
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // Comparar timestamp de expiración con tiempo actual (en segundos)
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

/**
 * Obtiene el tiempo restante en milisegundos hasta que expire el token
 * @returns milisegundos hasta expiración, o 0 si ya expiró
 */
export const getTimeUntilExpiration = (token: string): number => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return 0;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const timeRemaining = (decoded.exp - currentTime) * 1000; // Convertir a milisegundos
  return Math.max(0, timeRemaining);
};

/**
 * Verifica si el token está próximo a expirar
 */
export const isTokenExpiringSoon = (token: string): boolean => {
  const timeRemaining = getTimeUntilExpiration(token);
  return timeRemaining > 0 && timeRemaining <= WARNING_TIME_MS;
};

/**
 * Limpia la sesión del usuario (logout)
 */
export const clearSession = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
  localStorage.removeItem('idnegocio');
};

/**
 * Configura el listener para limpiar la sesión cuando se recarga la página
 * Esta función debe llamarse una vez al iniciar la aplicación
 * @returns Función de limpieza para remover el listener
 */
export const setupSessionClearOnReload = (): (() => void) => {
  const handleBeforeUnload = () => {
    // Obtener token y pathname de forma síncrona
    // Solo limpiar si hay una sesión activa (no estamos en login)
    const currentPath = window.location.pathname;
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token && currentPath !== '/login') {
      // Limpieza síncrona de localStorage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USUARIO_KEY);
      localStorage.removeItem('idnegocio');
    }
  };

  // Registrar listener para cuando se recarga o cierra la página
  window.addEventListener('beforeunload', handleBeforeUnload);

  // Retornar función de limpieza
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
};

/**
 * Verifica el estado del token y ejecuta callback si está expirado
 * 
 * IMPORTANTE: Esta verificación se basa en el timestamp 'exp' del JWT,
 * por lo que el token CONTINÚA EXPIRANDO incluso si:
 * - La computadora está bloqueada (pantalla protegida)
 * - El navegador está minimizado
 * - La pestaña está en segundo plano
 * 
 * El setInterval puede pausarse en algunos navegadores cuando la pestaña
 * está inactiva, pero al regresar se verifica inmediatamente contra el
 * timestamp real del token, garantizando logout si expiró.
 * 
 * @param onExpired - Función a ejecutar cuando el token expire
 * @param onExpiringSoon - Función opcional a ejecutar cuando el token esté por expirar
 * @returns Intervalo de verificación (debe limpiarse manualmente)
 */
export const checkTokenExpiration = (
  onExpired: () => void,
  onExpiringSoon?: (minutesRemaining: number) => void
): ReturnType<typeof setInterval> => {
  // Verificación inmediata basada en timestamp real del token
  const token = getToken();
  
  // Si no hay token, NO ejecutar onExpired inmediatamente
  // (el usuario puede estar en la página de login)
  if (!token) {
    return setInterval(() => {}, CHECK_INTERVAL_MS); // Retornar intervalo inactivo
  }
  
  // Si hay token pero está expirado, ejecutar onExpired
  if (isTokenExpired(token)) {
    onExpired();
    return setInterval(() => {}, CHECK_INTERVAL_MS); // Retornar intervalo inactivo
  }

  // Configurar verificación periódica
  const intervalId = setInterval(() => {
    const currentToken = getToken();
    
    if (!currentToken) {
      // Token fue eliminado (logout manual)
      clearInterval(intervalId);
      return;
    }

    // Verificación basada en timestamp 'exp' del JWT
    // NO depende de tiempo transcurrido en el cliente
    if (isTokenExpired(currentToken)) {
      onExpired();
      clearInterval(intervalId);
      return;
    }

    // Verificar si está próximo a expirar
    if (onExpiringSoon && isTokenExpiringSoon(currentToken)) {
      const timeRemaining = getTimeUntilExpiration(currentToken);
      const minutesRemaining = Math.ceil(timeRemaining / 60000);
      onExpiringSoon(minutesRemaining);
    }
  }, CHECK_INTERVAL_MS);

  return intervalId;
};

/**
 * Realiza un logout automático limpiando la sesión y redirigiendo
 * @param redirectUrl - URL a la que redirigir después del logout
 * @param message - Mensaje opcional a mostrar al usuario
 */
export const autoLogout = (
  redirectUrl: string = '/login',
  message?: string
): void => {
  clearSession();
  
  if (message) {
    // Guardar mensaje en sessionStorage para mostrarlo después del redirect
    sessionStorage.setItem('logoutMessage', message);
  }
  
  // Redirigir a la página de login
  window.location.href = redirectUrl;
};

/**
 * Obtiene el mensaje de logout si existe y lo limpia
 */
export const getLogoutMessage = (): string | null => {
  const message = sessionStorage.getItem('logoutMessage');
  if (message) {
    sessionStorage.removeItem('logoutMessage');
  }
  return message;
};

/**
 * Valida el token actual y retorna información del usuario
 * @returns Información del usuario si el token es válido, null si no
 */
export const validateSession = (): JWTPayload | null => {
  const token = getToken();
  
  if (!token) {
    return null;
  }

  if (isTokenExpired(token)) {
    clearSession();
    return null;
  }

  return decodeToken(token);
};

/**
 * Formatea el tiempo restante en formato legible
 */
export const formatTimeRemaining = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Hook para inicializar el monitoreo de sesión
 * Debe llamarse una vez al montar la aplicación principal
 * 
 * CARACTERÍSTICAS:
 * - Verificación periódica cada 1 minuto basada en timestamp del JWT
 * - Verificación inmediata al volver a la pestaña (visibilitychange)
 * - Verificación inmediata al enfocar la ventana (focus)
 * - El token CONTINÚA EXPIRANDO incluso si:
 *   * La computadora está bloqueada (pantalla protegida)
 *   * El navegador está minimizado
 *   * La pestaña está en segundo plano
 * 
 * @param onExpired - Callback cuando el token expira (opcional, usa autoLogout por defecto)
 * @param onExpiringSoon - Callback cuando quedan pocos minutos (opcional)
 * @returns Función de limpieza para desmontar listeners
 */
export const initSessionMonitoring = (
  onExpired?: () => void,
  onExpiringSoon?: (minutesRemaining: number) => void
): (() => void) => {
  const defaultOnExpired = () => {
    autoLogout('/login');
  };

  const handleExpired = onExpired || defaultOnExpired;

  // Iniciar verificación periódica (cada 1 minuto)
  const intervalId = checkTokenExpiration(
    handleExpired,
    onExpiringSoon
  );

  // Función para verificar inmediatamente el token
  const checkNow = () => {
    const token = getToken();
    
    // Solo ejecutar handleExpired si HAY token y está expirado
    // Si no hay token, no hacer nada (usuario en /login)
    if (token && isTokenExpired(token)) {
      handleExpired();
    }
  };

  // Listener: Verificar cuando el usuario vuelve a la pestaña
  // Útil cuando la pestaña estuvo inactiva por mucho tiempo
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkNow();
    }
  };

  // Listener: Verificar cuando el usuario enfoca la ventana
  // Útil cuando el usuario desbloquea la pantalla o vuelve de otra app
  const handleFocus = () => {
    checkNow();
  };

  // Registrar listeners
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleFocus);

  // Retornar función de limpieza
  return () => {
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleFocus);
  };
};

/**
 * Verifica si el usuario tiene un rol específico
 */
export const hasRole = (requiredRolId: number): boolean => {
  const session = validateSession();
  if (!session) {
    return false;
  }
  return session.idRol === requiredRolId;
};

/**
 * Verifica si el usuario pertenece a un negocio específico
 */
export const belongsToNegocio = (negocioId: number): boolean => {
  const session = validateSession();
  if (!session) {
    return false;
  }
  return session.idNegocio === negocioId;
};

/**
 * Obtiene la información completa del usuario desde localStorage
 */
export const getUsuarioData = (): Record<string, unknown> | null => {
  try {
    const usuarioStr = localStorage.getItem(USUARIO_KEY);
    if (!usuarioStr) {
      return null;
    }
    return JSON.parse(usuarioStr);
  } catch (error) {
    console.error('Error al parsear datos de usuario:', error);
    return null;
  }
};

// ============================================================================
// FUNCIONES OPCIONALES PARA RENOVACIÓN DE TOKEN (Refresh Token)
// ============================================================================
// Nota: La implementación de refresh token requiere un endpoint adicional
// en el backend y modificaciones en la tabla de tokens

/**
 * OPCIONAL: Renueva el token JWT llamando al endpoint de refresh
 * Requiere implementación del endpoint /api/auth/refresh en el backend
 */
export const refreshToken = async (apiUrl: string): Promise<boolean> => {
  try {
    const currentToken = getToken();
    if (!currentToken) {
      return false;
    }

    const response = await fetch(`${apiUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      }
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    
    if (data.success && data.data.token) {
      localStorage.setItem(TOKEN_KEY, data.data.token);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error al renovar token:', error);
    return false;
  }
};

/**
 * OPCIONAL: Intenta renovar el token automáticamente antes de que expire
 * Llama a refreshToken() cuando quedan 10 minutos de sesión
 */
export const setupAutoRefresh = (apiUrl: string): (() => void) => {
  const REFRESH_THRESHOLD_MS = 600000; // 10 minutos antes de expirar

  const intervalId = setInterval(async () => {
    const token = getToken();
    if (!token) {
      clearInterval(intervalId);
      return;
    }

    const timeRemaining = getTimeUntilExpiration(token);
    
    if (timeRemaining <= REFRESH_THRESHOLD_MS && timeRemaining > 0) {
      const refreshed = await refreshToken(apiUrl);
      
      if (!refreshed) {
        console.warn('No se pudo renovar el token automáticamente');
        autoLogout('/login', 'Tu sesión está por expirar. Por favor, inicia sesión nuevamente.');
        clearInterval(intervalId);
      }
    }
  }, CHECK_INTERVAL_MS);

  return () => {
    clearInterval(intervalId);
  };
};

export default {
  decodeToken,
  getToken,
  isTokenExpired,
  getTimeUntilExpiration,
  isTokenExpiringSoon,
  clearSession,
  setupSessionClearOnReload,
  checkTokenExpiration,
  autoLogout,
  getLogoutMessage,
  validateSession,
  formatTimeRemaining,
  initSessionMonitoring,
  hasRole,
  belongsToNegocio,
  getUsuarioData,
  refreshToken,
  setupAutoRefresh
};
