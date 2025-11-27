# PROJECT MANAGEMENT PLAN
## Sistema POS Web Crumen (pos54nwebcrumen)

**Versión del Documento**: 1.0  
**Fecha**: 27 de noviembre de 2025  
**Versión del Sistema**: 2.5.B12  
**Director del Proyecto**: [Nombre]  

---

## CONTROL DE CAMBIOS DEL DOCUMENTO

| Versión | Fecha | Descripción del Cambio | Autor |
|---------|-------|------------------------|-------|
| 1.0 | 27-Nov-2025 | Creación inicial del documento | Equipo PMO |

---

## TABLA DE CONTENIDO

1. [Introducción](#1-introducción)
2. [Plan de Gestión del Alcance](#2-plan-de-gestión-del-alcance)
3. [Plan de Gestión del Cronograma](#3-plan-de-gestión-del-cronograma)
4. [Plan de Gestión de Costos](#4-plan-de-gestión-de-costos)
5. [Plan de Gestión de Calidad](#5-plan-de-gestión-de-calidad)
6. [Plan de Gestión de Recursos](#6-plan-de-gestión-de-recursos)
7. [Plan de Gestión de Comunicaciones](#7-plan-de-gestión-de-comunicaciones)
8. [Plan de Gestión de Riesgos](#8-plan-de-gestión-de-riesgos)
9. [Plan de Gestión de Adquisiciones](#9-plan-de-gestión-de-adquisiciones)
10. [Plan de Gestión de Interesados](#10-plan-de-gestión-de-interesados)
11. [Plan de Gestión de Cambios](#11-plan-de-gestión-de-cambios)

---

## 1. INTRODUCCIÓN

### 1.1 Propósito del Plan

Este Plan de Gestión del Proyecto define cómo el proyecto Sistema POS Web Crumen será ejecutado, monitoreado, controlado y cerrado. Proporciona la base para todas las actividades de gestión del proyecto.

### 1.2 Alcance del Plan

Este plan cubre todos los aspectos de la gestión del proyecto desde la fase actual (v2.5.B12) hasta el cierre formal, incluyendo:
- Gestión del alcance, cronograma y costos
- Gestión de calidad y recursos
- Gestión de comunicaciones y riesgos
- Gestión de adquisiciones e interesados

### 1.3 Enfoque de Gestión

**Metodología**: Híbrida (Agile + Waterfall)
- **Desarrollo**: Scrum con sprints de 2 semanas
- **Despliegue**: Continuous Deployment (CD)
- **Planificación**: Cascada para fases principales

---

## 2. PLAN DE GESTIÓN DEL ALCANCE

### 2.1 Proceso de Definición del Alcance

**Actividades**:
1. Recopilación de requisitos con stakeholders
2. Documentación en User Stories
3. Refinamiento en sesiones de grooming
4. Aprobación por Product Owner
5. Inclusión en backlog priorizado

### 2.2 Work Breakdown Structure (WBS)

```
1.0 Sistema POS Web Crumen
│
├── 1.1 Gestión del Proyecto
│   ├── 1.1.1 Planificación
│   ├── 1.1.2 Monitoreo y Control
│   └── 1.1.3 Cierre
│
├── 1.2 Infraestructura y Arquitectura
│   ├── 1.2.1 Setup Frontend (React + Vite)
│   ├── 1.2.2 Setup Backend (Express + MySQL)
│   ├── 1.2.3 Configuración PWA
│   └── 1.2.4 CI/CD Pipeline
│
├── 1.3 Autenticación y Seguridad
│   ├── 1.3.1 Sistema de Login JWT
│   ├── 1.3.2 Gestión de Roles y Permisos
│   ├── 1.3.3 Auditoría de Login
│   ├── 1.3.4 Sistema de Sesiones
│   └── 1.3.5 Bloqueo por Intentos Fallidos
│
├── 1.4 Módulos de Configuración
│   ├── 1.4.1 Usuarios
│   ├── 1.4.2 Roles
│   ├── 1.4.3 Categorías
│   ├── 1.4.4 Moderadores
│   ├── 1.4.5 Clientes
│   ├── 1.4.6 Mesas
│   ├── 1.4.7 Descuentos
│   ├── 1.4.8 Cuentas Contables
│   ├── 1.4.9 Unidades de Medida
│   └── 1.4.10 Negocios
│
├── 1.5 Gestión de Inventario
│   ├── 1.5.1 Insumos
│   ├── 1.5.2 Recetas
│   ├── 1.5.3 Subrecetas
│   └── 1.5.4 Control de Stock
│
├── 1.6 Módulo de Ventas
│   ├── 1.6.1 Toma de Órdenes
│   ├── 1.6.2 Comanda Digital
│   ├── 1.6.3 Facturación
│   └── 1.6.4 Cierre de Caja
│
├── 1.7 Reportes y Analytics
│   ├── 1.7.1 Dashboard Principal
│   ├── 1.7.2 Reportes de Ventas
│   ├── 1.7.3 Reportes de Inventario
│   └── 1.7.4 Reportes Financieros
│
├── 1.8 Testing y Calidad
│   ├── 1.8.1 Unit Testing
│   ├── 1.8.2 Integration Testing
│   ├── 1.8.3 E2E Testing
│   └── 1.8.4 Security Audit
│
├── 1.9 Documentación
│   ├── 1.9.1 Documentación Técnica
│   ├── 1.9.2 Manual de Usuario
│   ├── 1.9.3 API Documentation
│   └── 1.9.4 Documentación PMI
│
└── 1.10 Despliegue y Soporte
    ├── 1.10.1 Configuración de Producción
    ├── 1.10.2 Migración de Datos
    ├── 1.10.3 Capacitación
    └── 1.10.4 Soporte Post-Launch
```

### 2.3 Control del Alcance

**Métricas**:
- **Scope Creep**: Cambios no aprobados / Total de cambios
- **Completitud**: Funcionalidades completadas / Funcionalidades planificadas
- **Desviación**: Features adicionales / Features del plan original

**Herramientas**:
- Change Request Form
- Impact Analysis Template
- Backlog priorizado en Jira/GitHub Projects

---

## 3. PLAN DE GESTIÓN DEL CRONOGRAMA

### 3.1 Metodología de Programación

**Enfoque**: Scrum con sprints de 2 semanas

**Ceremonias**:
- Daily Standup: 15 min diarios (9:00 AM)
- Sprint Planning: 2 horas cada 2 semanas
- Sprint Review: 1 hora al final del sprint
- Retrospectiva: 1 hora al final del sprint
- Backlog Refinement: 1 hora semanal

### 3.2 Cronograma Maestro

```
FASE 1: FUNDACIÓN (COMPLETADO) ✅
│
├── Semana 1-2: Setup Infraestructura
├── Semana 3-4: Arquitectura Base
└── Semana 5-6: CI/CD y Deploy

FASE 2: AUTENTICACIÓN (COMPLETADO) ✅
│
├── Semana 7-8: Sistema de Login JWT
├── Semana 9-10: Roles y Permisos
└── Semana 11-12: Auditoría y Sesiones

FASE 3: CONFIGURACIÓN (COMPLETADO) ✅
│
├── Semana 13-16: Módulos CRUD (Usuarios, Roles, Categorías)
├── Semana 17-20: Módulos CRUD (Insumos, Recetas, Mesas)
└── Semana 21-22: Multi-tenant y Negocios

FASE 4: INVENTARIO (EN PROGRESO) 🔄
│
├── Semana 23-24: Gestión de Insumos
├── Semana 25-26: Sistema de Recetas
└── Semana 27-28: Control de Stock

FASE 5: VENTAS (PENDIENTE) ⏳
│
├── Semana 29-32: Toma de Órdenes
├── Semana 33-34: Comanda Digital
├── Semana 35-36: Facturación
└── Semana 37-38: Cierre de Caja

FASE 6: REPORTES (PENDIENTE) ⏳
│
├── Semana 39-40: Dashboard
├── Semana 41-42: Reportes de Ventas
└── Semana 43-44: Reportes Financieros

FASE 7: TESTING (PENDIENTE) ⏳
│
├── Semana 45-46: Testing Funcional
├── Semana 47: Security Audit
└── Semana 48: Performance Testing

FASE 8: LANZAMIENTO (PENDIENTE) ⏳
│
├── Semana 49: Migración de Datos
├── Semana 50: Capacitación
└── Semana 51-52: Soporte Post-Launch
```

### 3.3 Control del Cronograma

**Métricas**:
- **Velocity**: Story points completados por sprint
- **Burndown**: Trabajo restante vs tiempo
- **Schedule Variance (SV)**: EV - PV
- **Schedule Performance Index (SPI)**: EV / PV

**Objetivo**: SPI ≥ 0.95 (no más de 5% de retraso)

### 3.4 Camino Crítico

```
Infraestructura → Autenticación → Configuración → Inventario → Ventas → Testing → Producción
```

**Actividades Críticas**:
1. Sistema de Autenticación (bloqueante para todo)
2. Módulo de Ventas (core del negocio)
3. Testing de Seguridad (bloqueante para producción)
4. Migración de Datos (bloqueante para go-live)

---

## 4. PLAN DE GESTIÓN DE COSTOS

### 4.1 Presupuesto del Proyecto

#### 4.1.1 Costos de Desarrollo

| Concepto | Cantidad | Costo Unitario | Subtotal | Total |
|----------|----------|----------------|----------|-------|
| **Recursos Humanos** | | | | |
| Tech Lead (6 meses) | 960 hrs | Variable | Variable | Variable |
| Desarrollador Senior Frontend (6 meses) | 960 hrs | Variable | Variable | Variable |
| Desarrollador Senior Backend (6 meses) | 960 hrs | Variable | Variable | Variable |
| QA Engineer (4 meses) | 640 hrs | Variable | Variable | Variable |
| DevOps Engineer (2 meses) | 320 hrs | Variable | Variable | Variable |
| **Subtotal RRHH** | | | | **Variable** |

#### 4.1.2 Costos de Infraestructura (Anual)

| Servicio | Proveedor | Costo Mensual | Costo Anual |
|----------|-----------|---------------|-------------|
| **Hosting Frontend** | Render.com | $7-25 | $84-300 |
| **Hosting Backend** | Render.com | $7-25 | $84-300 |
| **Base de Datos MySQL** | Render/AWS | $10-50 | $120-600 |
| **CDN (opcional)** | Cloudflare | $0-20 | $0-240 |
| **Dominio** | [Proveedor] | - | $15 |
| **SSL Certificate** | Let's Encrypt | $0 | $0 |
| **Monitoreo** | Sentry/LogRocket | $0-30 | $0-360 |
| **Backups** | Incluido/S3 | $0-10 | $0-120 |
| **Total Infraestructura** | | | **$303-1,935/año** |

#### 4.1.3 Costos de Herramientas

| Herramienta | Costo | Tipo |
|-------------|-------|------|
| **IDE** | VS Code (gratis) | $0 |
| **Control de Versiones** | GitHub (gratis) | $0 |
| **Project Management** | Jira/Trello (gratis) | $0 |
| **Comunicación** | Slack (gratis) | $0 |
| **Total Herramientas** | | **$0/año** |

### 4.2 Línea Base de Costos

**Presupuesto Total Estimado**:
- Desarrollo: Variable (según tarifas de equipo)
- Infraestructura Año 1: $300-2,000
- Contingencia (15%): $45-300
- **TOTAL**: Desarrollo + $345-2,300

### 4.3 Control de Costos

**Métricas**:
- **Cost Variance (CV)**: EV - AC
- **Cost Performance Index (CPI)**: EV / AC
- **Estimate at Completion (EAC)**: BAC / CPI

**Objetivo**: CPI ≥ 0.90 (no más de 10% de sobrecosto)

**Frecuencia de Revisión**: Mensual

---

## 5. PLAN DE GESTIÓN DE CALIDAD

### 5.1 Estándares de Calidad

#### 5.1.1 Calidad del Código

| Métrica | Objetivo | Herramienta |
|---------|----------|-------------|
| **Cobertura de Tests** | ≥ 80% | Jest, React Testing Library |
| **Complejidad Ciclomática** | ≤ 10 | ESLint |
| **Code Smells** | 0 críticos | SonarQube |
| **Duplicación de Código** | < 3% | SonarQube |
| **Type Safety** | 100% | TypeScript |
| **Vulnerabilidades** | 0 críticas | npm audit |

#### 5.1.2 Calidad de la Aplicación

| Métrica | Objetivo | Herramienta |
|---------|----------|-------------|
| **Lighthouse Score** | ≥ 90 | Chrome Lighthouse |
| **LCP (Largest Contentful Paint)** | < 2.5s | Web Vitals |
| **FID (First Input Delay)** | < 100ms | Web Vitals |
| **CLS (Cumulative Layout Shift)** | < 0.1 | Web Vitals |
| **Tiempo de Respuesta API** | < 2s (p95) | New Relic |
| **Uptime** | ≥ 99.5% | UptimeRobot |

### 5.2 Actividades de Aseguramiento de Calidad

#### 5.2.1 Durante el Desarrollo

```
Developer → Code → Self-Review
                      ↓
                 Unit Tests (≥80%)
                      ↓
                 ESLint (0 errors)
                      ↓
                 TypeScript (0 errors)
                      ↓
                 Pull Request
                      ↓
                 Code Review (peer)
                      ↓
                 Automated Tests (CI)
                      ↓
              ¿Aprobado? → Sí → Merge
                      ↓
                     No → Fix → Repeat
```

#### 5.2.2 Antes de Producción

- [ ] Testing funcional completo
- [ ] Testing de regresión
- [ ] Security audit
- [ ] Performance testing
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Cross-browser testing (Chrome, Firefox, Edge, Safari)
- [ ] Mobile testing (responsive)
- [ ] User Acceptance Testing (UAT)

### 5.3 Control de Calidad

**Inspecciones**:
- Code Review: 100% de PRs
- Sprint Review: Cada 2 semanas
- Quality Audit: Mensual

**Corrección de Defectos**:
| Severidad | SLA de Resolución |
|-----------|-------------------|
| Crítico | 4 horas |
| Alto | 24 horas |
| Medio | 1 semana |
| Bajo | Próximo sprint |

---

## 6. PLAN DE GESTIÓN DE RECURSOS

### 6.1 Organigrama del Equipo

```
Project Manager
        │
        ├── Technical Team
        │   │
        │   ├── Tech Lead (1)
        │   │   ├── Frontend Developers (2)
        │   │   └── Backend Developers (2)
        │   │
        │   ├── QA Engineer (1)
        │   │
        │   └── DevOps Engineer (1)
        │
        └── Product Team
            ├── Product Owner (1)
            └── UX Designer (0.5)
```

### 6.2 Matriz RACI

| Actividad | PM | Tech Lead | Dev | QA | DevOps | PO | Sponsor |
|-----------|----|-----------|----|----|---------|----|---------|
| **Planificación** | A | C | I | I | I | R | A |
| **Diseño Técnico** | I | A/R | C | C | C | I | I |
| **Desarrollo** | I | R | A | I | I | C | I |
| **Testing** | I | C | I | A/R | I | C | I |
| **Code Review** | I | A/R | C | I | I | I | I |
| **Deployment** | C | R | I | C | A | I | I |
| **Documentación** | R | C | A | C | C | C | I |
| **Aprobación de Cambios** | C | C | I | I | I | R | A |

**Leyenda**:
- **R**: Responsible (Responsable de ejecutar)
- **A**: Accountable (Aprobador final)
- **C**: Consulted (Debe ser consultado)
- **I**: Informed (Debe ser informado)

### 6.3 Plan de Adquisición de Recursos

**Roles Actuales**: 7 personas
**Roles Pendientes**: 
- UX Designer (0.5 FTE) - Fase 5
- Support Engineer (1 FTE) - Post-lanzamiento

**Curva de Staffing**:
```
Personas
  8 │         ┌────────┐
  7 │    ┌────┤        │
  6 │ ┌──┤    │        ├───┐
  5 │ │  │    │        │   │
  4 │─┤  │    │        │   ├──
  3 │ │  │    │        │   │
  2 │ └──┘    └────────┘   │
  1 │                      │
  0 └──────────────────────┴───
     F1  F2  F3  F4  F5  F6 F7 F8
           Fases del Proyecto
```

### 6.4 Calendario de Recursos

| Recurso | Ene | Feb | Mar | Abr | May | Jun | Jul | Ago | Sep | Oct | Nov | Dic |
|---------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| **PM** | 100% | 100% | 100% | 100% | 100% | 100% | 50% | 50% | - | - | - | - |
| **Tech Lead** | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 50% | - | - | - | - |
| **Frontend Dev** | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 50% | - | - | - | - |
| **Backend Dev** | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 50% | - | - | - | - |
| **QA** | - | 50% | 50% | 100% | 100% | 100% | 100% | 100% | 50% | - | - | - |
| **DevOps** | 50% | 50% | 100% | 50% | 50% | 100% | 100% | 50% | - | - | - | - |

---

## 7. PLAN DE GESTIÓN DE COMUNICACIONES

### 7.1 Matriz de Comunicaciones

| Comunicación | Objetivo | Frecuencia | Formato | Participantes | Responsable |
|--------------|----------|------------|---------|---------------|-------------|
| **Daily Standup** | Sincronización diaria | Diario (15 min) | Presencial/Virtual | Equipo Dev | Scrum Master |
| **Sprint Planning** | Planear sprint | Quincenal (2h) | Reunión | Equipo + PO | PM |
| **Sprint Review** | Demo de avances | Quincenal (1h) | Demo | Equipo + Stakeholders | PO |
| **Retrospectiva** | Mejora continua | Quincenal (1h) | Reunión | Equipo | PM |
| **Status Report** | Actualización ejecutiva | Semanal | Email/Dashboard | Patrocinador | PM |
| **Stakeholder Meeting** | Alineación estratégica | Mensual (1h) | Reunión | Stakeholders clave | PM |
| **Technical Sync** | Decisiones técnicas | Semanal (1h) | Reunión | Tech Team | Tech Lead |
| **Release Notes** | Comunicar cambios | Por release | Email/Slack | Usuarios | PO |

### 7.2 Canales de Comunicación

| Canal | Propósito | Audiencia | SLA de Respuesta |
|-------|-----------|-----------|------------------|
| **Slack #general** | Comunicación general | Todo el equipo | 4 horas |
| **Slack #dev** | Discusión técnica | Developers | 2 horas |
| **Slack #alerts** | Alertas críticas | DevOps + Tech Lead | 15 minutos |
| **Email** | Comunicación formal | Stakeholders | 24 horas |
| **Jira** | Tracking de tareas | Equipo técnico | Por prioridad |
| **GitHub** | Code review, issues | Developers | 24 horas |
| **Zoom/Meet** | Reuniones remotas | Según necesidad | Agendado |

### 7.3 Escalamiento de Issues

```
Nivel 1: Developer (24h)
        ↓
   ¿Resuelto? No
        ↓
Nivel 2: Tech Lead (48h)
        ↓
   ¿Resuelto? No
        ↓
Nivel 3: PM + Sponsor (72h)
        ↓
   ¿Resuelto? No
        ↓
Nivel 4: Executive Decision
```

---

## 8. PLAN DE GESTIÓN DE RIESGOS

### 8.1 Metodología de Gestión de Riesgos

**Proceso**:
1. **Identificación**: Brainstorming quincenal
2. **Análisis Cualitativo**: Probabilidad x Impacto
3. **Análisis Cuantitativo**: Para riesgos críticos
4. **Planificación de Respuesta**: Estrategias EMIC
5. **Monitoreo**: Revisión semanal en status meeting

### 8.2 Registro de Riesgos

| ID | Riesgo | Prob | Imp | Score | Tipo | Estrategia | Plan de Respuesta | Owner |
|----|--------|------|-----|-------|------|------------|-------------------|-------|
| R01 | Caída de servidor producción | M | A | 12 | Técnico | Mitigar | Backup automático diario, DR plan | DevOps |
| R02 | Vulnerabilidad de seguridad | B | C | 15 | Seguridad | Mitigar | Auditorías mensuales, updates | Tech Lead |
| R03 | Pérdida de datos | B | C | 15 | Técnico | Mitigar | Backups cada 6h, replicación | DevOps |
| R04 | Escalabilidad insuficiente | M | A | 12 | Arquitectura | Mitigar | Load testing, arquitectura escalable | Arquitecto |
| R05 | Falta de adopción usuarios | M | A | 12 | Negocio | Mitigar | Capacitación, UX intuitivo | PO |
| R06 | Scope creep | A | M | 12 | Gestión | Evitar | Control estricto de cambios | PM |
| R07 | Dependencia de Render.com | B | M | 6 | Técnico | Aceptar | Plan de migración documentado | DevOps |
| R08 | Bugs críticos en producción | M | A | 12 | Calidad | Mitigar | Testing exhaustivo, QA continuo | QA Lead |
| R09 | Rotación de personal clave | M | A | 12 | RRHH | Transferir | Documentación, knowledge sharing | PM |
| R10 | Cambios regulatorios fiscales | B | M | 6 | Legal | Monitorear | Arquitectura flexible | PM |

**Leyenda**:
- **Probabilidad**: B=Baja (0.1-0.3), M=Media (0.4-0.6), A=Alta (0.7-0.9)
- **Impacto**: B=Bajo (1-3), M=Medio (4-7), A=Alto (8-10), C=Crítico (10)
- **Score**: Prob x Imp (normalizado a escala 1-15)
- **Estrategia EMIC**: Evitar, Mitigar, Transferir, Aceptar

### 8.3 Matriz de Probabilidad e Impacto

```
IMPACTO
10 Crítico │       │ R02, R03 │          │
 8 Alto    │  R05  │ R01,R04  │          │
            │       │ R08, R09 │          │
 4 Medio   │  R06  │   R07    │   R10    │
 2 Bajo    │       │          │          │
           └───────┴──────────┴──────────┴
            0.1-0.3  0.4-0.6    0.7-0.9
              Baja    Media      Alta
                  PROBABILIDAD
```

### 8.4 Reserva de Contingencia

**Presupuesto**: 15% del presupuesto total  
**Tiempo**: 10% del cronograma total  
**Autorización**: PM puede usar hasta 5%, PM+Sponsor para más

### 8.5 Triggers de Riesgo

| Riesgo | Trigger (Indicador de Advertencia) |
|--------|-------------------------------------|
| R01 | Uptime < 99% en última semana |
| R02 | npm audit reporta vulnerabilidades altas |
| R04 | Tiempo de respuesta > 3s (p95) |
| R05 | Tasa de adopción < 50% en primera semana |
| R06 | > 3 change requests no planificados/sprint |
| R08 | > 2 bugs críticos en producción/mes |
| R09 | Anuncio de renuncia de personal clave |

---

## 9. PLAN DE GESTIÓN DE ADQUISICIONES

### 9.1 Decisiones de Hacer vs Comprar

| Componente | Decisión | Justificación |
|------------|----------|---------------|
| **Frontend Framework** | Usar (React) | Open source, amplia comunidad |
| **Backend Framework** | Usar (Express) | Open source, flexible |
| **Base de Datos** | Usar (MySQL) | Open source, confiable |
| **Hosting** | Comprar (Render) | Costo-beneficio vs administrar servidores |
| **Autenticación** | Hacer (custom JWT) | Control total, requisitos específicos |
| **Analytics** | Comprar (futuro) | Especialización, tiempo al mercado |
| **Payment Gateway** | Comprar (futuro) | Cumplimiento PCI-DSS |

### 9.2 Contratos Vigentes

| Proveedor | Servicio | Tipo de Contrato | Inicio | Renovación | Costo |
|-----------|----------|------------------|--------|------------|-------|
| **Render.com** | Hosting | Subscripción mensual | [Fecha] | Automática | $14-50/mes |
| **[Registrar]** | Dominio | Anual | [Fecha] | Manual | $15/año |
| **GitHub** | Repositorio | Gratis (público) | [Fecha] | N/A | $0 |

### 9.3 Proceso de Adquisición

```
Identificación de Necesidad
        ↓
   Make vs Buy Analysis
        ↓
   RFI/RFP (si aplica)
        ↓
   Evaluación de Proveedores
        ↓
   Negociación
        ↓
   Aprobación PM + Sponsor
        ↓
   Firma de Contrato
        ↓
   Administración del Contrato
```

### 9.4 Criterios de Selección de Proveedores

| Criterio | Peso | Evaluación |
|----------|------|------------|
| **Costo** | 25% | 1-10 |
| **Calidad/Confiabilidad** | 30% | 1-10 |
| **Soporte Técnico** | 20% | 1-10 |
| **Escalabilidad** | 15% | 1-10 |
| **Referencias** | 10% | 1-10 |
| **Total** | 100% | Score ponderado |

---

## 10. PLAN DE GESTIÓN DE INTERESADOS

### 10.1 Registro de Interesados

| Stakeholder | Rol/Organización | Interés | Poder | Influencia | Estrategia |
|-------------|------------------|---------|-------|------------|------------|
| **CEO Crumen** | Patrocinador | Alto | Alto | Alto | Gestionar Cercanamente |
| **Gerentes Restaurante** | Usuarios clave | Alto | Medio | Alto | Mantener Satisfechos |
| **Meseros/Cajeros** | Usuarios finales | Alto | Bajo | Medio | Mantener Informados |
| **Equipo Desarrollo** | Ejecutores | Alto | Medio | Alto | Gestionar Cercanamente |
| **CFO** | Aprobador presupuesto | Medio | Alto | Alto | Gestionar Cercanamente |
| **IT Manager** | Soporte técnico | Medio | Medio | Medio | Mantener Satisfechos |
| **Clientes Finales** | Usuarios indirectos | Medio | Bajo | Bajo | Monitorear |
| **Proveedor Hosting** | Servicio | Bajo | Bajo | Bajo | Monitorear |
| **Autoridades Fiscales** | Regulatorio | Bajo | Alto | Medio | Mantener Informados |

### 10.2 Matriz Poder-Interés

```
PODER
Alto  │ CFO,         │ CEO,         │
      │ Autoridades  │ Gerentes,    │
      │              │ Eq. Dev      │
      ├──────────────┼──────────────┤
Bajo  │ Proveedor,   │ Meseros,     │
      │ Clientes     │ IT Manager   │
      └──────────────┴──────────────┘
           Bajo           Alto
                INTERÉS
```

**Estrategias**:
- **Alto Poder + Alto Interés**: Gestionar Cercanamente
- **Alto Poder + Bajo Interés**: Mantener Satisfechos
- **Bajo Poder + Alto Interés**: Mantener Informados
- **Bajo Poder + Bajo Interés**: Monitorear

### 10.3 Plan de Engagement

| Stakeholder | Nivel Actual | Nivel Deseado | Acciones |
|-------------|--------------|---------------|----------|
| **CEO** | Supportive | Leading | Reportes semanales, demos mensuales |
| **Gerentes** | Neutral | Supportive | Workshops, early access, feedback sessions |
| **Meseros** | Unaware | Supportive | Capacitación, videos tutoriales, soporte dedicado |
| **Eq. Dev** | Leading | Leading | Daily standups, retrospectivas, reconocimiento |
| **CFO** | Neutral | Supportive | Business case, ROI reports, cost tracking |

**Niveles de Engagement**:
1. **Unaware**: No conoce el proyecto
2. **Resistant**: Se opone al proyecto
3. **Neutral**: Ni apoya ni se opone
4. **Supportive**: Apoya el proyecto
5. **Leading**: Lidera y promueve el proyecto

---

## 11. PLAN DE GESTIÓN DE CAMBIOS

### 11.1 Proceso de Control de Cambios

```
Solicitud de Cambio (Change Request)
        ↓
Registro en Sistema (Jira/GitHub)
        ↓
Evaluación de Impacto
  - Alcance
  - Cronograma
  - Costos
  - Calidad
  - Riesgos
        ↓
Presentación al Change Control Board (CCB)
        ↓
    Decisión
        ├── Aprobado → Planificación → Implementación
        ├── Rechazado → Notificación + Justificación
        └── Diferido → Backlog Futuro
        ↓
Actualización de Documentación
        ↓
Comunicación a Stakeholders
        ↓
Monitoreo de Implementación
        ↓
Cierre del Change Request
```

### 11.2 Change Control Board (CCB)

**Miembros**:
- Project Manager (Chair)
- Tech Lead
- Product Owner
- Patrocinador (para cambios mayores)

**Frecuencia de Reuniones**: Semanal o según demanda

### 11.3 Clasificación de Cambios

| Tipo | Definición | Impacto | Aprobación | SLA |
|------|------------|---------|------------|-----|
| **Crítico** | Bug de seguridad, pérdida de datos, sistema caído | Crítico | Inmediata (PM) | < 4h |
| **Mayor** | Nueva feature, cambio arquitectónico, > 40h trabajo | Alto | CCB + Sponsor | 3-5 días |
| **Menor** | Mejora, bug no crítico, < 40h trabajo | Medio | Tech Lead | 1-2 días |
| **Trivial** | Typo, ajuste cosmético, < 4h trabajo | Bajo | Developer | Inmediato |

### 11.4 Formulario de Solicitud de Cambio

**Información Requerida**:
1. Descripción del cambio
2. Justificación/Razón
3. Impacto en alcance
4. Impacto en cronograma
5. Impacto en costos
6. Impacto en calidad
7. Impacto en riesgos
8. Alternativas consideradas
9. Prioridad sugerida
10. Solicitante y fecha

### 11.5 Métricas de Control de Cambios

| Métrica | Fórmula | Objetivo |
|---------|---------|----------|
| **Change Rate** | # Cambios aprobados / # Cambios solicitados | 60-80% |
| **Scope Creep** | # Cambios no planificados / Total features | < 10% |
| **Tiempo de Aprobación** | Promedio días desde solicitud hasta decisión | < 3 días |
| **Impacto en Cronograma** | Días añadidos por cambios / Duración total | < 5% |

---

## 12. INTEGRACIÓN DEL PLAN

### 12.1 Líneas Base del Proyecto

**Línea Base del Alcance**:
- WBS v1.0 aprobada
- Requisitos documentados
- Criterios de aceptación definidos

**Línea Base del Cronograma**:
- Cronograma maestro v1.0
- Hitos principales definidos
- Dependencias mapeadas

**Línea Base de Costos**:
- Presupuesto aprobado: $X
- Reserva de contingencia: 15%
- Reserva de gestión: 10%

### 12.2 Monitoreo y Control

**Frecuencia de Revisión**:
- **Diario**: Standup, burndown
- **Semanal**: Status report, riesgos
- **Quincenal**: Sprint review, métricas
- **Mensual**: Executive dashboard, stakeholders

**Métricas Clave (KPIs)**:
| KPI | Meta | Actual | Status |
|-----|------|--------|--------|
| **Schedule Performance Index (SPI)** | ≥ 0.95 | [Calcular] | 🟢 |
| **Cost Performance Index (CPI)** | ≥ 0.90 | [Calcular] | 🟢 |
| **Velocity (Story Points)** | 40-50/sprint | [Actual] | 🟢 |
| **Defect Density** | < 1/KLOC | [Calcular] | 🟢 |
| **Code Coverage** | ≥ 80% | [Actual] | 🟢 |
| **Customer Satisfaction** | ≥ 4.5/5 | [Survey] | ⏳ |

**Semáforo**:
- 🟢 Verde: Cumple objetivo
- 🟡 Amarillo: En riesgo (90-100% de meta)
- 🔴 Rojo: Fuera de objetivo (< 90% de meta)

### 12.3 Herramientas de Gestión

| Área de Conocimiento | Herramienta |
|----------------------|-------------|
| **Integración** | Jira, Confluence |
| **Alcance** | Jira, GitHub Projects |
| **Cronograma** | Jira, GitHub Projects, Gantt |
| **Costos** | Excel, [Software de contabilidad] |
| **Calidad** | Jest, ESLint, SonarQube, Lighthouse |
| **Recursos** | [HR Software] |
| **Comunicaciones** | Slack, Email, Zoom |
| **Riesgos** | Registro en Jira |
| **Adquisiciones** | [Procurement Software] |
| **Interesados** | Excel, [CRM] |

---

## 13. APROBACIONES

Este Plan de Gestión del Proyecto ha sido revisado y aprobado por:

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| **Patrocinador** | [Nombre] | _____________ | __________ |
| **Director del Proyecto** | [Nombre] | _____________ | __________ |
| **Tech Lead** | [Nombre] | _____________ | __________ |
| **Product Owner** | [Nombre] | _____________ | __________ |
| **QA Lead** | [Nombre] | _____________ | __________ |

---

## ANEXOS

### Anexo A: Glosario de Acrónimos

| Acrónimo | Significado |
|----------|-------------|
| **AC** | Actual Cost (Costo Real) |
| **BAC** | Budget at Completion (Presupuesto al Completar) |
| **CCB** | Change Control Board |
| **CPI** | Cost Performance Index |
| **CV** | Cost Variance |
| **EAC** | Estimate at Completion |
| **EMIC** | Evitar, Mitigar, Transferir, Aceptar (Estrategias de Riesgo) |
| **EV** | Earned Value (Valor Ganado) |
| **PV** | Planned Value (Valor Planificado) |
| **RACI** | Responsible, Accountable, Consulted, Informed |
| **SLA** | Service Level Agreement |
| **SPI** | Schedule Performance Index |
| **SV** | Schedule Variance |
| **WBS** | Work Breakdown Structure |

### Anexo B: Referencias

- PMI PMBOK Guide 7th Edition
- Scrum Guide 2020
- OWASP Top 10
- WCAG 2.1 Guidelines

### Anexo C: Historial de Revisiones

| Versión | Fecha | Sección Modificada | Descripción del Cambio | Autor |
|---------|-------|-------------------|------------------------|-------|
| 1.0 | 27-Nov-2025 | Todas | Creación inicial del documento | PMO |

---

**Documento Controlado**  
**Última Actualización**: 27 de noviembre de 2025  
**Próxima Revisión**: Mensual o según cambios significativos  
**Clasificación**: Interno - Confidencial

