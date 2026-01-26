# Fix: Comandas con Estado ORDENADO - Crear Nuevo Registro

## Problema Original

**Descripción**: En PageVentas, cuando hay comandas con estatus "ORDENADO" y se agregan nuevos artículos iguales a los de la comanda con estatus ordenado, el sistema intentaba sumarlos a la comanda deshabilitada en lugar de crear un nuevo registro en `tblposcrumenwebdetalleventas`.

**Impacto**: Los artículos no se podían ordenar por separado, causando confusión en la gestión de comandas.

## Solución Implementada

### Cambios en `/src/pages/PageVentas/PageVentas.tsx`

#### 1. Función `agregarAComanda()` (Líneas 429-447)

**Antes:**
```typescript
const agregarAComanda = (producto: ProductoWeb, moderadores?: string, moderadoresNames?: string[]) => {
  const itemExistente = comanda.find(item => 
    item.producto.idProducto === producto.idProducto && 
    hasSameModeradores(item.moderadores, moderadores)
  );
  
  if (itemExistente) {
    // ❌ PROBLEMA: Siempre incrementa, incluso si el item está ORDENADO
    setComanda(comanda.map(item => 
      item === itemExistente ? { ...item, cantidad: item.cantidad + 1 } : item
    ));
  } else {
    setComanda([...comanda, { producto, cantidad: 1, moderadores, moderadoresNames }]);
  }
};
```

**Después:**
```typescript
const agregarAComanda = (producto: ProductoWeb, moderadores?: string, moderadoresNames?: string[]) => {
  const itemExistente = comanda.find(item => 
    item.producto.idProducto === producto.idProducto && 
    hasSameModeradores(item.moderadores, moderadores)
  );
  
  // ✅ SOLUCIÓN: Si el item existe pero está ORDENADO, crear nueva entrada
  if (itemExistente && itemExistente.estadodetalle !== ESTADO_ORDENADO) {
    setComanda(comanda.map(item => 
      item === itemExistente
        ? { ...item, cantidad: item.cantidad + 1 }
        : item
    ));
  } else {
    // Crea nueva entrada: o no existe item, o el item existente está ORDENADO
    setComanda([...comanda, { producto, cantidad: 1, moderadores, moderadoresNames }]);
  }
};
```

#### 2. Función `disminuirCantidad()` (Líneas 449-467)

Agregada protección para no modificar items con estado ORDENADO:
```typescript
if (itemExistente && itemExistente.estadodetalle !== ESTADO_ORDENADO) {
  // Solo modifica si NO está ordenado
}
```

#### 3. Función `actualizarCantidad()` (Líneas 469-488)

Agregada protección para no modificar items con estado ORDENADO:
```typescript
if (itemExistente && itemExistente.estadodetalle !== ESTADO_ORDENADO) {
  // Solo actualiza si NO está ordenado
}
```

## Comportamiento Esperado

### Escenario 1: Item NO existe en comanda
- **Acción**: Usuario agrega producto X
- **Resultado**: Se crea nueva entrada con cantidad = 1

### Escenario 2: Item existe pero NO está ORDENADO
- **Acción**: Usuario agrega producto X que ya existe sin ORDENADO
- **Resultado**: Se incrementa la cantidad del item existente

### Escenario 3: Item existe y ESTÁ ORDENADO (🆕 FIX)
- **Acción**: Usuario agrega producto X que ya existe con estado ORDENADO
- **Resultado**: Se crea una NUEVA entrada con cantidad = 1
- **Beneficio**: El nuevo item puede ser ordenado independientemente

## Flujo de Datos

```
Usuario agrega producto
    ↓
agregarAComanda()
    ↓
¿Item existe?
    ├─ NO → Crear nueva entrada
    └─ SÍ → ¿Está ORDENADO?
            ├─ SÍ → Crear nueva entrada (🆕 FIX)
            └─ NO → Incrementar cantidad
```

## Impacto en Base de Datos

Cuando el usuario presiona "PRODUCIR" o "ESPERAR", el sistema llama a `crearVenta()` o `agregarDetallesAVenta()`, que envía los items de la comanda al backend. Con este fix:

- **Items con estado ORDENADO**: No se incluyen en la petición (filtrados en línea 541)
- **Items nuevos/sin ordenar**: Se envían como INSERT separados
- **Resultado**: Cada item nuevo crea un registro independiente en `tblposcrumenwebdetalleventas`

## Validación

✅ **Build exitoso**: El proyecto compila sin errores  
✅ **Code Review**: Sin comentarios de mejora  
✅ **Security Check**: Sin vulnerabilidades detectadas  
✅ **Protección UI**: Botones +/- ya están deshabilitados para items ORDENADOS

## Archivos Modificados

- `/src/pages/PageVentas/PageVentas.tsx` - Funciones de gestión de comanda

## Notas Técnicas

1. La interfaz `ItemComanda` ya incluía el campo `estadodetalle?: EstadoDetalle` (línea 32)
2. Los items ORDENADOS ya se mostraban visualmente como deshabilitados (línea 1255-1259)
3. Los botones de control ya estaban deshabilitados para items ORDENADOS (líneas 1338, 1345)
4. Este fix completa la lógica funcional para evitar modificación de items ORDENADOS

## Fecha de Implementación

26 de enero de 2026
