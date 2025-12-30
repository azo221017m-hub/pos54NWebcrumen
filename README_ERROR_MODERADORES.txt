===============================================================================
  ERROR: "Unknown column 'moderadores' in field list" - SOLUCIÓN RÁPIDA
===============================================================================

PROBLEMA:
  Al registrar ventas web, aparece el error:
  "Error al registrar venta web: Unknown column 'moderadores' in field list"

CAUSA:
  Falta una columna en la base de datos

SOLUCIÓN:
  Ejecutar una migración SQL (requiere acceso a la base de datos)

PASOS RÁPIDOS:
  1. Lee: QUICK_FIX_MODERADORES.md (guía de 3 minutos)
  2. O lee: backend/MIGRATION_MODERADORES_COLUMN.md (guía completa)
  3. O lee: SOLUCION_ERROR_MODERADORES.md (en español)

PARA DBAs:
  - Ejecutar: backend/src/scripts/add_moderadores_to_detalleventas.sql
  - Tiempo: ~3 minutos
  - Riesgo: Bajo (migración segura)
  - Downtime: No requerido

DOCUMENTACIÓN:
  📚 QUICK_FIX_MODERADORES.md          - Guía rápida (3 min)
  📚 SOLUCION_ERROR_MODERADORES.md     - Solución en español
  📚 backend/MIGRATION_MODERADORES_COLUMN.md - Guía completa
  📚 backend/src/scripts/README_MIGRATIONS.md - Info de migraciones
  📚 IMPLEMENTATION_REPORT_MODERADORES_FIX.md - Reporte completo
  📚 DEPLOY_CHECKLIST.md               - Checklist actualizado

ESTADO: ✅ Documentación completa - Listo para aplicar migración
===============================================================================
