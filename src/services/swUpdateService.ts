/**
 * Servicio de Actualización de Service Worker (PWA)
 * Maneja la detección y aplicación de actualizaciones del service worker
 */

import { Workbox } from 'workbox-window';
import type { WorkboxLifecycleWaitingEvent } from 'workbox-window';

// Tipo para el callback de actualización disponible
export type UpdateAvailableCallback = (workbox: Workbox) => void;

// Tipo para el callback de actualización aplicada
export type UpdateAppliedCallback = () => void;

/**
 * Registra el service worker y configura los listeners para actualizaciones
 * 
 * @param onUpdateAvailable - Callback cuando hay una nueva versión disponible
 * @param onUpdateApplied - Callback cuando se aplica la actualización
 * @returns Instancia de Workbox o null si no está disponible
 */
export const registerSWWithUpdate = (
  onUpdateAvailable?: UpdateAvailableCallback,
  onUpdateApplied?: UpdateAppliedCallback
): Workbox | null => {
  // Verificar si el navegador soporta service workers
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker no está soportado en este navegador');
    return null;
  }

  // Crear instancia de Workbox
  const wb = new Workbox('/sw.js', {
    scope: '/',
  });

  // Evento: Nueva versión está esperando para activarse
  wb.addEventListener('waiting', (_event: WorkboxLifecycleWaitingEvent) => {
    console.log('🔄 Nueva versión del service worker está esperando...');
    
    if (onUpdateAvailable) {
      onUpdateAvailable(wb);
    }
  });

  // Evento: Nueva versión instalada y controlando la página
  wb.addEventListener('controlling', () => {
    console.log('✅ Nueva versión del service worker está activa');
    
    if (onUpdateApplied) {
      onUpdateApplied();
    }
  });

  // Evento: Service worker activado (primera vez o después de actualización)
  wb.addEventListener('activated', (event) => {
    console.log('🚀 Service worker activado:', event.isUpdate ? 'actualización' : 'primera vez');
    
    // Si es una actualización, recargar la página para usar la nueva versión
    if (event.isUpdate && onUpdateApplied) {
      onUpdateApplied();
    }
  });

  // Registrar el service worker
  wb.register()
    .then((registration) => {
      if (registration) {
        console.log('✅ Service Worker registrado exitosamente');
        
        // Verificar actualizaciones periódicamente (cada hora)
        // Guardar el ID del intervalo para poder limpiarlo si es necesario
        const intervalId = setInterval(() => {
          console.log('🔍 Verificando actualizaciones del service worker...');
          registration.update();
        }, 60 * 60 * 1000); // 1 hora

        // Almacenar el ID del intervalo en una propiedad del objeto workbox
        // para permitir limpieza externa si es necesario
        (wb as any).updateCheckIntervalId = intervalId;
      }
    })
    .catch((error) => {
      console.error('❌ Error al registrar Service Worker:', error);
    });

  return wb;
};

/**
 * Aplica la actualización del service worker inmediatamente
 * Envía mensaje al service worker en espera para que se active
 * 
 * @param workbox - Instancia de Workbox
 */
export const applyUpdate = (workbox: Workbox): void => {
  console.log('⚡ Aplicando actualización del service worker...');
  
  // Enviar mensaje SKIP_WAITING al service worker
  workbox.messageSkipWaiting();
};

/**
 * Refresca la página para cargar la nueva versión
 * Se debe llamar después de que el nuevo service worker tome control
 */
export const refreshPage = (): void => {
  console.log('🔄 Recargando página para aplicar nueva versión...');
  window.location.reload();
};

/**
 * Configuración completa de actualización automática
 * Registra el SW y aplica actualizaciones automáticamente sin notificación
 * 
 * @returns Instancia de Workbox o null
 */
export const setupAutoUpdate = (): Workbox | null => {
  return registerSWWithUpdate(
    // Cuando hay actualización disponible, aplicarla inmediatamente
    (workbox) => {
      console.log('🔄 Aplicando actualización automáticamente...');
      applyUpdate(workbox);
    },
    // Cuando se aplica la actualización, recargar la página
    () => {
      refreshPage();
    }
  );
};

/**
 * Configuración con notificación al usuario
 * Registra el SW y permite al usuario decidir cuándo actualizar
 * 
 * @param onUpdateAvailable - Callback cuando hay actualización (debe mostrar UI)
 * @returns Instancia de Workbox o null
 */
export const setupPromptUpdate = (
  onUpdateAvailable: UpdateAvailableCallback
): Workbox | null => {
  return registerSWWithUpdate(
    onUpdateAvailable,
    // Cuando se aplica la actualización, recargar la página
    () => {
      refreshPage();
    }
  );
};

/**
 * Limpia el cache del service worker (útil al hacer logout)
 * Esta función delega a la función equivalente en sessionService para evitar duplicación
 */
export const clearSWCache = async (): Promise<void> => {
  try {
    if ('serviceWorker' in navigator && 'caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('✅ Cache del Service Worker limpiado');
    }
  } catch (error) {
    console.error('❌ Error al limpiar cache del Service Worker:', error);
  }
};

/**
 * Limpia el intervalo de verificación de actualizaciones
 * Útil para evitar memory leaks si se necesita desmontar el SW
 * 
 * @param workbox - Instancia de Workbox con el intervalo almacenado
 */
export const clearUpdateCheckInterval = (workbox: Workbox | null): void => {
  if (workbox && (workbox as any).updateCheckIntervalId) {
    clearInterval((workbox as any).updateCheckIntervalId);
    console.log('🧹 Intervalo de verificación de actualizaciones limpiado');
  }
};

export default {
  registerSWWithUpdate,
  applyUpdate,
  refreshPage,
  setupAutoUpdate,
  setupPromptUpdate,
  clearSWCache,
  clearUpdateCheckInterval
};
