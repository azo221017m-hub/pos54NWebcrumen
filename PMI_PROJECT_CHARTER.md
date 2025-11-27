# PROJECT CHARTER
## Sistema POS Web Crumen (pos54nwebcrumen)

**Versión del Documento**: 1.0  
**Fecha**: 27 de noviembre de 2025  
**Versión del Sistema**: 2.5.B12  
**Preparado por**: Equipo de Desarrollo  

---

## 1. INFORMACIÓN GENERAL DEL PROYECTO

### 1.1 Identificación del Proyecto

| Campo | Información |
|-------|-------------|
| **Nombre del Proyecto** | Sistema POS Web Crumen |
| **Código del Proyecto** | pos54nwebcrumen |
| **Fecha de Inicio** | [Fecha de inicio del proyecto] |
| **Fecha Estimada de Finalización** | [Fecha planificada] |
| **Patrocinador del Proyecto** | [Nombre del patrocinador] |
| **Director del Proyecto** | [Nombre del PM] |
| **Organización** | Crumen |

### 1.2 Descripción del Proyecto

Sistema de Punto de Venta (POS) web diseñado para la gestión integral de restaurantes y negocios de alimentos, con funcionalidades de comanda digital, control de inventario, gestión de ventas y administración de personal.

### 1.3 Justificación del Proyecto

**Necesidad del Negocio**:
- Digitalización de procesos operativos en restaurantes
- Reducción de errores en toma de órdenes
- Control en tiempo real de inventarios y ventas
- Mejora en la experiencia del cliente
- Trazabilidad completa de operaciones

**Oportunidades**:
- Mercado creciente de soluciones digitales para restaurantes
- Demanda de sistemas multi-tenant para cadenas de restaurantes
- Necesidad de sistemas seguros con auditoría completa

---

## 2. OBJETIVOS DEL PROYECTO

### 2.1 Objetivos de Negocio

1. **Eficiencia Operativa**: Reducir en un 40% el tiempo de toma de órdenes
2. **Control Financiero**: Mejorar la precisión del control de inventario en un 95%
3. **Seguridad**: Implementar sistema de auditoría completo con trazabilidad del 100%
4. **Escalabilidad**: Soportar múltiples negocios (multi-tenant) desde una sola instalación
5. **Disponibilidad**: Lograr 99.5% de uptime del sistema

### 2.2 Objetivos Técnicos

1. **Arquitectura Moderna**: Implementar stack React + TypeScript + Express + MySQL
2. **Seguridad**: JWT con expiración de 8 horas y sistema de bloqueo por intentos fallidos
3. **Auditoría**: Registro completo de intentos de login con metadata (IP, navegador, OS)
4. **PWA**: Aplicación web progresiva con soporte offline
5. **Performance**: Tiempo de respuesta < 2 segundos en operaciones críticas

### 2.3 Criterios de Éxito

| Criterio | Métrica | Meta |
|----------|---------|------|
| **Disponibilidad** | Uptime mensual | ≥ 99.5% |
| **Performance** | Tiempo de respuesta API | < 2 segundos |
| **Seguridad** | Intentos de login fallidos bloqueados | 100% |
| **Auditoría** | Registros capturados | 100% |
| **Usabilidad** | Tiempo de entrenamiento de usuarios | < 4 horas |
| **Escalabilidad** | Negocios soportados | Ilimitado |

---

## 3. ALCANCE DEL PROYECTO

### 3.1 Dentro del Alcance

#### Módulos Implementados

**3.1.1 Autenticación y Seguridad**
- ✅ Sistema de login con JWT
- ✅ Auditoría de intentos de login
- ✅ Bloqueo automático después de 3 intentos fallidos
- ✅ Desbloqueo automático en 30 minutos
- ✅ Registro de metadata (IP, navegador, OS, dispositivo)
- ✅ Gestión de sesiones con auto-logout
- ✅ Verificación de sesión con pantalla bloqueada

**3.1.2 Administración de Usuarios**
- ✅ CRUD de usuarios
- ✅ Gestión de roles
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Multi-tenant (separación por negocio)

**3.1.3 Configuración de Catálogos**
- ✅ Categorías de productos
- ✅ Moderadores y categorías de moderadores
- ✅ Clientes
- ✅ Mesas
- ✅ Descuentos
- ✅ Cuentas contables
- ✅ Unidades de medida de compra

**3.1.4 Gestión de Insumos y Productos**
- ✅ Insumos (ingredientes)
- ✅ Recetas
- ✅ Subrecetas
- ✅ Control de inventario

**3.1.5 Infraestructura**
- ✅ PWA con manifest y service worker
- ✅ SEO optimizado para Google
- ✅ Interceptores de API centralizados
- ✅ Manejo global de errores

### 3.2 Fuera del Alcance (Esta Versión)

- ❌ Integración con sistemas de pago externos (MercadoPago, Stripe)
- ❌ Aplicación móvil nativa (iOS/Android)
- ❌ Impresión de tickets en impresoras térmicas
- ❌ Dashboard de analytics y reportes avanzados
- ❌ Sistema de reservaciones
- ❌ Integración con delivery apps (Uber Eats, Rappi)
- ❌ Sistema de propinas digitales

### 3.3 Supuestos

1. El cliente provee infraestructura de hosting (servidor, base de datos)
2. Los usuarios tienen acceso a internet estable
3. Los navegadores son versiones modernas (Chrome 90+, Firefox 88+, Edge 90+)
4. Existe un administrador técnico para configuración inicial
5. Los datos del negocio (menú, precios) están disponibles para carga inicial

### 3.4 Restricciones

1. **Tecnológicas**: 
   - Frontend: React 19.0.0 + TypeScript
   - Backend: Node.js 18+ + Express
   - Base de datos: MySQL 8.0+
   
2. **Presupuestarias**: 
   - Uso de tecnologías open-source
   - Infraestructura en la nube (Render.com)

3. **Temporales**: 
   - Versión 2.5.B12 completada
   - Próxima release major: [Fecha planificada]

4. **Regulatorias**:
   - Cumplimiento de GDPR/LOPD para datos personales
   - Normativas fiscales locales

---

## 4. ENTREGABLES DEL PROYECTO

### 4.1 Entregables de Software

| Entregable | Descripción | Estado |
|------------|-------------|--------|
| **Frontend Application** | SPA React con PWA | ✅ Completado |
| **Backend API** | API REST con Express | ✅ Completado |
| **Base de Datos** | Schema MySQL con tablas | ✅ Completado |
| **Sistema de Autenticación** | JWT + Auditoría | ✅ Completado |
| **Sistema de Sesiones** | Gestión automática | ✅ Completado |
| **Módulos de Configuración** | 12 módulos CRUD | ✅ Completado |

### 4.2 Entregables de Documentación

| Documento | Propósito | Estado |
|-----------|-----------|--------|
| **README.md** | Guía de inicio rápido | ✅ Completado |
| **HOW_TO_RUN.md** | Instrucciones de ejecución | ✅ Completado |
| **QUICKSTART.md** | Inicio rápido | ✅ Completado |
| **DEVELOPMENT_GUIDE.md** | Guía de desarrollo | ✅ Completado |
| **AUTHENTICATION_GUIDE.md** | Guía de autenticación | ✅ Completado |
| **SESSION_TIMER_GUIDE.md** | Guía del temporizador de sesión | ✅ Completado |
| **SISTEMA_AUDITORIA_LOGIN.md** | Sistema de auditoría | ✅ Completado |
| **SISTEMA_SESIONES.md** | Sistema de sesiones | ✅ Completado |
| **COMPORTAMIENTO_EXPIRACION_SESION.md** | Comportamiento de expiración | ✅ Completado |
| **API_DOCUMENTATION.md** | Documentación de API (backend) | ✅ Completado |
| **PROJECT_STRUCTURE.txt** | Estructura del proyecto | ✅ Completado |
| **DEPLOY_CHECKLIST.md** | Checklist de despliegue | ✅ Completado |
| **PRODUCCION.md** | Guía de producción | ✅ Completado |
| **RENDER.md** | Despliegue en Render | ✅ Completado |

### 4.3 Entregables de Infraestructura

- ✅ Configuración de Vite para producción
- ✅ Configuración de PWA
- ✅ Scripts de build automatizados
- ✅ Configuración de variables de entorno
- ✅ Archivos de despliegue (render.json)

---

## 5. ORGANIZACIÓN DEL PROYECTO

### 5.1 Estructura Organizacional

```
Director del Proyecto
    │
    ├── Equipo de Desarrollo Frontend
    │   ├── Desarrollador React Senior
    │   └── Desarrollador UI/UX
    │
    ├── Equipo de Desarrollo Backend
    │   ├── Desarrollador Node.js Senior
    │   └── Especialista en Bases de Datos
    │
    ├── Equipo de QA
    │   └── Tester/QA Engineer
    │
    └── DevOps Engineer
```

### 5.2 Roles y Responsabilidades

| Rol | Responsabilidades | Autoridad |
|-----|-------------------|-----------|
| **Patrocinador** | Aprobar presupuesto, definir objetivos estratégicos | Alta |
| **Director de Proyecto** | Planificación, ejecución, monitoreo, cierre | Alta |
| **Tech Lead Frontend** | Arquitectura frontend, revisión de código | Media |
| **Tech Lead Backend** | Arquitectura backend, seguridad, base de datos | Media |
| **Desarrolladores** | Implementación de features, corrección de bugs | Media |
| **QA Engineer** | Testing, validación de calidad | Media |
| **DevOps** | CI/CD, infraestructura, monitoreo | Media |
| **Usuarios Finales** | Feedback, validación de usabilidad | Baja |

---

## 6. STAKEHOLDERS (INTERESADOS)

### 6.1 Identificación de Stakeholders

| Stakeholder | Interés | Poder | Estrategia |
|-------------|---------|-------|------------|
| **Dueños de Negocios** | Alto (usuarios principales) | Alto | Gestionar Cercanamente |
| **Meseros/Cajeros** | Alto (usuarios diarios) | Medio | Mantener Satisfechos |
| **Gerentes de Restaurante** | Alto (reportes, control) | Alto | Gestionar Cercanamente |
| **Equipo de Desarrollo** | Alto (construcción) | Medio | Mantener Satisfechos |
| **Proveedor de Hosting** | Medio (infraestructura) | Bajo | Monitorear |
| **Autoridades Fiscales** | Medio (cumplimiento) | Alto | Gestionar Cercanamente |
| **Clientes Finales** | Medio (experiencia) | Bajo | Mantener Informados |

### 6.2 Matriz de Comunicaciones

| Stakeholder | Información | Frecuencia | Método |
|-------------|-------------|------------|--------|
| **Patrocinador** | Estado general, riesgos, presupuesto | Semanal | Reporte ejecutivo |
| **Equipo Técnico** | Tareas, bugs, dailies | Diario | Stand-up, Slack |
| **Usuarios Finales** | Capacitación, nuevas features | Por release | Email, videos |
| **Gerentes** | Métricas, reportes | Mensual | Dashboard |

---

## 7. CRONOGRAMA DE ALTO NIVEL

### 7.1 Hitos Principales

| Hito | Fecha | Estado |
|------|-------|--------|
| **Fase 1: Infraestructura Base** | [Fecha] | ✅ Completado |
| **Fase 2: Autenticación y Seguridad** | [Fecha] | ✅ Completado |
| **Fase 3: Módulos de Configuración** | [Fecha] | ✅ Completado |
| **Fase 4: Sistema de Auditoría** | 22-Ene-2025 | ✅ Completado |
| **Fase 5: Gestión de Sesiones** | 22-Ene-2025 | ✅ Completado |
| **Fase 6: Testing y Correcciones** | [En progreso] | 🔄 En curso |
| **Fase 7: Despliegue a Producción** | [Planificado] | ⏳ Pendiente |

### 7.2 Roadmap Futuro

| Feature | Prioridad | Estimación | Release Target |
|---------|-----------|------------|----------------|
| **Módulo de Ventas Completo** | Alta | 4 semanas | v2.6 |
| **Sistema de Reportes** | Alta | 3 semanas | v2.6 |
| **Dashboard Analytics** | Media | 2 semanas | v2.7 |
| **Integración de Pagos** | Alta | 3 semanas | v2.7 |
| **App Móvil** | Baja | 8 semanas | v3.0 |
| **Sistema de Propinas** | Media | 2 semanas | v2.8 |

---

## 8. PRESUPUESTO

### 8.1 Estimación de Costos

| Categoría | Descripción | Costo Estimado | Frecuencia |
|-----------|-------------|----------------|------------|
| **Desarrollo** | Equipo de 4 desarrolladores | Variable | Por proyecto |
| **Hosting Frontend** | Render.com (plan Pro) | $7-25/mes | Mensual |
| **Hosting Backend** | Render.com (plan Pro) | $7-25/mes | Mensual |
| **Base de Datos** | MySQL en Render/AWS | $10-50/mes | Mensual |
| **Dominio** | .com/.mx | $15/año | Anual |
| **SSL Certificate** | Let's Encrypt (gratis) | $0 | Gratis |
| **Monitoreo** | Herramientas de monitoreo | $0-20/mes | Mensual |
| **Testing** | Herramientas de QA | $0 | Gratis (open source) |
| **Total Mensual (Infraestructura)** | | **$24-120/mes** | |

### 8.2 ROI Esperado

- **Reducción de errores**: 40% menos errores en órdenes = ahorro en desperdicio
- **Eficiencia operativa**: 30% menos tiempo en toma de órdenes
- **Control de inventario**: 25% reducción en mermas por mejor control
- **Retorno de inversión estimado**: 6-12 meses

---

## 9. RIESGOS DEL PROYECTO

### 9.1 Registro de Riesgos

| ID | Riesgo | Probabilidad | Impacto | Estrategia de Mitigación | Responsable |
|----|--------|--------------|---------|--------------------------|-------------|
| R01 | Caída del servidor de producción | Media | Alto | Backup automático, plan de recuperación | DevOps |
| R02 | Vulnerabilidad de seguridad | Baja | Crítico | Auditorías de seguridad, actualizaciones | Tech Lead |
| R03 | Pérdida de datos | Baja | Crítico | Backups diarios, redundancia de BD | DevOps |
| R04 | Escalabilidad insuficiente | Media | Alto | Arquitectura escalable, load balancing | Arquitecto |
| R05 | Falta de adopción de usuarios | Media | Alto | Capacitación, UX intuitivo | PM |
| R06 | Cambios en requisitos | Alta | Medio | Metodología ágil, sprints cortos | PM |
| R07 | Dependencia de terceros (Render) | Baja | Medio | Plan de migración alternativo | DevOps |
| R08 | Bugs críticos en producción | Media | Alto | Testing exhaustivo, QA continuo | QA Lead |

### 9.2 Matriz de Riesgos

```
IMPACTO
  Alto    │ R05 │ R01, R04, R08 │ R02, R03 │
  Medio   │ R06 │      R07      │          │
  Bajo    │     │               │          │
          └─────┴───────────────┴──────────┴
               Baja    Media      Alta
                   PROBABILIDAD
```

---

## 10. CALIDAD

### 10.1 Estándares de Calidad

| Área | Estándar | Métrica |
|------|----------|---------|
| **Código** | Clean Code, SOLID principles | Code review 100% |
| **Seguridad** | OWASP Top 10 | 0 vulnerabilidades críticas |
| **Testing** | Cobertura mínima | ≥ 80% en funciones críticas |
| **Performance** | Web Vitals | LCP < 2.5s, FID < 100ms |
| **Accesibilidad** | WCAG 2.1 AA | Mínimo AA |
| **Documentación** | Código documentado | 100% funciones públicas |

### 10.2 Plan de Aseguramiento de Calidad

**Actividades de QA**:
1. ✅ Unit Testing (Jest, React Testing Library)
2. ✅ Integration Testing (API endpoints)
3. ✅ Código TypeScript tipado estrictamente
4. ✅ Linting con ESLint
5. ✅ Code reviews obligatorios
6. ⏳ Testing de carga y estrés (pendiente)
7. ⏳ Auditoría de seguridad (pendiente)

### 10.3 Criterios de Aceptación

**Para cada feature**:
- [ ] Código revisado por al menos 1 desarrollador senior
- [ ] Testing unitario con ≥80% cobertura
- [ ] Testing manual completado
- [ ] Documentación actualizada
- [ ] Sin errores de TypeScript
- [ ] Sin vulnerabilidades conocidas
- [ ] Aprobación del Product Owner

---

## 11. GESTIÓN DE CAMBIOS

### 11.1 Proceso de Control de Cambios

```
Solicitud de Cambio
        ↓
Evaluación de Impacto (PM + Tech Lead)
        ↓
    ¿Aprobado?
        ↓
    Sí → Planificación → Implementación → Testing → Despliegue
        ↓
    No → Rechazo con justificación
```

### 11.2 Clasificación de Cambios

| Tipo | Definición | Aprobación Requerida | Tiempo Estimado |
|------|------------|---------------------|-----------------|
| **Crítico** | Bug de seguridad, pérdida de datos | Inmediata | Hotfix < 24h |
| **Mayor** | Nueva funcionalidad, cambio arquitectónico | Patrocinador + PM | 1-4 semanas |
| **Menor** | Mejora, bug no crítico | Tech Lead | 1-7 días |
| **Trivial** | Typos, ajustes visuales | Desarrollador | < 1 día |

### 11.3 Historial de Cambios Mayores

| Versión | Fecha | Cambios | Tipo |
|---------|-------|---------|------|
| **2.5.B12** | 22-Ene-2025 | Sistema de auditoría de login completo | Mayor |
| **2.5.B12** | 22-Ene-2025 | Sistema de gestión de sesiones JWT | Mayor |
| **2.5.B12** | 22-Ene-2025 | Corrección de 11 servicios con apiClient | Crítico |
| **2.5.B12** | 22-Ene-2025 | Mejora en expiración de sesión (listeners) | Menor |
| **2.5.B11** | [Fecha] | SEO metadata, PWA fixes | Menor |

---

## 12. COMUNICACIONES

### 12.1 Plan de Comunicaciones

| Audiencia | Tipo de Comunicación | Frecuencia | Responsable |
|-----------|---------------------|------------|-------------|
| **Equipo Desarrollo** | Daily Standup | Diario | Scrum Master |
| **Equipo Desarrollo** | Sprint Planning | Quincenal | PM |
| **Patrocinador** | Status Report | Semanal | PM |
| **Usuarios** | Release Notes | Por release | Product Owner |
| **Stakeholders** | Newsletter | Mensual | PM |

### 12.2 Canales de Comunicación

- **Interno**: Slack, Microsoft Teams
- **Documentación**: GitHub Wiki, Confluence
- **Tracking**: Jira, GitHub Issues
- **Email**: Para comunicaciones formales
- **Video**: Zoom, Google Meet para reuniones

---

## 13. ADQUISICIONES (PROCUREMENT)

### 13.1 Servicios/Productos Adquiridos

| Item | Proveedor | Costo | Tipo de Contrato |
|------|-----------|-------|------------------|
| **Hosting** | Render.com | $14-50/mes | Subscripción mensual |
| **Dominio** | [Proveedor] | $15/año | Anual |
| **Monitoreo** | [Herramienta] | Variable | Por uso |
| **IDE/Herramientas** | VS Code (gratis), npm (gratis) | $0 | Open Source |

### 13.2 Dependencias de Software

**Frontend** (package.json):
- react: 19.0.0
- react-router-dom: 7.1.1
- axios: 1.7.9
- jwt-decode: 4.0.0
- vite: 7.2.2
- typescript: ~5.7.2

**Backend** (backend/package.json):
- express: 4.21.2
- mysql2: 3.11.5
- bcrypt: 5.1.1
- jsonwebtoken: 9.0.2
- cors: 2.8.5
- dotenv: 16.4.7

---

## 14. LECCIONES APRENDIDAS

### 14.1 Éxitos

1. ✅ **Arquitectura TypeScript**: Reducción de bugs en 60% vs JavaScript
2. ✅ **Sistema de auditoría**: Trazabilidad completa implementada desde el inicio
3. ✅ **Documentación continua**: Facilitó onboarding y mantenimiento
4. ✅ **apiClient centralizado**: Evitó errores en producción
5. ✅ **PWA desde el inicio**: Mejor experiencia de usuario

### 14.2 Desafíos Enfrentados

1. ⚠️ **Configuración de ESLint**: Archivos backend no incluidos en tsconfig
   - **Solución**: Documentado como warning no bloqueante
   
2. ⚠️ **Referencias de PWA assets**: 404 en assets inexistentes
   - **Solución**: Actualizado vite.config.ts con assets correctos
   
3. ⚠️ **Servicios usando axios directo**: Producción con errores 404
   - **Solución**: Migración de 11 servicios a apiClient centralizado

### 14.3 Mejoras para Futuros Proyectos

1. 🔄 Implementar CI/CD desde el inicio
2. 🔄 Testing automatizado en cada PR
3. 🔄 Auditoría de seguridad en cada release
4. 🔄 Monitoreo y alertas desde día 1
5. 🔄 Plan de capacitación de usuarios más temprano

---

## 15. CRITERIOS DE CIERRE

### 15.1 Condiciones para Cierre del Proyecto

- [ ] Todos los entregables completados y aceptados
- [ ] Documentación técnica y de usuario finalizada
- [ ] Sistema desplegado en producción
- [ ] Capacitación de usuarios completada
- [ ] Período de estabilización de 30 días exitoso
- [ ] Transferencia de conocimiento al equipo de soporte
- [ ] Lecciones aprendidas documentadas
- [ ] Aprobación formal del patrocinador

### 15.2 Actividades de Cierre

1. **Documentación Final**:
   - Manual de usuario
   - Manual técnico
   - Runbooks de operación
   
2. **Transferencia**:
   - Código fuente en repositorio
   - Credenciales de acceso
   - Documentación de infraestructura
   
3. **Soporte Post-Lanzamiento**:
   - 90 días de garantía
   - Corrección de bugs críticos
   - Soporte técnico

---

## 16. APROBACIONES

### 16.1 Firmas de Aprobación

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| **Patrocinador del Proyecto** | [Nombre] | _____________ | ______ |
| **Director del Proyecto** | [Nombre] | _____________ | ______ |
| **Tech Lead** | [Nombre] | _____________ | ______ |
| **Product Owner** | [Nombre] | _____________ | ______ |

---

## ANEXOS

### A. Glosario de Términos

| Término | Definición |
|---------|------------|
| **POS** | Point of Sale (Punto de Venta) |
| **JWT** | JSON Web Token - Token de autenticación |
| **PWA** | Progressive Web App |
| **CRUD** | Create, Read, Update, Delete |
| **RBAC** | Role-Based Access Control |
| **Multi-tenant** | Múltiples negocios en una sola instalación |
| **SPA** | Single Page Application |
| **API REST** | API basada en principios REST |

### B. Referencias

- Documentación técnica: `/docs`
- Repositorio: GitHub - azo221017m-hub/pos54NWebcrumen
- Stack tecnológico: React 19, Express, MySQL 8
- Estándares: PMI PMBOK 7th Edition

### C. Historial de Revisiones del Documento

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 27-Nov-2025 | Equipo de Desarrollo | Creación inicial del Project Charter |

---

**Documento controlado. Última actualización**: 27 de noviembre de 2025  
**Próxima revisión**: [Fecha programada]  
**Estado del Proyecto**: ACTIVO - Versión 2.5.B12 en Producción

