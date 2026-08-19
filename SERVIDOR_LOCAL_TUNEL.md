# Convertir tu Mac en servidor de la app (acceso desde otra red WiFi)

Guía para que un cliente conectado a **otra red WiFi** (no la misma LAN) pueda
usar esta app corriendo en tu Mac, mientras tú sigues usando VS Code
normalmente en otros proyectos.

## Arquitectura de esta solución

```
Cliente (otra WiFi)                Tu Mac
      │                              │
      │  https://xxxx.trycloudflare.com
      ▼                              │
┌─────────────┐   túnel   ┌──────────────────────┐
│  cloudflared │◄─────────►│ Vite dev server :5173│
└─────────────┘            │   (proxy interno)     │
                            │  /api, /ws  → :3000   │
                            └──────────┬────────────┘
                                       ▼
                            ┌──────────────────────┐
                            │ Backend Express :3000 │
                            └──────────┬────────────┘
                                       ▼
                            ┌──────────────────────┐
                            │  Azure MySQL (nube)   │
                            │  (BD de producción)   │
                            └──────────────────────┘
```

Puntos clave de este diseño:

- **La base de datos NO cambia de lugar.** El backend en tu Mac se conecta
  al mismo Azure MySQL que ya usa producción. No hay que instalar MySQL
  local ni exponer ningún puerto de base de datos a internet.
- **Solo se expone un puerto (5173, el frontend).** El backend (3000) se
  queda escuchando en `localhost` y nunca se expone directamente: Vite ya
  tiene configurado un proxy interno que reenvía `/api` y `/ws` hacia
  `localhost:3000` ([vite.config.ts](vite.config.ts)). Esto también evita
  problemas de CORS, porque el navegador del cliente solo ve un origen
  (la URL del túnel).
- **Un solo túnel = una sola URL** que compartes con el cliente.

---

## 0. Prerrequisitos

```bash
# Instalar cloudflared (túnel gratuito de Cloudflare, sin cuenta necesaria
# para un "quick tunnel")
brew install cloudflared
```

Necesitas también las credenciales de la base de datos Azure MySQL de
producción (host, usuario, password, nombre de BD). Están donde ya las
tengas guardadas (Render dashboard / `.env` de producción del backend).

> Nota de seguridad: vas a exponer temporalmente tu ambiente de
> **desarrollo** conectado a la BD de **producción**. Cualquier venta,
> movimiento o cambio que se haga desde el cliente remoto se guardará en la
> base de datos real. Trátalo con el mismo cuidado que producción.

---

## 1. Configurar el backend para usar Azure MySQL

```bash
cd /Users/azo/Proyectos/pos54NWebcrumen/backend
cp .env.example .env
```

Edita `backend/.env` y completa con los datos de Azure MySQL (no dejes
`localhost`):

```env
PORT=3000

DB_HOST=crumenprod01.mysql.database.azure.com
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=pos_crumen
# SSL va habilitado por defecto (correcto para Azure, no lo desactives)

JWT_SECRET=usa_el_mismo_valor_que_produccion_o_uno_propio
JWT_EXPIRES_IN=24h

NODE_ENV=development
TZ=Etc/GMT+6

# No es necesario tocar estas dos para este escenario: como el navegador
# del cliente solo habla con la URL del túnel (proxy interno de Vite),
# nunca dispara una petición cross-origin real hacia el backend.
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

Instala dependencias y levanta el backend:

```bash
npm install
npm run dev
```

Deberías ver en consola:
```
🚀 Servidor corriendo en http://localhost:3000
📊 Health check: http://localhost:3000/api/health
```

Verifica la conexión a la BD:

```bash
curl http://localhost:3000/api/health
```

**Deja esta terminal corriendo.**

---

## 2. Levantar el frontend

En **otra terminal**:

```bash
cd /Users/azo/Proyectos/pos54NWebcrumen
npm install
npm run dev
```

Vite arrancará en `http://localhost:5173`. Ya se le agregó `host: true` y
`allowedHosts: true` en [vite.config.ts](vite.config.ts) — esto es
necesario para que acepte peticiones que llegan con el hostname público del
túnel en vez de `localhost` (Vite las bloquea por defecto por seguridad).

**Deja esta segunda terminal corriendo también.**

---

## 3. Exponer el frontend a internet con Cloudflare Tunnel

En una **tercera terminal**:

```bash
cloudflared tunnel --url http://localhost:5173
```

Verás algo como:

```
Your quick Tunnel has been created! Visit it at:
https://random-words-1234.trycloudflare.com
```

Comparte esa URL con el cliente en la otra red WiFi. Al abrirla en su
navegador, verá la app completa (frontend), y todas las llamadas a
`/api/...` y al WebSocket viajarán por el mismo túnel hacia tu backend
local, que a su vez habla con Azure MySQL.

**Deja esta tercera terminal corriendo mientras el cliente use la app.**

### Limitación a tener en cuenta

El "quick tunnel" genera una **URL nueva cada vez que reinicias
`cloudflared`**. Si cierras y vuelves a abrir esa terminal, tendrás que
volver a compartir la nueva URL con el cliente. Para una URL fija y
permanente (ej. `pos.tudominio.com`) se necesita un dominio propio + una
cuenta gratuita de Cloudflare y un "named tunnel"; si más adelante quieres
eso, dímelo y armamos esa variante.

---

## Resumen: 3 terminales corriendo en tu Mac

| Terminal | Comando | Puerto |
|---|---|---|
| 1 | `cd backend && npm run dev` | 3000 (local, no expuesto) |
| 2 | `npm run dev` (raíz del repo) | 5173 (local, no expuesto) |
| 3 | `cloudflared tunnel --url http://localhost:5173` | expone 5173 a internet |

Mientras estas 3 terminales sigan abiertas, puedes seguir usando VS Code
con total normalidad para trabajar en otros proyectos — no interfieren
entre sí.

## Para detener el servidor

`Ctrl + C` en cada una de las 3 terminales (el orden no importa).

## Alternativa rápida: ngrok

Si prefieres ngrok en vez de Cloudflare (requiere crear cuenta gratuita en
ngrok.com y un authtoken):

```bash
brew install ngrok
ngrok config add-authtoken TU_TOKEN
ngrok http 5173
```

Te dará una URL `https://xxxx.ngrok-free.app` que funciona igual que el
paso 3 de arriba.
