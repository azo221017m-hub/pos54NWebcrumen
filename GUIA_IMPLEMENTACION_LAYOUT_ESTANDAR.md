# GUÍA DE IMPLEMENTACIÓN: LAYOUT ESTÁNDAR PARA PÁGINAS

## 📋 Objetivo

Estandarizar todas las páginas del sistema con un layout consistente que incluye:
- **HEADER**: Barra superior con logo, título y botones de acción
- **HERO**: Sección con título y descripción (opcional)
- **CONTENEDOR PRINCIPAL**: Área de contenido con scroll vertical
- **CARDS**: Componentes de lista que muestran datos completos sin cortes

---

## 🎨 Estructura del Layout

### Imagen de Referencia
El layout está basado en la imagen de diseño proporcionada que muestra:
- Header morado con degradado
- Título centrado con logo
- Botón "Regresa a DASHBOARD" a la izquierda
- Botón de acción "+ Nuevo[nombre de submenú]" a la derecha
- Contenedor de fondo celeste con patrón diagonal
- Área de contenido blanca con scroll vertical

---

## 🗂️ Archivos Creados

### 1. **StandardPageLayout.css**
**Ubicación**: `src/styles/StandardPageLayout.css`

**Características**:
- Layout completo de página con header, hero y contenedor principal
- Sistema de grid responsive para cards
- Scroll personalizado en contenedor de contenido
- Estados de loading y empty
- Notificaciones consistentes
- Diseño responsive móvil

### 2. **StandardPageLayout.tsx**
**Ubicación**: `src/components/StandardPageLayout/StandardPageLayout.tsx`

**Props**:
```typescript
interface StandardPageLayoutProps {
  // Header props
  showBackButton?: boolean;           // Mostrar botón "Regresa a DASHBOARD"
  backButtonPath?: string;            // Ruta del botón de regreso (default: '/dashboard')
  backButtonText?: string;            // Texto del botón (default: 'Regresa a DASHBOARD')
  headerTitle: string;                // Título principal en header
  headerSubtitle?: string;            // Subtítulo del header
  headerLogo?: string;                // Logo (URL o path de imagen)
  actionButton?: {                    // Botón de acción principal
    text: string;
    icon?: ReactNode;
    onClick: () => void;
  };

  // Hero props (opcional)
  heroTitle?: string;                 // Título del hero
  heroDescription?: string;           // Descripción del hero

  // Content
  children: ReactNode;                // Contenido principal

  // Estados
  loading?: boolean;                  // Estado de carga
  loadingMessage?: string;            // Mensaje de carga
  isEmpty?: boolean;                  // Estado vacío
  emptyIcon?: ReactNode;              // Icono para estado vacío
  emptyMessage?: string;              // Mensaje para estado vacío
}
```

### 3. **StandardCard.tsx**
**Ubicación**: `src/components/StandardCard/StandardCard.tsx`

**Props**:
```typescript
interface StandardCardProps {
  title: string;                      // Título del card
  fields: CardField[];                // Array de campos a mostrar
  actions?: {                         // Botones de acción
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'edit' | 'delete';
  }[];
  className?: string;                 // Clase CSS adicional
}

interface CardField {
  label: string;                      // Etiqueta del campo
  value: string | number | ReactNode; // Valor (puede ser JSX)
}
```

---

## 🚀 Cómo Implementar en una Página

### Paso 1: Importar Componentes

```typescript
import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
import StandardCard from '../../components/StandardCard/StandardCard';
import { Plus, Edit, Trash2, [OtroIcono] } from 'lucide-react';
```

### Paso 2: Estructura del Return

```typescript
return (
  <>
    {/* Notificaciones (si aplica) */}
    {mensaje && (
      <div className={`standard-notification ${mensaje.tipo}`}>
        <div className="notification-content">
          <p className="notification-message">{mensaje.texto}</p>
        </div>
        <button className="btn-close" onClick={() => setMensaje(null)}>×</button>
      </div>
    )}

    <StandardPageLayout
      headerTitle="Título de la Página"
      headerSubtitle="Descripción breve"
      backButtonText="Regresa a DASHBOARD"
      backButtonPath="/dashboard"
      actionButton={{
        text: 'Nuevo [Elemento]',
        icon: <Plus size={20} />,
        onClick: handleNuevo
      }}
      loading={cargando}
      loadingMessage="Cargando datos..."
      isEmpty={datos.length === 0}
      emptyIcon={<[Icono] size={80} />}
      emptyMessage="No hay datos registrados."
    >
      <div className="standard-cards-grid">
        {datos.map((item) => (
          <StandardCard
            key={item.id}
            title={item.nombre}
            fields={[
              {
                label: 'Campo 1',
                value: item.campo1
              },
              {
                label: 'Campo 2',
                value: (
                  <span style={{ color: '#10b981' }}>
                    {item.campo2}
                  </span>
                )
              }
            ]}
            actions={[
              {
                label: 'Editar',
                icon: <Edit size={16} />,
                onClick: () => handleEditar(item),
                variant: 'edit'
              },
              {
                label: 'Eliminar',
                icon: <Trash2 size={16} />,
                onClick: () => handleEliminar(item.id),
                variant: 'delete'
              }
            ]}
          />
        ))}
      </div>
    </StandardPageLayout>
  </>
);
```

---

## ✅ Ejemplos Implementados

### 1. ConfigInsumos.tsx

**Antes**:
- Layout personalizado con header custom
- Lista de componentes específica
- Estilos propios no reutilizables

**Después**:
```typescript
<StandardPageLayout
  headerTitle="Gestión de Insumos"
  headerSubtitle="Administra los insumos del negocio"
  actionButton={{
    text: 'Nuevo Insumo',
    icon: <Plus size={20} />,
    onClick: handleNuevo
  }}
  isEmpty={insumos.length === 0}
>
  <div className="standard-cards-grid">
    {insumos.map((insumo) => (
      <StandardCard
        key={insumo.id_insumo}
        title={insumo.nombre}
        fields={[...]}
        actions={[...]}
      />
    ))}
  </div>
</StandardPageLayout>
```

**Mejoras**:
- ✅ Cards con altura automática (sin cortes de texto)
- ✅ Scroll vertical en contenedor
- ✅ Estados loading y empty integrados
- ✅ Grid responsive automático

### 2. ConfigUsuarios.tsx

**Implementación**:
- Layout estándar con vista lista/formulario
- Cards con información completa de usuario
- Manejo de estados integrado

---

## 🎯 Beneficios del Layout Estándar

### 1. **Consistencia Visual**
- Todas las páginas lucen igual
- Experiencia de usuario uniforme
- Brand identity coherente

### 2. **Mantenibilidad**
- Un solo lugar para actualizar estilos globales
- Componentes reutilizables
- Menos código duplicado

### 3. **Responsive por Defecto**
- Grid adapta automáticamente columnas
- Mobile-friendly sin configuración extra
- Breakpoints predefinidos

### 4. **Mejora en UX**
- Scroll vertical solo en contenido (header fijo)
- Cards completas sin cortes
- Loading y empty states consistentes
- Notificaciones estandarizadas

### 5. **Desarrollo Más Rápido**
- Plantilla lista para usar
- Props configurables
- Menos decisiones de diseño

---

## 📐 Especificaciones de Diseño

### Colores

```css
/* Header */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Fondo página */
background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

/* Contenedor principal */
background: white;

/* Botones */
--primary: #667eea;
--success: #10b981;
--danger: #ef4444;
--warning: #f59e0b;
```

### Espaciado

```css
/* Padding */
--header-padding: 1rem 2rem;
--hero-padding: 2rem 2rem 1.5rem 2rem;
--main-padding: 2rem;
--card-padding: 1.5rem;

/* Gaps */
--grid-gap: 1.5rem;
--card-gap: 1rem;
```

### Tamaños

```css
/* Header */
--header-height: 70px;

/* Cards */
--card-min-width: 320px;
--card-border-radius: 10px;

/* Scroll */
--scrollbar-width: 12px;
```

---

## 🔄 Migración de Páginas Existentes

### Checklist de Migración

1. ✅ **Identificar componentes actuales**
   - Header/Toolbar actual
   - Lista/Grid de datos
   - Formularios modales
   - Notificaciones

2. ✅ **Reemplazar imports**
   ```typescript
   // Remover
   import { useNavigate } from 'react-router-dom';
   import ListaCustom from '...';
   import './PageCustom.css';
   
   // Agregar
   import StandardPageLayout from '../../components/StandardPageLayout/StandardPageLayout';
   import StandardCard from '../../components/StandardCard/StandardCard';
   ```

3. ✅ **Mapear datos a StandardCard**
   - Identificar campos a mostrar
   - Crear array de `fields`
   - Definir `actions` (editar, eliminar, etc.)

4. ✅ **Configurar props del layout**
   - Títulos y subtítulos
   - Botones de acción
   - Estados loading/empty

5. ✅ **Probar responsive**
   - Desktop (> 768px)
   - Tablet (768px)
   - Mobile (< 768px)

---

## 📝 Páginas Pendientes de Migración

### Alta Prioridad
- [ ] ConfigCategorias
- [ ] ConfigClientes
- [ ] ConfigProductosWeb
- [ ] ConfigProveedores
- [ ] ConfigMesas
- [ ] ConfigRecetas

### Media Prioridad
- [ ] ConfigTurnos
- [ ] ConfigDescuentos
- [ ] ConfigGrupoMovimientos
- [ ] MovimientosInventario
- [ ] PageGastos
- [ ] PageVentas

### Baja Prioridad (páginas especiales)
- [ ] ConfigNegocios (tiene layout especial)
- [ ] DashboardPage (ya tiene diseño custom)
- [ ] LoginPage (no aplica)
- [ ] LandingPage (no aplica)

---

## 🐛 Troubleshooting

### Problema: Cards se cortan
**Solución**: Verificar que uses `standard-cards-grid` como contenedor

### Problema: Scroll no funciona
**Solución**: Asegurar que el contenido esté dentro de `StandardPageLayout`

### Problema: Botones no responden
**Solución**: Verificar que los handlers estén definidos y pasados correctamente

### Problema: Estados no se actualizan
**Solución**: Verificar props `loading` e `isEmpty`

---

## 📚 Recursos

### Archivos de Referencia
- `src/styles/StandardPageLayout.css` - Estilos globales
- `src/components/StandardPageLayout/StandardPageLayout.tsx` - Layout component
- `src/components/StandardCard/StandardCard.tsx` - Card component
- `src/pages/ConfigInsumos/ConfigInsumos.tsx` - Ejemplo completo
- `src/pages/ConfigUsuarios/ConfigUsuarios.tsx` - Ejemplo con vistas múltiples

### Librerías Utilizadas
- **lucide-react**: Iconos
- **React Router**: Navegación
- **CSS Grid**: Layout responsive

---

## 🎓 Mejores Prácticas

1. **Usar campos descriptivos en cards**
   ```typescript
   fields={[
     { label: 'Nombre', value: item.nombre },
     { label: 'Estado', value: <Badge status={item.activo} /> }
   ]}
   ```

2. **Iconos consistentes**
   - Edit: `<Edit size={16} />`
   - Delete: `<Trash2 size={16} />`
   - Add: `<Plus size={20} />`

3. **Confirmación en acciones destructivas**
   ```typescript
   onClick: () => {
     if (window.confirm('¿Está seguro?')) {
       handleEliminar(id);
     }
   }
   ```

4. **Formateo de datos**
   - Moneda: `formatCurrency(value)`
   - Fechas: `new Date(value).toLocaleDateString('es-MX')`
   - Booleanos: `value ? 'Activo' : 'Inactivo'`

---

## 🚀 Siguiente Fase

1. Migrar todas las páginas de configuración
2. Crear variantes de cards (compact, expanded)
3. Agregar filtros y búsqueda al layout
4. Implementar paginación integrada
5. Crear temas (light/dark mode)

---

**Fecha de creación**: 18 de Febrero de 2026
**Versión**: 2.5.B12
**Autor**: Sistema de Desarrollo CRUMENSYS
