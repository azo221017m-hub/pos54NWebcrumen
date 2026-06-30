# Dashboard – Análisis del Estado Actual
> Generado: 2026-06-29 | Proyecto: pos54NWebcrumen-2

---

## 1. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite + React Router v6 |
| Backend | Node.js + TypeScript + Express |
| Base de datos | MySQL (mysql2/promise, pool de 20 conexiones) |
| Autenticación | JWT en localStorage (`token`, `usuario`, `privilegio`) |
| Tiempo real | WebSocket propio (`useWebSocket` hook) |
| Deploy | Vercel (frontend) + servidor MySQL en Azure |

---

## 2. Tablas Confirmadas (de controladores y scripts SQL)

### `tblposcrumenwebturnos`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| idturno | INT PK AUTO | ID del turno |
| numeroturno | INT | Número correlativo |
| fechainicioturno | DATETIME | Apertura del turno |
| fechafinturno | DATETIME NULL | Cierre del turno |
| estatusturno | VARCHAR(20) | `abierto` / `cerrado` |
| claveturno | VARCHAR(50) | Clave compuesta única |
| usuarioturno | VARCHAR(100) | Alias del colaborador |
| idnegocio | INT | FK negocio |
| metaturno | DECIMAL(12,2) NULL | Meta de venta del turno |
| logrometa | DECIMAL(12,4) NULL | % de cumplimiento calculado al cierre |

### `tblposcrumenwebventas`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| idventa | INT PK AUTO | |
| tipodeventa | ENUM | `MESA`, `LLEVAR`, `DOMICILIO`, `ONLINE`, `MOVIMIENTO` |
| folioventa | VARCHAR | Folio único |
| estadodeventa | ENUM | `ORDENADO`, `COBRADO`, `CANCELADO`, `DEVUELTO`, `ESPERAR`, `EN_CAMINO`, `SOLICITADO` |
| fechadeventa | DATETIME | |
| subtotal | DECIMAL | Antes de descuentos |
| descuentos | DECIMAL | Descuento aplicado |
| impuestos | DECIMAL | |
| totaldeventa | DECIMAL | Total final |
| formadepago | ENUM | `EFECTIVO`, `TARJETA`, `TRANSFERENCIA`, `MIXTO` |
| estatusdepago | ENUM | `PAGADO`, `PENDIENTE`, `CANCELADO` |
| referencia | VARCHAR | `FONDO de CAJA`, `INGRESO CAJA`, `RETIRO CAJA`, `GASTO` para MOVIMIENTOs |
| descripcionmov | VARCHAR | `VENTA` para ventas reales, descripción para movimientos |
| detalledescuento | VARCHAR | Nombre/tipo del descuento aplicado |
| claveturno | VARCHAR | FK al turno |
| idnegocio | INT | FK negocio |
| usuarioauditoria | VARCHAR | Alias del colaborador que cobró |
| origenventa | ENUM | `SITIO`, `WEB` |

### `tblposcrumenwebdetalleventas`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| iddetalleventa | INT PK AUTO | |
| idventa | INT FK | |
| nombreproducto | VARCHAR | Nombre del producto vendido |
| cantidad | DECIMAL | |
| preciounitario | DECIMAL | |
| costounitario | DECIMAL | Costo al momento de la venta |
| subtotal | DECIMAL | cantidad × preciounitario |
| total | DECIMAL | con descuentos |
| idnegocio | INT | |
| fechadetalleventa | DATETIME | |
| usuarioauditoria | VARCHAR | |
| comensal | VARCHAR | |

### `tblposcrumenwebdetallemovimientos`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| iddetallemovimiento | INT PK AUTO | |
| nombreinsumo | VARCHAR | Nombre del insumo |
| tipomovimiento | ENUM | `ENTRADA` / `SALIDA` |
| motivomovimiento | ENUM | `COMPRA`, `MERMA`, `AJUSTE_MANUAL`, `CONSUMO`, `VENTA` |
| cantidad | DECIMAL | Positivo para ENTRADA, negativo para SALIDA |
| costo | DECIMAL | Costo unitario |
| estatusmovimiento | ENUM | `PROCESADO` / `PENDIENTE` |
| fechamovimiento | DATETIME | |
| idnegocio | INT | |
| usuarioauditoria | VARCHAR | |
| proveedor | VARCHAR(200) NULL | Nombre del proveedor (migración aplicada) |
| observaciones | VARCHAR NULL | |

### `tblposcrumenwebinsumos`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_insumo | INT PK AUTO | |
| nombre | VARCHAR | |
| unidad_medida | VARCHAR | |
| stock_actual | DECIMAL | Stock disponible |
| stock_minimo | DECIMAL | Umbral de alerta de reabasto |
| costo_promedio_ponderado | DECIMAL | CPP vigente |
| precio_venta | DECIMAL | |
| id_cuentacontable | VARCHAR NULL | Grupo contable |
| activo | TINYINT | 1=activo |
| inventariable | TINYINT | 1=inventariable |
| idnegocio | INT | |
| idproveedor | VARCHAR NULL | **Guarda el NOMBRE del proveedor, no el ID** |

### Otras tablas confirmadas
- `tblposcrumenwebproveedores` – catálogo de proveedores (`id_proveedor`, `nombre`, ...)
- `tblposcrumenwebcuentacontable` – grupos/cuentas contables
- `tblposcrumenwebnegocio` – datos del negocio (`nombreNegocio`, `rfcnegocio`, `direccionfiscalnegocio`, `logotipo`, `abiertoahoraweb`)
- `tblposcrumenwebdetallepagos` – desglose de pagos MIXTO
- `tblposcrumenwebusuarios` – usuarios (`id`, `nombre`, `alias`, `idNegocio`, `idRol`, `privilegio`)

---

## 3. Ticket de Cierre de Turno (referencia visual y de datos)

**Componente:** `src/components/turnos/TicketFinTurno/TicketFinTurno.tsx`  
**Endpoint de datos:** `GET /api/turnos/corte/:claveturno`  
**Controlador:** `backend/src/controllers/turnos.ts → obtenerCorteFinTurno`

El corte incluye: turno + negocio, fondo de caja, ingresos/retiros, ventas brutas/netas/descuentos, gastos del turno, ventas por forma de pago (incluyendo MIXTO via `tblposcrumenwebdetallepagos`), ventas por tipo, productos vendidos, conciliación de efectivo, indicadores (tickets, ticket promedio).

**Formato:** texto `<pre>` con fuente monoespaciada, generado por `generarTextoTicket()` en `src/utils/ticketFinTurno.ts`.

**⚠️ NO MODIFICAR esta lógica ni este componente.**

---

## 4. Endpoints de Reportes Existentes (`/api/reportes/`)

| Ruta | Función | Descripción |
|------|---------|-------------|
| `GET /estado-resultados` | `getEstadoResultados` | Ventas, costo, utilidad bruta/neta, gastos |
| `GET /ventas` | `getReporteVentas` | Detalle de ventas por rango + filtros |
| `GET /compras` | `getReporteCompras` | Compras (ENTRADA COMPRA) por rango |
| `GET /costos` | `getReporteCostos` | Costos de venta por producto |
| `GET /gastos` | `getReporteGastos` | Gastos (SALIDA) por categoría |
| `GET /rentabilidad` | `getReporteRentabilidad` | Margen por producto |
| `GET /flujo` | `getReporteFlujo` | Flujo de caja diario |

Todos filtran automáticamente por `idnegocio` del JWT y aceptan `?fechaInicio=&fechaFin=`.

---

## 5. Autenticación y Multi-negocio

- JWT almacenado en `localStorage` como `token`
- `idNegocio` del usuario se extrae en el middleware `authMiddleware` → `req.user.idNegocio`
- **Todas las queries de reportes ya filtran por `idnegocio`** — sin acceso cruzado entre negocios
- `privilegio` controla visibilidad: nivel 5+ ve "Mi Visor de Ventas" (reportes gerenciales)
- El sistema es multi-negocio pero cada usuario pertenece a un solo negocio

---

## 6. Campos/Tablas que Faltan o Requieren Atención

### Disponibles (no requieren cambios en BD)
| Reporte | Fuente de datos | Estado |
|---------|-----------------|--------|
| Stock actual | `tblposcrumenwebinsumos.stock_actual` | ✅ Disponible |
| Stock mínimo | `tblposcrumenwebinsumos.stock_minimo` | ✅ Disponible |
| Proveedor habitual del insumo | `tblposcrumenwebinsumos.idproveedor` (nombre) | ✅ Disponible |
| Historial compras | `tblposcrumenwebdetallemovimientos` ENTRADA/COMPRA | ✅ Disponible |
| Meta por turno | `tblposcrumenwebturnos.metaturno` | ✅ Disponible |
| % Cumplimiento meta | `tblposcrumenwebturnos.logrometa` | ✅ Disponible |
| Ventas por colaborador | `tblposcrumenwebventas.usuarioauditoria` | ✅ Disponible |
| Descuentos por tipo | `tblposcrumenwebventas.detalledescuento` | ✅ Disponible |
| Gastos del turno | `tblposcrumenwebventas` donde `referencia='GASTO'` | ✅ Disponible |
| Devoluciones | `tblposcrumenwebventas.estadodeventa='DEVUELTO'` | ✅ Disponible |

### Limitaciones conocidas
| Campo | Situación | Solución propuesta |
|-------|-----------|-------------------|
| `categoria_gasto` | No existe. Los gastos del turno usan `descripcionmov`; los de movimientos usan `motivomovimiento` | Usar `descripcionmov` (turno) y `motivomovimiento` (inventario) como categoría |
| `meta_venta por mes/periodo` | Solo existe `metaturno` (meta por turno, no por periodo calendario) | Acumular `metaturno` de todos los turnos del periodo |
| `motivo_descuento` separado | Se usa `detalledescuento` en ventas para el nombre del descuento | Usar `detalledescuento` como "motivo" |
| Costos fijos vs variables | No hay clasificación de gastos en fijos/variables | Usar gastos totales como proxy de costos fijos para punto de equilibrio (documentar en código) |
| `stock_maximo` | No existe en `tblposcrumenwebinsumos` | No es necesario para los reportes solicitados |
| Historial de stock | No se guarda snapshot histórico del stock | Usar movimientos acumulados para aproximar rotación |

---

## 7. Nuevos Endpoints a Crear

### Categoría: Salud del Negocio
| Ruta | Descripción |
|------|-------------|
| `GET /api/reportes/salud/estado` | Resumen ejecutivo: ventas, costos, gastos, descuentos, compras + semáforo y punto de equilibrio |
| `GET /api/reportes/salud/gastos-descuentos` | Gastos agrupados por categoría + descuentos por producto/colaborador/motivo |
| `GET /api/reportes/inventario/sugerencia-compra` | Lista de compras inteligente |

### Categoría: Inventario
| Ruta | Descripción |
|------|-------------|
| `GET /api/reportes/inventario/stock` | Stock actual de todos los insumos con valor |
| `GET /api/reportes/inventario/bajo-minimo` | Insumos bajo stock mínimo |
| `GET /api/reportes/inventario/compras-proveedor` | Compras históricas por proveedor |
| `GET /api/reportes/inventario/rotacion` | Rotación por producto (ventas del periodo) |

### Categoría: Ventas (extensión de existentes)
| Ruta | Descripción |
|------|-------------|
| `GET /api/reportes/ventas/hoy` | Ventas del día actual: total, tickets, forma de pago, por turno |
| `GET /api/reportes/ventas/por-turno` | Ventas agrupadas por turno en el rango |
| `GET /api/reportes/ventas/top-productos` | Top productos por cantidad y monto |
| `GET /api/reportes/ventas/mensual` | Ventas totales consolidadas por mes del año |

### Categoría: Colaboradores
| Ruta | Descripción |
|------|-------------|
| `GET /api/reportes/colaboradores/ranking` | Ranking: monto total, tickets, ticket promedio |
| `GET /api/reportes/colaboradores/cumplimiento-meta` | Meta vs real por colaborador/turno |
| `GET /api/reportes/colaboradores/kpi` | KPI completo: ventas, descuentos, devoluciones, turnos |

---

## 8. Componentes Nuevos a Crear

| Archivo | Propósito |
|---------|-----------|
| `src/components/common/ReceiptCard/ReceiptCard.tsx` | Componente reutilizable de ticket térmico (visual) |
| `src/components/common/ReceiptCard/ReceiptCard.css` | Estilos del ticket |
| `src/services/reportesDashboard.service.ts` | Nuevas llamadas API para los 4 sectores |
| `src/pages/Reportes/SaludNegocio/SaludNegocio.tsx` | Página Salud del Negocio |
| `src/pages/Reportes/Inventario/InventarioReportes.tsx` | Página Inventario |
| `src/pages/Reportes/Ventas/VentasReportes.tsx` | Página Ventas |
| `src/pages/Reportes/Colaboradores/ColaboradoresReportes.tsx` | Página Colaboradores |

---

## 9. Fórmulas Clave

### Punto de Equilibrio
```
Margen_Contribucion = (Ventas - Costo_Ventas) / Ventas
PE_Monto = Gastos_Totales / Margen_Contribucion
PE_Unidades = PE_Monto / Ticket_Promedio
```
> **Nota:** "Gastos_Totales" incluye gastos operativos registrados como SALIDA en movimientos y como referencia='GASTO' en ventas. No se distingue entre fijos y variables por falta de clasificación en BD.

### Sugerencia de Compra
```
N_compras = últimas 10 compras del insumo en detallemovimientos
Promedio_dias = promedio(días entre compras consecutivas)
Promedio_qty = promedio(cantidad por compra)
Urgencia = max(0, stock_minimo - stock_actual)
Cantidad_sugerida = Urgencia + Promedio_qty
```

### Rotación de Inventario
```
Rotacion = Cantidad_vendida_periodo / stock_actual
(approx — sin historial de stock inicial)
```

### % Cumplimiento Meta Colaborador (por turno)
```
Cumplimiento = (Ventas_turno / Metaturno) × 100
(ya calculado en logrometa al cerrar el turno)
```
