# Corrección de Errores en Producción - Servicios API

## 📋 Resumen
Se corrigieron errores en producción causados por servicios que usaban `axios` directamente en lugar de usar la instancia configurada `apiClient`, lo que causaba problemas con las URLs en ambiente de producción.

## 🐛 Errores Identificados
```
❌ insumosService - Error al obtener insumos: Ae
❌ cuentasContablesService - Error al obtener cuentas: Ae
```

## 🔧 Causa del Problema
Los servicios estaban usando:
- `axios.get('/api/insumos/...')` → URL relativa sin base configurada
- URLs hardcodeadas con `/api/` que no se ajustaban al ambiente de producción

## ✅ Solución Implementada
Se modificaron **11 servicios** para usar `apiClient` de `./api.ts` que tiene:
- URL base configurada desde variables de entorno
- Interceptor de autenticación automático
- Manejo de errores centralizado

### Archivos Corregidos:

1. **insumosService.ts**
   - ❌ Antes: `axios.get('/api/insumos/...')`
   - ✅ Ahora: `apiClient.get('/insumos/...')`

2. **cuentasContablesService.ts**
   - ❌ Antes: `axios.get('/api/cuentas-contables/...')`
   - ✅ Ahora: `apiClient.get('/cuentas-contables/...')`

3. **categoriasService.ts**
   - ❌ Antes: `axios.get('/api/categorias/...')`
   - ✅ Ahora: `apiClient.get('/categorias/...')`

4. **moderadoresService.ts**
   - ❌ Antes: `axios.get('/api/moderadores/...')`
   - ✅ Ahora: `apiClient.get('/moderadores/...')`

5. **recetasService.ts**
   - ❌ Antes: `axios.get('/api/recetas/...')`
   - ✅ Ahora: `apiClient.get('/recetas/...')`

6. **subrecetasService.ts**
   - ❌ Antes: `axios.get('/api/subrecetas/...')`
   - ✅ Ahora: `apiClient.get('/subrecetas/...')`

7. **moderadoresRefService.ts**
   - ❌ Antes: `axios.get('/api/moderadores/...')`
   - ✅ Ahora: `apiClient.get('/moderadores/...')`

8. **mesasService.ts**
   - ❌ Antes: URLs hardcodeadas con `VITE_API_URL`
   - ✅ Ahora: `apiClient.get('/mesas/...')`

9. **descuentosService.ts**
   - ❌ Antes: URLs hardcodeadas con `VITE_API_URL`
   - ✅ Ahora: `apiClient.get('/descuentos/...')`

10. **clientesService.ts**
    - ❌ Antes: `axios.get('/api/clientes/...')`
    - ✅ Ahora: `apiClient.get('/clientes/...')`

11. **catModeradoresService.ts**
    - ❌ Antes: URLs hardcodeadas con `VITE_API_URL`
    - ✅ Ahora: `apiClient.get('/cat-moderadores/...')`

### Servicios que YA estaban correctos:
- ✅ **negociosService.ts** - Ya usaba `api.get()`
- ✅ **rolesService.ts** - Ya usaba `api.get()`
- ✅ **usuariosService.ts** - Ya usaba `api.get()`
- ✅ **umcompraService.ts** - Ya usaba `api.get()`

## 📝 Cambios Adicionales
También se eliminaron las funciones `getAuthHeaders()` de cada servicio ya que el interceptor de `apiClient` maneja automáticamente la autenticación.

## 🎯 Beneficios
1. **URLs Dinámicas**: Se adaptan automáticamente al ambiente (desarrollo/producción)
2. **Autenticación Centralizada**: El token se agrega automáticamente
3. **Manejo de Errores**: Redirección automática al login si el token expira
4. **Código más Limpio**: Menos duplicación de código
5. **Fácil Mantenimiento**: Cambios en una sola ubicación (api.ts)

## 🚀 Próximos Pasos
1. Compilar el proyecto: `npm run build`
2. Desplegar a producción
3. Verificar que los errores se han corregido

## 📅 Fecha de Cambio
27 de Noviembre de 2025

## 🔖 Versión
2.5.B12
