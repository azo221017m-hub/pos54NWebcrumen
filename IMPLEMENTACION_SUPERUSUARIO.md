# Implementación de Login SUPERUSUARIO

## Resumen

Se ha implementado exitosamente la funcionalidad para permitir el login con un usuario SUPERUSUARIO del sistema con credenciales predefinidas.

## Requisito

Permitir el logueo con usuario SUPERUSUARIO de sistema:
- **Alias:** Crumen
- **Password:** Crumen.*

## Cambios Realizados

### 1. Script de Creación del SUPERUSUARIO

**Archivo:** `backend/src/scripts/createSuperuser.ts`

Este script TypeScript:
- ✅ Verifica si el usuario con alias "Crumen" ya existe en la base de datos
- ✅ Si existe:
  - Actualiza la contraseña a "Crumen.*" (hasheada con bcrypt)
  - Activa el usuario (estatus = 1)
  - Limpia cualquier intento de login fallido previo
- ✅ Si NO existe:
  - Crea un nuevo usuario con:
    - Alias: `Crumen`
    - Nombre: `SUPERUSUARIO`
    - Password: `Crumen.*` (hasheado con bcrypt, 10 salt rounds)
    - Rol: 1 (Administrador)
    - Negocio: 1
    - Estatus: 1 (Activo)

**Características de seguridad:**
- La contraseña se almacena hasheada usando bcrypt con salt de 10 rounds
- El script limpia los intentos de login fallidos para evitar bloqueos
- El usuario se crea con estatus activo para permitir login inmediato
- La contraseña se enmascara en los logs de consola

### 2. Comando NPM

**Archivo:** `backend/package.json`

Se agregó el comando:
```json
"db:create-superuser": "ts-node src/scripts/createSuperuser.ts"
```

**Uso:**
```bash
cd backend
npm run db:create-superuser
```

### 3. Documentación

#### 3.1 README del Script

**Archivo:** `backend/src/scripts/README_SUPERUSER.md`

Documentación detallada que explica:
- Credenciales del SUPERUSUARIO
- Cómo ejecutar el script
- Qué hace el script (paso a paso)
- Requisitos del sistema
- Instrucciones de login
- Notas de seguridad

#### 3.2 Guía de Autenticación

**Archivo:** `AUTHENTICATION_GUIDE.md`

Se agregó una nueva sección (2.2) que documenta:
- Cómo crear/actualizar el SUPERUSUARIO
- Credenciales de acceso
- Comando de ejecución
- Funcionalidad del script

## Integración con el Sistema Existente

### Autenticación

El sistema de autenticación existente en `backend/src/controllers/auth.controller.ts` ya soporta completamente este usuario:

1. **Login por alias:** El endpoint `/api/auth/login` acepta el campo `email` que en realidad es el alias del usuario
2. **Verificación de contraseña:** Usa bcrypt para comparar passwords
3. **Verificación de estatus:** Verifica que el usuario esté activo (estatus = 1)
4. **Generación de token JWT:** Genera un token válido por 8 horas
5. **Auditoría:** Registra el login exitoso en la tabla de auditoría

### Base de Datos

Tabla utilizada: `tblposcrumenwebusuarios`

Campos relevantes:
- `idUsuario` - ID único generado automáticamente
- `idNegocio` - ID del negocio (1)
- `idRol` - Rol del usuario (1 = Administrador)
- `nombre` - Nombre completo ("SUPERUSUARIO")
- `alias` - Username para login ("Crumen")
- `password` - Contraseña hasheada con bcrypt
- `telefono` - Teléfono (vacío)
- `estatus` - Estado del usuario (1 = activo)
- `fechaRegistroauditoria` - Fecha de registro
- `usuarioauditoria` - Usuario que realizó el registro ("system")

## Uso

### 1. Crear/Actualizar el SUPERUSUARIO

```bash
cd backend
npm run db:create-superuser
```

**Salida esperada:**
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

### 2. Login en la Aplicación

1. Abrir la aplicación web
2. Ir a la página de login
3. Ingresar credenciales:
   - **Usuario:** `Crumen`
   - **Contraseña:** `Crumen.*`
4. Click en "Iniciar Sesión"
5. El sistema:
   - Verifica las credenciales contra la base de datos
   - Genera un token JWT válido por 8 horas
   - Registra el login exitoso en la auditoría
   - Redirige al dashboard

## Seguridad

### Análisis de Seguridad Realizado

✅ **CodeQL Scan:** 0 alertas de seguridad  
✅ **Code Review:** Feedback implementado  
✅ **Hashing de Contraseñas:** bcrypt con 10 salt rounds  
✅ **Logs Seguros:** Contraseña enmascarada en consola  
✅ **Manejo de Errores:** Mensajes de error sin exposición de detalles sensibles  

### Consideraciones

1. **Credenciales Hardcodeadas:** Las credenciales están definidas en el código según los requisitos del sistema. Este es un usuario administrativo especial para acceso de emergencia o configuración inicial.

2. **Protección contra Fuerza Bruta:** El sistema ya implementa:
   - Límite de 3 intentos de login fallidos
   - Bloqueo temporal de 30 minutos después de 3 fallos
   - Auditoría de todos los intentos de login

3. **Token JWT:** 
   - Válido por 8 horas
   - Firmado con secret key configurable
   - Incluye datos del usuario (id, alias, nombre, idNegocio, idRol)

## Verificación

### Checklist de Verificación

- [x] Script creado y probado sintácticamente
- [x] Comando NPM agregado
- [x] Documentación completa
- [x] Integración con sistema de autenticación existente
- [x] Revisión de seguridad (CodeQL)
- [x] Revisión de código
- [x] Mejoras de seguridad implementadas

## Conclusión

La implementación está completa y lista para uso. El SUPERUSUARIO puede ser creado ejecutando el script proporcionado, y luego puede hacer login en la aplicación con las credenciales especificadas en los requisitos.
