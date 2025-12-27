# Guía de Ejecución: createSuperuser.ts

## Resumen

Este documento proporciona instrucciones detalladas para ejecutar el endpoint/script `createSuperuser.ts` que crea o actualiza el SUPERUSUARIO del sistema.

## Objetivo

Crear o actualizar el usuario SUPERUSUARIO del sistema con las siguientes credenciales:
- **Usuario/Alias:** `Crumen`
- **Contraseña:** `Crumen.*`
- **Rol:** Administrador (idRol: 1)

## Requisitos Previos

1. **Base de datos MySQL configurada y accesible**
2. **Archivo `.env` configurado** en el directorio `backend/` con:
   ```env
   DB_HOST=<host_de_base_de_datos>
   DB_USER=<usuario_de_base_de_datos>
   DB_PASSWORD=<contraseña_de_base_de_datos>
   DB_NAME=<nombre_de_base_de_datos>
   DB_PORT=3306
   ```
3. **Node.js y npm instalados** (versión 16 o superior)
4. **Dependencias instaladas** ejecutando `npm install` en el directorio `backend/`

## Métodos de Ejecución

Existen **DOS métodos** para ejecutar la creación/actualización del SUPERUSUARIO:

### Método 1: Script de CLI (Recomendado para inicialización)

Este método ejecuta el script directamente desde la línea de comandos.

#### Pasos:

1. Navegar al directorio backend:
   ```bash
   cd backend
   ```

2. Ejecutar el script:
   ```bash
   npm run db:create-superuser
   ```

#### Salida Esperada (Usuario Nuevo):

```
🔄 Verificando usuario SUPERUSUARIO...

⚠️  SUPERUSUARIO no encontrado. Creándolo...

✅ SUPERUSUARIO creado exitosamente!
   ID: [auto-generado]
   Alias: Crumen
   Nombre: SUPERUSUARIO
   Rol: 1 (Administrador)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Credenciales del SUPERUSUARIO:
   Usuario: Crumen
   Password: ********
   (Consultar documentación para la contraseña completa)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Salida Esperada (Usuario Existente):

```
🔄 Verificando usuario SUPERUSUARIO...

✅ SUPERUSUARIO encontrado:
   ID: 123
   Alias: Crumen
   Nombre: SUPERUSUARIO
   Estatus: 1

✅ Contraseña del SUPERUSUARIO actualizada exitosamente!
✅ Historial de intentos de login limpiado.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Credenciales del SUPERUSUARIO:
   Usuario: Crumen
   Password: ********
   (Consultar documentación para la contraseña completa)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Método 2: API Endpoint (Para sistemas en ejecución)

Este método usa el endpoint REST API cuando el servidor backend está corriendo.

#### Pasos:

1. Asegurarse de que el servidor backend esté corriendo:
   ```bash
   cd backend
   npm run dev
   # o
   npm start
   ```

2. Hacer una petición POST al endpoint:

   **Usando curl:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/ensure-superuser \
     -H "Content-Type: application/json"
   ```

   **Usando Postman o herramientas similares:**
   - Método: `POST`
   - URL: `http://localhost:3000/api/auth/ensure-superuser`
   - Headers: `Content-Type: application/json`
   - Body: No se requiere

   **Usando JavaScript/fetch:**
   ```javascript
   fetch('http://localhost:3000/api/auth/ensure-superuser', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json'
     }
   })
   .then(response => response.json())
   .then(data => console.log(data))
   .catch(error => console.error('Error:', error));
   ```

#### Respuesta Esperada (Usuario Creado):

```json
{
  "success": true,
  "message": "SUPERUSUARIO creado exitosamente",
  "data": {
    "alias": "Crumen",
    "id": 123,
    "action": "created"
  }
}
```

#### Respuesta Esperada (Usuario Actualizado):

```json
{
  "success": true,
  "message": "SUPERUSUARIO actualizado y cuenta desbloqueada exitosamente",
  "data": {
    "alias": "Crumen",
    "id": 123,
    "action": "updated"
  }
}
```

#### Respuesta de Error:

```json
{
  "success": false,
  "message": "Error al procesar la solicitud del SUPERUSUARIO"
}
```

## Qué Hace el Script/Endpoint

El script/endpoint realiza las siguientes operaciones:

1. **Verifica** si el usuario con alias "Crumen" existe en la tabla `tblposcrumenwebusuarios`

2. **Si el usuario EXISTE:**
   - Actualiza la contraseña a "Crumen.*" (hasheada con bcrypt, 10 salt rounds)
   - Activa el usuario estableciendo `estatus = 1`
   - Limpia todos los intentos de login fallidos de la tabla `tblposcrumenwebintentoslogin`
   - Esto asegura que el usuario no esté bloqueado y pueda hacer login inmediatamente

3. **Si el usuario NO EXISTE:**
   - Crea un nuevo registro en `tblposcrumenwebusuarios` con:
     - `alias`: "Crumen"
     - `nombre`: "SUPERUSUARIO"
     - `password`: "Crumen.*" (hasheada con bcrypt)
     - `idRol`: 1 (Administrador)
     - `idNegocio`: 1
     - `estatus`: 1 (Activo)
     - `telefono`: "" (vacío)
     - `fechaRegistroauditoria`: Timestamp actual
     - `usuarioauditoria`: "system"

## Verificación de Ejecución Exitosa

Después de ejecutar el script/endpoint, puedes verificar que funcionó correctamente:

### 1. Verificar en Base de Datos

Ejecutar esta consulta SQL:

```sql
SELECT idUsuario, alias, nombre, idRol, estatus 
FROM tblposcrumenwebusuarios 
WHERE alias = 'Crumen';
```

**Resultado esperado:**
```
idUsuario | alias  | nombre        | idRol | estatus
----------|--------|---------------|-------|--------
123       | Crumen | SUPERUSUARIO  | 1     | 1
```

### 2. Verificar Login en la Aplicación

1. Abrir la aplicación web: `https://pos54nwebcrumen.onrender.com`
2. Ir a la página de login
3. Ingresar credenciales:
   - **Usuario:** `Crumen`
   - **Contraseña:** `Crumen.*`
4. Click en "Iniciar Sesión"
5. **Resultado esperado:** Login exitoso y redirección al dashboard

### 3. Verificar Estado de Bloqueo

Verificar que no hay intentos de login fallidos:

```sql
SELECT * 
FROM tblposcrumenwebintentoslogin 
WHERE aliasusuario = 'Crumen';
```

**Resultado esperado:** 0 registros (la tabla debe estar limpia para este usuario)

## Casos de Uso

### Caso 1: Inicialización del Sistema

Cuando se configura el sistema por primera vez:

```bash
cd backend
npm install
npm run db:create-superuser
```

### Caso 2: Recuperación de Cuenta Bloqueada

Si el SUPERUSUARIO está bloqueado por intentos fallidos:

```bash
cd backend
npm run db:create-superuser
```

Esto desbloqueará la cuenta y restablecerá la contraseña.

### Caso 3: Restablecimiento de Contraseña

Si se olvidó la contraseña del SUPERUSUARIO:

```bash
cd backend
npm run db:create-superuser
```

La contraseña será restablecida a "Crumen.*"

### Caso 4: Sistema en Producción

Si el sistema está corriendo en producción y necesitas asegurar que el SUPERUSUARIO existe:

```bash
curl -X POST https://pos54nwebcrumenbackend.onrender.com/api/auth/ensure-superuser \
  -H "Content-Type: application/json"
```

## Troubleshooting

### Error: "getaddrinfo ENOTFOUND [host]"

**Causa:** No se puede conectar a la base de datos.

**Solución:**
1. Verificar que la base de datos esté corriendo
2. Verificar las credenciales en el archivo `.env`
3. Verificar la conectividad de red al servidor de base de datos
4. Verificar reglas de firewall

### Error: "Access denied for user"

**Causa:** Credenciales de base de datos incorrectas.

**Solución:**
1. Verificar `DB_USER` y `DB_PASSWORD` en `.env`
2. Verificar que el usuario tenga permisos en la base de datos

### Error: "Unknown database"

**Causa:** La base de datos especificada no existe.

**Solución:**
1. Verificar `DB_NAME` en `.env`
2. Crear la base de datos si no existe

### Advertencia: "1 high severity vulnerability"

**Causa:** Vulnerabilidades en dependencias npm.

**Solución:**
```bash
npm audit fix
```

## Seguridad

### Consideraciones Importantes

1. **Credenciales Hardcodeadas:** 
   - Las credenciales del SUPERUSUARIO están predefinidas según requisitos del sistema
   - Este es un usuario administrativo especial para acceso de emergencia
   - La contraseña se almacena hasheada con bcrypt (10 salt rounds)

2. **Acceso al Endpoint:**
   - El endpoint `/api/auth/ensure-superuser` es público por diseño
   - Esto permite la inicialización del sistema sin necesidad de autenticación previa
   - En producción, considerar restringir el acceso mediante IP whitelist o autenticación adicional

3. **Protección contra Fuerza Bruta:**
   - El sistema implementa límite de 3 intentos de login fallidos
   - Bloqueo temporal de 30 minutos después de 3 fallos
   - Auditoría de todos los intentos de login

4. **Token JWT:**
   - Válido por 8 horas después del login
   - Firmado con secret key configurable en `.env`
   - Incluye datos del usuario (id, alias, nombre, idNegocio, idRol)

## Archivos Relacionados

- **Script:** `backend/src/scripts/createSuperuser.ts`
- **Endpoint:** `backend/src/routes/auth.routes.ts` (línea 52)
- **Controller:** `backend/src/controllers/auth.controller.ts` (función `ensureSuperuser`)
- **Configuración:** `backend/.env`
- **Configuración de DB:** `backend/src/config/db.ts`

## Referencias

- [IMPLEMENTACION_SUPERUSUARIO.md](./IMPLEMENTACION_SUPERUSUARIO.md) - Documentación de implementación completa
- [backend/src/scripts/README_SUPERUSER.md](./backend/src/scripts/README_SUPERUSER.md) - Documentación del script
- [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) - Guía de autenticación del sistema

## Conclusión

Este documento proporciona dos métodos confiables para ejecutar la creación/actualización del SUPERUSUARIO:

1. **Script CLI** (`npm run db:create-superuser`) - Recomendado para inicialización y operaciones de mantenimiento
2. **API Endpoint** (`POST /api/auth/ensure-superuser`) - Recomendado para sistemas en ejecución o automatización

Ambos métodos son seguros, idempotentes (pueden ejecutarse múltiples veces sin problemas), y proporcionan feedback claro del resultado de la operación.
