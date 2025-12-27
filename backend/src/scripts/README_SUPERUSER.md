# Script para Crear SUPERUSUARIO

Este script crea o actualiza el SUPERUSUARIO del sistema con las credenciales requeridas.

## Credenciales del SUPERUSUARIO

- **Usuario/Alias:** `Crumen`
- **Contraseña:** `Crumen.*`
- **Rol:** Administrador (idRol: 1)
- **Negocio:** idNegocio: 1

## Uso

Para ejecutar el script desde el directorio backend:

```bash
npm run db:create-superuser
```

## Qué hace el script

1. **Verifica** si el usuario con alias "Crumen" ya existe en la base de datos
2. **Si existe:**
   - Actualiza la contraseña a "Crumen.*"
   - Activa el usuario (estatus = 1)
   - Limpia cualquier intento de login fallido previo
3. **Si NO existe:**
   - Crea un nuevo usuario con:
     - Alias: `Crumen`
     - Nombre: `SUPERUSUARIO`
     - Password: `Crumen.*` (hasheado con bcrypt)
     - Rol: 1 (Administrador)
     - Negocio: 1
     - Estatus: 1 (Activo)

## Requisitos

- Base de datos MySQL configurada y accesible
- Archivo `.env` con la configuración de la base de datos:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`

## Login en la Aplicación

Una vez ejecutado el script, puedes hacer login en la aplicación con:

- **Usuario:** `Crumen`
- **Contraseña:** `Crumen.*`

El sistema de autenticación verificará el alias y password contra la base de datos usando bcrypt para la comparación de contraseñas.

## Notas de Seguridad

- La contraseña se almacena hasheada usando bcrypt con salt de 10 rounds
- El script limpia los intentos de login fallidos para evitar que la cuenta esté bloqueada
- El usuario se crea con estatus activo (1) para permitir login inmediato
