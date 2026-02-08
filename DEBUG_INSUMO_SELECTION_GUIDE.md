# Guía de Mensajes de Debug para Selección de Insumos

## Descripción

Se ha implementado un sistema de mensajes de debug que muestra información detallada cuando se selecciona un insumo en el formulario de movimientos de inventario.

## Ubicación

**Página:** MovimientosInventario  
**Componente:** FormularioMovimiento  
**Campo:** Input de selección de insumo (dropdown)

## Información Mostrada

Cuando se selecciona un insumo, el sistema muestra en la consola del navegador los siguientes datos:

1. **INSUMO** - Nombre del insumo seleccionado
2. **CANT.** - Cantidad (valor actual del campo)
3. **COSTO** - Costo del insumo
4. **PROVEEDOR** - Proveedor asociado
5. **U.M.** - Unidad de medida
6. **EXIST.** - Existencia actual en inventario
7. **COSTO POND.** - Costo promedio ponderado
8. **CANT. ÚLT.** - Cantidad de la última compra
9. **PROV. ÚLT.** - Proveedor de la última compra
10. **COSTO ÚLT.** - Costo de la última compra

## Formato del Mensaje

### Escenario 1: API de última compra exitosa

```
=== DEBUG: Insumo Seleccionado ===
INSUMO: [nombre del insumo]
CANT.: [cantidad]
COSTO: [costo]
PROVEEDOR: [nombre del proveedor]
U.M.: [unidad de medida]
EXIST.: [existencia actual]
COSTO POND.: [costo ponderado]
CANT. ÚLT.: [cantidad última compra]
PROV. ÚLT.: [proveedor última compra]
COSTO ÚLT.: [costo última compra]
================================
```

### Escenario 2: API de última compra falla (datos básicos)

```
=== DEBUG: Insumo Seleccionado (datos básicos) ===
INSUMO: [nombre del insumo]
CANT.: [cantidad]
COSTO: [costo]
PROVEEDOR: [nombre del proveedor]
U.M.: [unidad de medida]
EXIST.: [existencia actual]
COSTO POND.: [costo ponderado]
CANT. ÚLT.: 0
PROV. ÚLT.: 
COSTO ÚLT.: 0
===================================================
```

## Características Técnicas

### Visibilidad
- **Modo Desarrollo:** ✅ Activo - Los mensajes se muestran en la consola
- **Modo Producción:** ❌ Inactivo - Los mensajes son eliminados automáticamente por el proceso de build

### Implementación
- Los mensajes solo se muestran cuando `import.meta.env.DEV` es `true`
- El código de debug es eliminado completamente en builds de producción por Vite
- No hay impacto en el rendimiento de la aplicación en producción

### Seguridad
- ✅ Scan de seguridad CodeQL: 0 alertas
- ✅ No expone información sensible adicional (solo datos ya visibles en la UI)
- ✅ Solo activo en modo desarrollo

## Cómo Usar

### Pasos para ver los mensajes de debug:

1. **Abrir la aplicación en modo desarrollo:**
   ```bash
   npm run dev
   ```

2. **Navegar a la página de Movimientos de Inventario**

3. **Abrir las herramientas de desarrollador del navegador:**
   - Chrome/Edge: F12 o Ctrl+Shift+I (Windows/Linux) / Cmd+Option+I (Mac)
   - Firefox: F12 o Ctrl+Shift+K (Windows/Linux) / Cmd+Option+K (Mac)

4. **Ir a la pestaña "Console" (Consola)**

5. **Crear o editar un movimiento:**
   - Click en el botón "+ INSUMO" para agregar una línea
   - Seleccionar un insumo del dropdown

6. **Ver el mensaje de debug en la consola**

## Ejemplo de Uso Real

```
=== DEBUG: Insumo Seleccionado ===
INSUMO: Harina de trigo
CANT.: 0
COSTO: 45.50
PROVEEDOR: Distribuidora ABC
U.M.: kg
EXIST.: 150
COSTO POND.: 44.75
CANT. ÚLT.: 50
PROV. ÚLT.: Distribuidora ABC
COSTO ÚLT.: 45.00
================================
```

## Casos de Uso

### Para Desarrolladores
- Verificar que los datos del insumo se cargan correctamente
- Debuggear problemas con la API de última compra
- Validar que los cálculos de costos están correctos
- Revisar la integración entre insumos y proveedores

### Para Testing
- Confirmar que todos los campos se populan correctamente
- Verificar el comportamiento cuando falla la API de última compra
- Validar datos de existencia y costos ponderados

## Archivos Modificados

- `src/components/movimientos/FormularioMovimiento/FormularioMovimiento.tsx`

## Notas Adicionales

- Los mensajes aparecen inmediatamente después de seleccionar un insumo
- Si hay múltiples insumos en el formulario, cada selección genera su propio mensaje
- Los valores mostrados reflejan el estado exacto en el momento de la selección
- En caso de error al obtener la última compra, se muestra un mensaje en consola con el prefijo "Error al obtener última compra:"

## Resolución de Problemas

### No veo los mensajes de debug
- ✅ Verifica que estás ejecutando la aplicación en modo desarrollo (`npm run dev`)
- ✅ Confirma que la consola del navegador está abierta
- ✅ Asegúrate de que no hay filtros activos en la consola que oculten los mensajes

### Los mensajes muestran valores vacíos o cero
- Esto es normal si el insumo no tiene datos de última compra
- Verifica que el insumo tiene datos completos en la base de datos
- Revisa si hay mensajes de error en la consola relacionados con la API

## Mantenimiento

Para remover completamente los mensajes de debug del código (si ya no son necesarios):

1. Buscar en el archivo `FormularioMovimiento.tsx` las secciones marcadas con `// DEBUG:`
2. Eliminar los bloques `if (import.meta.env.DEV)` que contienen los console.log
3. Mantener la funcionalidad principal del código intacta
