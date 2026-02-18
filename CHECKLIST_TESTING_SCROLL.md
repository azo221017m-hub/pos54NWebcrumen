# ✅ CHECKLIST DE TESTING - Scroll Vertical

## 📋 Guía de Verificación del Scroll Vertical

### 🎯 Objetivo
Verificar que el scroll vertical funciona correctamente en todas las 20 páginas migradas al sistema StandardPageLayout.

---

## 🔍 TESTING BÁSICO

### 1. ✅ Verificación Visual del Scrollbar

**Instrucciones**:
1. Abrir cualquier página con varios cards (ej: ConfigGrupoMovimientos)
2. Buscar la barra de scroll en el lado derecho del contenedor blanco
3. Verificar que sea visible y tenga estilo personalizado

**Criterios de Éxito**:
- [ ] El scrollbar es visible (color gris-azul `#94a3b8`)
- [ ] El scrollbar tiene bordes redondeados
- [ ] El scrollbar tiene 12px de ancho
- [ ] El track (fondo) es gris muy claro (`#f1f5f9`)

---

### 2. ✅ Scroll con Mouse Wheel

**Instrucciones**:
1. Posicionar el cursor sobre el área de cards
2. Usar la rueda del mouse para hacer scroll arriba/abajo
3. Verificar movimiento suave

**Criterios de Éxito**:
- [ ] El scroll funciona con la rueda del mouse
- [ ] El movimiento es suave (no salta)
- [ ] El header permanece fijo en la parte superior
- [ ] Solo el área de cards hace scroll

---

### 3. ✅ Arrastrar Scrollbar

**Instrucciones**:
1. Hacer clic y mantener presionado en la barra de scroll (thumb)
2. Arrastrar hacia arriba y hacia abajo
3. Observar el comportamiento

**Criterios de Éxito**:
- [ ] La barra se puede arrastrar con el mouse
- [ ] El contenido se mueve de acuerdo al arrastre
- [ ] La barra no se "pega" ni tiene comportamiento errático

---

### 4. ✅ Estados Hover y Active

**Instrucciones**:
1. Posicionar el cursor sobre la barra de scroll (sin hacer clic)
2. Observar el cambio de color en hover
3. Hacer clic y arrastrar, observar el cambio en active

**Criterios de Éxito**:
- [ ] En hover, la barra cambia a un tono más oscuro (`#64748b`)
- [ ] Al hacer clic (active), la barra se oscurece aún más (`#475569`)
- [ ] Las transiciones son suaves (0.3s)

---

## 📱 TESTING RESPONSIVE

### 5. ✅ Pantallas Pequeñas (Laptop 1366x768)

**Instrucciones**:
1. Redimensionar el navegador a 1366x768
2. Abrir una página con 8+ cards
3. Verificar que aparece el scroll

**Criterios de Éxito**:
- [ ] El scroll aparece cuando hay muchos cards
- [ ] El layout no se rompe
- [ ] Los cards son visibles completamente
- [ ] El scrollbar es funcional

---

### 6. ✅ Pantallas Grandes (Desktop 1920x1080)

**Instrucciones**:
1. Usar una pantalla grande o redimensionar a 1920x1080
2. Abrir una página con pocos cards (3-4)
3. Verificar que NO aparece scroll si no es necesario

**Criterios de Éxito**:
- [ ] Sin scroll si los cards caben en pantalla
- [ ] Con scroll si los cards exceden el espacio disponible
- [ ] El comportamiento es automático

---

## 🔧 TESTING FUNCIONAL

### 7. ✅ Agregar/Eliminar Elementos

**Instrucciones**:
1. En una página con scroll, agregar un nuevo elemento
2. Verificar que el scroll se ajusta automáticamente
3. Eliminar elementos hasta que no se necesite scroll
4. Verificar que el scrollbar desaparece

**Criterios de Éxito**:
- [ ] Al agregar elementos, el scroll aparece/crece
- [ ] Al eliminar elementos, el scroll se ajusta/desaparece
- [ ] El comportamiento es dinámico y automático

---

### 8. ✅ Header Fijo (Sticky)

**Instrucciones**:
1. Hacer scroll hasta el fondo de la página
2. Observar si el header (con botón "Regresa a DASHBOARD") permanece visible
3. Verificar que solo el área de cards hace scroll

**Criterios de Éxito**:
- [ ] El header permanece fijo en la parte superior
- [ ] El botón de acción (ej: "Nuevo Grupo") permanece visible
- [ ] Solo el contenedor de cards hace scroll
- [ ] El fondo degradado no hace scroll

---

### 9. ✅ Sin Scroll Horizontal

**Instrucciones**:
1. Hacer scroll en todas direcciones
2. Verificar que no aparece scrollbar horizontal
3. Redimensionar la ventana del navegador

**Criterios de Éxito**:
- [ ] Solo hay scroll vertical
- [ ] No aparece scrollbar horizontal
- [ ] Los cards no se cortan horizontalmente
- [ ] El contenido es responsive

---

## 🌐 TESTING CROSS-BROWSER

### 10. ✅ Google Chrome

**Versión**: 130+

**Criterios de Éxito**:
- [ ] Scrollbar personalizado visible
- [ ] Hover/Active funcionan correctamente
- [ ] Scroll suave
- [ ] Sin errores en consola

---

### 11. ✅ Mozilla Firefox

**Versión**: 133+

**Criterios de Éxito**:
- [ ] Scrollbar thin visible (más delgado que Chrome)
- [ ] Color personalizado aplicado
- [ ] Scroll suave
- [ ] Sin errores en consola

---

### 12. ✅ Microsoft Edge

**Versión**: 130+

**Criterios de Éxito**:
- [ ] Scrollbar personalizado visible (igual que Chrome)
- [ ] Hover/Active funcionan correctamente
- [ ] Scroll suave
- [ ] Sin errores en consola

---

## 📄 TESTING POR PÁGINA

### Verificar scroll en TODAS las 20 páginas:

1. [ ] **ConfigInsumos** - Muchos insumos
2. [ ] **ConfigUsuarios** - Varios usuarios
3. [ ] **ConfigCategorias** - Categorías variadas
4. [ ] **ConfigClientes** - Lista de clientes
5. [ ] **ConfigProveedores** - Proveedores registrados
6. [ ] **ConfigMesas** - Mesas del negocio
7. [ ] **ConfigRecetas** - Recetas disponibles
8. [ ] **ConfigProductosWeb** - Productos para web
9. [ ] **ConfigTurnos** - Turnos de trabajo
10. [ ] **ConfigModulosPagos** - Módulos de pago
11. [ ] **ConfigDescuentos** - Descuentos configurados
12. [ ] **ConfigGrupoMovimientos** - ⭐ **PÁGINA DE REFERENCIA**
13. [ ] **ConfigModeradores** - Moderadores del sistema
14. [ ] **ConfigCatModeradores** - Categorías de moderadores
15. [ ] **ConfigRolUsuarios** - Roles de usuarios
16. [ ] **ConfigUMCompra** - Unidades de medida
17. [ ] **ConfigNegocios** - Negocios registrados
18. [ ] **PageGastos** - Gastos del sistema
19. [ ] **ConfigSubreceta** - Subrecetas
20. [ ] **MovimientosInventario** - Movimientos de inventario

---

## 🚨 CASOS EDGE

### 13. ✅ Página Vacía

**Instrucciones**:
1. Abrir una página sin datos (estado vacío)
2. Verificar que aparece el mensaje "No hay datos"
3. Verificar que NO aparece scrollbar

**Criterios de Éxito**:
- [ ] Mensaje de "vacío" centrado
- [ ] Sin scrollbar (no hay contenido para scroll)
- [ ] Layout correcto

---

### 14. ✅ Página con Exactamente 1 Card

**Instrucciones**:
1. Asegurar que solo hay 1 elemento en la lista
2. Verificar que NO aparece scrollbar
3. Verificar que el card es completamente visible

**Criterios de Éxito**:
- [ ] Sin scrollbar (1 card cabe en pantalla)
- [ ] Card centrado y visible
- [ ] Sin errores

---

### 15. ✅ Carga (Loading State)

**Instrucciones**:
1. Recargar la página y observar el estado de carga
2. Verificar que el spinner es visible
3. Verificar que NO aparece scrollbar durante la carga

**Criterios de Éxito**:
- [ ] Spinner centrado durante la carga
- [ ] Sin scrollbar durante loading
- [ ] Scrollbar aparece después de cargar datos (si hay muchos)

---

## 🎨 TESTING DE USABILIDAD

### 16. ✅ Scroll con Teclado

**Instrucciones**:
1. Hacer clic en el área de cards para darle foco
2. Usar las teclas de flecha arriba/abajo
3. Usar Page Up/Page Down
4. Usar Home/End

**Criterios de Éxito**:
- [ ] Flechas arriba/abajo hacen scroll
- [ ] Page Up/Down hacen scroll por página
- [ ] Home va al inicio, End va al final
- [ ] El scroll es suave

---

### 17. ✅ Velocidad de Scroll

**Instrucciones**:
1. Hacer scroll rápido con mouse wheel
2. Hacer scroll lento con arrastre de scrollbar
3. Verificar que no hay lag ni stuttering

**Criterios de Éxito**:
- [ ] Scroll fluido sin lag
- [ ] No hay "saltos" visuales
- [ ] Rendimiento constante con muchos cards

---

## 📊 RESULTADOS ESPERADOS

### ✅ Página Perfecta

Una página con scroll funcionando perfectamente debe cumplir:

- ✅ Scrollbar visible cuando hay 5+ cards (aprox)
- ✅ Scrollbar invisible cuando hay pocos cards
- ✅ Header permanece fijo (sticky)
- ✅ Scroll suave con mouse wheel
- ✅ Scrollbar arrastrable
- ✅ Colores personalizados visibles
- ✅ Hover/Active funcionan
- ✅ Sin scroll horizontal
- ✅ Compatible con todos los navegadores
- ✅ Sin errores en consola

---

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: No aparece scrollbar

**Diagnóstico**:
- Verificar que hay suficientes cards para exceder el espacio
- Verificar que `.standard-page-content` tiene `overflow-y: auto`
- Verificar que `.standard-page-container` tiene `height: 100vh`

**Solución**: Ya implementado correctamente ✅

---

### Problema 2: Scrollbar no es personalizado

**Diagnóstico**:
- Verificar navegador (Safari antiguo no soporta `::-webkit-scrollbar`)
- Verificar que los estilos CSS están cargados

**Solución**: 
- Firefox usa `scrollbar-width: thin` y `scrollbar-color`
- Chrome/Edge usan `::-webkit-scrollbar-*`
- Ambos están implementados ✅

---

### Problema 3: Scroll lento o con lag

**Diagnóstico**:
- Verificar cantidad de elementos (100+ puede causar lag)
- Verificar rendimiento del navegador

**Solución**:
- Considerar paginación si hay 50+ elementos
- Implementar virtualización si hay 100+ elementos
- Para este proyecto (típicamente 5-30 elementos): No hay problema ✅

---

## 📝 REPORTE DE TESTING

### Formato de Reporte

```markdown
## Reporte de Testing - Scroll Vertical

**Fecha**: [FECHA]
**Tester**: [NOMBRE]
**Navegador**: [NAVEGADOR + VERSIÓN]

### Páginas Verificadas:
- [x] ConfigGrupoMovimientos - ✅ Todo funciona
- [ ] ConfigInsumos - ⚠️ Scrollbar muy claro (?)
- etc...

### Problemas Encontrados:
1. [Describir problema]
   - Severidad: Alta/Media/Baja
   - Página afectada: [nombre]
   - Pasos para reproducir: [pasos]
   
### Sugerencias:
- [Sugerencia de mejora]
```

---

## ✅ ESTADO DEL CHECKLIST

**Progreso**: [ ] 0/17 tests completados

**Responsable**: [Asignar tester]  
**Fecha Límite**: [Definir]  
**Prioridad**: Media (funcionalidad ya implementada, testing es validación)

---

**Última Actualización**: 18 de Febrero de 2026 - 19:45  
**Documento Creado Por**: GitHub Copilot  
**Versión**: 1.0

