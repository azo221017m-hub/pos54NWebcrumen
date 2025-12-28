# Diferencia entre Moderadores y Usuarios

## ⚠️ IMPORTANTE: NO CONFUNDIR

### Usuarios (tblposcrumenwebusuarios)
Los **usuarios** son personas que acceden al sistema POS. Cada usuario tiene:
- Un nombre completo (ej: "Juan Pérez")
- Un alias para login (ej: "jperez")
- Una contraseña encriptada
- Un rol asignado (Administrador, Cajero, etc.)
- Permisos para realizar acciones en el sistema

**Ejemplo de usuarios:**
- Juan Pérez (Administrador)
- María González (Cajera)
- Carlos López (Mesero)

### Moderadores (tblposcrumenwebmoderadores)
Los **moderadores** son opciones de modificación para productos. NO son personas. Son características que se pueden aplicar a un producto durante una venta:
- Modificaciones de ingredientes (ej: "Sin picante", "Sin cebolla")
- Opciones adicionales (ej: "Extra queso", "Doble carne")
- Especificaciones de preparación (ej: "Término medio", "Bien cocido")

**Ejemplo de moderadores:**
- Sin picante
- Extra queso
- Sin cebolla
- Término medio
- Bien cocido
- Sin mayonesa

## ¿Cómo funcionan los Moderadores?

1. Se crean moderadores individuales (opciones) en la tabla `tblposcrumenwebmoderadores`
2. Se agrupan en categorías en la tabla `tblposcrumenwebmodref` (ej: "Ingredientes", "Punto de cocción")
3. Las categorías de productos se vinculan a estas categorías de moderadores
4. Al vender un producto, se pueden seleccionar los moderadores aplicables

## Errores Comunes

### ❌ INCORRECTO
Crear moderadores con nombres de personas:
- Juan Pérez
- María González
- Carlos López

### ✅ CORRECTO
Crear moderadores con opciones de modificación:
- Sin picante
- Extra queso
- Sin cebolla
- Término medio

## Flujo de Datos

```
Producto → Categoría → Categoría de Moderadores → Moderadores Disponibles
                                                    ↓
                                             [Usuario selecciona]
                                                    ↓
                                            Venta con Moderadores
```

## Referencias en el Código

- **Frontend**: `src/components/moderadores/FormularioModerador/FormularioModerador.tsx`
- **Backend**: `backend/src/controllers/moderadores.controller.ts`
- **Tipos**: `src/types/moderador.types.ts`
- **Documentación**: `PAGEVENTAS_IMPROVEMENTS_SUMMARY.md` (líneas 49-56)

## Pregunta Frecuente

**P: ¿Los moderadores deben estar vinculados a usuarios?**

R: No necesariamente. Los moderadores son opciones de productos, no personas. Sin embargo, si se necesita rastrear qué usuario preparó un producto con ciertos moderadores, eso se maneja a través del campo `usuarioauditoria` en las ventas, no a través de la tabla de moderadores.
