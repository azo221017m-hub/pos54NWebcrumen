# Fix: Error al registrar venta web - Unknown column 'moderadores'

## 🚨 Problema

Al intentar registrar una venta web en PageVentas, aparece el siguiente error:

```
Error al registrar venta web: Unknown column 'moderadores' in field list
```

## ✅ Solución

Este error se debe a que falta una columna en la base de datos. **Se requiere ejecutar una migración SQL.**

### Pasos para Resolver

1. **Lee la documentación completa de migración:**
   - Ver: [`backend/MIGRATION_MODERADORES_COLUMN.md`](backend/MIGRATION_MODERADORES_COLUMN.md)
   - Este documento contiene instrucciones paso a paso detalladas

2. **Ejecuta el script de migración:**
   - Ubicación: [`backend/src/scripts/add_moderadores_to_detalleventas.sql`](backend/src/scripts/add_moderadores_to_detalleventas.sql)
   - **IMPORTANTE:** Haz un respaldo de la base de datos antes de ejecutar

3. **Comando rápido (para administradores de base de datos):**
   ```bash
   # 1. Respaldar base de datos
   mysqldump -h <DB_HOST> -u <DB_USER> -p <DB_NAME> > backup_$(date +%Y%m%d_%H%M%S).sql
   
   # 2. Conectar y ejecutar migración
   mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME>
   source backend/src/scripts/add_moderadores_to_detalleventas.sql
   
   # 3. Verificar
   DESCRIBE tblposcrumenwebdetalleventas;
   ```

4. **Verifica que la migración se aplicó correctamente:**
   - La columna `moderadores` debe aparecer en la tabla `tblposcrumenwebdetalleventas`
   - Tipo: `LONGTEXT`
   - Nullable: `YES`

## 📋 ¿Qué hace la migración?

Agrega la columna `moderadores` a la tabla `tblposcrumenwebdetalleventas` para almacenar los IDs de moderadores seleccionados para cada producto en una venta.

**La migración es segura porque:**
- ✅ Usa `IF NOT EXISTS` - no falla si la columna ya existe
- ✅ La columna es nullable - no requiere datos para registros existentes
- ✅ No modifica datos existentes
- ✅ No tiene efectos secundarios en otras tablas

## 📚 Documentación Relacionada

- **Guía completa de migración:** [`backend/MIGRATION_MODERADORES_COLUMN.md`](backend/MIGRATION_MODERADORES_COLUMN.md)
- **Guía de migraciones:** [`backend/src/scripts/README_MIGRATIONS.md`](backend/src/scripts/README_MIGRATIONS.md)
- **¿Qué son moderadores?:** [`MODERADORES_VS_USUARIOS.md`](MODERADORES_VS_USUARIOS.md)
- **Script SQL:** [`backend/src/scripts/add_moderadores_to_detalleventas.sql`](backend/src/scripts/add_moderadores_to_detalleventas.sql)

## 🔍 Contexto Técnico

- **Archivo afectado:** `backend/src/controllers/ventasWeb.controller.ts` (línea 246)
- **Tabla de base de datos:** `tblposcrumenwebdetalleventas`
- **Columna faltante:** `moderadores`
- **Tipo de dato:** `LONGTEXT NULL`

## ⚠️ Notas Importantes

1. **Esta migración es REQUERIDA** - Sin ella, las ventas web no se podrán registrar
2. **Se debe aplicar en producción** - Es una actualización necesaria del esquema de base de datos
3. **No hay downtime** - La migración es rápida (milisegundos)
4. **Respaldo recomendado** - Siempre respalda antes de ejecutar migraciones

## 🆘 Soporte

Si tienes problemas aplicando la migración:

1. Revisa la documentación completa: `backend/MIGRATION_MODERADORES_COLUMN.md`
2. Verifica que tienes permisos de `ALTER TABLE` en la base de datos
3. Confirma que estás usando MySQL 5.7+ o MariaDB 10.2+
4. Contacta al equipo de desarrollo con:
   - Mensaje de error completo
   - Versión de MySQL/MariaDB
   - Output de `DESCRIBE tblposcrumenwebdetalleventas;`

---

**Fecha:** 30 de Diciembre, 2024  
**Prioridad:** 🔴 Alta - Bloquea funcionalidad de ventas web  
**Estado:** ✅ Solución documentada - Requiere aplicación en base de datos
