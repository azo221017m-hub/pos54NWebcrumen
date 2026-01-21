# Implementación de CRUD para Turnos (Shifts)

## Descripción
Implementación completa de CRUD para la tabla `tblposcrumenwebturnos` que permite gestionar los turnos de trabajo del negocio.

## Estructura de la Tabla

### tblposcrumenwebturnos
| Campo | Tipo | Descripción |
|-------|------|-------------|
| idturno | INT(10) UN AI PK | ID único autogenerado del turno |
| numeroturno | INT(11) | Número del turno (igual al idturno) |
| fechainicioturno | DATETIME | Fecha/hora de inicio (autogenerada con NOW()) |
| fechafinturno | DATETIME | Fecha/hora de cierre (NULL hasta cerrar) |
| estatusturno | VARCHAR(20) | Estado: 'abierto' o 'cerrado' |
| claveturno | VARCHAR(50) | Clave compuesta única |
| usuarioturno | VARCHAR(100) | Alias del usuario que inició el turno |
| idnegocio | INT(10) UN | ID del negocio |

### Formato de claveturno
`[ddmmyyyyHHMMSS]+[numeroturno]+[idusuario]+[idnegocio]`

Ejemplo: `21012026143045112345` donde:
- `21012026143045` = 21/01/2026 14:30:45
- `1` = numeroturno
- `1` = idusuario
- `2345` = idnegocio

## Archivos Creados

### Backend
- `backend/src/controllers/turnos.controller.ts` - Controlador con lógica CRUD
- `backend/src/routes/turnos.routes.ts` - Rutas de API
- `backend/src/scripts/create_turnos_table.sql` - Script SQL para crear tabla
- `backend/src/app.ts` - Actualizado para registrar rutas

### Frontend - Types & Services
- `src/types/turno.types.ts` - Interfaces TypeScript
- `src/services/turnosService.ts` - Servicio para llamadas API

### Frontend - Components
- `src/components/turnos/ListaTurnos/` - Componente de lista
  - `ListaTurnos.tsx`
  - `ListaTurnos.css`
- `src/components/turnos/FormularioTurno/` - Componente de formulario
  - `FormularioTurno.tsx`
  - `FormularioTurno.css`

### Frontend - Page
- `src/pages/ConfigTurnos/` - Página principal
  - `ConfigTurnos.tsx`
  - `ConfigTurnos.css`
- `src/router/AppRouter.tsx` - Actualizado con ruta `/config-turnos`

## Endpoints de API

### GET /api/turnos
Obtiene todos los turnos del negocio autenticado
- Requiere autenticación
- Ordenados por idturno DESC

### GET /api/turnos/:idturno
Obtiene un turno específico por ID
- Requiere autenticación

### POST /api/turnos
Inicia un nuevo turno
- Requiere autenticación
- Valida que no exista turno abierto
- Autogenera todos los campos

### PUT /api/turnos/:idturno
Actualiza un turno (cerrar turno)
- Requiere autenticación
- Actualiza estatusturno y fechafinturno

### DELETE /api/turnos/:idturno
Elimina un turno
- Requiere autenticación

### POST /api/turnos/cerrar-actual
Cierra el turno abierto actual del negocio
- Requiere autenticación
- Busca turno con estatusturno='abierto'

## Características

### Autogeneración de Campos
Todos los campos se generan automáticamente en el backend:
- `numeroturno` = `idturno`
- `fechainicioturno` = NOW() al crear
- `fechafinturno` = NULL al crear, NOW() al cerrar
- `estatusturno` = 'abierto' al crear
- `claveturno` = formato especificado
- `usuarioturno` = del token JWT
- `idnegocio` = del token JWT

### Validaciones
- Solo un turno abierto por negocio a la vez
- No se pueden editar turnos cerrados
- Usuario debe estar autenticado

### UI Features
- Diseño consistente con el resto del proyecto
- Colores: gradientes morados/azules
- Cards responsive con información completa
- Estados visuales para turnos abiertos/cerrados
- Cálculo automático de duración del turno
- Confirmación antes de eliminar

## Uso

### Iniciar Turno
1. Acceder a `/config-turnos`
2. Click en "Iniciar Turno"
3. Sistema crea turno automáticamente

### Cerrar Turno
1. Click en "Cerrar Turno" en el card del turno abierto
2. Revisar detalles en modal
3. Confirmar cierre

### Eliminar Turno
1. Click en "Eliminar" en cualquier turno
2. Confirmar eliminación

## Instalación de Base de Datos

Ejecutar el script SQL:
```sql
-- backend/src/scripts/create_turnos_table.sql
```

## Testing
- Build frontend: ✅ Exitoso
- Build backend: ✅ Exitoso
- Rutas registradas: ✅ Sí
- Tipos consistentes: ✅ Sí

## Próximos Pasos
- Verificar funcionamiento en desarrollo/producción
- Pruebas de integración
- Revisar seguridad con CodeQL
- Tomar screenshots de UI
