# ⚡ QUICK FIX: Error "Unknown column 'moderadores'"

## Para el Administrador de Base de Datos

### El Problema
Las ventas web fallan con este error:
```
Error al registrar venta web: Unknown column 'moderadores' in field list
```

### La Solución (3 minutos)

**1. Haz un respaldo (SIEMPRE primero):**
```bash
mysqldump -h <DB_HOST> -u <DB_USER> -p <DB_NAME> > backup_$(date +%Y%m%d_%H%M%S).sql
```

**2. Conecta a la base de datos:**
```bash
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME>
```
*(Te pedirá la contraseña)*

**3. Ejecuta esta SQL:**
```sql
-- Agregar columna moderadores a la tabla de detalles de ventas
ALTER TABLE tblposcrumenwebdetalleventas
ADD COLUMN IF NOT EXISTS moderadores LONGTEXT NULL
COMMENT 'Comma-separated IDs of moderadores (from tblposcrumenwebmoderadores) selected for this product'
AFTER observaciones;

-- Actualizar comentario de la tabla
ALTER TABLE tblposcrumenwebdetalleventas 
COMMENT = 'Detalle de ventas web con información de productos, recetas, costos y moderadores';
```

**4. Verifica que funcionó:**
```sql
DESCRIBE tblposcrumenwebdetalleventas;
```

Deberías ver la columna `moderadores` en la lista.

**5. ¡Listo!** Ahora prueba registrar una venta web.

---

## Alternativa: Usar el script

Si prefieres usar el script SQL incluido en el proyecto:

```bash
# Conéctate a la base de datos
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME>

# Dentro de MySQL, ejecuta:
source backend/src/scripts/add_moderadores_to_detalleventas.sql
```

---

## ¿Qué hace esto?

Agrega una columna llamada `moderadores` a la tabla `tblposcrumenwebdetalleventas`.

Esta columna almacena las opciones de modificación seleccionadas para cada producto en una venta (ejemplo: "Sin picante", "Extra queso").

---

## Seguridad

✅ Esta operación es **SEGURA**:
- No modifica datos existentes
- No elimina nada
- La columna es nullable (no requiere valores para registros antiguos)
- Usa `IF NOT EXISTS` (no falla si la columna ya existe)

---

## Si algo sale mal

1. Revisa el mensaje de error
2. Verifica que tienes permisos `ALTER TABLE`
3. Confirma que estás usando MySQL 5.7+ o MariaDB 10.2+
4. Contacta al equipo de desarrollo

---

## Documentación Completa

Para más detalles, ve:
- `backend/MIGRATION_MODERADORES_COLUMN.md` - Guía completa
- `SOLUCION_ERROR_MODERADORES.md` - Solución en español
- `backend/src/scripts/README_MIGRATIONS.md` - Info de todas las migraciones

---

**⏱️ Tiempo estimado:** 2-3 minutos  
**🔴 Prioridad:** Alta - Bloquea ventas web  
**✅ Probado:** Sí  
**📅 Fecha:** 30 de Diciembre, 2024
