# Configuración de Vercel

## Problema Identificado

El bot de Vercel aparece automáticamente en los Pull Requests del repositorio, creando despliegues de previsualización (preview deployments) para cada commit. Esto puede ser confuso o innecesario si el proyecto principal se despliega en otra plataforma (como Render.com).

## Solución Implementada

Se han agregado los siguientes archivos de configuración:

### 1. `vercel.json`

Este archivo configura cómo Vercel despliega el proyecto:

- **`github.enabled: false`**: Intenta desactivar los despliegues automáticos desde GitHub
- **`github.autoAlias: false`**: Desactiva la creación automática de alias
- **`github.silent: true`**: Reduce las notificaciones de Vercel en los PRs
- **`env`**: Define variables de entorno para producción (apuntando al backend en Render.com)

### 2. `.vercelignore`

Especifica qué archivos y carpetas deben excluirse del despliegue en Vercel:

- Excluye `node_modules`, `backend/`, documentación, scripts, etc.
- Reduce el tamaño del despliegue y acelera el proceso
- Similar a `.gitignore` pero específico para Vercel

### 3. `.gitignore` (actualizado)

Se agregó la carpeta `.vercel` para evitar que archivos locales de Vercel se suban al repositorio.

## Cómo Desactivar Completamente Vercel

Si deseas desactivar completamente la integración de Vercel con GitHub:

### Opción 1: Desde la Configuración del Repositorio en GitHub

1. Ve a tu repositorio en GitHub
2. Navega a **Settings** → **Integrations** → **GitHub Apps**
3. Busca **Vercel**
4. Haz clic en **Configure** o **Manage**
5. Selecciona **Uninstall** o deshabilita el repositorio específico

### Opción 2: Desde el Dashboard de Vercel

1. Accede a tu cuenta en [vercel.com](https://vercel.com)
2. Ve a tu proyecto
3. Navega a **Settings** → **Git**
4. Desconecta el repositorio o elimina el proyecto

### Opción 3: Desactivar Solo los Preview Deployments

1. En el dashboard de Vercel, ve a tu proyecto
2. **Settings** → **Git**
3. Encuentra la sección **Preview Deployments**
4. Desactiva "Automatically create preview deployments"

## Plataforma de Despliegue Actual

Este proyecto está configurado para desplegarse en **Render.com**:

- **Frontend**: https://pos54nwebcrumen.onrender.com
- **Backend**: https://pos54nwebcrumenbackend.onrender.com

Ver `deploy.ps1` y `PRODUCCION.md` para más detalles sobre el proceso de despliegue.

## Recomendación

Si **NO** planeas usar Vercel para despliegue:
- Desinstala la integración de Vercel desde GitHub (Opción 1)
- Esto detendrá completamente los despliegues automáticos y las notificaciones del bot

Si **SÍ** quieres mantener Vercel para preview deployments:
- Los archivos de configuración actuales (`vercel.json` y `.vercelignore`) ya están optimizados
- Las previsualizaciones pueden ser útiles para revisar cambios antes de hacer merge

## Comandos Útiles de Vercel CLI (opcional)

Si tienes el CLI de Vercel instalado:

```bash
# Instalar Vercel CLI globalmente
npm i -g vercel

# Ver proyectos vinculados
vercel list

# Desvincular el proyecto actual
vercel unlink

# Ver logs de despliegue
vercel logs
```

## Referencias

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git/vercel-for-github)
- [Disable Preview Deployments](https://vercel.com/docs/concepts/deployments/preview-deployments)

---

**Última actualización**: 2026-01-09  
**Autor**: Sistema de configuración automatizada
