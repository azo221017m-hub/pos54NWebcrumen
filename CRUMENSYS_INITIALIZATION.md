# 🔑 Inicialización de Usuario Crumensys

## Descripción

Este script proporciona una manera de inicializar automáticamente el sistema con un usuario por defecto cuando la tabla de usuarios está vacía. Es útil para la primera configuración del sistema.

## Usuario Crumensys

Cuando la tabla `tblposcrumenwebusuarios` está vacía, se puede ejecutar el script de inicialización que crea el siguiente usuario:

```javascript
{
  alias: 'crumensys',
  password: 'Crumen.',
  idNegocio: 99999,
  nombre: 'adminsistemas',
  idRol: 1, // Administrador
  estatus: 1
}
```

## Cómo Ejecutar

### Opción 1: Desde el backend

```bash
cd backend
npm run db:init-crumensys
```

### Opción 2: Usando ts-node directamente

```bash
cd backend
npx ts-node src/scripts/initializeCrumensys.ts
```

## Comportamiento del Script

1. **Verifica el estado de la tabla**: Cuenta cuántos usuarios existen en `tblposcrumenwebusuarios`
2. **Si la tabla está vacía** (count = 0):
   - Crea el usuario `crumensys` con contraseña hasheada usando bcrypt
   - Asigna idNegocio: 99999, idRol: 1 (Administrador)
   - Muestra las credenciales en la consola
3. **Si la tabla ya tiene usuarios**:
   - Informa que no se requiere inicialización
   - Muestra los primeros 5 usuarios existentes

## Credenciales

```
Usuario: crumensys
Password: Crumen.
```

## Seguridad

- La contraseña se almacena hasheada usando bcrypt con un factor de 10
- Solo se crea el usuario si la tabla está completamente vacía
- El usuario tiene rol de administrador (idRol: 1) con permisos completos
- ⚠️ **IMPORTANTE**: Por razones de seguridad, se recomienda encarecidamente cambiar la contraseña del usuario crumensys después del primer login
- La contraseña por defecto 'Crumen.' es conocida y está documentada, por lo que no debe usarse en ambientes de producción sin cambiarla

## Ejemplo de Salida

### Cuando la tabla está vacía:

```
🔄 Verificando tabla de usuarios...

📊 Total de usuarios encontrados: 0

⚠️  La tabla está vacía. Insertando usuario crumensys...

✅ Usuario crumensys creado exitosamente!
   ID: 1
   Alias: crumensys
   Nombre: adminsistemas
   idNegocio: 99999
   idRol: 1 (Administrador)
   Password: ********

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Credenciales del usuario crumensys:
   Usuario: crumensys
   Password: Crumen.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Cuando la tabla ya tiene usuarios:

```
🔄 Verificando tabla de usuarios...

📊 Total de usuarios encontrados: 3

ℹ️  La tabla ya contiene usuarios. No se requiere inicialización.
   El usuario crumensys solo se crea si la tabla está vacía.

✅ Usuarios existentes:
   - ID: 1 | Alias: admin | Nombre: Administrador
   - ID: 2 | Alias: usuario1 | Nombre: Usuario Uno
   - ID: 3 | Alias: usuario2 | Nombre: Usuario Dos
```

## Archivos Relacionados

- `/backend/src/scripts/initializeCrumensys.ts` - Script principal
- `/backend/package.json` - Contiene el comando `db:init-crumensys`

## Uso Recomendado

Este script está diseñado para:
1. **Primera instalación del sistema**: Cuando no existen usuarios y necesitas uno para comenzar
2. **Reseteo completo**: Después de limpiar la tabla de usuarios completamente
3. **Recuperación de acceso**: Cuando todos los usuarios han sido eliminados accidentalmente

## Notas Importantes

- ⚠️ **El usuario solo se crea si la tabla está completamente vacía**
- ✅ **El usuario tiene permisos de administrador completos (idRol: 1)**
- ✅ **La contraseña se hashea con bcrypt antes de almacenarse**
- ⚠️ **CRÍTICO: Se DEBE cambiar la contraseña después del primer login por razones de seguridad**
- ⚠️ **No usar la contraseña por defecto en ambientes de producción**
