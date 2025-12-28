/**
 * Servicio de Renovación de Token basado en Actividad
 * Implementa una sesión deslizante (sliding session) que renueva el token
 * cuando el usuario realiza acciones como cambiar de página o hacer clic en menús
 */

import { getToken, getTimeUntilExpiration } from './sessionService';

// Constantes de configuración
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'token'; // Debe coincidir con sessionService.ts
const REFRESH_THRESHOLD_MS = 300000; // Renovar si quedan menos de 5 minutos (300000ms)
const MIN_REFRESH_INTERVAL_MS = 60000; // No renovar más de una vez por minuto

// Variable para rastrear la última renovación
let lastRefreshTime = 0;
let isRefreshing = false;
let lastActivityCheck = 0;

/**
 * Determina si es necesario renovar el token
 * @returns true si el token está próximo a expirar y no se renovó recientemente
 */
const shouldRefreshToken = (): boolean => {
  const token = getToken();
  if (!token) {
    return false;
  }

  // No renovar si ya se renovó recientemente
  const timeSinceLastRefresh = Date.now() - lastRefreshTime;
  if (timeSinceLastRefresh < MIN_REFRESH_INTERVAL_MS) {
    return false;
  }

  // Renovar si quedan menos de 5 minutos
  const timeRemaining = getTimeUntilExpiration(token);
  return timeRemaining <= REFRESH_THRESHOLD_MS && timeRemaining > 0;
};

/**
 * Renueva el token JWT llamando al endpoint de refresh
 * @returns true si la renovación fue exitosa, false en caso contrario
 */
export const refreshToken = async (): Promise<boolean> => {
  // Evitar múltiples renovaciones simultáneas
  if (isRefreshing) {
    return false;
  }

  try {
    isRefreshing = true;

    const currentToken = getToken();
    if (!currentToken) {
      return false;
    }

    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      }
    });

    if (!response.ok) {
      console.warn('⚠️ No se pudo renovar el token:', response.status);
      return false;
    }

    const data = await response.json();
    
    if (data.success && data.data?.token) {
      // Actualizar el token en localStorage usando la constante
      localStorage.setItem(TOKEN_KEY, data.data.token);
      lastRefreshTime = Date.now();
      console.log('✅ Token renovado exitosamente');
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Error al renovar token:', error);
    return false;
  } finally {
    isRefreshing = false;
  }
};

/**
 * Registra actividad del usuario y renueva el token si es necesario
 * Debe llamarse en eventos de actividad como:
 * - Cambio de página (navegación)
 * - Click en menús
 * - Acciones importantes del usuario
 */
export const trackActivity = async (): Promise<void> => {
  // Throttle: evitar verificaciones excesivas (no más de una verificación cada 10 segundos)
  const now = Date.now();
  if (now - lastActivityCheck < 10000) {
    return; // Ignorar actividad si se verificó hace menos de 10 segundos
  }
  lastActivityCheck = now;
  
  if (shouldRefreshToken()) {
    await refreshToken();
  }
};

/**
 * Configura listeners para detectar actividad del usuario
 * @returns Función de limpieza para remover los listeners
 */
export const setupActivityTracking = (): (() => void) => {
  // Rastrear clicks en el documento
  const handleClick = () => {
    trackActivity();
  };

  // Rastrear cambios de página (popstate)
  const handleNavigation = () => {
    trackActivity();
  };

  // Rastrear interacciones con el teclado
  const handleKeyDown = () => {
    trackActivity();
  };

  // Registrar listeners
  document.addEventListener('click', handleClick);
  window.addEventListener('popstate', handleNavigation);
  document.addEventListener('keydown', handleKeyDown);

  // Renovar inmediatamente si es necesario
  trackActivity();

  // Retornar función de limpieza
  return () => {
    document.removeEventListener('click', handleClick);
    window.removeEventListener('popstate', handleNavigation);
    document.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Hook para configurar la renovación automática de token en navegación
 * Debe usarse en el router o en componentes que manejan la navegación
 */
export const setupNavigationTracking = (): (() => void) => {
  // Rastrear cada navegación
  const handleNavigation = () => {
    trackActivity();
  };

  // Para react-router, podemos usar eventos de popstate y hashchange
  window.addEventListener('popstate', handleNavigation);
  window.addEventListener('hashchange', handleNavigation);

  // Renovar inmediatamente al montar
  trackActivity();

  // Retornar función de limpieza
  return () => {
    window.removeEventListener('popstate', handleNavigation);
    window.removeEventListener('hashchange', handleNavigation);
  };
};

export default {
  refreshToken,
  trackActivity,
  setupActivityTracking,
  setupNavigationTracking
};
