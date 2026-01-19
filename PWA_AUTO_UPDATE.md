# Sistema de Auto-Actualización PWA

## Descripción General

Este documento describe el sistema de auto-actualización implementado para la PWA (Progressive Web App) de POS54N Web Crumen. El sistema permite que la aplicación se actualice automáticamente después de un deploy, mostrando una notificación al usuario.

## Arquitectura

### Componentes Principales

1. **Service Worker** (generado automáticamente por vite-plugin-pwa)
   - Gestiona el cache de la aplicación
   - Escucha el mensaje `SKIP_WAITING` para activarse inmediatamente
   - Usa `clientsClaim()` para tomar control de las páginas abiertas

2. **swUpdateService.ts** - Servicio de Actualización
   - Registra el Service Worker usando Workbox Window
   - Detecta cuando hay una nueva versión disponible
   - Maneja la comunicación entre el frontend y el Service Worker
   - Dispara eventos personalizados cuando hay actualizaciones

3. **UpdateNotification.tsx** - Componente de Notificación
   - Muestra un banner visual cuando hay una actualización disponible
   - Permite al usuario actualizar inmediatamente o posponer
   - Estilo responsive y accesible

4. **main.tsx** - Punto de Entrada
   - Registra el Service Worker solo en producción
   - Configura el modo "prompt" para notificar al usuario

## Flujo de Actualización

```
1. Usuario visita la aplicación
   ↓
2. Service Worker se registra y se activa
   ↓
3. Usuario trabaja normalmente
   ↓
4. Se hace deploy de una nueva versión
   ↓
5. Service Worker detecta la nueva versión
   ↓
6. Service Worker descarga los nuevos archivos
   ↓
7. Service Worker entra en estado "waiting"
   ↓
8. swUpdateService detecta el estado "waiting"
   ↓
9. Se dispara evento "swUpdateAvailable"
   ↓
10. UpdateNotification muestra banner al usuario
    ↓
11a. Usuario hace clic en "Actualizar"          11b. Usuario hace clic en "Ahora no"
    ↓                                                ↓
12a. Se envía mensaje SKIP_WAITING al SW         12b. Banner se oculta
    ↓                                                ↓
13a. Service Worker se activa inmediatamente     13b. Usuario continúa trabajando
    ↓                                                (actualización disponible para después)
14a. Página se recarga automáticamente
    ↓
15a. Usuario ve la nueva versión
```

## Configuración

### vite.config.ts

```typescript
VitePWA({
  registerType: 'prompt',           // Modo prompt: notificar al usuario
  injectRegister: null,             // No inyectar automáticamente
  workbox: {
    skipWaiting: false,             // No activar automáticamente
    clientsClaim: true,             // Tomar control después de activarse
    cleanupOutdatedCaches: true,    // Limpiar caches antiguos
  }
})
```

### Características Clave

1. **Detección Automática**: El Service Worker verifica actualizaciones cada hora
2. **Notificación al Usuario**: Banner visual no intrusivo en la parte inferior
3. **Control del Usuario**: El usuario decide cuándo aplicar la actualización
4. **Recarga Automática**: Después de aceptar, la página se recarga con la nueva versión
5. **Limpieza de Cache**: Los caches antiguos se eliminan automáticamente

## Uso

### Modo Prompt (Actual)

El usuario ve una notificación y decide cuándo actualizar:

```typescript
// En main.tsx
setupPromptUpdate((workbox) => {
  const event = new CustomEvent('swUpdateAvailable', { detail: { workbox } });
  window.dispatchEvent(event);
});
```

### Modo Auto (Alternativo)

Para actualizar automáticamente sin notificación:

```typescript
// Cambiar en main.tsx
import { setupAutoUpdate } from './services/swUpdateService'

setupAutoUpdate(); // Actualiza automáticamente sin preguntar
```

## API del Servicio

### `registerSWWithUpdate(onUpdateAvailable?, onUpdateApplied?)`

Registra el Service Worker y configura los listeners.

**Parámetros:**
- `onUpdateAvailable`: Callback cuando hay una nueva versión
- `onUpdateApplied`: Callback cuando se aplica la actualización

**Retorna:** Instancia de Workbox o null

### `applyUpdate(workbox)`

Aplica la actualización inmediatamente enviando mensaje SKIP_WAITING.

**Parámetros:**
- `workbox`: Instancia de Workbox

### `refreshPage()`

Recarga la página para usar la nueva versión.

### `setupPromptUpdate(onUpdateAvailable)`

Configura actualización con notificación al usuario.

**Parámetros:**
- `onUpdateAvailable`: Callback cuando hay actualización

**Retorna:** Instancia de Workbox o null

### `setupAutoUpdate()`

Configura actualización automática sin notificación.

**Retorna:** Instancia de Workbox o null

### `clearSWCache()`

Limpia todos los caches del Service Worker.

**Retorna:** Promise<void>

## Eventos Personalizados

### `swUpdateAvailable`

Se dispara cuando hay una nueva versión disponible.

**Detalle del Evento:**
```typescript
{
  workbox: Workbox // Instancia de Workbox para aplicar la actualización
}
```

**Uso:**
```typescript
window.addEventListener('swUpdateAvailable', (event) => {
  const workbox = event.detail.workbox;
  // Manejar actualización
});
```

## Componente UpdateNotification

### Props

Ninguna. El componente escucha automáticamente el evento `swUpdateAvailable`.

### Métodos Internos

- `handleUpdate()`: Aplica la actualización inmediatamente
- `handleDismiss()`: Oculta la notificación sin actualizar

### Estilos

Los estilos están en `src/styles/UpdateNotification.css` y son:
- **Responsive**: Se adapta a móviles y escritorio
- **Accesible**: Usa roles ARIA y atributos de accesibilidad
- **Modo oscuro**: Compatible con `prefers-color-scheme: dark`

## Testing

### Probar Actualizaciones en Desarrollo

1. **Build inicial:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Hacer cambio en el código** (por ejemplo, cambiar texto en App.tsx)

3. **Build nuevo:**
   ```bash
   npm run build
   ```

4. **Recargar la página en el navegador**
   - Abre DevTools → Application → Service Workers
   - Verás el nuevo SW en "waiting"
   - La notificación debería aparecer

5. **Click en "Actualizar"**
   - La página se recarga
   - La nueva versión está activa

### Probar en Producción

1. **Deploy versión 1:**
   ```bash
   npm run build
   # Deploy a Vercel/Netlify/etc
   ```

2. **Visitar la aplicación** y trabajar normalmente

3. **Hacer cambios y deploy versión 2:**
   ```bash
   # Hacer cambios en el código
   npm run build
   # Deploy a Vercel/Netlify/etc
   ```

4. **En la aplicación abierta:**
   - Esperar ~1 hora (o refrescar manualmente)
   - La notificación aparece
   - Click en "Actualizar"
   - La nueva versión se carga

## Ventajas del Sistema

1. ✅ **Usuario en control**: El usuario decide cuándo actualizar
2. ✅ **No interrumpe el trabajo**: La actualización no se fuerza
3. ✅ **Actualización garantizada**: Después de aceptar, se recarga con la nueva versión
4. ✅ **Cache limpio**: No hay archivos obsoletos
5. ✅ **Verificación periódica**: Busca actualizaciones cada hora
6. ✅ **Fácil de cambiar**: Se puede cambiar a auto-update fácilmente

## Desventajas

1. ⚠️ **Requiere acción del usuario**: Si el usuario ignora la notificación, seguirá con la versión antigua
2. ⚠️ **Solo en producción**: No funciona en desarrollo (modo dev de Vite)

## Solución de Problemas

### La notificación no aparece

1. Verificar que estés en producción (`npm run build && npm run preview`)
2. Abrir DevTools → Console y buscar logs con 🔄 o 📦
3. Verificar en DevTools → Application → Service Workers que hay un SW "waiting"

### El Service Worker no se actualiza

1. En DevTools → Application → Service Workers:
   - Click en "Update" para forzar verificación
   - Verificar que "Update on reload" NO esté marcado
2. Verificar que los archivos cambiaron realmente (cambiar App.tsx)
3. Limpiar cache del navegador y recargar

### La página no recarga después de actualizar

1. Verificar en Console si hay errores
2. Verificar que `workbox.messageSkipWaiting()` se ejecutó
3. El Service Worker debe pasar de "waiting" a "activated"

## Recursos

- [Workbox Window](https://developer.chrome.com/docs/workbox/modules/workbox-window/)
- [Service Worker Lifecycle](https://web.dev/service-worker-lifecycle/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [PWA Update Patterns](https://web.dev/service-worker-lifecycle/#update-on-reload)

## Mantenimiento

### Cambiar de Prompt a Auto

En `src/main.tsx`, cambiar:

```typescript
// De esto:
import { setupPromptUpdate } from './services/swUpdateService'
setupPromptUpdate((workbox) => { ... });

// A esto:
import { setupAutoUpdate } from './services/swUpdateService'
setupAutoUpdate();
```

### Cambiar frecuencia de verificación

En `src/services/swUpdateService.ts`, línea ~73:

```typescript
// Cambiar de 1 hora a 30 minutos:
}, 30 * 60 * 1000); // 30 minutos
```

### Personalizar notificación

Editar `src/components/UpdateNotification.tsx` y `src/styles/UpdateNotification.css`.

## Conclusión

El sistema de auto-actualización implementado proporciona una experiencia de usuario fluida y controlada para mantener la aplicación actualizada sin interrumpir el flujo de trabajo del usuario.
